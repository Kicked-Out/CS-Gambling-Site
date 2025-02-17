from django.urls import path, include
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('oauth/', include('allauth.socialaccount.urls')),
    path('accounts/profile/<int:uid>/', views.profile, name='profile'),
    path('accounts/profile/', views.redirect_to_profile, name='redirect_to_profile'),
    path('accounts/logout/', views.user_logout, name='user_logout'),
    path('accounts/cases_opened/', views.cases_opened, name='cases_opened'),
    path('accounts/open_case/', views.open_case, name='open_case'),
    path('accounts/withdraw/', views.withdraw, name='withdraw'),
    path('cases/', include('cases.urls')),
]
