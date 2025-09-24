from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

# Create your models here.
class Customer(models.Model):
    customer_name=models.CharField(max_length=100)
    customer_email=models.EmailField(max_length=100,blank=True,null=True)
    customer_phone=models.CharField(max_length=15,blank=True,null=True)
    customer_age=models.IntegerField(blank=True,null=True)
    customer_image=models.ImageField(blank=True,null=True)
    customer_password=models.CharField(max_length=200,blank=True,null=True)
    customer_role = models.CharField(max_length=20, default='customer')
    customer_gender_choice=(
        ('male','male'),
        ('female','female'),
        ('no choice','no choice'), 
    )
    customer_gender=models.CharField(max_length=150,choices=customer_gender_choice,default='no choice')

    def __str__(self):
       return self.customer_name
    
class Therapist(models.Model):
    therapist_name=models.CharField(max_length=100)
    therapist_email=models.EmailField(max_length=100,blank=True,null=True)
    therapist_phone=models.CharField(max_length=15,blank=True,null=True)
    year_of_experience=models.IntegerField(blank=True,null=True)
    therapist_image=models.ImageField(blank=True,null=True)
    therapist_specialization=models.CharField(max_length=100,blank=True,null=True) #psychritist,psychologist
    therapist_qualification=models.CharField(max_length=200,blank=True,null=True)  #Mbbs/md
    therapist_status=models.CharField(max_length=100,blank=True,null=True)
    therapist_licence_number=models.IntegerField(blank=True,null=True)
    therapist_Serve_for=models.CharField(max_length=100,blank=True,null=True)
    therapist_password=models.CharField(max_length=200,blank=True,null=True)
    therapist_role = models.CharField(max_length=20,blank=True,null=True, default='therapist')
    therapist_gender_choice=(
        ('male','male'),
        ('female','female'),
        ('no choice','no choice'), 
    )
    therapist_gender=models.CharField(max_length=150,choices=therapist_gender_choice,default='no choice')
    hospital_name=models.CharField(max_length=200,blank=True,null=True)
    hospital_address=models.CharField(max_length=300,blank=True,null=True)

    def __str__(self):
       return self.therapist_name

class Admin(models.Model):
    admin_name=models.CharField(max_length=100,blank=True,null=True)
    admin_email=models.EmailField(max_length=100,blank=True,null=True)
    admin_password=models.CharField(max_length=200,blank=True,null=True)
    admin_role = models.CharField(max_length=20, default='admin')
    def __str__(self):
       return self.admin_name

class UserAuth(models.Model):
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.BigIntegerField()  
    user_object = GenericForeignKey('content_type', 'object_id')
    
    user_name = models.CharField(max_length=100,blank=True,null=True)
    user_password = models.CharField(max_length=200,blank=True,null=True)
    user_role = models.CharField(max_length=20,blank=True,null=True)

    def __str__(self):
       return f"{self.user_name}-{self.user_role}"
    
class Review(models.Model):
    customer=models.ForeignKey(Customer,on_delete=models.CASCADE)
    therapist=models.ForeignKey(Therapist,on_delete=models.CASCADE)
    review_rating=models.IntegerField(blank=True,null=True)
    review_date=models.DateTimeField(auto_now=True,blank=True,null=True)

    def __str__(self):
       return f"Review by {self.customer.customer_name} for {self.therapist.therapist_name}"