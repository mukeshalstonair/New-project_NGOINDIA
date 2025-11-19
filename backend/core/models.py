from django.db import models
from django.contrib.auth.models import User

class StaffProfile(models.Model):
    """Extended profile for NGO staff"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, blank=True)
    designation = models.CharField(max_length=100, blank=True)
    department = models.CharField(max_length=100, blank=True)
    
    class Meta:
        db_table = 'staff_profiles'
    
    def __str__(self):
        return f"{self.user.username} - {self.designation}"

class Sector(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'sectors'
    
    def __str__(self):
        return self.name

class Network(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    sector = models.ForeignKey(Sector, on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'networks'
    
    def __str__(self):
        return self.name