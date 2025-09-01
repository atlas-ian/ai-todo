# core/models.py
from django.db import models
from django.contrib.auth.models import User
import uuid
import secrets
import string

class Store(models.Model):
    """Represents a customer's store (e.g., Shopify, WooCommerce)"""
    PLATFORM_CHOICES = [
        ('shopify', 'Shopify'),
        ('woocommerce', 'WooCommerce'),
        ('custom', 'Custom'),
    ]
    
    SUBSCRIPTION_STATUS_CHOICES = [
        ('trial', 'Trial'),
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('past_due', 'Past Due'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stores')
    name = models.CharField(max_length=200)
    domain = models.URLField()
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES, default='custom')
    
    # API Configuration
    api_key = models.CharField(max_length=100, unique=True, editable=False)
    webhook_secret = models.CharField(max_length=100, editable=False)
    
    # Subscription
    subscription_status = models.CharField(
        max_length=20, 
        choices=SUBSCRIPTION_STATUS_CHOICES, 
        default='trial'
    )
    subscription_plan = models.CharField(max_length=50, default='starter')
    trial_ends_at = models.DateTimeField(null=True, blank=True)
    
    # Settings
    welcome_message = models.TextField(
        default="Hi! I'm here to help you with any questions about our store."
    )
    escalation_message = models.TextField(
        default="Let me connect you with a human representative."
    )
    theme_color = models.CharField(max_length=7, default='#007bff')  # Hex color
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.api_key:
            self.api_key = self.generate_api_key()
        if not self.webhook_secret:
            self.webhook_secret = self.generate_webhook_secret()
        super().save(*args, **kwargs)
    
    def generate_api_key(self):
        """Generate a unique API key for the store"""
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(32))
    
    def generate_webhook_secret(self):
        """Generate a webhook secret for secure communications"""
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(64))
    
    def __str__(self):
        return f"{self.name} ({self.domain})"
    
    class Meta:
        ordering = ['-created_at']

class StoreIntegration(models.Model):
    """Store platform-specific integration settings"""
    store = models.OneToOneField(Store, on_delete=models.CASCADE, related_name='integration')
    
    # Shopify specific
    shopify_shop_name = models.CharField(max_length=100, blank=True)
    shopify_access_token = models.CharField(max_length=200, blank=True)
    
    # WooCommerce specific  
    woocommerce_consumer_key = models.CharField(max_length=200, blank=True)
    woocommerce_consumer_secret = models.CharField(max_length=200, blank=True)
    
    # General settings
    sync_products = models.BooleanField(default=True)
    sync_orders = models.BooleanField(default=True)
    sync_customers = models.BooleanField(default=False)
    
    last_sync_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.store.name} Integration"

class FAQ(models.Model):
    """Frequently Asked Questions for each store"""
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='faqs')
    question = models.CharField(max_length=500)
    answer = models.TextField()
    category = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.store.name}: {self.question[:50]}"
    
    class Meta:
        ordering = ['category', 'question']
        verbose_name_plural = "FAQs"