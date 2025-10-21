from rest_framework import serializers
from account.models import Customer, Admin
from .models import Quiz, QuizQuestion, QuizResultRange, QuizAttempt, QuizAnswer
from account.serializers import CustomerSerializer


class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = [
            'id',
            'quiz',
            'order',
            'question_text',
            'option_a',
            'option_b',
            'option_c',
            'option_d',
            'score_a',
            'score_b',
            'score_c',
            'score_d',
            'is_required'
        ]
        read_only_fields = ['id','quiz']


class QuizResultRangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizResultRange
        fields = ['id', 'quiz', 'min_score', 'max_score', 'result_text']


class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)
    result_ranges = QuizResultRangeSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id',
            'title',
            'created_by',
            'created_at',
            'is_active',
            'questions',
            'result_ranges'
        ]

class QuizAnswerSerializer(serializers.ModelSerializer):
    question = QuizQuestionSerializer(read_only=True)
    question_id = serializers.PrimaryKeyRelatedField(source='question',queryset=QuizQuestion.objects.all(),write_only=True)

    class Meta:
        model = QuizAnswer
        fields = ['id', 'attempt', 'question', 'question_id', 'chosen_option', 'answered_at']
        read_only_fields = ['id', 'answered_at', 'question']

class QuizAttemptSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    quiz = QuizSerializer(read_only=True)
    quiz_id = serializers.PrimaryKeyRelatedField(source='quiz',queryset=Quiz.objects.filter(is_active=True), write_only=True)
    answers = QuizAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = QuizAttempt
        fields = [
            'id',
            'customer',
            'quiz',
            'quiz_id',
            'started_at',
            'completed_at',
            'total_score',
            'result_text',
            'is_completed',
            'answers'
        ]
        read_only_fields = ['id', 'started_at', 'completed_at', 'total_score', 'result_text', 'is_completed', 'answers']