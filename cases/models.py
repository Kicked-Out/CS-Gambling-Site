from django.db import models
from django.db.models import ForeignKey
from my_account.models import Profile


# Create your models here.
class Case(models.Model):
    image = models.CharField(max_length=255)
    name = models.CharField(max_length=100)
    name_uk = models.CharField(max_length=100)
    price = models.FloatField(default=0.00)

class CaseSkin(models.Model):
    name = models.CharField(max_length=100)
    odds = models.DecimalField(decimal_places=3, max_digits=10)
    case = ForeignKey(Case, on_delete=models.CASCADE, related_name='case_skins')

class Skin(models.Model):
    name = models.CharField(max_length=100)
    name_uk = models.CharField(max_length=100)
    image = models.CharField(max_length=100)
    price = models.DecimalField(decimal_places=2, max_digits=10)
    case = ForeignKey(Case, on_delete=models.CASCADE, related_name='skins')
    profile = ForeignKey(Profile, on_delete=models.CASCADE, related_name='skins')

