from rest_framework import serializers
from .models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = [
            'id',
            'customer',  # pass customer ID
            'therapist', # pass therapist ID
            'consultation_type',
            'appointment_type',
            'appointment_date',
            'appointment_time',
            'hospital_name',
            'hospital_address',
            'created_at'
        ]
