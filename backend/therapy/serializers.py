# serializers.py
from rest_framework import serializers
from .models import Appointment
from account.serializers import HospitalSerializer
from account.serializers import TherapistSerializer
from account.serializers import CustomerSerializer
class AppointmentSerializer(serializers.ModelSerializer):
    hospital = HospitalSerializer(read_only=True)  
    therapist = TherapistSerializer(read_only=True)
    customer = CustomerSerializer(read_only=True)
    class Meta:
        model = Appointment
        fields = [
            'id',
            'customer',  
            'therapist', 
            'consultation_type',
            'appointment_type',
            'appointment_date',
            'appointment_time',
            'hospital',  
            'created_at'
        ]
