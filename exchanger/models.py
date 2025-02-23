<<<<<<< HEAD
from django.db import models
from my_account.models import Profile, InventoryItem

from django.db import models
from my_account.models import Profile, InventoryItem

class Exchange(models.Model):
    from_user = models.ForeignKey(Profile, related_name='sent_items', on_delete=models.CASCADE)
    to_user = models.ForeignKey(Profile, related_name='received_items', on_delete=models.CASCADE)
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, null=True)
    is_accepted = models.BooleanField(default=False)
    from_user_items_confirmed = models.BooleanField(default=False)
    to_user_items_confirmed = models.BooleanField(default=False)
    session_id = models.CharField(max_length=100, unique=True, null=True)

    def __str__(self):
        return f"Exchange from {self.from_user.username} to {self.to_user.username}"

class SelectedItem(models.Model):
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    exchanger_session = models.CharField(max_length=100)
    is_confirmed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} selected {self.item.item_name}"
=======
from django.db import models

# Create your models here.
>>>>>>> 587eeefc3f2ad2c4ea3190741cdaa5f9b6d795f9
