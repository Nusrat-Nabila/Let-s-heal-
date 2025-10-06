# serializers.py
from rest_framework import serializers
from .models import Blog

class BlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blog
        fields = [
            'id',
            'blog_title',
            'blog_content',
            'blog_image',
            'blog_author_name',
            'blog_author',
            'blog_created_at',
            'blog_updated_at',
        ]
