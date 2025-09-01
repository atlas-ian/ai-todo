from rest_framework import generics, status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from core.models import Store
from .models import ChatSession, ChatMessage, Ticket
from .serializers import ChatSessionSerializer, TicketSerializer, ChatRequestSerializer
from .services import ChatbotService
import logging

logger = logging.getLogger(__name__)

class TicketListView(generics.ListCreateAPIView):
    """List and create tickets for authenticated store owner"""
    serializer_class = TicketSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Return tickets for stores owned by authenticated user
        return Ticket.objects.filter(store__owner=self.request.user)

class TicketDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve and update specific ticket"""
    serializer_class = TicketSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Ticket.objects.filter(store__owner=self.request.user)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def chat_endpoint(request, api_key):
    """Main chat endpoint for widget communication"""
    try:
        # Validate store API key
        store = get_object_or_404(Store, api_key=api_key)
        
        # Validate request data
        serializer = ChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Invalid request data', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = serializer.validated_data
        
        # Get or create chat session
        session, created = ChatSession.objects.get_or_create(
            store=store,
            session_id=data['session_id'],
            defaults={
                'customer_email': data.get('customer_email', ''),
                'customer_name': data.get('customer_name', ''),
                'customer_ip': request.META.get('REMOTE_ADDR'),
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            }
        )
        
        # Save user message
        user_message = ChatMessage.objects.create(
            session=session,
            message_type='user',
            content=data['message']
        )
        
        # Generate AI response
        chatbot_service = ChatbotService(store)
        ai_response = chatbot_service.get_response(
            message=data['message'],
            session=session
        )
        
        # Save bot response
        bot_message = ChatMessage.objects.create(
            session=session,
            message_type='bot',
            content=ai_response['content'],
            ai_model=ai_response.get('model', 'gpt-3.5-turbo'),
            ai_confidence=ai_response.get('confidence', 0.8),
            processing_time=ai_response.get('processing_time', 0)
        )
        
        # Check if we should create a ticket
        if ai_response.get('create_ticket', False):
            ticket = Ticket.objects.create(
                store=store,
                session=session,
                subject=f"Support Request from {data.get('customer_name', 'Customer')}",
                description=data['message'],
                customer_email=data.get('customer_email', ''),
                customer_name=data.get('customer_name', '')
            )
            
            return Response({
                'response': ai_response['content'],
                'ticket_created': True,
                'ticket_id': str(ticket.id),
                'session_id': session.session_id
            })
        
        return Response({
            'response': ai_response['content'],
            'ticket_created': False,
            'session_id': session.session_id
        })
        
    except Store.DoesNotExist:
        return Response(
            {'error': 'Invalid API key'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}")
        return Response(
            {'error': 'Internal server error'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def chat_sessions(request):
    """Get chat sessions for authenticated store owner"""
    try:
        store = Store.objects.get(owner=request.user)
        sessions = ChatSession.objects.filter(store=store).order_by('-created_at')[:50]
        serializer = ChatSessionSerializer(sessions, many=True)
        return Response(serializer.data)
    except Store.DoesNotExist:
        return Response(
            {'error': 'Store not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )