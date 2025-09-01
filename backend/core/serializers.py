from rest_framework import serializers
from .models import Store, FAQ

class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = [
            'id', 'name', 'domain', 'platform', 
            'welcome_message', 'theme_color',
            'subscription_status', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'category', 'is_active']
        read_only_fields = ['id']