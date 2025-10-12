# serializers.py
from rest_framework import serializers
from .models import Quiz, QuizQuestion, QuizResult

class QuizSerializer(serializers.ModelSerializer):

    class Meta:
        model = Quiz
        fields = [
            'id',
            'title',
            'description',
            'created_at',
            'updated_at',
            'created_by',
        ]

class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = [
            'id',
            'quiz',  # quiz ID
            'question_text',
            'option_a',
            'option_b',
            'option_c',
            'option_d',
            'correct_option',
            'created_at',
            'updated_at',
        ]

class QuizResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizResult
        fields = [
            'id',
            'quiz',
            'customer',
            'score',
            'result_text'
            'taken_at',
        ]
