# core/admin.py
from django.contrib import admin
from .models import Store, StoreIntegration, FAQ

@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ['name', 'domain', 'platform', 'subscription_status', 'created_at']
    list_filter = ['platform', 'subscription_status', 'created_at']
    search_fields = ['name', 'domain']
    readonly_fields = ['id', 'api_key', 'webhook_secret', 'created_at', 'updated_at']

@admin.register(StoreIntegration)
class StoreIntegrationAdmin(admin.ModelAdmin):
    list_display = ['store', 'sync_products', 'sync_orders', 'last_sync_at']
    list_filter = ['sync_products', 'sync_orders', 'last_sync_at']

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ['question', 'store', 'category', 'is_active']
    list_filter = ['store', 'category', 'is_active']
    search_fields = ['question', 'answer']