from django.shortcuts import render

from .models import UpgradeItemsWearRatings


# Create your views here.
def upgrade(request):
    user = request.user
    inventory_items = None
    upgrade_items = None

    if (user.is_authenticated):
        inventory_items = user.inventory
        upgrade_items = UpgradeItemsWearRatings.objects.all()

    return render(request, 'upgrade/upgrade.html', {'inventory_items': inventory_items, 'upgrade_items': upgrade_items})