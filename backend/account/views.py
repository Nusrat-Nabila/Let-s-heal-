from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status
from django.contrib.contenttypes.models import ContentType
from .models import Customer, Therapist, Admin, UserAuth, Review ,TherapistRequest
from .serializers import CustomerSerializer, TherapistSerializer, AdminSerializer,UserAuthSerializer, ReviewSerializer ,TherapistRequestSerializer

#customer signup
@api_view(['POST'])
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
  
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#therapist request for signup
@api_view(['POST'])
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
def list_therapist_request(request):
    requests = TherapistRequest.objects.all().order_by('-created_at')
    serializer = TherapistRequestSerializer(requests, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

#Details of a specific therapist request (for admin)
@api_view(['GET'])
def requested_therapist_info(request,requst_id):
    therapist_req=get_object_or_404(TherapistRequest, id=requst_id)
    serializer=TherapistRequestSerializer(therapist_req)
    return Response(serializer.data,status=status.HTTP_200_OK)

#process therapist request
@api_view(['POST'])
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
            hospital_name=therapist_req.hospital_name,
            hospital_address=therapist_req.hospital_address,
            therapist_role="therapist",
            therapist_licence=therapist_req.licence_pdf  
        )
     
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


 #function to get role-based user data 
def role_based_response(user_auth):
   
    if user_auth.user_role == 'customer':
        customer = get_object_or_404(Customer, customer_email=user_auth.user_email)
        serializer = CustomerSerializer(customer)

    elif user_auth.user_role == 'therapist':
        therapist = get_object_or_404(Therapist, therapist_email=user_auth.user_email)
        serializer = TherapistSerializer(therapist)

    elif user_auth.user_role == 'admin':
        admin = get_object_or_404(Admin, admin_email=user_auth.user_email)
        serializer = AdminSerializer(admin)

    else:
        return Response({"success": False, "error": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)

    return Response(
        {"success": True, "role": user_auth.user_role, "data": serializer.data},
        status=status.HTTP_200_OK
    )

#login for customer,therapist and admin
@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    selected_role = request.data.get('role', None)  # only for multiple roles

    if not email or not password:
        return Response(
            {"success": False, "error": "Email and password are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    # get all users with this email
    users = UserAuth.objects.filter(user_email=email)
    if not users.exists():
        return Response(
            {"success": False, "error": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    # If multiple roles exist and role not selected yet
    if users.count() > 1 and not selected_role:
        roles = [user.user_role for user in users]
        return Response(
            {
                "success": True,
                "email": email,
                "roles": roles,
                "message": "Multiple roles found. Please select a role to continue."
            },
            status=status.HTTP_200_OK
        )

    # Determine which user to login as
    if selected_role:
        try:
            user_auth = users.get(user_role=selected_role)
        except UserAuth.DoesNotExist:
            return Response(
                {"success": False, "error": f"Role '{selected_role}' not found for this email"},
                status=status.HTTP_400_BAD_REQUEST
            )
    else:
        user_auth = users.first()  # only one role exists

    # Check password 
    if user_auth.user_password != password:
        return Response(
            {"success": False, "error": "Incorrect password"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Return role-based user data
    return role_based_response(user_auth)

# get customer list(for admin)
@api_view(['GET'])
def list_customer(request):
    customer=Customer.object.all()
    serializer=CustomerSerializer(customer,many=True)
    return Response(serializer.data,status=status.HTTP_200_OK)

#view customer details (for admin)
@api_view(['GET'])
def view_customer_profile(request,request_id):
    customer=Customer.object.get(id=request_id)
    serializer=CustomerSerializer(customer)
    return Response(serializer.data,status=status.HTTP_200_OK)

#delete customer (for admin)
@api_view(['DELETE'])
def delete_customer(request,customer_id):
    customer=get_object_or_404(Customer,id=customer_id)
    customer.delete()
    return Response({"message":"customer deleted successfully"},status=status.HTTP_204_NO_CONTENT)

