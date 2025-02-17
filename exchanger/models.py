from django.db import models
from my_account.models import Profile

# Create your models here.
class Friendship(models.Model):
    from_user = models.ForeignKey(Profile, related_name='frendship_from', on_delete=models.CASCADE)
    to_user = models.ForeignKey(Profile, related_name='frendship_to', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('from_user', 'to_user')

    def __str__(self):
        return f"{self.from_user.username} is friends with {self.to_user.username}"
