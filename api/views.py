from http.client import HTTPResponse

from django.http.response import JsonResponse
from django.shortcuts import render
import requests
import json
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

# Create your views here.
@csrf_exempt
def get_skin_info(request):
    auth_key = 'cb17a5e6cdd48520c388bad7fcc8b69bc08da4054b1bf193263049a5abdb2fcd'
    data = json.loads(request.body)
    skin_name = data.get('skin_name')

    print("skin_name", skin_name)

    if not skin_name:
        return JsonResponse({"error": "Missing 'skin_name' in request"}, status=400)


    payload = {
        "where": {
            "app_id": 730,
            "skin_name": skin_name
        },
        "limit": 1
    }

    headers = {'x-apikey': auth_key}
    res = requests.post('https://api.bitskins.com/market/search/skin_name', headers=headers, json=payload)

    if res.status_code != 200:
        return JsonResponse({"error": f"API request failed with status {res.status_code}"}, status=res.status_code)

    response_data = res.json()

    return JsonResponse(response_data, safe=False)