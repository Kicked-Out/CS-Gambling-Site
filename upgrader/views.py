from django.http.response import JsonResponse
from django.shortcuts import render

from my_account.models import Profile, InventoryItem
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

MAX_ELEMENTS_PER_PAGE = 16

def get_inventory_items(request, page):
    profile = Profile.objects.get(uid=request.user.uid)
    inventory_items = profile.inventory.all().values()
    inventory_list = []

    for i in range((page - 1) * MAX_ELEMENTS_PER_PAGE, (MAX_ELEMENTS_PER_PAGE * page)):
        if i >= inventory_items.count():
            break

        inventory_list.append(inventory_items[i])

    return JsonResponse(inventory_list, safe=False)

def get_upgrade_items(request, page):
    upgrade_items = UpgradeItemsWearRatings.objects.all()
    upgrade_list = []

    for i in range((page - 1) * MAX_ELEMENTS_PER_PAGE, (MAX_ELEMENTS_PER_PAGE * page)):
        if i >= upgrade_items.count():
            break

        item = upgrade_items[i]
        item_json = {
            "id": item.id,
            "name": item.upgrade_item.name,
            "price": item.upgrade_item.price,
            "image_url": "",
            "wear_rating": item.wear_rating.name,
        }

        upgrade_list.append(item_json)

    return JsonResponse(upgrade_list, safe=False)

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt  # Для простоти; у продакшн-версії використовуйте csrf-токени
def success(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            inventory_item_id = data.get('inventory')
            upgrade_item_id = data.get('upgrade')
            image_url = data.get('image_url')  # використовується, якщо потрібно

            # Отримуємо потрібні об'єкти
            inventory_item = InventoryItem.objects.get(id=inventory_item_id)
            upgrade_items_wear_ratings = UpgradeItemsWearRatings.objects.get(id=upgrade_item_id)
            upgrade_item = upgrade_items_wear_ratings.upgrade_item

            # Видаляємо елемент з інвентарю
            inventory_item.delete()

            # Створюємо новий елемент інвентарю на основі апгрейду
            InventoryItem.objects.create(
                profile=request.user,
                name=upgrade_item.name,
                price=upgrade_item.price,
                image_url=image_url  # або, якщо хочете, upgrade_item.image_url
            )

            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def fail(request, inventory_item_id):
    inventory_item = InventoryItem.objects.get(id=inventory_item_id)
    InventoryItem.delete(inventory_item)

    print(inventory_item_id)

    return JsonResponse({'success': True})