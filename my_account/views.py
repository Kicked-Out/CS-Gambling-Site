from django.shortcuts import redirect, render, HttpResponse
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from allauth.socialaccount.models import SocialAccount
from .models import Profile

def is_user_logged_in(request):
    return request.user.is_authenticated

@login_required(login_url='/accounts/steam/login/?process=login')
def profile(request):
    social_account = SocialAccount.objects.get(user=request.user)
    extra_data = social_account.extra_data
    avatar_url = extra_data["avatarfull"]
    user = extra_data['personaname']
    
    user_profile = Profile.objects.get(username=request.user.username)
    user_profile.avatar = avatar_url
    user_profile.save()

    context = {
        'user_name': user,
        'avatar': avatar_url,
        'profile': user_profile,
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
