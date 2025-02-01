from django.urls import path
from cases import views

urlpatterns = [
    path('', views.case_list, name='case_list'),
    path('case/<int:case_id>', views.index, name='index'),
    
]