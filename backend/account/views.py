from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.contenttypes.models import ContentType
from .models import Customer, Therapist, Admin, UserAuth, Review
from .serializers import CustomerSerializer, TherapistSerializer, AdminSerializer,UserAuthSerializer, ReviewSerializer

@api_view(['POST'])
def customer_signup(request):
    serializer = CustomerSerializer(data=request.data)
    if serializer.is_valid():
        customer=serializer.save()

        UserAuth.objects.create(
        content_type=ContentType.objects.get_for_model(Customer),
        object_id=customer.id,
        user_name=customer.customer_name,
        user_password=customer.customer_password,
        user_role=customer.customer_role
       )
  
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def therapist_signup(request):
    serializer = TherapistSerializer(data=request.data)
    if serializer.is_valid(): 
        therapist=serializer.save()

        UserAuth.objects.create(
        content_type=ContentType.objects.get_for_model(therapist),
        object_id=therapist.id,
        user_name=therapist.therapist_name,
        user_password=therapist.therapist_password,
        user_role=therapist.therapist_role
       )
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
      return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
