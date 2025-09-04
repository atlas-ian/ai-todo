from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Task
from .serializers import TaskSerializer, TaskCreateSerializer

@api_view(['GET'])
def health_check(request):
    return Response({
        'status': 'healthy',
        'message': 'Smart ToDo API is running!',
        'database': 'connected'
    })

class TaskListCreateView(ListCreateAPIView):
    queryset = Task.objects.all()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TaskCreateSerializer
        return TaskSerializer
    
    def get_queryset(self):
        queryset = Task.objects.all()
        
        # Filter by completion status
        completed = self.request.query_params.get('completed')
        if completed is not None:
            queryset = queryset.filter(completed=completed.lower() == 'true')
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
            
        # Filter by priority
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
            
        return queryset

class TaskDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

@api_view(['PATCH'])
def toggle_task_completion(request, pk):
    task = get_object_or_404(Task, pk=pk)
    task.completed = not task.completed
    task.save()
    
    serializer = TaskSerializer(task)
    return Response(serializer.data)


from .nlp_parser import TaskParser

# Initialize parser (do this at module level)
task_parser = TaskParser()

@api_view(['POST'])
def parse_natural_language(request):
    """
    Parse natural language input and return structured task data
    """
    text = request.data.get('text', '').strip()
    
    if not text:
        return Response(
            {'error': 'No text provided'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        parsed_data = task_parser.parse_task(text)
        return Response({
            'original_text': text,
            'parsed_task': parsed_data,
            'preview': {
                'title': parsed_data['title'],
                'due_date': parsed_data['due_date'],
                'priority': parsed_data['priority'],
                'category': parsed_data['category'],
            }
        })
    except Exception as e:
        logger.error(f"NLP parsing error: {e}")
        return Response(
            {'error': 'Failed to parse input'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(['GET'])
def task_stats(request):
    total_tasks = Task.objects.count()
    completed_tasks = Task.objects.filter(completed=True).count()
    pending_tasks = Task.objects.filter(completed=False).count()
    overdue_tasks = Task.objects.filter(
        completed=False,
        due_date__lt=timezone.now()
    ).count() if Task.objects.filter(due_date__isnull=False).exists() else 0
    
    return Response({
        'total': total_tasks,
        'completed': completed_tasks,
        'pending': pending_tasks,
        'overdue': overdue_tasks
    })