import re
import spacy
from datetime import datetime, timedelta
from django.utils import timezone
from dateutil import parser as dateutil_parser
import logging

# Configure logging
logger = logging.getLogger(__name__)

class TaskParser:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.warning("spaCy model not found, using basic parsing")
            self.nlp = None
        
        # Enhanced category keywords with weighted scoring
        self.category_keywords = {
            'work': {
                'high': ['meeting', 'deadline', 'project', 'client', 'presentation', 'report', 'proposal'],
                'medium': ['office', 'email', 'call', 'conference', 'team', 'boss', 'colleague', 'budget'],
                'low': ['work', 'job', 'business', 'professional', 'corporate']
            },
            'personal': {
                'high': ['birthday', 'anniversary', 'family dinner', 'call mom', 'call dad', 'visit family'],
                'medium': ['home', 'friend', 'dinner', 'lunch', 'vacation', 'holiday', 'personal'],
                'low': ['myself', 'own', 'private']
            },
            'study': {
                'high': ['exam', 'assignment', 'homework', 'research paper', 'thesis'],
                'medium': ['study', 'book', 'learn', 'course', 'lecture', 'tutorial', 'practice'],
                'low': ['education', 'knowledge', 'skill']
            },
            'health': {
                'high': ['doctor appointment', 'dentist', 'checkup', 'surgery', 'therapy'],
                'medium': ['gym', 'workout', 'exercise', 'jog', 'run', 'medicine', 'pharmacy'],
                'low': ['health', 'fitness', 'wellness', 'medical']
            },
            'shopping': {
                'high': ['buy groceries', 'grocery shopping', 'shopping mall', 'amazon order'],
                'medium': ['buy', 'purchase', 'shop', 'store', 'order', 'milk', 'bread', 'food'],
                'low': ['get', 'pick up', 'collect']
            }
        }
        
        # Enhanced priority detection
        self.priority_keywords = {
            4: {
                'urgent': ['urgent', 'asap', 'emergency', 'critical', 'immediately', 'right now'],
                'deadline': ['deadline today', 'due today', 'overdue', 'late']
            },
            3: {
                'important': ['important', 'high priority', 'crucial', 'significant', 'major'],
                'time_sensitive': ['soon', 'deadline', 'due tomorrow', 'this week']
            },
            1: {
                'low': ['low priority', 'when possible', 'eventually', 'sometime', 'if time'],
                'optional': ['maybe', 'consider', 'think about', 'might']
            }
        }

        # Time expressions with better parsing
        self.time_expressions = {
            'today': {'days': 0, 'confidence': 0.95},
            'tomorrow': {'days': 1, 'confidence': 0.95},
            'tonight': {'days': 0, 'confidence': 0.9, 'time': '20:00'},
            'this morning': {'days': 0, 'confidence': 0.9, 'time': '09:00'},
            'this afternoon': {'days': 0, 'confidence': 0.9, 'time': '14:00'},
            'this evening': {'days': 0, 'confidence': 0.9, 'time': '18:00'},
            'next week': {'days': 7, 'confidence': 0.8},
            'next month': {'days': 30, 'confidence': 0.7},
            'monday': {'weekday': 0, 'confidence': 0.85},
            'tuesday': {'weekday': 1, 'confidence': 0.85},
            'wednesday': {'weekday': 2, 'confidence': 0.85},
            'thursday': {'weekday': 3, 'confidence': 0.85},
            'friday': {'weekday': 4, 'confidence': 0.85},
            'saturday': {'weekday': 5, 'confidence': 0.85},
            'sunday': {'weekday': 6, 'confidence': 0.85},
        }

    def parse_task(self, text):
        """Enhanced parsing with confidence scores"""
        result = {
            'title': text,
            'description': None,
            'due_date': None,
            'priority': 2,
            'category': 'other',
            'confidence': {
                'overall': 0.5,
                'date': 0.0,
                'priority': 0.5,
                'category': 0.1
            },
            'suggestions': []
        }
        
        try:
            # Extract due date/time first
            result['due_date'], result['confidence']['date'] = self._extract_date_enhanced(text)
            
            # Extract priority
            result['priority'], result['confidence']['priority'] = self._extract_priority_enhanced(text)
            
            # Extract category
            result['category'], result['confidence']['category'] = self._extract_category_enhanced(text)
            
            # Clean title after extracting other components
            result['title'] = self._extract_clean_title_enhanced(text, result)
            
            # Calculate overall confidence
            result['confidence']['overall'] = (
                result['confidence']['date'] * 0.3 +
                result['confidence']['priority'] * 0.2 +
                result['confidence']['category'] * 0.3 +
                0.2  # Base confidence for title extraction
            )
            
            # Add suggestions for improvement
            result['suggestions'] = self._generate_suggestions(text, result)
            
        except Exception as e:
            logger.error(f"Enhanced parsing error: {e}")
            
        return result

    def _extract_date_enhanced(self, text):
        """Enhanced date extraction with better accuracy"""
        text_lower = text.lower()
        best_date = None
        best_confidence = 0.0
        
        # Check time expressions
        for expression, config in self.time_expressions.items():
            if expression in text_lower:
                try:
                    if 'days' in config:
                        target_date = timezone.now() + timedelta(days=config['days'])
                    elif 'weekday' in config:
                        target_date = self._get_next_weekday(config['weekday'])
                    else:
                        continue
                    
                    # Apply default time if specified
                    if 'time' in config:
                        hour, minute = map(int, config['time'].split(':'))
                        target_date = target_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
                    
                    # Look for specific time in text
                    time_match = re.search(r'(?:at\s+)?(\d{1,2}):?(\d{2})?\s*([ap]m)?', text_lower)
                    if time_match:
                        hour = int(time_match.group(1))
                        minute = int(time_match.group(2)) if time_match.group(2) else 0
                        am_pm = time_match.group(3)
                        
                        if am_pm:
                            if 'p' in am_pm and hour != 12:
                                hour += 12
                            elif 'a' in am_pm and hour == 12:
                                hour = 0
                        elif hour < 8:  # Assume PM for hours < 8 if no AM/PM specified
                            hour += 12
                            
                        target_date = target_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
                        config['confidence'] += 0.1  # Bonus for specific time
                    
                    if config['confidence'] > best_confidence:
                        best_date = target_date
                        best_confidence = config['confidence']
                        
                except Exception as e:
                    logger.debug(f"Date parsing error for {expression}: {e}")
                    continue
        
        # Try relative expressions like "in 2 hours", "in 3 days"
        relative_match = re.search(r'in\s+(\d+)\s+(minute|hour|day)s?', text_lower)
        if relative_match:
            amount = int(relative_match.group(1))
            unit = relative_match.group(2)
            
            if unit == 'minute':
                target_date = timezone.now() + timedelta(minutes=amount)
                confidence = 0.9
            elif unit == 'hour':
                target_date = timezone.now() + timedelta(hours=amount)
                confidence = 0.9
            elif unit == 'day':
                target_date = timezone.now() + timedelta(days=amount)
                confidence = 0.85
            
            if confidence > best_confidence:
                best_date = target_date
                best_confidence = confidence
        
        return best_date.isoformat() if best_date else None, best_confidence

    def _extract_priority_enhanced(self, text):
        """Enhanced priority extraction"""
        text_lower = text.lower()
        best_priority = 2
        best_confidence = 0.5
        
        for priority_level, categories in self.priority_keywords.items():
            for category, keywords in categories.items():
                for keyword in keywords:
                    if keyword in text_lower:
                        confidence = 0.9 if len(keyword.split()) > 1 else 0.7
                        if confidence > best_confidence:
                            best_priority = priority_level
                            best_confidence = confidence
        
        # Check for exclamation marks (indicates urgency)
        exclamation_count = text.count('!')
        if exclamation_count >= 2 and best_priority == 2:
            best_priority = 3
            best_confidence = max(best_confidence, 0.6)
        
        return best_priority, best_confidence

    def _extract_category_enhanced(self, text):
        """Enhanced category extraction with weighted scoring"""
        text_lower = text.lower()
        category_scores = {}
        
        for category, levels in self.category_keywords.items():
            total_score = 0
            for level, keywords in levels.items():
                weight = {'high': 3, 'medium': 2, 'low': 1}[level]
                for keyword in keywords:
                    if keyword in text_lower:
                        total_score += weight * len(keyword.split())
            
            if total_score > 0:
                category_scores[category] = total_score
        
        if category_scores:
            best_category = max(category_scores.items(), key=lambda x: x[1])
            # Normalize confidence score
            max_possible_score = 15  # Rough estimate
            confidence = min(0.95, best_category[1] / max_possible_score)
            return best_category[0], confidence
        
        return 'other', 0.1

    def _extract_clean_title_enhanced(self, text, parsed_data):
        """Clean title by removing detected date/time and priority indicators"""
        clean_text = text
        
        # Remove detected time expressions
        for expression in self.time_expressions.keys():
            pattern = r'\b' + re.escape(expression) + r'\b'
            clean_text = re.sub(pattern, '', clean_text, flags=re.IGNORECASE)
        
        # Remove time patterns
        time_patterns = [
            r'(?:at\s+)?\d{1,2}:?\d{2}?\s*[ap]m?',
            r'in\s+\d+\s+(?:minute|hour|day)s?',
        ]
        
        for pattern in time_patterns:
            clean_text = re.sub(pattern, '', clean_text, flags=re.IGNORECASE)
        
        # Remove priority indicators
        for priority_level, categories in self.priority_keywords.items():
            for category, keywords in categories.items():
                for keyword in keywords:
                    pattern = r'\b' + re.escape(keyword) + r'\b'
                    clean_text = re.sub(pattern, '', clean_text, flags=re.IGNORECASE)
        
        # Clean up whitespace and punctuation
        clean_text = re.sub(r'[,\-\s]+', ' ', clean_text).strip()
        clean_text = re.sub(r'\s+', ' ', clean_text)
        
        return clean_text if clean_text else text

    def _get_next_weekday(self, weekday):
        """Get the next occurrence of a specific weekday"""
        today = timezone.now()
        days_ahead = weekday - today.weekday()
        
        if days_ahead <= 0:  # Target day already happened this week
            days_ahead += 7
            
        return today + timedelta(days=days_ahead)

    def _generate_suggestions(self, text, result):
        """Generate suggestions for better task input"""
        suggestions = []
        
        if result['confidence']['date'] < 0.5:
            suggestions.append("Try adding a specific time like 'tomorrow at 2pm' or 'next Monday'")
        
        if result['confidence']['category'] < 0.3:
            suggestions.append("Add context keywords like 'buy', 'meeting', 'study', or 'exercise' to help categorize")
        
        if result['confidence']['priority'] < 0.6 and '!' not in text:
            suggestions.append("Add 'urgent', 'important', or 'low priority' to set priority level")
        
        return suggestions