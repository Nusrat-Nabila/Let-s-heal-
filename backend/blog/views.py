from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated ,AllowAny
from rest_framework.decorators import permission_classes
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Blog
from .serializers import BlogSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication


@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_blog(request):
    blogs = Blog.objects.all().order_by('-blog_created_at')
    if not blogs.exists():
            return Response({"message": "No blog found"}, status=status.HTTP_404_NOT_FOUND)
    serializer = BlogSerializer(blogs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def search_blog(request):
    query = request.GET.get('q', '')
    if query:
        blog = Blog.objects.filter(Q(blog_title__icontains=query) | Q(blog_author_name__icontains=query)).order_by('-blog_created_at')

        if not blog.exists():
            return Response({"message": "No blog found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = BlogSerializer(blog, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    # handle case when no query parameter is provided
    return Response({"message": "Please provide a search query"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_blog(request):
    blogs = Blog.objects.filter(blog_author=request.user).order_by('-blog_created_at')
    if not blogs.exists():
            return Response({"message": "No blog found"}, status=status.HTTP_404_NOT_FOUND)
    serializer = BlogSerializer(blogs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_blog(request):
    serializer = BlogSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(blog_author=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def blog_detail(request, pk): 
    blog = Blog.objects.get(pk=pk)
    if not blog:
        return Response({"error":"Blog not found"}, status=404)
    serializer = BlogSerializer(blog)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_blog(request, pk):
    blog = Blog.objects.filter(pk=pk, blog_author=request.user).first()
    if not blog:
        return Response({"error":"Blog not found or unauthorized"}, status=404)
    serializer = BlogSerializer(blog, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_blog(request, pk):
    try:
        pk = int(str(pk).strip())
    except ValueError:
        return Response({"error": "Invalid blog ID"}, status=400)
    
    blog = Blog.objects.filter(pk=pk, blog_author=request.user).first()
    if not blog:
        return Response({"error":"Blog not found or unauthorized"}, status=404)
    blog.delete()
    return Response({"success": True}, status=200)

