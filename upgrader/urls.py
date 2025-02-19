from django.urls import path
from . import views

urlpatterns = [
    path('', views.upgrade, name='upgrade'),
    path('get-inventory-items/<int:page>', views.get_inventory_items, name='get_inventory_items'),
    path('get-upgrade-items/<int:page>', views.get_upgrade_items, name='get_upgrade_items'),
    path('success/', views.success, name='success'),
    path('fail/<int:inventory_item_id>', views.fail, name='fail'),
]