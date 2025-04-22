from django.urls import path
from . import views

urlpatterns = [
    path('', views.upgrade, name='upgrade'),
    path('get-inventory-pages/', views.get_inventory_pages, name='get_inventory_pages'),
    path('get-upgrade-pages/', views.get_upgrade_pages, name='get_upgrade_pages'),
    path('get-inventory-items/<int:page>', views.get_inventory_items, name='get_inventory_items'),
    path('get-upgrade-items/<int:page>', views.get_upgrade_items, name='get_upgrade_items'),
    path('success/give_item/', views.give_item, name='give_item'),
    path('success/remove_item', views.remove_item, name='remove_item'),
    path('fail/<int:inventory_item_id>', views.fail, name='fail'),
]