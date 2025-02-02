from django.db import models
from django.contrib.auth.models import User, AbstractUser

class Profile(AbstractUser):
    avatar = models.CharField(max_length=255, blank=True, null=True)
    best_drop = models.CharField(max_length=255, blank=True, null=True)
    expensive_case = models.CharField(max_length=255, blank=True, null=True)
    cases_opened = models.IntegerField(default=0)
    wallet_balance = models.FloatField(default=0.00)

    def __str__(self):
        return self.username

class InventoryItem(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    item_name = models.CharField(max_length=255)
    item_value = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return 
