# chatbot_saas/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/core/', include('core.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/billing/', include('billing.urls')),
    path('api/integrations/', include('integrations.urls')),
]