from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from core.models import Store, FAQ

class Command(BaseCommand):
    help = 'Create demo data for testing'

    def handle(self, *args, **options):
        # Create demo user
        user, created = User.objects.get_or_create(
            username='demo',
            defaults={
                'email': 'demo@example.com',
                'first_name': 'Demo',
                'last_name': 'User'
            }
        )
        
        if created:
            user.set_password('demo123')
            user.save()
            self.stdout.write(self.style.SUCCESS('Created demo user'))
        else:
            self.stdout.write('Demo user already exists')
        
        # Create auth token
        token, _ = Token.objects.get_or_create(user=user)
        
        # Create demo store
        store, created = Store.objects.get_or_create(
            owner=user,
            name='Demo Electronics Store',
            defaults={
                'domain': 'https://demo-electronics.example.com',
                'platform': 'shopify',
                'welcome_message': 'Hi! Welcome to Demo Electronics. How can I help you today?',
                'theme_color': '#ff6b35'
            }
        )
        
        # Create demo FAQs if store was just created
        if created:
            demo_faqs = [
                {
                    'question': 'What are your store hours?',
                    'answer': 'We are open Monday-Friday 9AM-6PM EST for customer support.',
                    'category': 'General'
                },
                {
                    'question': 'How long does shipping take?',
                    'answer': 'Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days.',
                    'category': 'Shipping'
                },
                {
                    'question': 'What is your return policy?',
                    'answer': 'We accept returns within 30 days of purchase. Items must be in original condition.',
                    'category': 'Returns'
                },
            ]
            
            for faq_data in demo_faqs:
                FAQ.objects.create(store=store, **faq_data)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n=== DEMO DATA CREATED ===\n'
                f'Username: demo\n'
                f'Password: demo123\n'
                f'Auth Token: {token.key}\n'
                f'Store API Key: {store.api_key}\n'
                f'=========================='
            )
        )