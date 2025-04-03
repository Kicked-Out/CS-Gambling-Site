from django.http import Http404
from django.shortcuts import render
from allauth.socialaccount.models import SocialAccount
from django.http import Http404
from cases.models import Case, CaseSkin,Skin


# def win_skins(request):
#     skins = Skin.objects.all()
#     return render(request,'base/base.html',{'skins':skins})

def case_list(request):
    categories = {
    'Free Cases': Case.objects.filter(category='Free Cases'),
    'Event Cases': Case.objects.filter(category='Event Cases'),
    'Custom Cases': Case.objects.filter(category='Custom Cases'),
    'CS 2 Cases': Case.objects.filter(category='CS 2 Cases'),
    'Limited Offers': Case.objects.filter(category='Limited Offers'),
    'Sticker Cases': Case.objects.filter(category='Sticker Cases'),
    'Pistol Cases': Case.objects.filter(category='Pistol Cases'),
    'Knife Cases': Case.objects.filter(category='Knife Cases'),
    'Fifty-Fifty Cases': Case.objects.filter(category='Fifty-Fifty Cases'),
    'Developer Cases': Case.objects.filter(category='Developer Cases'),
    }

    return render(request, 'cases/case_list.html', {'categories': categories})

# def case_list(request):
#     cases = Case.objects.all()

#     return render(request, 'cases/case_list.html', {'cases': cases})

def case_detail(request, case_name):
    case = Case.objects.get(name=case_name)
    case_skins = case.case_skins.order_by('odds')

    return render(request, 'cases/case_detail.html', {'case': case, 'case_skins': case_skins})