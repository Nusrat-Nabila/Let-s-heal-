from django.contrib import admin
from .models import Customer, Therapist, Admin, UserAuth, Review,TherapistRequest
# Register your models here.
admin.site.register([Customer, Therapist, Admin, UserAuth, Review,TherapistRequest])