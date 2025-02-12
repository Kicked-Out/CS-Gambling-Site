from django.shortcuts import redirect, render, HttpResponse
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from allauth.socialaccount.models import SocialAccount
from .models import Profile, InventoryItem
from cases.models import Case
import json

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
    print("Won")
    if request.method == 'POST':
        body_unicode = request.body.decode('utf-8')
        body_data = json.loads(body_unicode)
        item_name = body_data.get('name')
        item_value = body_data.get('price')
        item_image = body_data.get('image')
        drop_chance = body_data.get('drop_chance') 
        print(body_data)

        user_profile = Profile.objects.get(username=request.user.username)
        new_item =InventoryItem.objects.create(profile=user_profile, item_name=item_name, item_value=item_value, image_url=item_image, drop_chance=drop_chance)

        if user_profile.best_drop is None or new_item.drop_chance < InventoryItem.objects.get(item_name=user_profile.best_drop).drop_chance:
            user_profile.best_drop = new_item.item_name
            user_profile.expensive_case = request.POST.get('case_name', 'Unknown Case')
            user_profile.save()

        return HttpResponse('200', content_type='application/json')
    else:
        return HttpResponse('Invalid request method', status=400)
