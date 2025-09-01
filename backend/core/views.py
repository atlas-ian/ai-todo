# core/views.py
from rest_framework import generics, status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Store
from .serializers import StoreSerializer

class StoreDetailView(generics.RetrieveUpdateAPIView):
    """Get and update store details"""
    serializer_class = StoreSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        # Return the store owned by the authenticated user
        return Store.objects.get(owner=self.request.user)

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def store_by_api_key(request, api_key):
    """Get store details by API key (for widget authentication)"""
    try:
        store = Store.objects.get(api_key=api_key)
        serializer = StoreSerializer(store)
        return Response(serializer.data)
    except Store.DoesNotExist:
        return Response(
            {'error': 'Invalid API key'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )