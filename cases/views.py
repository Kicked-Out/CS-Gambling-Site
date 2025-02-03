from django.http import Http404
from django.shortcuts import render
from allauth.socialaccount.models import SocialAccount
from django.http import Http404
from cases.models import Case, CaseSkin


def case_list(request):
    cases = Case.objects.all()

    return render(request, 'cases/case_list.html', {'cases': cases})

def case_detail(request, case_name):
    case = Case.objects.get(name=case_name)
    case_skins = case.case_skins.reverse()

    return render(request, 'cases/case_detail.html', {'case': case, 'case_skins': case_skins})