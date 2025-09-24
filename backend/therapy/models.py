from django.db import models

# Create your models here.
from account.models import Customer, Therapist 

class Appointment(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    therapist = models.ForeignKey(Therapist, on_delete=models.CASCADE)
    consultation_type = models.CharField(max_length=100, blank=False, null=False)#offilne/online
    appointment_type = models.CharField(max_length=100, blank=False, null=False)#new patient/follow up
    appointment_date = models.DateField(blank=False, null=False)
    appointment_time=models.TimeField(blank=False, null=False)
    hospital_name=models.CharField(max_length=200,blank=True,null=True)
    hospital_address=models.CharField(max_length=300,blank=True,null=True)
    appointment_status=models.CharField(max_length=100,blank=True,null=True)

    def __str__(self):
        return f"Appointment of {self.customer.customer_name} with {self.therapist.therapist_name}"