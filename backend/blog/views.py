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
def get_blog(request):
    query = request.GET.get('search', None)  
    my_posts = request.GET.get('my_posts', None)    
     
    blogs = Blog.objects.all().order_by('-blog_created_at')
    user = None
    try:
      user = request.user
    except:
       pass
    if query:
        blogs = blogs.filter( Q(blog_title__icontains=query) |  Q(blog_author__user_name__icontains=query))

    if my_posts == 'true':
     if not user:
        return Response({"detail":"Authentication required for my_posts"}, status=401)
    blogs = blogs.filter(blog_author=user)

    serializer = BlogSerializer(blogs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_blog(request):
    user = request.user
    if not user:
        return Response({"detail":"User not found"}, status=404)

    serializer = BlogSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(blog_author=user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def blog_detail(request, pk): 
    blog = Blog.objects.filter(pk=pk).first()
    if not blog:
        return Response({"error":"Blog not found"}, status=404)
    serializer = BlogSerializer(blog)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_blog(request, pk):
    user = request.user
    if not user:
        return Response({"detail":"User not found"}, status=404)
    
    blog = Blog.objects.filter(pk=pk, blog_author=user).first()
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

    user = request.user
    blog = Blog.objects.filter(pk=pk, blog_author=user).first()
    if not blog:
        return Response({"error":"Blog not found or unauthorized"}, status=404)

    blog.delete()
    return Response({"success": True}, status=204)

