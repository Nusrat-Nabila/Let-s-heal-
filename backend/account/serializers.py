# serializers.py
from rest_framework import serializers
from .models import Customer, Therapist, Admin, UserAuth, Review ,TherapistRequest,Hospital

class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = [
            'id',
            'name',
            'address',
        ]

class CustomerSerializer(serializers.ModelSerializer):
    
    confirm_password = serializers.CharField(write_only=True)
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
            'confirm_password',
        ]

    def validate(self, data):
     password = data.get("customer_password")
     confirm = data.get("confirm_password")

     if password != confirm:
        raise serializers.ValidationError("Passwords do not match")
     else:
        data.pop("confirm_password", None)  
     return data

class TherapistSerializer(serializers.ModelSerializer):
    hospital=HospitalSerializer(many=True,read_only=True)
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
            'therapist_licence',
            'therapist_Serve_for',
            'therapist_password',
            'therapist_role',
            'therapist_gender',
            'hospital',
        ]

class TherapistRequestSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)
    hospital = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Hospital.objects.all()
    )

    class Meta:
        model = TherapistRequest
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'year_of_experience',
            'specialization',
            'qualification',
            'gender',
            'image',
            'hospital',  # now writeable
            'password',
            'confirm_password',
            'licence_pdf',
            'status',
        ]
        read_only_fields = ['status']

    def validate(self, data):
        password = data.get("password")
        confirm = data.get("confirm_password")

        if password != confirm:
            raise serializers.ValidationError("Passwords do not match")
        else:
            data.pop("confirm_password", None)  
        return data
    
    
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
            'user_email',
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
