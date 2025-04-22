from django.urls import path
from api import views

urlpatterns = [
    path('get-skin-info/', views.get_skin_info, name='get_skin_info'),
]