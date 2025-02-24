from .models import Profile, Friendship

def user_context(request):
    if request.user.is_authenticated:
        try:
            profile = Profile.objects.get(username=request.user.username)
            return {'user_profile': profile}
        except Profile.DoesNotExist:
            return {'user_profile': None}
    else:
        return {'user_profile': None}
    

def friend_requests_count(request):
    if request.user.is_authenticated:
        count = Friendship.objects.filter(to_user=request.user, is_accepted=False).count()
        return {'friend_requests_count': count}
    else:
        return {'friend_requests_count': 0}
