from django.shortcuts import redirect, render
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from allauth.socialaccount.models import SocialAccount
from django.views.decorators.http import require_POST


@login_required(login_url='/accounts/steam/login/?process=login')
def profile(request):

    social_account = SocialAccount.objects.get(user=request.user)
    extra_data = social_account.extra_data
    avatar_url = extra_data["avatarfull"]
    user = extra_data['personaname']

    context = {
        'user': user,
        'avatar': avatar_url,
        'profile': profile,
    }
    return render(request, 'profile/profile.html', context)

def user_logout(request):
    logout(request)
    return redirect('/')


import logging

logger = logging.getLogger(__name__)

@login_required
def add_funds(request):
    if request.method == 'POST':
        amount = int(request.POST.get('amount'))
        request.user.wallet_balance += amount
        request.user.save()
        return redirect('profile')
    return render(request, 'profile/add_funds.html')

