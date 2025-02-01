import logging
import requests
from django.shortcuts import redirect, render
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from allauth.socialaccount.models import SocialAccount
from .models import Profile


@login_required
def profile(request):

    social_account = SocialAccount.objects.get(user=request.user)
    extra_data = social_account.extra_data
    avatar_url = extra_data["avatarfull"]
    user = extra_data['personaname']

    # inventory_items = profile.inventoryitem_set.all() if profile else []
    context = {
        'user': user,
        'avatar': avatar_url,
        'profile': profile,
        # 'inventory_items': inventory_items,
    }
    return render(request, 'profile/profile.html', context)

    # <a href='/accounts/steam/login/?process=login' class="btn btn-secondary">Login with Steam</a>