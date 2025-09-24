# serializers.py
from rest_framework import serializers
from .models import Customer, Therapist, Admin, UserAuth, Review

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'id',
            'customer_name',
            'customer_email',
            'customer_phone',
            'customer_age',
            'customer_image',
            'customer_password',
            'customer_role',
            'customer_gender',
        ]

class TherapistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Therapist
        fields = [
            'id',
            'therapist_name',
            'therapist_email',
            'therapist_phone',
            'year_of_experience',
            'therapist_image',
            'therapist_specialization',
            'therapist_qualification',
            'therapist_status',
            'therapist_licence_number',
            'therapist_Serve_for',
            'therapist_password',
            'therapist_role',
            'therapist_gender',
            'hospital_name',
            'hospital_address',
        ]

class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = [
            'id',
            'admin_name',
            'admin_email',
            'admin_password',
            'admin_role',
        ]

class UserAuthSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAuth
        fields = [
            'id',
            'content_type',
            'object_id',
            'user_name',
            'user_password',
            'user_role',
        ]

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = [
            'id',
            'customer',
            'therapist',
            'review_rating',
            'review_date',
        ]
