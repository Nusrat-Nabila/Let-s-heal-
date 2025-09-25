from django.contrib import admin
from .models import Quiz, QuizQuestion, QuizResult
# Register your models here.
admin.site.register([Quiz, QuizQuestion, QuizResult])