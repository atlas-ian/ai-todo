from rest_framework import serializers
from .models import ChatSession, ChatMessage, Ticket

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'message_type', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']

class ChatSessionSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChatSession
        fields = [
            'id', 'session_id', 'customer_email', 
            'is_active', 'messages', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = [
            'id', 'subject', 'description', 'status', 'priority',
            'customer_email', 'customer_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class ChatRequestSerializer(serializers.Serializer):
    """Serializer for incoming chat requests"""
    message = serializers.CharField(max_length=1000)
    session_id = serializers.CharField(max_length=100)
    customer_email = serializers.EmailField(required=False)
    customer_name = serializers.CharField(max_length=200, required=False)