from django.shortcuts import render
from django.shortcuts import redirect, render, HttpResponse
from django.contrib.auth.decorators import login_required, user_passes_test
from allauth.socialaccount.models import SocialAccount
from my_account.models import Profile, InventoryItem
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from cases.models import Case, Skin, CaseSkin
import json, random
import os, sys
from decimal import Decimal
import execjs
import decimal

@login_required
def add_funds(request):
    user = request.user
    user_profile = Profile.objects.get(username=user.username)
    social_account = SocialAccount.objects.get(user=request.user)
    extra_data = social_account.extra_data
    avatar_url = extra_data["avatarfull"]

    if(request.user.is_superuser):
        if request.method == 'POST':
            user_profile.wallet_balance += decimal.Decimal(request.POST.get('amount'))
            user_profile.save()
            
            return redirect(f'/accounts/profile/{user_profile.uid}/')
        else:
            return render(request, 'admins/add_funds.html', {'user_profile': user_profile, 'avatar': avatar_url})
    
    return redirect(f'/accounts/profile/{user_profile.uid}/')

@login_required
def update_balance(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            amount = float(data.get('amount'))
            user_profile = Profile.objects.get(username=request.user.username)

            if 'action' in data and data['action'] == 'deposit':
                user_profile.wallet_balance += amount
            elif 'action' in data and data['action'] == 'withdraw':
                if user_profile.wallet_balance >= amount:
                    user_profile.wallet_balance -= amount
                else:
                    return HttpResponse(json.dumps({'status': 'error', 'message': 'Not enough balance'}), content_type='application/json', status=400)
            else:
                return HttpResponse(json.dumps({'status': 'error', 'message': 'Invalid action'}), content_type='application/json', status=400)

            user_profile.save()
            return HttpResponse(json.dumps({'status': 'success', 'wallet_balance': user_profile.wallet_balance}), content_type='application/json', status=200)
        except Exception as e:
            return HttpResponse(json.dumps({'status': 'error', 'message': str(e)}), content_type='application/json', status=400)
    else:
        return HttpResponse(json.dumps({'status': 'error', 'message': 'Invalid request method'}), content_type='application/json', status=400)

@user_passes_test(lambda u: u.is_superuser)
def ban_user(request, user_id):
    try:
        user_profile = Profile.objects.get(id=user_id)
        if(not user_profile.is_superuser):
            user_profile.is_banned = True
            user_profile.save()
            return redirect('/admins/user_list/')
        else:
            return render(request, 'admin_panel.html', {'user': 'Error: You can\'t ban superusers'})
    except Profile.DoesNotExist:
        return redirect('/admins/user_list/')

    
@user_passes_test(lambda u: u.is_superuser)
def unban_user(request, user_id):

    try:
        user_profile = Profile.objects.get(id=user_id)
        user_profile.is_banned = False
        user_profile.save()
        return redirect('/admins/user_list/')
    except Profile.DoesNotExist:
        return redirect('/admins/user_list/')

@user_passes_test(lambda u: u.is_superuser)
def add_item_to_inventory(request):
    return render(request, 'admins/add_skins.html')

@csrf_exempt
@user_passes_test(lambda u: u.is_superuser)
def add_item_to_inventory_view(request):
    data = json.loads(request.body)
    inventory = data['inventory']
    item_name = data['item_name']
    image_url = data['image_url']
    price = data['price']

    user_profile = Profile.objects.get(uid=inventory)
    InventoryItem.objects.create(profile=user_profile, name=item_name, image_url=image_url, price=price)
    
    return HttpResponse(200)

@csrf_exempt
@user_passes_test(lambda u: u.is_superuser)
def add_item_to_case_view(request, case_name, item_name):
    print(case_name)
    case = Case.objects.get(name=case_name)
    case_skin = CaseSkin.objects.create(name=item_name, odds=random.uniform(0, 1), case=case)
    return HttpResponse(200)

@user_passes_test(lambda u: u.is_superuser)
def remove_item_from_inventory(request, user_id, item_id):
    user_profile = Profile.objects.get(uid=user_id)
    InventoryItem.objects.filter(profile=user_profile, id=item_id).delete()
    return redirect(f'/accounts/profile/{user_profile.uid}')


@user_passes_test(lambda u: u.is_superuser)
def update_case_price(request):
    pass
# Зробити через джава скрипт

@user_passes_test(lambda u: u.is_superuser)
@csrf_exempt
def add_case(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name')
        price = data.get('price')
        image_url = data.get('image')
        max_price = data.get('max_price', 0)
        
        try:
            max_price = float(max_price)
        except ValueError:
            max_price = 0
        
        case = Case.objects.create(name=name, price=price, image=image_url)
        
        total_price = 0
        skins = list(Skin.objects.all())

        while total_price < max_price and skins:
            skin = random.choice(skins)
            if total_price + skin.price <= max_price:
                CaseSkin.objects.create(name=skin.name, odds=random.uniform(0, 1), case=case)
                total_price += skin.price
                print(f"Added skin: {skin.name}, Total price: {total_price}")
            skins.remove(skin)

        return redirect('/admins/add_cases/')
    else:
        return render(request, 'admins/add_cases.html')
    
@user_passes_test(lambda u: u.is_superuser)
def remove_case(request, case_id):
    try:
        case = Case.objects.get(id=case_id)
        case.delete()
        return redirect('/admins/case_list_admin/')
    except Case.DoesNotExist:
        return redirect('/admins/case_list_admin/')
    

@user_passes_test(lambda u: u.is_superuser)
def user_list(request):
    users = Profile.objects.all()
    return render(request, 'admins/admin_user_list.html', {'users': users})

@user_passes_test(lambda u: u.is_superuser)
def case_list_admin(request):
    if request.method == 'POST':
        try:
            new_price = Decimal(request.POST.get('amount'))
            case = Case.objects.get(id=request.POST.get('case_id'))
            case.price = new_price
            case.save()
            return redirect('/admins/case_list_admin/')
        except Case.DoesNotExist as e:
            return HttpResponse({'status': 'error', 'message': str(e)}, content_type='application/json', status=404)
    cases = Case.objects.all()
    return render(request, 'admins/case_list_admin.html', {'cases': cases})

@user_passes_test(lambda u: u.is_superuser)
def user_detail(request, user_id):
    user = Profile.objects.get(id=user_id)
    return render(request, 'admins/admin_user_detail.html', {'user': user})

@user_passes_test(lambda u: u.is_superuser)
def admin_panel(request):
    return render(request, 'admins/admin_panel.html')

