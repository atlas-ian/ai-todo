from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    is_overdue = serializers.ReadOnlyField()
    
    class Meta:
        model = Task
        fields = [
            'id', 
            'title', 
            'description', 
            'due_date', 
            'priority', 
            'category', 
            'completed', 
            'created_at', 
            'updated_at',
            'is_overdue'
        ]
        read_only_fields = ['created_at', 'updated_at']

class TaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'title', 
            'description', 
            'due_date', 
            'priority', 
            'category'
        ]