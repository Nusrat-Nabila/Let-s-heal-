from django.contrib import admin
from .models import Customer, Therapist, Admin, UserAuth, Review
# Register your models here.
admin.site.register([Customer, Therapist, Admin, UserAuth, Review])