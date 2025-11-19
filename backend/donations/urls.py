from django.urls import path
from . import views

urlpatterns = [
    path('api/donations/', views.get_donations, name='get_donations'),
    path('api/donations/add/', views.add_donation, name='add_donation'),
]