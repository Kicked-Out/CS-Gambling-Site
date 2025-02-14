from django.shortcuts import redirect, render, HttpResponse
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.views.decorators.csrf import csrf_exempt
from allauth.socialaccount.models import SocialAccount
from .models import Profile, InventoryItem, WithdrawRequest
from cases.models import Case
import json
from .forms import WithdrawRequestForm
import decimal
from decimal import Decimal

def is_user_logged_in(request):
    return request.user.is_authenticated

@login_required(login_url='/accounts/steam/login/?process=login')
def profile(request):
    social_account = SocialAccount.objects.get(user=request.user)
    extra_data = social_account.extra_data
    avatar_url = extra_data["avatarfull"]
    user = extra_data['personaname']
    u_id = extra_data['steamid']

    if request.method == 'POST':
        user_profile = Profile.objects.get(username=request.user.username)
        user_profile.trade_url = request.POST['trade_url']
        user_profile.save()
    
    user_profile = Profile.objects.get(username=request.user.username)
    user_profile.avatar = avatar_url
    user_profile.save()

    inventory_items = InventoryItem.objects.filter(profile=user_profile)

    context = {
        'user_name': user,
        'avatar': avatar_url,
        'profile': user_profile,
        'inventory_items': inventory_items,
        'uid': u_id,
    }
    return render(request, 'profile/profile.html', context)

def user_logout(request):
    logout(request)
    return redirect('/')

@login_required
def add_funds(request):
    if(request.user.is_superuser):
        user = request.user
        user_profile = Profile.objects.get(username=user.username)
        social_account = SocialAccount.objects.get(user=request.user)
        extra_data = social_account.extra_data
        avatar_url = extra_data["avatarfull"]
        if request.method == 'POST':
            user_profile.wallet_balance += float(request.POST['amount'])
            user_profile.save()
            return redirect('profile')
        else:
            return render(request, 'profile/add_funds.html', {'user_profile': user_profile, 'avatar': avatar_url})
    
    return redirect('profile')
    

@login_required
def cases_opened(request):
    user_profile = Profile.objects.get(username=request.user.username)
    cases_opened = user_profile.cases_opened
    user_profile.cases_opened += 1
    user_profile.save()
    return HttpResponse(request, cases_opened)

@csrf_exempt
@login_required
def open_case(request):
    if request.method == 'POST':
        body_unicode = request.body.decode('utf-8')

        body_data = json.loads(body_unicode)
        item_name = body_data.get('name')
        item_value = body_data.get('price')
        item_image = body_data.get('image')
        case_name = body_data.get('case_name')
        case_image = Case.objects.get(name=case_name).image
        case_price = float(body_data.get('case_price', 0))

        user_profile = Profile.objects.get(username=request.user.username)

        if user_profile.wallet_balance < case_price:
            return HttpResponse('Not enough money', status=500)

        user_profile.wallet_balance = Decimal(user_profile.wallet_balance) - Decimal(case_price)
        user_profile.save(update_fields=["wallet_balance"])

        new_item = InventoryItem.objects.create(
            profile=user_profile, 
            item_name=item_name, 
            item_value=item_value, 
            image_url=item_image
            )

        best_drop_item = InventoryItem.objects.filter(item_name=user_profile.best_drop).first()
        if user_profile.best_drop is None or (best_drop_item and new_item.item_value > best_drop_item.item_value):
            user_profile.best_drop = new_item.item_name
            user_profile.best_drop_image = new_item.image_url
            user_profile.best_drop_value = new_item.item_value
            user_profile.expensive_case = case_name
            user_profile.expensive_case_image = case_image
            user_profile.save()

        return HttpResponse('200', content_type='application/json')
    else:
        return HttpResponse('Invalid request method', status=400)
    
@login_required
def withdraw(request):
    if request.method == 'POST':
        form = WithdrawRequestForm(request.POST, user=request.user)
        if form.is_valid():
            withdraw_request = form.save(commit=False)
            withdraw_request.profile = request.user
            withdraw_request.save()
            return HttpResponse('200', content_type='application/json')
    else:
        form = WithdrawRequestForm(user=request.user)
    return render(request, 'profile/withdraw.html', {'form': form})

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



#===============================Пане Денис перевірте потім чи тут все добре
@user_passes_test(lambda u: u.is_superuser)
def ban_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_id = data.get('user_id')
        try:
            user_profile = Profile.objects.get(id=user_id)
            user_profile.is_banned = True
            user_profile.save()
            return HttpResponse({'status': 'success', 'message': 'User banned'}, content_type='application/json', status=200)
        except Profile.DoesNotExist:
            return HttpResponse({'status': 'error', 'message': 'User not found'}, content_type='application/json', status=404)
    else:
        return HttpResponse({'status': 'error', 'message': 'Invalid request method'}, content_type='application/json', status=400)
    
@user_passes_test(lambda u: u.is_superuser)
def unban_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_id = data.get('user_id')
        try:
            user_profile = Profile.objects.get(id=user_id)
            user_profile.is_banned = False
            user_profile.save()
            return HttpResponse({'status': 'success', 'message': 'User unbanned'}, content_type='application/json', status=200)
        except Profile.DoesNotExist:
            return HttpResponse({'status': 'error', 'message': 'User not found'}, content_type='application/json', status=404)
    else:
        return HttpResponse({'status': 'error', 'message': 'Invalid request method'}, content_type='application/json', status=400)
    
@user_passes_test(lambda u: u.is_superuser)
def add_item_to_inventory(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_id = data.get('user_id')
        item_name = data.get('item_name')
        try:
            user_profile = Profile.objects.get(id=user_id)
            InventoryItem.objects.create(profile=user_profile, item_name=item_name, item_value=data.get('item_value', 0), image_url=data.get('image_url'))
            return HttpResponse({'status': 'success', 'message': 'Item added to inventory'}, content_type='application/json', status=200)
        except Profile.DoesNotExist:
            return HttpResponse({'status': 'error', 'message': 'User not found'}, content_type='application/json', status=404)
    else:
        return HttpResponse({'status': 'error', 'message': 'Invalid request method'}, content_type='application/json', status=400)
    

@user_passes_test(lambda u: u.is_superuser)
def remove_item_from_inventory(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_id = data.get('user_id')
        item_name = data.get('item_name')
        try:
            user_profile = Profile.objects.get(id=user_id)
            InventoryItem.objects.filter(profile=user_profile, item_name=item_name).delete()
            return HttpResponse({'status': 'success', 'message': 'Item removed from inventory'}, content_type='application/json', status=200)
        except Profile.DoesNotExist:
            return HttpResponse({'status': 'error', 'message': 'User not found'}, content_type='application/json', status=404)
    else:
        return HttpResponse({'status': 'error', 'message': 'Invalid request method'}, content_type='application/json', status=400)

@user_passes_test(lambda u: u.is_superuser)
def update_case_price(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        try:
            new_price = Decimal(data.get('new_price'))
            case = Case.objects.first()
            case.price = new_price
            case.save()
            return HttpResponse({'status': 'success', 'message': 'Case price updated'}, content_type='application/json', status=200)
        except Case.DoesNotExist:
            return HttpResponse({'status': 'error', 'message': 'Case not found'}, content_type='application/json', status=404)
    else:
        return HttpResponse({'status': 'error', 'message': 'Invalid request method'}, content_type='application/json', status=400)
    