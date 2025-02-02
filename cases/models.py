from django.db import models
from django.db.models import ForeignKey


# Create your models here.
class Case(models.Model):
    name = models.CharField(max_length=100)
    # description = models.TextField()
    price = models.DecimalField(decimal_places=3, max_digits=10)

class Weapon(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Skin(models.Model):
    name = models.CharField(max_length=100)
    weapon = ForeignKey(Weapon, on_delete=models.CASCADE, related_name='skins')
    image = models.ImageField(upload_to=f'skins/{weapon.name}/')
    case = ForeignKey(Case, on_delete=models.CASCADE, related_name='skins')
    price = models.DecimalField(decimal_places=2, max_digits=10)
    range = models.IntegerField()
    odds = models.DecimalField(decimal_places=3, max_digits=10)