from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.contenttypes.models import ContentType
from account.models import Customer, Therapist
from account.serializers import TherapistSerializer
from rest_framework.permissions import IsAuthenticated ,AllowAny
from rest_framework.decorators import permission_classes
from django.db.models import Q
from .models import Appointment
from .serializers import AppointmentSerializer
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
# Create your views here.

#view therapist list(for admin and customer)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_therapist(request):
    user = request.user
    if user.user_role != "admin" and user.user_role != "customer":
        return Response({"error":"Not authorized"}, status=403)
  
    therapists = Therapist.objects.all().order_by('therapist_name')
    query = request.GET.get('search', '').strip()
    if query:
        therapists = therapists.filter(
            Q(therapist_name__icontains=query) |
            Q(therapist_specialization__icontains=query) |
            Q(hospital_name__icontains=query)
        )

    specialty = request.GET.get('specialty', '')
    hospital = request.GET.get('hospital', '')
    gender = request.GET.get('gender', '')
    sort_by = request.GET.get('sort', 'name_asc')

    if specialty and specialty != 'All Specialties':
        therapists = therapists.filter(therapist_specialization__iexact=specialty)

    if hospital and hospital != 'All Hospitals':
        therapists = therapists.filter(hospital_name__iexact=hospital)

    if gender and gender != 'Any Gender':
        therapists = therapists.filter(therapist_gender__iexact=gender)

    if sort_by == 'name_asc':
        therapists = therapists.order_by('therapist_name')
    elif sort_by == 'name_desc':
        therapists = therapists.order_by('-therapist_name')

    if not therapists.exists():
        return Response({"message": "No therapists found"}, status=status.HTTP_404_NOT_FOUND)
    serializer = TherapistSerializer(therapists, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


#view therapist details admin,therapist and customer
@api_view(['GET'])
@permission_classes([AllowAny])
def view_therapist_profile(request,therapist_id):
    therapist=Therapist.objects.get(id=therapist_id)
    serializer=TherapistSerializer(therapist)
    return Response(serializer.data,status=status.HTTP_200_OK)

#update therapist profile (for therapist)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_therapist_profile(request,therapist_id):
    user = request.user
    therapist = Therapist.objects.filter(pk=therapist_id).first()
    if not therapist:
        return Response({"error": "therapist not found"}, status=404)
    if user.user_role != "therapist" and user.user_email != therapist.therapist_email :
        return Response({"error": "Not authorized to update this profile"}, status=403)

    serializer = TherapistSerializer(therapist, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#delete therapist (for admin and therapist)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_therapist(request,therapist_id):
    user = request.user
    therapist = get_object_or_404(Therapist, id=therapist_id)
    if user.user_role != "admin" and user.user_role != "therapist"  and user.user_email != therapist.therapist_email:
        return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
    therapist.delete()
    return Response({"message":"Therapist deleted successfully"},status=status.HTTP_204_NO_CONTENT)


# view for book appointment
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def book_appointment(request,therapist_id):
    user = request.user
    try:
        customer = Customer.objects.get(customer_email=user.user_email )
    except Customer.DoesNotExist:
        return Response({"error": "Only customers can book appointments."}, status=status.HTTP_403_FORBIDDEN)

   
    therapist_id = therapist_id
    appointment_type=request.data.get('appointment_type')
    consultation_type = request.data.get('consultation_type')
    appointment_date = request.data.get('appointment_date')
    appointment_time = request.data.get('appointment_time')
    hospital_name=request.data.get("hospital_name")
    hospital_address=request.data.get('hospital_address')

    if not therapist_id or not appointment_date or not appointment_time or not appointment_type or not consultation_type or not hospital_name or not hospital_address:
        return Response({"error": "Therapist, date,time ,appointment type ,consultation type ,hospital_name and hospital_address are required."}, status=status.HTTP_400_BAD_REQUEST)


    therapist = Therapist.objects.get(id=therapist_id)
    current_appointment = Appointment.objects.filter(therapist=therapist,appointment_date=appointment_date).count()

    if current_appointment >= 80:
        return Response({"error": "This therapist has reached the daily limit of 80 patients."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = AppointmentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(customer=customer)
        send_mail(
            "About appointment booking ",
            "Your appointment is booked successfully!",
            settings.DEFAULT_FROM_EMAIL,
            [customer.customer_email],
            fail_silently=False,
        )
        return Response({"message": "your appointment booked successfully!", "data": serializer.data},status=status.HTTP_200_OK)
    
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
 #customer appointment history      
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_appointment_history(request):
    customer=Customer.objects.get(customer_email=request.user.user_email)
    appointment=Appointment.objects.filter(customer=customer).order_by('-appointment_date', '-appointment_time')
    serializer=AppointmentSerializer(appointment,many=True)
    return Response(serializer.data,status=status.HTTP_200_OK)

 #therapist previous booking history    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def therapist_appointment_prev_history(request):
    therapist=Therapist.objects.get(therapist_email=request.user.user_email)
    now = timezone.now()
    today = now.date()
    appointment=Appointment.objects.filter(therapist=therapist).exclude(Q(appointment_date__gt=today)).order_by('-appointment_date', '-appointment_time')
    serializer=AppointmentSerializer(appointment,many=True)
    return Response(serializer.data,status=status.HTTP_200_OK)

 #therapist current booking history  
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def therapist_appointment_current_history(request):
    therapist=Therapist.objects.get(therapist_email=request.user.user_email)
    now = timezone.now()
    today = now.date()
    current_time = now.time()
    appointment=Appointment.objects.filter(therapist=therapist).exclude(Q(appointment_date=today, appointment_time__gt=current_time)).order_by('-appointment_date', '-appointment_time')
    serializer=AppointmentSerializer(appointment,many=True)
    return Response(serializer.data,status=status.HTTP_200_OK)