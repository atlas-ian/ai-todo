# chat/admin.py
from django.contrib import admin
from .models import ChatSession, ChatMessage, Ticket, TicketMessage

@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ['session_id', 'store', 'customer_email', 'is_active', 'created_at']
    list_filter = ['store', 'is_active', 'created_at']
    search_fields = ['session_id', 'customer_email']

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['session', 'message_type', 'content', 'created_at']
    list_filter = ['message_type', 'created_at']
    search_fields = ['content']

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ['subject', 'store', 'customer_email', 'status', 'priority', 'created_at']
    list_filter = ['store', 'status', 'priority', 'created_at']
    search_fields = ['subject', 'description', 'customer_email']

@admin.register(TicketMessage)
class TicketMessageAdmin(admin.ModelAdmin):
    list_display = ['ticket', 'message_type', 'author', 'created_at']
    list_filter = ['message_type', 'created_at']
    search_fields = ['content']