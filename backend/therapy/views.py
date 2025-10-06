
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.contenttypes.models import ContentType
from account.models import Customer, Therapist, Admin, UserAuth, Review ,TherapistRequest
from account.serializers import CustomerSerializer, TherapistSerializer, AdminSerializer,UserAuthSerializer, ReviewSerializer ,TherapistRequestSerializer

# Create your views here.
#view therapist list(for admin)
@api_view(['GET'])
def therapist_list(request):
    therapist=Therapist.object.all()
    serializer=TherapistSerializer(therapist,many=True)
    return Response(serializer.data,status=status.HTTP_200_OK)

#view therapist details admin,therapist and customer
@api_view(['GET'])
def view_therapist_profile(request,request_id):
    therapist=Therapist.object.get(id=request_id)
    serializer=TherapistSerializer(therapist)
    return Response(serializer.data,status=status.HTTP_200_OK)

#delete therapist (for admin and therapist)
@api_view(['DELETE'])
def delete_therapist(request,therapist_id):
    therapist=get_object_or_404(Therapist,id=therapist_id)
    therapist.delete()
    return Response({"message":"Therapist deleted successfully"},status=status.HTTP_204_NO_CONTENT)