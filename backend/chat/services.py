# chat/services.py
import openai
from django.conf import settings
from core.models import FAQ
import time
import logging

logger = logging.getLogger(__name__)

class ChatbotService:
    """Service class for handling AI chatbot responses"""
    
    def __init__(self, store):
        self.store = store
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        
    def get_response(self, message, session=None, context=None):
        """Generate AI response for user message"""
        start_time = time.time()
        
        try:
            # Build context for the AI
            system_prompt = self._build_system_prompt()
            conversation_context = self._build_conversation_context(session)
            
            # Prepare messages for OpenAI
            messages = [
                {"role": "system", "content": system_prompt},
            ]
            
            # Add conversation history (last 5 messages)
            if conversation_context:
                messages.extend(conversation_context)
            
            # Add current user message
            messages.append({"role": "user", "content": message})
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=500,
                temperature=0.7,
            )
            
            processing_time = time.time() - start_time
            ai_content = response.choices[0].message.content
            
            # Determine if we should create a ticket
            should_create_ticket = self._should_create_ticket(message, ai_content)
            
            return {
                'content': ai_content,
                'model': 'gpt-3.5-turbo',
                'confidence': 0.8,  # You can implement confidence scoring later
                'processing_time': processing_time,
                'create_ticket': should_create_ticket
            }
            
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            
            # Fallback response
            return {
                'content': self.store.escalation_message,
                'model': 'fallback',
                'confidence': 0.0,
                'processing_time': time.time() - start_time,
                'create_ticket': True
            }
    
    def _build_system_prompt(self):
        """Build system prompt with store context"""
        faqs = self.store.faqs.filter(is_active=True)
        faq_text = "\n".join([f"Q: {faq.question}\nA: {faq.answer}" for faq in faqs[:10]])
        
        prompt = f"""You are a helpful customer service assistant for {self.store.name}.

Store Information:
- Store Name: {self.store.name}
- Website: {self.store.domain}
- Platform: {self.store.platform}

Your goal is to help customers with their questions about products, orders, policies, and general inquiries.

Available FAQs:
{faq_text if faq_text else "No FAQs available yet."}

Guidelines:
1. Be friendly, helpful, and professional
2. Answer based on the store information and FAQs provided
3. If you don't know something specific about the store, be honest
4. For complex issues or complaints, acknowledge and suggest human support
5. Keep responses concise but complete
6. Use a warm, conversational tone

If a customer seems frustrated, has a complex issue, or explicitly asks for human help, acknowledge their concern and let them know you'll connect them with a human representative."""

        return prompt
    
    def _build_conversation_context(self, session, limit=5):
        """Build conversation context from recent messages"""
        if not session:
            return []
        
        # Get recent messages (excluding current one)
        recent_messages = session.messages.order_by('-created_at')[:limit*2]
        context = []
        
        for msg in reversed(recent_messages):
            if msg.message_type == 'user':
                context.append({"role": "user", "content": msg.content})
            elif msg.message_type == 'bot':
                context.append({"role": "assistant", "content": msg.content})
        
        return context
    
    def _should_create_ticket(self, user_message, ai_response):
        """Determine if a support ticket should be created"""
        # Simple keyword-based detection (improve this later)
        escalation_triggers = [
            'speak to human', 'human agent', 'not helpful', 
            'frustrated', 'complaint', 'manager', 'supervisor',
            'cancel order', 'refund', 'problem with order'
        ]
        
        user_lower = user_message.lower()
        ai_lower = ai_response.lower()
        
        # Check if user message contains escalation triggers
        has_escalation_trigger = any(trigger in user_lower for trigger in escalation_triggers)
        
        # Check if AI response suggests human contact
        ai_suggests_human = any(phrase in ai_lower for phrase in [
            'human representative', 'connect you with', 'speak to someone'
        ])
        
        return has_escalation_trigger or ai_suggests_human