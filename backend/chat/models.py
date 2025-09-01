# chat/models.py
from django.db import models
from django.contrib.auth.models import User
from core.models import Store
import uuid

class ChatSession(models.Model):
    """Represents a chat session with a customer"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='chat_sessions')
    session_id = models.CharField(max_length=100)  # Frontend-generated session ID
    
    # Customer info (optional, may be anonymous)
    customer_email = models.EmailField(blank=True)
    customer_name = models.CharField(max_length=200, blank=True)
    customer_ip = models.GenericIPAddressField(null=True, blank=True)
    
    # Session metadata
    user_agent = models.TextField(blank=True)
    referrer = models.URLField(blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.store.name} - Session {self.session_id[:8]}"
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['store', 'session_id']

class ChatMessage(models.Model):
    """Individual messages in a chat session"""
    MESSAGE_TYPE_CHOICES = [
        ('user', 'User Message'),
        ('bot', 'Bot Response'),
        ('system', 'System Message'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPE_CHOICES)
    content = models.TextField()
    
    # AI metadata
    ai_model = models.CharField(max_length=50, blank=True)  # e.g., "gpt-3.5-turbo"
    ai_confidence = models.FloatField(null=True, blank=True)
    processing_time = models.FloatField(null=True, blank=True)  # Response time in seconds
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.session.store.name} - {self.message_type}: {self.content[:50]}"
    
    class Meta:
        ordering = ['created_at']

class Ticket(models.Model):
    """Support tickets created from chat escalations"""
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('waiting_customer', 'Waiting for Customer'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='tickets')
    session = models.ForeignKey(
        ChatSession, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='tickets'
    )
    
    # Ticket details
    subject = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    
    # Customer information
    customer_email = models.EmailField()
    customer_name = models.CharField(max_length=200, blank=True)
    
    # Assignment
    assigned_to = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_tickets'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.store.name} - {self.subject}"
    
    class Meta:
        ordering = ['-created_at']

class TicketMessage(models.Model):
    """Messages within a support ticket"""
    MESSAGE_TYPE_CHOICES = [
        ('customer', 'Customer'),
        ('agent', 'Agent'),
        ('system', 'System'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='messages')
    
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPE_CHOICES)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    content = models.TextField()
    
    # Attachments (for future)
    # attachments = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Ticket {self.ticket.subject} - {self.message_type}"
    
    class Meta:
        ordering = ['created_at']