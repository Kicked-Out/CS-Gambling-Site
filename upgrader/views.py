from django.shortcuts import render
from my_account.models import Profile, InventoryItem
from .models import UpgradeItemsWearRatings
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import math


# Create your views here.
def upgrade(request):
    profile = request.user
    inventory_items = None
    upgrade_items = None

    if (profile.is_authenticated):
        inventory_items = profile.inventory.all()
        upgrade_items = UpgradeItemsWearRatings.objects.all()

    print(inventory_items)

    return render(request, 'upgrade/upgrade.html', {'inventory_items': inventory_items, 'upgrade_items': upgrade_items})

MAX_ELEMENTS_PER_PAGE = 16

def get_inventory_pages(request):
    profile = request.user
    inventory_items = profile.inventory
    inventory_pages = 0

    if inventory_items.count() != 0:
        inventory_pages = math.ceil(inventory_items.count() / MAX_ELEMENTS_PER_PAGE)

    return JsonResponse(inventory_pages, safe=False)

def get_upgrade_pages(request):
    upgrade_items = UpgradeItemsWearRatings.objects.all()
    upgrade_pages = 0

    if upgrade_items.count() != 0:
        upgrade_pages = math.ceil(upgrade_items.count() / MAX_ELEMENTS_PER_PAGE)

    return JsonResponse(upgrade_pages, safe=False)

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

# @csrf_exempt
# def success(request):
#     if request.method == 'POST':
#         try:
#             data = json.loads(request.body)
#             inventory_item_id = data.get('inventory_item_id')
#             upgrade_item_id = data.get('upgrade_item_id')
#             price = data.get('upgrade_item_price')
#             image_url = data.get('upgrade_item_image_url')
#
#             inventory_item = InventoryItem.objects.get(id=inventory_item_id)
#             upgrade_items_wear_ratings = UpgradeItemsWearRatings.objects.get(id=upgrade_item_id)
#             upgrade_item = upgrade_items_wear_ratings.upgrade_item
#             print(upgrade_item.name)
#
#             inventory_item.delete()
#
#             InventoryItem.objects.create(
#                 profile=request.user,
#                 name=upgrade_item.name,
#                 price=price,
#                 image_url=image_url
#             )
#
#             return JsonResponse({'success': True})
#         except Exception as e:
#             print(e)
#             return JsonResponse({'error': str(e)}, status=400)
#     else:
#         return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def give_item(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            upgrade_item_id = data.get('upgrade_item_id')
            price = data.get('upgrade_item_price')
            image_url = data.get('upgrade_item_image_url')

            upgrade_items_wear_ratings = UpgradeItemsWearRatings.objects.get(id=upgrade_item_id)
            upgrade_item = upgrade_items_wear_ratings.upgrade_item

            InventoryItem.objects.create(
                profile=request.user,
                name=upgrade_item.name,
                price=price,
                image_url=image_url
            )

            return JsonResponse({'success': True})
        except Exception as e:
            print(e)
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def remove_item(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print(data)
            inventory_item_id = data.get('inventory_item_id')
            print(inventory_item_id)

            inventory_item = InventoryItem.objects.get(id=inventory_item_id)

            inventory_item.delete()

            return JsonResponse({'success': True})
        except Exception as e:
            print(e)
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def fail(request, inventory_item_id):
    inventory_item = InventoryItem.objects.get(id=inventory_item_id)
    InventoryItem.delete(inventory_item)

    print(inventory_item_id)

    return JsonResponse({'success': True})