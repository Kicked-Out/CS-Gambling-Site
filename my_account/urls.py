from django.urls import path, include
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('oauth/', include('allauth.socialaccount.urls')),
    path('accounts/profile/<str:uid>/', views.profile, name='profile'),
    path('accounts/profile/', views.redirect_to_profile, name='redirect_to_profile'),
    path('accounts/logout/', views.user_logout, name='user_logout'),
    path('accounts/cases_opened/', views.cases_opened, name='cases_opened'),
    path('accounts/open_case/', views.open_case, name='open_case'),
    path('accounts/withdraw/', views.withdraw, name='withdraw'),
    path('cases/', include('cases.urls')),
    path('friends/', views.friend_list, name='friend_list'),
    path('friends/send_friend_request/<int:to_user_id>/', views.send_friend_request, name='send_friend_request'),
    path('friends/accept_friend_request/<int:from_user_id>/', views.accept_friend_request, name='accept_friend_request'),
    path('send_friend_request/<int:to_user_id>/', views.send_friend_request, name='send_friend_request'),
    path('add_friend_request/<str:to_user_id>/', views.add_friend_request, name='add_friend_request'),
    path('accept_friend_request/<int:from_user_id>/', views.accept_friend_request, name='accept_friend_request'),
    path('remove_friend/<int:from_user_id>/', views.remove_friend, name='remove_friend'),
    path('base/', views.base_view, name='base_view'),
    path('reject_friend_request/<int:from_user_id>/', views.reject_friend_request, name='reject_friend_request'),
    path('cancel_friend_request/<int:to_user_id>/', views.cancel_friend_request, name='cancel_friend_request'),
    path('chat/<str:friend_uid>/', views.chat_view, name='chat_view'),
]
