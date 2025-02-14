from django.shortcuts import render

# Create your views here.
def upgrade(request):
    user = request.user
    inventoryItems = None

    if (user.is_authenticated):
        inventoryItems = user.inventory

    return render(request, 'upgrade/upgrade.html', {'inventoryШtems': inventoryItems})