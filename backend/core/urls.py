# core/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('store/', views.StoreDetailView.as_view(), name='store-detail'),
    path('store/<str:api_key>/', views.store_by_api_key, name='store-by-api-key'),
]