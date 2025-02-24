from django.urls import path
from cases import views

urlpatterns = [
    path('', views.case_list, name='case_list'),
    path('case/<str:case_name>/', views.case_detail, name='case_detail'),
]