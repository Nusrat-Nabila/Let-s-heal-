from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Blog
from .serializers import BlogSerializer

@api_view(['GET'])
def get_blog(request):
    query = request.GET.get('search', None)  
    my_posts = request.GET.get('my_posts', None)    

    blogs = Blog.objects.all().order_by('-blog_created_at')

    if query:
        blogs = blogs.filter( Q(blog_title__icontains=query) |  Q(blog_author__user_name__icontains=query))

    if my_posts == 'true':
        blogs = blogs.filter(blog_author=request.user)

    serializer = BlogSerializer(blogs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def create_blog(request):
    serializer = BlogSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(blog_author=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def blog_detail(request, pk):
    blog = get_object_or_404(Blog, pk=pk)
    serializer = BlogSerializer(blog)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
def update_blog(request, pk):
    blog = get_object_or_404(Blog, pk=pk)
    serializer = BlogSerializer(blog, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_blog(request, pk):
    blog = get_object_or_404(Blog, pk=pk)
    blog.delete()
    return Response({'message': 'Blog deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
