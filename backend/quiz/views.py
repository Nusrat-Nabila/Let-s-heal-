from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response
from rest_framework import status

from .models import Quiz, QuizQuestion, QuizResult
from .serializers import QuizSerializer, QuizQuestionSerializer, QuizResultSerializer
from account.models import Customer, UserAuth
from django.utils import timezone

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_quiz(request):
    if request.user.user_role!="admin":
        return Response ({'messeage':"only admin can create quiz}"},status=status.HTTP_403_FORBIDDEN)
    serializer=QuizSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(created_by=request.user)
        return Response (serializer.data, status=status.HTTP_201_CREATED) 
    return Response (serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_question(request,pk):
    quiz=Quiz.objects.get(id=pk)
    if request.user.user_role!="admin" and quiz.created_by!=request.user:
        return Response ({'message':"only admin can add question}"},status=status.HTTP_403_FORBIDDEN)
    else:
        serializer=QuizQuestionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(quiz=quiz)
            return Response (serializer.data, status=status.HTTP_201_CREATED) 
        else:
          return Response (serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
    
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_question(request,question_id):
    quiz=Quiz.objects.get(id=question_id)
    if request.user.user_role!="admin" and quiz.created_by!=request.user:
        return Response ({'message':"only admin can add question}"},status=status.HTTP_403_FORBIDDEN)
    question=QuizQuestion.objects.get(id=question_id)
    serializer=QuizQuestionSerializer(question,data=request.data,partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response (serializer.data,status=status.HTTP_200_OK)
    else:
        return Response (serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_question(request,question_id):
    question=QuizQuestion.objects.get(id=question_id)
    if request.user.user_role!="admin" and question.quiz.created_by!=request.user:
        return Response ({'message':"only admin can delete question}"},status=status.HTTP_403_FORBIDDEN)
    question.delete()
    return Response({'message':"question deleted successfully"},status=status.HTTP_204_NO_CONTENT)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_quiz(request,question_id):
    quiz=Quiz.objects.get(id=question_id)
    if request.user.user_role!="admin" and quiz.created_by!=request.user:
        return Response ({'message':"only admin can delete question}"},status=status.HTTP_403_FORBIDDEN)
    quiz.delete()
    return Response({'message':"question deleted successfully"},status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([AllowAny])
def view_all_quiz(request):
    quiz=Quiz.objects.all()

    serializer=QuizSerializer(quiz,many=True)
    return Response(serializer.data,status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_quiz_question(request,pk):
    quiz=Quiz.objects.get(id=pk)
    question=QuizQuestion.objects.filter(quiz=quiz)
    serializer=QuizQuestionSerializer(question,many=True)
    return Response(serializer.data,status=status.HTTP_200_OK)


    