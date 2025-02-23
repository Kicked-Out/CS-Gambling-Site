<<<<<<< HEAD
from . import views
from django.urls import path

# Create your views here.
urlpatterns = [
    path('update_balance/', views.update_balance, name='update_balance'),
    path('ban_user/<int:user_id>/', views.ban_user, name='ban_user'),
    path('unban_user/<int:user_id>/', views.unban_user, name='unban_user'),
    path('add_item_to_inventory_view/', views.add_item_to_inventory_view, name='add_item_to_inventory_view'),
    path('add_item_to_case_view/<str:case_name>/<str:item_name>/', views.add_item_to_case_view, name='add_item_to_case_view'),
    path('add_item_to_inventory/', views.add_item_to_inventory, name='add_item_to_inventory'),
    path('remove_item_from_inventory/<str:user_id>/<int:item_id>/', views.remove_item_from_inventory, name='remove_item_from_inventory'),
    path('update_case_price/', views.update_case_price, name='update_case_price'),
    path('user_list/', views.user_list, name='user_list'),
    path('admin_panel/', views.admin_panel, name='admin_panel'),
    path('case_list_admin/', views.case_list_admin, name='case_list_admin'),
    path('add_funds/', views.add_funds, name='add_funds'),
    path('add_cases/', views.add_case, name='add_cases'),
    path('remove_case/<int:case_id>/', views.remove_case, name='remove_case'),
]

=======
from . import views
from django.urls import path

# Create your views here.
urlpatterns = [
    path('update_balance/', views.update_balance, name='update_balance'),
    path('ban_user/<int:user_id>/', views.ban_user, name='ban_user'),
    path('unban_user/<int:user_id>/', views.unban_user, name='unban_user'),
    path('add_item_to_inventory_view/', views.add_item_to_inventory_view, name='add_item_to_inventory_view'),
    path('add_item_to_case_view/<str:case_name>/<str:item_name>/', views.add_item_to_case_view, name='add_item_to_case_view'),
    path('add_item_to_inventory/', views.add_item_to_inventory, name='add_item_to_inventory'),
    path('remove_item_from_inventory/<str:user_id>/<int:item_id>/', views.remove_item_from_inventory, name='remove_item_from_inventory'),
    path('update_case_price/', views.update_case_price, name='update_case_price'),
    path('user_list/', views.user_list, name='user_list'),
    path('admin_panel/', views.admin_panel, name='admin_panel'),
    path('case_list_admin/', views.case_list_admin, name='case_list_admin'),
    path('add_funds/', views.add_funds, name='add_funds'),
    path('add_cases/', views.add_case, name='add_cases'),
    path('remove_case/<int:case_id>/', views.remove_case, name='remove_case'),
]

>>>>>>> 587eeefc3f2ad2c4ea3190741cdaa5f9b6d795f9
