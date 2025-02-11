from django.urls import path, include
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('oauth/', include('allauth.socialaccount.urls')),
    path('accounts/profile/', views.profile, name='profile'),
    path('accounts/logout/', views.user_logout, name='user_logout'),
    path('accounts/add_funds/', views.add_funds, name='add_funds'),
    path('accounts/cases_opened/', views.cases_opened, name='cases_opened'),
]
