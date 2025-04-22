from django.urls import path
from . import views

urlpatterns = [
    path("exchanger/<int:to_user_id>/", views.exchanger, name="exchanger"),
]
