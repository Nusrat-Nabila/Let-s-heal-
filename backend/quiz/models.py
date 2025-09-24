from django.db import models

# Create your models here.
from account.models import Customer, Therapist,Admin, UserAuth 

class Quiz(models.Model):
    title = models.CharField(max_length=255,blank=True,null=True)
    description = models.TextField(blank=True,null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by=models.ForeignKey(UserAuth,on_delete=models.CASCADE)

    def __str__(self):
        return self.title
    
class QuizQuestion(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    question_text = models.TextField(blank=True,null=True)
    option_a= models.CharField(max_length=255,blank=True,null=True)
    option_b= models.CharField(max_length=255,blank=True,null=True)
    option_c= models.CharField(max_length=255,blank=True,null=True)
    option_d= models.CharField(max_length=255,blank=True,null=True)
    correct_option_choices = (
    ('A', 'A'),
    ('B', 'B'),
    ('C', 'C'),
    ('D', 'D'),
     )

    correct_option = models.CharField(max_length=5,choices=correct_option_choices,default='A')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.question_text
    
class QuizResult(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    score = models.IntegerField(blank=True,null=True)
    taken_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer.customer_name} - {self.quiz.title}"