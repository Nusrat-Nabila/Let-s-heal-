from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated ,AllowAny
from rest_framework.decorators import permission_classes
from django.db.models import Q
from .models import Blog
from .serializers import BlogSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication


@api_view(['GET'])
@permission_classes([AllowAny])
def search_blog(request):
    search_query = request.GET.get('search', '').strip() or request.GET.get('q', '').strip()

    if search_query:
        blogs = Blog.objects.filter(Q(blog_title__icontains=search_query) |Q(blog_author_name__icontains=search_query)).order_by('-blog_created_at')
    else:
        blogs = Blog.objects.all().order_by('-blog_created_at')

    serializer = BlogSerializer(blogs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

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

#view a blog post detatils
@api_view(['GET'])
@permission_classes([AllowAny])
def blog_detail(request, pk): 
    try:
        blog = Blog.objects.get(pk=pk)
    except Blog.DoesNotExist:
        return Response({"error": "Blog not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = BlogSerializer(blog)
    data = serializer.data
    data['is_author'] = False  # default

    jwt_auth = JWTAuthentication()
    try:
        user_auth_tuple = jwt_auth.authenticate(request)
        if user_auth_tuple is not None:
            user, token = user_auth_tuple
            if user == blog.blog_author:
                data['is_author'] = True
    except Exception:
        pass

    return Response(data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_blog(request, pk):
    blog = Blog.objects.get(pk=pk)
    if blog.blog_author != request.user:
        return Response({"error": "You are not authorized to update this blog"}, status=status.HTTP_403_FORBIDDEN)
    serializer = BlogSerializer(blog, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_blog(request, pk):
    blog = Blog.objects.get(pk=pk)
    if blog.blog_author != request.user:
        return Response({"error": "You are not authorized to delete this blog"}, status=status.HTTP_403_FORBIDDEN)

    blog.delete()
    return Response({"success": True, "message": "Blog deleted successfully"}, status=status.HTTP_200_OK)
