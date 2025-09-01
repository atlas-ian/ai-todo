# chat/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('<str:api_key>/chat/', views.chat_endpoint, name='chat-endpoint'),
    path('sessions/', views.chat_sessions, name='chat-sessions'),
    path('tickets/', views.TicketListView.as_view(), name='ticket-list'),
    path('tickets/<uuid:pk>/', views.TicketDetailView.as_view(), name='ticket-detail'),
]