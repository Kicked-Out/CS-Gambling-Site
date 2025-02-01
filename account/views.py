import logging
import requests
from django.shortcuts import redirect
from django.contrib.auth import login
from django.contrib.auth.models import User
from . import Profile

API_KEY = 'CAC4814310DD3C235DECCAAF9715D26A'

def get_steam_profile(steam_id):
    profile_url = f'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={API_KEY}&steamids={steam_id}'

    logging.info(f'Requesting Steam profile: {profile_url}')
    print(f'Requesting Steam profile: {profile_url}')

    try:
        response = requests.get(profile_url)
        
        logging.info(f'Response Status Code: {response.status_code}')
        logging.info(f'Response Content: {response.text}')
        print(f'Response Status Code: {response.status_code}')
        print(f'Response Content: {response.text}')
        
        response.raise_for_status()

        profile_data = response.json()
        if 'response' in profile_data and 'players' in profile_data['response'] and profile_data['response']['players']:
            profile_info = profile_data['response']['players'][0]
            return {
                "personaname": profile_info.get('personaname', 'Unknown'),
                "avatarfull": profile_info.get('avatarfull', ''),
            }
        else:
            logging.error("Error: No players found in Steam API response")
            print("Error: No players found in Steam API response")
            return None

    except requests.exceptions.HTTPError as e:
        logging.error(f'HTTPError: {e}')
        print(f'HTTPError: {e}')
        return None
    except requests.exceptions.RequestException as e:
        logging.error(f'RequestException: {e}')
        print(f'RequestException: {e}')
        return None

def steam_login(request):
    steam_id = '76561198137800699'
    try:
        steam_profile = get_steam_profile(steam_id)
        steam_name = steam_profile['personaname']
        steam_avatar = steam_profile['avatarfull']
        print(request.GET)

        user, created = User.objects.get_or_create(username=steam_id, defaults={'first_name': steam_name})

        if created:
            Profile.objects.create(user=user, avatar=steam_avatar)
            print(request.GET)

        else:
            user.first_name = steam_name
            user.save()
            profile = Profile.objects.get(user=user)
            profile.avatar = steam_avatar
            profile.save()
            print(request.GET)

        login(request, user)
        print(request.GET)

    except requests.exceptions.HTTPError as e:
        print(f"Failed to fetch Steam profile: {e}")
        print(request.GET)

        return redirect('login')
    except requests.exceptions.RequestException as e:
        print(f"RequestException: {e}")
        print(request.GET)

        return redirect('login')

    return redirect('profile')
