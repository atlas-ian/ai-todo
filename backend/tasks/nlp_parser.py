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
        
        # Category keywords for classification
        self.category_keywords = {
            'work': [
                'meeting', 'project', 'deadline', 'office', 'client', 'presentation',
                'report', 'email', 'call', 'conference', 'team', 'boss', 'colleague',
                'proposal', 'budget', 'review', 'analysis'
            ],
            'personal': [
                'family', 'home', 'friend', 'dinner', 'lunch', 'birthday', 'anniversary',
                'vacation', 'holiday', 'visit', 'call mom', 'call dad', 'personal'
            ],
            'study': [
                'study', 'exam', 'assignment', 'homework', 'research', 'book', 'learn',
                'course', 'lecture', 'tutorial', 'practice', 'review', 'notes'
            ],
            'health': [
                'doctor', 'appointment', 'gym', 'workout', 'exercise', 'jog', 'run',
                'medicine', 'pharmacy', 'dentist', 'checkup', 'therapy', 'meditation'
            ],
            'shopping': [
                'buy', 'purchase', 'shop', 'groceries', 'store', 'mall', 'order',
                'amazon', 'online', 'milk', 'bread', 'food', 'clothes'
            ]
        }
        
        # Priority keywords
        self.priority_keywords = {
            4: ['urgent', 'asap', 'emergency', 'critical', 'immediately'],
            3: ['important', 'high priority', 'soon', 'deadline'],
            1: ['low priority', 'when possible', 'eventually', 'sometime']
        }

    def parse_task(self, text):
        """
        Parse natural language input into structured task data
        """
        result = {
            'title': text,
            'description': None,
            'due_date': None,
            'priority': 2,  # Default medium priority
            'category': 'other',
            'confidence': {}
        }
        
        try:
            # Extract and clean title
            result['title'] = self._extract_clean_title(text)
            
            # Extract due date/time
            result['due_date'], result['confidence']['date'] = self._extract_date(text)
            
            # Extract priority
            result['priority'], result['confidence']['priority'] = self._extract_priority(text)
            
            # Extract category
            result['category'], result['confidence']['category'] = self._extract_category(text)
            
        except Exception as e:
            logger.error(f"Error parsing task: {e}")
            
        return result

    def _extract_clean_title(self, text):
        """Extract clean task title by removing date/time and priority indicators"""
        # Remove common date patterns
        date_patterns = [
            r'\b(today|tomorrow|tonight)\b',
            r'\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b',
            r'\b(at \d{1,2}:\d{2}(\s*[ap]m)?)\b',
            r'\b(in \d+ (minutes?|hours?|days?))\b',
            r'\b(next week|next month)\b',
            r'\b(this (morning|afternoon|evening|week))\b',
        ]
        
        # Remove priority indicators
        priority_patterns = [
            r'\b(urgent|asap|high priority|important)\b',
            r'\b(low priority|when possible)\b',
        ]
        
        clean_text = text
        all_patterns = date_patterns + priority_patterns
        
        for pattern in all_patterns:
            clean_text = re.sub(pattern, '', clean_text, flags=re.IGNORECASE)
        
        # Clean up extra whitespace
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        
        return clean_text if clean_text else text

    def _extract_date(self, text):
        """Extract due date from natural language"""
        # Common time expressions
        time_patterns = {
            r'\btoday\b': 0,
            r'\btomorrow\b': 1,
            r'\btonig ht\b': 0,
        }
        
        text_lower = text.lower()
        
        # Check for relative dates
        for pattern, days_offset in time_patterns.items():
            if re.search(pattern, text_lower):
                target_date = timezone.now() + timedelta(days=days_offset)
                
                # Try to extract specific time
                time_match = re.search(r'(\d{1,2}):(\d{2})(\s*[ap]m)?', text_lower)
                if time_match:
                    hour = int(time_match.group(1))
                    minute = int(time_match.group(2))
                    am_pm = time_match.group(3)
                    
                    if am_pm and 'p' in am_pm and hour != 12:
                        hour += 12
                    elif am_pm and 'a' in am_pm and hour == 12:
                        hour = 0
                        
                    target_date = target_date.replace(
                        hour=hour, 
                        minute=minute, 
                        second=0, 
                        microsecond=0
                    )
                
                return target_date.isoformat(), 0.8

        # Try using dateutil for more complex parsing
        try:
            # Extract potential date strings
            date_candidates = re.findall(
                r'\b(?:next|this)?\s*(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|month)\b|\b\d{1,2}/\d{1,2}\b',
                text_lower
            )
            
            for candidate in date_candidates:
                try:
                    parsed_date = dateutil_parser.parse(candidate, fuzzy=True)
                    if parsed_date > datetime.now():
                        return timezone.make_aware(parsed_date).isoformat(), 0.6
                except:
                    continue
                    
        except Exception as e:
            logger.debug(f"Date parsing error: {e}")
        
        return None, 0.0

    def _extract_priority(self, text):
        """Extract priority level from text"""
        text_lower = text.lower()
        
        for priority_level, keywords in self.priority_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    return priority_level, 0.9
        
        # Default medium priority
        return 2, 0.5

    def _extract_category(self, text):
        """Extract category from text using keyword matching"""
        text_lower = text.lower()
        category_scores = {}
        
        for category, keywords in self.category_keywords.items():
            score = 0
            for keyword in keywords:
                if keyword in text_lower:
                    # Longer matches get higher scores
                    score += len(keyword.split())
            
            if score > 0:
                category_scores[category] = score
        
        if category_scores:
            best_category = max(category_scores.items(), key=lambda x: x[1])
            confidence = min(0.9, best_category[1] * 0.3)  # Scale confidence
            return best_category[0], confidence
        
        return 'other', 0.1