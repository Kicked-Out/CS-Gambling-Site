<<<<<<< HEAD
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
=======
from .models import Profile

def user_context(request):
    if request.user.is_authenticated:
        try:
            profile = Profile.objects.get(username=request.user.username)
            return {'user_profile': profile}
        except Profile.DoesNotExist:
            return {'user_profile': None}
    else:
        return {'user_profile': None}
>>>>>>> 587eeefc3f2ad2c4ea3190741cdaa5f9b6d795f9
