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
            'hospital',#pass hospital ID--like this [1,2]<-- here 1 and 2 is the id of hospital 
            'created_at'
        ]
