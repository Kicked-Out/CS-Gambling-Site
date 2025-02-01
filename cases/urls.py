from django.urls import path
from cases import views

urlpatterns = [
    path('', views.case_list, name='case_list'),
    path('case/<int:case_id>/', views.case_detail, name='case_detail'),
]