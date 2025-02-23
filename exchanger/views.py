from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from my_account.models import Profile, InventoryItem
from .models import Exchange, SelectedItem

@login_required
def exchanger(request, to_user_id):
    from_user = request.user
    to_user = get_object_or_404(Profile, id=to_user_id)
    
    from_user_inventory = InventoryItem.objects.filter(profile=from_user)
    to_user_inventory = InventoryItem.objects.filter(profile=to_user)
    
    session_id = f"exchange_{min(from_user.id, to_user.id)}_{max(from_user.id, to_user.id)}"
    
    from_user_selections = SelectedItem.objects.filter(exchanger_session=session_id, user=from_user)
    to_user_selections = SelectedItem.objects.filter(exchanger_session=session_id, user=to_user)
    
    exchange, created = Exchange.objects.get_or_create(
        session_id=session_id,
        defaults={
            'from_user': from_user if from_user.id < to_user.id else to_user,
            'to_user': to_user if from_user.id < to_user.id else from_user,
            'item': None,
        }
    )

    is_from_user = exchange.from_user == from_user
    is_to_user = exchange.to_user == from_user

    if request.method == "POST":
        from_items_ids = request.POST.get("from_items", "").split(",")
        to_items_ids = request.POST.get("to_items", "").split(",")
        
        from_items_ids = [id for id in from_items_ids if id]
        to_items_ids = [id for id in to_items_ids if id]

        if from_items_ids or to_items_ids:
            SelectedItem.objects.filter(exchanger_session=session_id).delete()

            for item_id in from_items_ids:
                item = get_object_or_404(InventoryItem, id=item_id, profile=from_user)
                SelectedItem.objects.create(
                    user=from_user,
                    item=item,
                    exchanger_session=session_id,
                    is_confirmed=False
                )

            for item_id in to_items_ids:
                item = get_object_or_404(InventoryItem, id=item_id, profile=to_user)
                SelectedItem.objects.create(
                    user=to_user,
                    item=item,
                    exchanger_session=session_id,
                    is_confirmed=False
                )

            if 'confirm_items' in request.POST:
                if is_from_user:
                    exchange.from_user_items_confirmed = True
                elif is_to_user:
                    exchange.to_user_items_confirmed = True
                exchange.save()
                return JsonResponse({
                    'success': True,
                    'message': 'Items confirmed',
                    'from_confirmed': exchange.from_user_items_confirmed,
                    'to_confirmed': exchange.to_user_items_confirmed
                })

            if 'confirm_trade' in request.POST:
                if not (exchange.from_user_items_confirmed and exchange.to_user_items_confirmed):
                    return JsonResponse({
                        'success': False,
                        'message': 'Both users must confirm items first'
                    })

                from_items = InventoryItem.objects.filter(id__in=from_items_ids, profile=from_user)
                to_items = InventoryItem.objects.filter(id__in=to_items_ids, profile=to_user)

                if from_items.exists() or to_items.exists():
                    for from_item in from_items:
                        from_item.profile = to_user
                        from_item.save()

                    for to_item in to_items:
                        to_item.profile = from_user
                        to_item.save()

                    SelectedItem.objects.filter(exchanger_session=session_id).delete()
                    exchange.delete()
                    return JsonResponse({'success': True, 'message': 'Trade completed!'})
                
            if 'cancel_trade' in request.POST:
                SelectedItem.objects.filter(exchanger_session=session_id).delete()
                exchange.delete()
                return JsonResponse({'success': True, 'message': 'Trade cancelled'})

            return JsonResponse({'success': True})
        
        return JsonResponse({'success': False, 'message': 'No items selected'})

    context = {
        "from_user": from_user,
        "to_user": to_user,
        "from_user_inventory": from_user_inventory,
        "to_user_inventory": to_user_inventory,
        "from_user_selections": from_user_selections,
        "to_user_selections": to_user_selections,
        "from_user_items_confirmed": exchange.from_user_items_confirmed,
        "to_user_items_confirmed": exchange.to_user_items_confirmed,
    }
    return render(request, "profile/exchange.html", context)