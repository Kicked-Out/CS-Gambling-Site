from django.shortcuts import redirect, render, HttpResponse, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.views.decorators.csrf import csrf_exempt
from allauth.socialaccount.models import SocialAccount
from .models import Profile, InventoryItem, WithdrawRequest, Friendship, Notification, Message
from cases.models import Case
import json
from .forms import WithdrawRequestForm, MessageForm
from django.db import IntegrityError
from decimal import Decimal

#===============================Profile page====================================

def is_user_logged_in(request):
    return request.user.is_authenticated

@login_required(login_url='/accounts/steam/login/?process=login')
def profile(request, uid):
    user_profile = Profile.objects.get(uid=uid)

    if request.method == 'POST':
        user_profile.trade_url = request.POST['trade_url']
    
    user_profile.save()

    inventory_items = InventoryItem.objects.filter(profile=user_profile)
    cases = Case.objects.all()

    context = {
        'user_profile': user_profile,
        'inventory_items': inventory_items,
        'cases': cases,
    }
    return render(request, f'profile/profile.html', context)

@login_required
def redirect_to_profile(request):
    social_account = SocialAccount.objects.get(user=request.user)
    extra_data = social_account.extra_data
    avatar_url = extra_data["avatarfull"]
    u_id = extra_data['steamid']
    user_profile = Profile.objects.get(username=request.user.username)
    user_profile.avatar = avatar_url
    user_profile.uid = u_id
    user_profile.save()

    return redirect(f'/accounts/profile/{u_id}/')

def user_logout(request):
    logout(request)
    return redirect('/')

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
            name=item_name,
            price=item_value,
            image_url=item_image
            )

        best_drop_item = InventoryItem.objects.filter(name=user_profile.best_drop).first()
        if user_profile.best_drop is None or (best_drop_item and new_item.price > best_drop_item.price):
            user_profile.best_drop = new_item.name
            user_profile.best_drop_image = new_item.image_url
            user_profile.best_drop_value = new_item.price
            user_profile.expensive_case = case_name
            user_profile.expensive_case_image = case_image
            user_profile.save()

        return HttpResponse('200', content_type='application/json')
    else:
        return HttpResponse('Invalid request method', status=400)
    
    
#===================================withdraw====================================

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
def send_friend_request(request, to_user_id):
    to_user = get_object_or_404(Profile, id=to_user_id)
    Friendship.objects.create(from_user=request.user, to_user=to_user, is_accepted=False)
    return redirect('profile', uid=to_user_id)


@login_required
def accept_friend_request(request, from_user_id):
    from_user = get_object_or_404(Profile, id=from_user_id)
    friendship = get_object_or_404(Friendship, from_user=from_user, to_user=request.user)
    friendship.is_accepted = True
    friendship.save()
    return redirect('profile', uid=from_user_id)


@login_required
def friend_list(request):
    friends_from = Friendship.objects.filter(from_user=request.user, is_accepted=True)
    friends_to = Friendship.objects.filter(to_user=request.user, is_accepted=True)
    all_friends = friends_from | friends_to
    
    friend_requests = Friendship.objects.filter(to_user=request.user, is_accepted=False)
    outgoing_requests = Friendship.objects.filter(from_user=request.user, is_accepted=False)
    search_query = request.GET.get('search', '')

    if search_query:
        search_results = Profile.objects.filter(username__icontains=search_query).exclude(id=request.user.id)
    else:
        search_results = None

    return render(request, 'profile/friend_list.html', {
        'friends': all_friends,
        'friend_requests': friend_requests,
        'outgoing_requests': outgoing_requests,
        'search_results': search_results,
        'search_query': search_query,
    })


@login_required
def add_friend(request, to_user_id):
    to_user = get_object_or_404(Profile, id=to_user_id)
    Friendship.objects.create(from_user=request.user, to_user=to_user, is_accepted=False)
    return redirect('profile', uid=to_user_id)

@login_required
def remove_friend(request, from_user_id):
    from_user = get_object_or_404(Profile, id=from_user_id)
    friendship1 = Friendship.objects.filter(from_user=from_user, to_user=request.user).first()
    friendship2 = Friendship.objects.filter(from_user=request.user, to_user=from_user).first()
    
    if friendship1:
        friendship1.delete()
    if friendship2:
        friendship2.delete()
    
    return redirect('friend_list')

@login_required
def add_friend_request(request, to_user_id):
    to_user = get_object_or_404(Profile, uid=to_user_id)
    try:
        friendship, created = Friendship.objects.get_or_create(
            from_user=request.user,
            to_user=to_user,
            defaults={'is_accepted': False}
        )
        if created:
            Notification.objects.create(profile=to_user, message=f"{request.user.username} has sent you a friend request.")
    except IntegrityError:
        return redirect('friend_list')
    
    return redirect('friend_list')

@login_required
def accept_friend_request(request, from_user_id):
    from_user = get_object_or_404(Profile, id=from_user_id)
    friendship = get_object_or_404(Friendship, from_user=from_user, to_user=request.user)
    friendship.is_accepted = True
    friendship.save()
    return redirect('friend_list')


@login_required
def base_view(request):
    friend_requests_count = Friendship.objects.filter(to_user=request.user, is_accepted=False).count()
    return render(request, 'base.html', {
        'friend_requests_count': friend_requests_count,
    })

@login_required
def reject_friend_request(request, from_user_id):
    from_user = get_object_or_404(Profile, id=from_user_id)
    friendship = get_object_or_404(Friendship, from_user=from_user, to_user=request.user)
    friendship.delete()
    return redirect('friend_list')

@login_required
def cancel_friend_request(request, to_user_id):
    to_user = get_object_or_404(Profile, id=to_user_id)
    friendship = get_object_or_404(Friendship, from_user=request.user, to_user=to_user)
    friendship.delete()
    return redirect('friend_list')

@login_required
def chat_view(request, friend_uid):
    friend_profile = get_object_or_404(Profile, uid=friend_uid)
    user_profile = get_object_or_404(Profile, username=request.user.username)

    messages = Message.objects.filter(
        from_user__in=[user_profile, friend_profile],
        to_user__in=[user_profile, friend_profile]
    ).order_by('timestamp')

    if request.method == 'POST':
        form = MessageForm(request.POST)
        if form.is_valid():
            message = form.save(commit=False)
            message.from_user = user_profile
            message.to_user = friend_profile
            message.save()
            return redirect('chat_view', friend_uid=friend_uid)
    else:
        form = MessageForm()

    return render(request, 'profile/chat.html', {
        'friend_profile': friend_profile,
        'user_profile': user_profile,
        'messages': messages,
        'form': form,
    })

@login_required
def getChatMessages(request, friend_uid):
    friend_profile = get_object_or_404(Profile, uid=friend_uid)
    user_profile = request.user

    messages = Message.objects.filter(
        from_user__in=[user_profile, friend_profile],
        to_user__in=[user_profile, friend_profile]
    ).order_by('timestamp')

    print(messages)

    return JsonResponse({'messages': messages})
