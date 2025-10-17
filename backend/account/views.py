from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status
from django.contrib.contenttypes.models import ContentType
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Customer, Therapist, Admin, UserAuth, Review ,TherapistRequest,Hospital
from .serializers import CustomerSerializer, TherapistSerializer, AdminSerializer,UserAuthSerializer, ReviewSerializer ,TherapistRequestSerializer,HospitalSerializer

#customer signup
@api_view(['POST'])
@permission_classes([AllowAny])
def customer_signup(request):
    serializer = CustomerSerializer(data=request.data)
    if serializer.is_valid():
        customer=serializer.save()

        UserAuth.objects.create(
        content_type=ContentType.objects.get_for_model(Customer),
        object_id=customer.id,
        user_name=customer.customer_name,
        user_email=customer.customer_email,
        user_password=customer.customer_password,
        user_role=customer.customer_role
       )
  
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#therapist request for signup
@api_view(['POST'])
@permission_classes([AllowAny])
def therapist_request_signup(request):
    if TherapistRequest.objects.filter(email=request.data.get('email')).exists():
        return Response( {"success": False, "error": "A request with this email already exists."},status=status.HTTP_400_BAD_REQUEST)
    
    else:
     serializer = TherapistRequestSerializer(data=request.data)
     if serializer.is_valid():
        req = serializer.save()
        return Response({"success": True, "message": "Request submitted. Awaiting admin approval."},status=status.HTTP_201_CREATED)
     
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#List of all therapist requests (for admin)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_therapist_request(request):
    requests = TherapistRequest.objects.all().order_by('-created_at')
    if not requests.exists():
            return Response({"message": "No therapist request for registration is found"}, status=status.HTTP_404_NOT_FOUND)
    serializer = TherapistRequestSerializer(requests, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

#Details of a specific therapist request (for admin)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def requested_therapist_info(request,request_id):
    therapist_req=get_object_or_404(TherapistRequest, id=request_id)
    if not therapist_req:
            return Response({"error":" requested Therapist info is not found"}, status=404)
    serializer=TherapistRequestSerializer(therapist_req)
    return Response(serializer.data,status=status.HTTP_200_OK)

#process therapist request
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_therapist_request(request, request_id):
    action = request.data.get("action")  # "approve" or "decline"
    therapist_req = get_object_or_404(TherapistRequest, id=request_id)

    if action == "approve":
        therapist = Therapist.objects.create(
            therapist_name=therapist_req.name,
            therapist_email=therapist_req.email,
            therapist_phone=therapist_req.phone,
            year_of_experience=therapist_req.year_of_experience,
            therapist_specialization=therapist_req.specialization,
            therapist_qualification=therapist_req.qualification,
            therapist_password=therapist_req.password,
            therapist_gender=therapist_req.gender,
            therapist_role="therapist",
            therapist_licence=therapist_req.licence_pdf,
            therapist_image=therapist_req.image 
        )

        therapist.hospital.set(therapist_req.hospital.all())
     
        UserAuth.objects.create(
            content_type=ContentType.objects.get_for_model(Therapist),
            object_id=therapist.id,
            user_name=therapist.therapist_name,
            user_email=therapist.therapist_email,
            user_password=therapist.therapist_password,
            user_role="therapist"
        )

        therapist_req.status = "approved"
        therapist_req.save()
    
        send_mail(
            "Therapist Request Approved",
            "Congratulations! Your therapist registration request has been approved. You can now log in.",
            settings.DEFAULT_FROM_EMAIL,
            [therapist_req.email],
            fail_silently=False,
        )

        return Response({"success": True, "message": "Request approved and therapist created."},status=status.HTTP_200_OK)

    elif action == "decline":
        therapist_req.status = "declined"
        therapist_req.save()

        send_mail(
            "Therapist Request Declined",
            "Sorry, your therapist registration request has been declined.",
            settings.DEFAULT_FROM_EMAIL,
            [therapist_req.email],
            fail_silently=False,
        )

        return Response({"success": True, "message": "Request declined."},status=status.HTTP_200_OK)

    return Response({"success": False, "error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

#login for customer,therapist and admin
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    role = request.data.get('role')
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password or not role:
        return Response({"success": False, "error": "Email, password, and role are required"}, status=status.HTTP_400_BAD_REQUEST)

    user_auth = UserAuth.objects.filter(user_email=email, user_role=role).first()
    if not user_auth: 
        return Response({"success": False, "error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    if user_auth.user_password != password:
        return Response({"success": False, "error": "Incorrect password"}, status=status.HTTP_401_UNAUTHORIZED)

    if role == "customer":
        user = get_object_or_404(Customer, customer_email=email)
        serializer = CustomerSerializer(user)
    elif role == "therapist":
        user = get_object_or_404(Therapist, therapist_email=email)
        serializer = TherapistSerializer(user)
    elif role == "admin":
        user = get_object_or_404(Admin, admin_email=email)
        serializer = AdminSerializer(user)
    else:
        return Response({"success": False, "error": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)

    refresh = RefreshToken()
    refresh['user_id'] = user_auth.id
    refresh['email'] = user_auth.user_email
    refresh['role'] = user_auth.user_role

    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    return Response({
    "success": True,
    "role": user_auth.user_role,
    "data": serializer.data,
    "access_token": access_token,
    "refresh_token": refresh_token,
    },status=status.HTTP_200_OK)

# get customer list(for admin)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_customer(request):
    customer=Customer.objects.all()
    if not customer.exists():
            return Response({"message": "No customer found"}, status=status.HTTP_404_NOT_FOUND)
    serializer=CustomerSerializer(customer,many=True)
    return Response(serializer.data,status=status.HTTP_200_OK)

# View customer profile 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_customer_profile(request, request_id):
    user = request.user
    customer = get_object_or_404(Customer, id=request_id)
    if not customer:
            return Response({"message": "No customer found"}, status=status.HTTP_404_NOT_FOUND)
    if user.user_role != "admin" and user.user_email != customer.customer_email:
        return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
    serializer = CustomerSerializer(customer)
    return Response(serializer.data, status=status.HTTP_200_OK)

# Update customer profile
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_customer_profile(request, customer_id):
    user = request.user
    customer = get_object_or_404(Customer, id=customer_id) 
    serializer = CustomerSerializer(customer, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Delete customer
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_customer(request, customer_id):
    user = request.user
    customer = get_object_or_404(Customer, id=customer_id)
    if user.user_role != "admin" and user.user_email != customer.customer_email:
        return Response({"error": "Not authorized"}, status=403)
    customer.delete()
    return Response({"message": "Customer deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

# create hospital
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_hospital(request):
    user=request.user
    if user.user_role!='admin':
     return Response ({'error':"only admin can add hospital"}, status=status.HTTP_400_BAD_REQUEST)
    else:
        serializer=HospitalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "data": serializer.data}, status=status.HTTP_201_CREATED)
        else:
         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
# View hospital list
@api_view(['GET'])
@permission_classes([AllowAny])
def view_hospital_list(request):
        hospital=Hospital.objects.all()
        serializer=HospitalSerializer(hospital, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
# View hospital profile
@api_view(['GET'])
@permission_classes([AllowAny])
def view_specific_hospital_info(request, pk):
        hospital=Hospital.objects.get(id=pk)
        serializer=HospitalSerializer(hospital)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Update hospital
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_hospital(request, pk):
    user=request.user
    if user.user_role!='admin':
     return Response ({'error':"only admin can add hospital"}, status=status.HTTP_400_BAD_REQUEST)
    
    hospital = get_object_or_404(Hospital, id=pk) 
    serializer = HospitalSerializer(hospital, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Delete hospital
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_hospital(request, pk):
    user=request.user
    if user.user_role!='admin':
     return Response ({'error':"only admin can add hospital"}, status=status.HTTP_400_BAD_REQUEST)
    
    hospital = get_object_or_404(Hospital, id=pk)
    hospital.delete()
    return Response({"message": "Customer deleted successfully"}, status=status.HTTP_204_NO_CONTENT)



