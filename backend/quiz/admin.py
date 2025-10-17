from django.contrib import admin
from .models import Quiz, QuizQuestion, QuizResultRange, QuizAttempt, QuizAnswer
# Register your models here.
admin.site.register([Quiz, QuizQuestion, QuizResultRange, QuizAttempt, QuizAnswer])