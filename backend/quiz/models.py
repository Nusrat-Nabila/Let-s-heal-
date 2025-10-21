from django.db import models
from account.models import Customer, Admin
class Quiz(models.Model):
    title = models.CharField(max_length=255, blank=True, null=True)
    created_by = models.ForeignKey(Admin, on_delete=models.SET_NULL, null=True, related_name='quizzes')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return self.title or "Untitled Quiz"

class QuizQuestion(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    order = models.PositiveIntegerField(default=0, help_text="Controls question order in the quiz",blank=True, null=True)
    question_text = models.TextField(blank=True, null=True)
    option_a = models.CharField(max_length=255,blank=True, null=True)
    option_b = models.CharField(max_length=255,blank=True, null=True)
    option_c = models.CharField(max_length=255,blank=True, null=True)
    option_d = models.CharField(max_length=255,blank=True, null=True)

    score_a = models.IntegerField(default=0)
    score_b = models.IntegerField(default=0)
    score_c = models.IntegerField(default=0)
    score_d = models.IntegerField(default=0)
    is_required = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Q{self.order} - {self.quiz.title}"

class QuizResultRange(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='result_ranges')
    min_score = models.IntegerField(blank=True, null=True)
    max_score = models.IntegerField(blank=True, null=True)
    result_text = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['min_score']

    def __str__(self):
        return f"{self.quiz.title}: {self.min_score}-{self.max_score}"

class QuizAttempt(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    total_score = models.IntegerField(null=True, blank=True)
    result_text = models.TextField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Attempt {self.id} by {self.customer} on {self.quiz.title}"


class QuizAnswer(models.Model):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE)
    chosen_option = models.CharField(max_length=1, choices=[('a', 'A'), ('b', 'B'), ('c', 'C'), ('d', 'D')], blank=True, null=True)
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('attempt', 'question')

    def __str__(self):
        return f"Attempt {self.attempt.id} Q{self.question.order} => {self.chosen_option}"
