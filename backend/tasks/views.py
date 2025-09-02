from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def health_check(views):
    return Response({
        'status': 'healthy',
        'message': 'Smart ToDo API is running!',
        'database': 'connected'
    })