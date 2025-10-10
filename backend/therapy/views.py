
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.contenttypes.models import ContentType
from account.models import Customer, Therapist, Admin, UserAuth, Review ,TherapistRequest
from account.serializers import CustomerSerializer, TherapistSerializer, AdminSerializer,UserAuthSerializer, ReviewSerializer ,TherapistRequestSerializer
from rest_framework.permissions import IsAuthenticated ,AllowAny
from rest_framework.decorators import permission_classes
from django.db.models import Q
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