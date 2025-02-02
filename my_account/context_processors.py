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
