from django.shortcuts import render
from allauth.socialaccount.models import SocialAccount
from django.http import Http404

def case_list(request):
    cases = [
    {"name": "Case 1", "image": "static/images/case1.jpg", "price": 3.0},  # price як число
    {"name": "Case 2", "image": "static/images/case2.jpg", "price": None},  # price як None, якщо немає ціни
]
    return render(request, 'cases/case_list.html', {'cases': cases})

def case_detail(request, case_name):
    cases = [
        {"name": "Case 1", "image": "static/images/case1.jpg", "price": 3.0},
        {"name": "Case 2", "image": "static/images/case2.jpg", "price": None},
    ]
    case = next((c for c in cases if c["name"] == case_name), None)
    if case is None:
        raise Http404("Case not found")
    return render(request, 'cases/case_detail.html', {'case': case})

