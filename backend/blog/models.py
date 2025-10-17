from django.db import models

# Create your models here.
from account.models import UserAuth

class Blog(models.Model):
    blog_title=models.CharField(max_length=200,blank=True,null=True)
    blog_content=models.TextField(blank=True,null=True)
    blog_image=models.ImageField(blank=True,null=True)
    blog_author_name=models.CharField(max_length=100,blank=True,null=True)
    blog_author=models.ForeignKey(UserAuth,on_delete=models.CASCADE,blank=True,null=True)
    blog_created_at=models.DateTimeField(auto_now_add=True)
    blog_updated_at=models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.blog_title
