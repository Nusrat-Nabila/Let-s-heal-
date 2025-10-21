from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response
from .models import Quiz, QuizQuestion, QuizResultRange, QuizAttempt, QuizAnswer, Customer
from .serializers import QuizSerializer, QuizQuestionSerializer, QuizResultRangeSerializer, QuizAttemptSerializer, QuizAnswerSerializer


def get_main_quiz():
    quiz = Quiz.objects.filter(is_active=True).first()
    if not quiz:
        raise ValueError("No active quiz found. Please create one in admin panel.")
    return quiz

@api_view(['GET'])
@permission_classes([AllowAny])
def admin_view_all_questions(request):
    quiz = get_main_quiz()
    questions = QuizQuestion.objects.filter(quiz=quiz).order_by('order')
    serializer = QuizQuestionSerializer(questions, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_add_question(request):
    quiz = get_main_quiz()
    serializer = QuizQuestionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(quiz=quiz)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([AllowAny])
def admin_update_question(request, question_id):
    question = get_object_or_404(QuizQuestion, id=question_id)
    serializer = QuizQuestionSerializer(question, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def admin_delete_question(request, question_id):
    question = get_object_or_404(QuizQuestion, id=question_id)
    question.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_add_result_range(request):
    quiz = get_main_quiz()
    data = request.data.copy()
    data['quiz'] = quiz.id
    serializer = QuizResultRangeSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_quiz_attempt(request):
    try:
        customer_id = request.data.get('customer_id')
        
        if not customer_id:
            return Response({
                'status': 'fail', 
                'message': 'Customer ID is required in request body.'
            }, status=status.HTTP_400_BAD_REQUEST)

        customer = get_object_or_404(Customer, id=customer_id)
        quiz = Quiz.objects.filter(is_active=True).first()
        
        if not quiz:
            return Response({'status': 'fail', 'message': 'No active quiz found.'}, status=status.HTTP_400_BAD_REQUEST)

        attempt = QuizAttempt.objects.create(customer=customer, quiz=quiz)
        return Response(QuizAttemptSerializer(attempt).data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'status': 'fail', 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_next_question(request, attempt_id):
    attempt = get_object_or_404(QuizAttempt, id=attempt_id)
    if attempt.is_completed:
        return Response({"done": True, "message": "Attempt already completed."})
    
    questions = QuizQuestion.objects.filter(quiz=attempt.quiz).order_by('order')
    answered = attempt.answers.values_list('question_id', flat=True)
    next_question = questions.exclude(id__in=answered).first()
    if not next_question:
        return Response({"done": True})  
    return Response(QuizQuestionSerializer(next_question).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def submit_answer(request, attempt_id):
    attempt = get_object_or_404(QuizAttempt, id=attempt_id)
    if attempt.is_completed:
        return Response({"error": "Attempt already completed"}, status=400)

    q_id = request.data.get('question_id')
    chosen = (request.data.get('chosen_option') or '').lower()
    if chosen not in ['a', 'b', 'c', 'd']:
        return Response({"error": "chosen_option must be 'a','b','c','d'"}, status=400)

    question = get_object_or_404(QuizQuestion, id=q_id, quiz=attempt.quiz)
    answer, _ = QuizAnswer.objects.update_or_create(attempt=attempt, question=question,defaults={'chosen_option': chosen})
    return Response(QuizAnswerSerializer(answer).data, status=201)


@api_view(['POST'])
@permission_classes([AllowAny])
def finish_attempt(request, attempt_id):
    attempt = get_object_or_404(QuizAttempt, id=attempt_id)

    if attempt.is_completed:
        return Response(QuizAttemptSerializer(attempt).data)
    
    total_score = 0
    for ans in attempt.answers.select_related('question'):
        if ans.chosen_option == 'a':
            score = ans.question.score_a
        elif ans.chosen_option == 'b':
            score = ans.question.score_b
        elif ans.chosen_option == 'c':
            score = ans.question.score_c
        elif ans.chosen_option == 'd':
            score = ans.question.score_d
        else:
            score = 0
        
        total_score += score

    result_range = QuizResultRange.objects.filter(
        quiz=attempt.quiz,
        min_score__lte=total_score,
        max_score__gte=total_score 
    ).first()

    attempt.total_score = total_score
    attempt.result_text = result_range.result_text if result_range else "No result available."
    attempt.is_completed = True
    attempt.completed_at = timezone.now()
    attempt.save()

    return Response(QuizAttemptSerializer(attempt).data)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_attempt_result(request, attempt_id):
    attempt = get_object_or_404(QuizAttempt, id=attempt_id)
    if not attempt.is_completed:
        return Response({"error": "Attempt not yet completed"}, status=status.HTTP_400_BAD_REQUEST)
    return Response(QuizAttemptSerializer(attempt).data)