from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.staff_login, name='staff_login'),
    path('simple-login/', views.simple_login, name='simple_login'),
]