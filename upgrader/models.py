from django.db import models

# Create your models here.
class WearRating(models.Model):
    name = models.CharField(max_length=100)

class UpgradeItem(models.Model):
    name = models.CharField(max_length=100)
    price = models.IntegerField()

class UpgradeItemsWearRatings(models.Model):
    upgrade_item = models.ForeignKey(UpgradeItem, on_delete=models.CASCADE, related_name='wear_ratings')
    wear_rating = models.ForeignKey(WearRating, on_delete=models.CASCADE, related_name='upgrade_items')