from django.db import models

# Create your models here.
from account.models import UserAuth

class Chat(models.Model):
    user = models.ForeignKey(UserAuth, on_delete=models.CASCADE)
    message = models.TextField(blank=False, null=False)
    date_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat by {self.user.user_name} at {self.date_time}"