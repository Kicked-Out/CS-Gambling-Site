from django.db import models
from django.contrib.auth.models import User, AbstractUser

class Profile(AbstractUser):
    avatar = models.CharField(max_length=255, blank=True, null=True)
    best_drop = models.CharField(max_length=255, blank=True, null=True)
    best_drop_image = models.CharField(max_length=255, blank=True, null=True)
    best_drop_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    expensive_case = models.CharField(max_length=255, blank=True, null=True)
    expensive_case_image = models.CharField(max_length=255, blank=True, null=True)
    cases_opened = models.IntegerField(default=0)
    wallet_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    uid = models.CharField(max_length=255, blank=True, null=True, unique=True)
    trade_url = models.CharField(max_length=255, blank=True, null=True)
    is_banned = models.BooleanField(default=False)

    def __str__(self):
        return self.username

class InventoryItem(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='inventory')
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    image_url = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.name

class WithdrawRequest(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    create_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=255, default='pending')
    transaction_id = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"WithdrawRequest for {self.profile.username} with {self.item.item_name}"

class Friendship(models.Model):
    from_user = models.ForeignKey(Profile, related_name='friendships_from', on_delete=models.CASCADE)
    to_user = models.ForeignKey(Profile, related_name='friendships_to', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_accepted = models.BooleanField(default=False)

    class Meta:
        unique_together = ('from_user', 'to_user')

    def __str__(self):
        return f"{self.from_user.username} is friends with {self.to_user.username}"
    

class Notification(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.profile.username}: {self.message}"

class Message(models.Model):
    from_user = models.ForeignKey(Profile, related_name='sent_messages', on_delete=models.CASCADE)
    to_user = models.ForeignKey(Profile, related_name='received_messages', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.from_user.username} to {self.to_user.username} at {self.timestamp}"