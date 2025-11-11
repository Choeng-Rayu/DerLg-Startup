"""Recommendation engine using collaborative and content-based filtering."""

from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from datetime import datetime, timedelta
import logging
from collections import defaultdict

from utils.feature_extractor import FeatureExtractor
from utils.data_processor import DataProcessor

logger = logging.getLogger(__name__)


class RecommendationEngine:
    """
    Hybrid recommendation system combining collaborative filtering
    and content-based filtering for personalized hotel and tour recommendations.
    """
    
    def __init__(self):
        """Initialize the recommendation engine."""
        self.collaborative_weight = 0.6
        self.content_weight = 0.4
        self.feature_extractor = FeatureExtractor()
        self.data_processor = DataProcessor()
        
        # Cache for user-item interactions
        self.user_item_matrix = {}
        self.user_similarity_cache = {}
    
    async def get_recommendations(
        self,
        user_id: str,
        budget: float,
        preferences: Dict[str, Any],
        dates: Dict[str, str],
        item_type: str = "hotel"
    ) -> List[Dict[str, Any]]:
        """
        Generate personalized recommendations for a user.
        
        Args:
            user_id: User identifier
            budget: Maximum budget
            preferences: User preferences (amenities, location, etc.)
            dates: Check-in and check-out dates
            item_type: Type of item to recommend ("hotel" or "tour")
            
        Returns:
            List of recommended hotels/tours with scores and confidence
        """
        try:
            logger.info(f"Generating recommendations for user {user_id}, budget: {budget}, type: {item_type}")
            
            # 1. Get user profile and history
            user_profile = await self._get_user_profile(user_id)
            
            # 2. Get available items within date range and budget
            available_items = await self._query_available_items(
                budget=budget,
                dates=dates,
                item_type=item_type,
                preferences=preferences
            )
            
            if not available_items:
                logger.warning(f"No available items found for budget {budget}")
                return []
            
            logger.info(f"Found {len(available_items)} available items")
            
            # 3. Calculate collaborative filtering scores
            cf_scores = await self.calculate_collaborative_score(user_id, available_items)
            
            # 4. Calculate content-based filtering scores
            cb_scores = self.calculate_content_score(user_profile, available_items)
            
            # 5. Combine scores using hybrid approach (60% CF, 40% CB)
            final_scores = (self.collaborative_weight * cf_scores + 
                          self.content_weight * cb_scores)
            
            # 6. Apply budget constraints and optimization
            optimized_items = self.apply_budget_optimization(
                available_items,
                final_scores,
                budget
            )
            
            # 7. Integrate real-time event data
            enhanced_items = await self.integrate_events(optimized_items, dates)
            
            # 8. Add confidence scores and explanations
            recommendations = self._add_recommendation_metadata(
                enhanced_items,
                user_profile,
                preferences
            )
            
            logger.info(f"Generated {len(recommendations)} recommendations")
            return recommendations[:10]  # Return top 10
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}", exc_info=True)
            return []
    
    async def calculate_collaborative_score(
        self,
        user_id: str,
        items: List[Dict[str, Any]]
    ) -> np.ndarray:
        """
        Calculate collaborative filtering scores based on user-user similarity.
        Uses user-based collaborative filtering to find similar users and
        recommend items they liked.
        
        Implementation:
        1. Build user-item interaction matrix from booking history and ratings
        2. Calculate user-user similarity using cosine similarity
        3. Find K most similar users (K=10)
        4. Predict ratings for items based on similar users' preferences
        5. Normalize scores to 0-1 range
        
        Args:
            user_id: User identifier
            items: Available items to score
            
        Returns:
            Array of scores for each item (0-1 range)
        """
        try:
            # Get user interaction history (bookings + ratings)
            user_interactions = await self._get_user_interactions(user_id)
            
            if not user_interactions:
                # Cold start: return neutral scores
                logger.info(f"Cold start for user {user_id}, returning neutral scores")
                return np.ones(len(items)) * 0.5
            
            # Build user-item matrix for collaborative filtering
            user_item_matrix = await self._build_user_item_matrix()
            
            if not user_item_matrix or user_id not in user_item_matrix:
                logger.info(f"User {user_id} not in interaction matrix")
                return np.ones(len(items)) * 0.5
            
            # Find similar users using cosine similarity
            similar_users = await self._find_similar_users(
                user_id,
                user_item_matrix,
                top_k=10
            )
            
            if not similar_users:
                logger.info(f"No similar users found for {user_id}")
                return np.ones(len(items)) * 0.5
            
            logger.info(f"Found {len(similar_users)} similar users for {user_id}")
            
            # Calculate scores based on similar users' preferences
            scores = np.zeros(len(items))
            
            for idx, item in enumerate(items):
                item_id = item.get('id')
                weighted_score = 0.0
                total_weight = 0.0
                
                for similar_user_id, similarity in similar_users:
                    # Check if similar user interacted with this item
                    user_rating = await self._get_user_item_rating(
                        similar_user_id,
                        item_id
                    )
                    
                    if user_rating is not None:
                        # Weight the rating by user similarity
                        weighted_score += similarity * user_rating
                        total_weight += similarity
                
                # Calculate predicted rating
                if total_weight > 0:
                    predicted_rating = weighted_score / total_weight
                    # Normalize to 0-1 range (assuming ratings are 1-5)
                    scores[idx] = (predicted_rating - 1) / 4.0
                else:
                    # No data from similar users, use item popularity
                    avg_rating = item.get('average_rating', 3.0)
                    scores[idx] = (avg_rating - 1) / 4.0
            
            # Apply min-max normalization to ensure 0-1 range
            if scores.max() > scores.min():
                scores = (scores - scores.min()) / (scores.max() - scores.min())
            
            return scores
            
        except Exception as e:
            logger.error(f"Error in collaborative filtering: {str(e)}", exc_info=True)
            return np.ones(len(items)) * 0.5
    
    def calculate_content_score(
        self,
        user_profile: Dict[str, Any],
        items: List[Dict[str, Any]]
    ) -> np.ndarray:
        """
        Calculate content-based filtering scores based on item features.
        Compares item features with user preferences using cosine similarity.
        
        Implementation:
        1. Extract user preference vector (budget, amenities, travel style)
        2. Extract item feature vectors (price, rating, amenities, location)
        3. Calculate cosine similarity between user and item vectors
        4. Apply feature weighting (amenities: 40%, price: 30%, rating: 20%, location: 10%)
        5. Normalize scores to 0-1 range
        
        Args:
            user_profile: User preferences and history
            items: Available items to score
            
        Returns:
            Array of scores for each item (0-1 range)
        """
        try:
            # Extract user preference vector
            user_vector = self.feature_extractor.extract_user_preferences(user_profile)
            
            scores = np.zeros(len(items))
            
            for idx, item in enumerate(items):
                # Extract item feature vector
                item_type = item.get('type', 'hotel')
                
                if item_type == 'hotel':
                    item_vector = self.feature_extractor.extract_hotel_features(item)
                else:
                    item_vector = self.feature_extractor.extract_tour_features(item)
                
                # Ensure vectors have same length
                min_len = min(len(user_vector), len(item_vector))
                user_vec_trimmed = user_vector[:min_len]
                item_vec_trimmed = item_vector[:min_len]
                
                # Calculate base similarity
                base_similarity = self.feature_extractor.calculate_similarity(
                    user_vec_trimmed,
                    item_vec_trimmed
                )
                
                # Apply feature-specific scoring
                feature_score = self._calculate_feature_score(user_profile, item)
                
                # Combine base similarity with feature score (70% similarity, 30% features)
                combined_score = 0.7 * base_similarity + 0.3 * feature_score
                
                scores[idx] = max(0.0, min(1.0, combined_score))
            
            # Apply min-max normalization
            if scores.max() > scores.min():
                scores = (scores - scores.min()) / (scores.max() - scores.min())
            
            return scores
            
        except Exception as e:
            logger.error(f"Error in content-based filtering: {str(e)}", exc_info=True)
            return np.ones(len(items)) * 0.5
    
    def _calculate_feature_score(
        self,
        user_profile: Dict[str, Any],
        item: Dict[str, Any]
    ) -> float:
        """
        Calculate feature-specific score for an item.
        
        Args:
            user_profile: User preferences
            item: Item to score
            
        Returns:
            Feature score (0-1)
        """
        try:
            score = 0.0
            
            # Amenity matching (40% weight)
            preferred_amenities = set(user_profile.get('preferred_amenities', []))
            item_amenities = set(item.get('amenities', []))
            
            if preferred_amenities:
                amenity_match = len(preferred_amenities & item_amenities) / len(preferred_amenities)
                score += 0.4 * amenity_match
            else:
                score += 0.2  # Neutral if no preferences
            
            # Price matching (30% weight)
            user_budget = user_profile.get('budget', 100)
            item_price = item.get('price_per_night', item.get('price_per_person', 0))
            
            # Normalize price to USD
            currency = item.get('currency', 'USD')
            item_price_usd = self.data_processor.normalize_price(item_price, currency)
            
            # Score based on how well price fits budget (prefer 60-80% of budget)
            if item_price_usd <= user_budget:
                price_ratio = item_price_usd / user_budget
                # Optimal range is 0.6-0.8 of budget
                if 0.6 <= price_ratio <= 0.8:
                    price_score = 1.0
                elif price_ratio < 0.6:
                    price_score = 0.7 + (price_ratio / 0.6) * 0.3
                else:
                    price_score = 1.0 - ((price_ratio - 0.8) / 0.2) * 0.3
                score += 0.3 * max(0.0, price_score)
            
            # Rating score (20% weight)
            rating = item.get('average_rating', 3.0)
            rating_score = rating / 5.0
            score += 0.2 * rating_score
            
            # Location preference (10% weight)
            # TODO: Implement location-based scoring when user location preferences are available
            score += 0.1 * 0.5  # Neutral for now
            
            return min(1.0, score)
            
        except Exception as e:
            logger.error(f"Error calculating feature score: {str(e)}")
            return 0.5
    
    def apply_budget_optimization(
        self,
        items: List[Dict[str, Any]],
        scores: np.ndarray,
        budget: float
    ) -> List[Dict[str, Any]]:
        """
        Filter and optimize recommendations based on budget constraints.
        Ensures recommendations stay within 90% of budget as per requirement 31.1.
        
        Implementation:
        1. Filter items within 90% of budget threshold
        2. Calculate value score (quality/price ratio)
        3. Apply budget-aware ranking (balance score and value)
        4. Provide alternative suggestions if budget is insufficient
        5. Sort by combined score (recommendation + value)
        
        Args:
            items: Available items
            scores: Recommendation scores
            budget: Maximum budget
            
        Returns:
            Filtered and ranked items within budget
        """
        try:
            # Filter items within 90% of budget (requirement 31.1)
            budget_threshold = budget * 0.9
            
            filtered_items = []
            over_budget_items = []
            
            for idx, item in enumerate(items):
                price = item.get('price_per_night', item.get('price_per_person', 0))
                
                # Normalize price to USD if needed
                currency = item.get('currency', 'USD')
                price_usd = self.data_processor.normalize_price(price, currency)
                
                item_with_score = item.copy()
                item_with_score['recommendation_score'] = float(scores[idx])
                item_with_score['price_usd'] = price_usd
                item_with_score['remaining_budget'] = budget - price_usd
                
                # Calculate value score (quality vs price ratio)
                rating = item.get('average_rating', 3.0)
                if price_usd > 0:
                    # Higher rating and lower price = better value
                    value_score = (rating / 5.0) / (price_usd / budget)
                    # Normalize value score to 0-1 range
                    value_score = min(1.0, value_score)
                else:
                    value_score = 0.0
                
                item_with_score['value_score'] = value_score
                
                # Calculate combined score (70% recommendation, 30% value)
                combined_score = 0.7 * item_with_score['recommendation_score'] + 0.3 * value_score
                item_with_score['combined_score'] = combined_score
                
                if price_usd <= budget_threshold:
                    filtered_items.append(item_with_score)
                else:
                    over_budget_items.append(item_with_score)
            
            # Sort by combined score (recommendation + value)
            filtered_items.sort(key=lambda x: x['combined_score'], reverse=True)
            
            # If insufficient options within budget, suggest alternatives
            if len(filtered_items) < 3 and over_budget_items:
                logger.info(f"Only {len(filtered_items)} items within budget, adding alternatives")
                
                # Sort over-budget items by how close they are to budget
                over_budget_items.sort(key=lambda x: x['price_usd'])
                
                # Add closest over-budget items as alternatives
                for item in over_budget_items[:2]:
                    item['is_alternative'] = True
                    item['budget_exceeded_by'] = item['price_usd'] - budget_threshold
                    filtered_items.append(item)
            
            logger.info(f"Filtered to {len(filtered_items)} items within budget optimization")
            return filtered_items
            
        except Exception as e:
            logger.error(f"Error in budget optimization: {str(e)}", exc_info=True)
            return []
    
    async def integrate_events(
        self,
        recommendations: List[Dict[str, Any]],
        dates: Dict[str, str]
    ) -> List[Dict[str, Any]]:
        """
        Enhance recommendations with real-time event data.
        Boosts recommendations that coincide with cultural events.
        
        Implementation:
        1. Query events happening during travel dates
        2. Match events with recommendation locations
        3. Apply event proximity boost (15% for same city, 10% for nearby)
        4. Add event information to recommendations
        5. Re-rank based on updated scores
        
        Args:
            recommendations: Current recommendations
            dates: Travel dates
            
        Returns:
            Enhanced recommendations with event information
        """
        try:
            # Get events happening during travel dates
            events = await self._get_events_in_date_range(dates)
            
            if not events:
                logger.info("No events found during travel dates")
                for rec in recommendations:
                    rec['has_events'] = False
                return recommendations
            
            logger.info(f"Found {len(events)} events during travel dates")
            
            # Enhance recommendations with event data
            for rec in recommendations:
                location = rec.get('location', {})
                city = location.get('city', '')
                province = location.get('province', '')
                
                # Find events in same city
                same_city_events = [
                    e for e in events
                    if e.get('location', {}).get('city', '').lower() == city.lower()
                ]
                
                # Find events in same province (nearby)
                nearby_events = [
                    e for e in events
                    if e.get('location', {}).get('province', '').lower() == province.lower()
                    and e not in same_city_events
                ]
                
                if same_city_events or nearby_events:
                    rec['nearby_events'] = same_city_events + nearby_events
                    rec['has_events'] = True
                    rec['event_count'] = len(same_city_events) + len(nearby_events)
                    
                    # Calculate event boost based on proximity and cultural significance
                    event_boost = 0.0
                    
                    if same_city_events:
                        # 15% boost for events in same city
                        base_boost = 0.15
                        
                        # Additional boost for culturally significant events
                        for event in same_city_events:
                            if event.get('event_type') == 'festival':
                                base_boost += 0.05
                        
                        event_boost = min(0.25, base_boost)  # Cap at 25%
                    
                    elif nearby_events:
                        # 10% boost for nearby events
                        event_boost = 0.10
                    
                    # Apply boost to combined score
                    current_score = rec.get('combined_score', rec.get('recommendation_score', 0.5))
                    rec['combined_score'] = min(1.0, current_score + event_boost)
                    rec['event_boost'] = event_boost
                    rec['event_boost_applied'] = True
                    
                    # Add event details for display
                    rec['event_highlights'] = [
                        {
                            'name': e.get('name'),
                            'type': e.get('event_type'),
                            'dates': f"{e.get('start_date')} to {e.get('end_date')}",
                            'significance': e.get('cultural_significance', '')
                        }
                        for e in (same_city_events + nearby_events)[:3]  # Top 3 events
                    ]
                else:
                    rec['has_events'] = False
                    rec['event_count'] = 0
            
            # Re-sort after event boost using combined score
            recommendations.sort(
                key=lambda x: x.get('combined_score', x.get('recommendation_score', 0)),
                reverse=True
            )
            
            logger.info(f"Enhanced {sum(1 for r in recommendations if r.get('has_events'))} recommendations with event data")
            return recommendations
            
        except Exception as e:
            logger.error(f"Error integrating events: {str(e)}", exc_info=True)
            # Return original recommendations on error
            for rec in recommendations:
                rec['has_events'] = False
            return recommendations
    
    # Helper methods
    
    async def _get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user profile including preferences and history."""
        # TODO: Query from database
        # For now, return default profile
        return {
            'user_id': user_id,
            'budget': 100,
            'preferred_amenities': ['wifi', 'pool', 'breakfast'],
            'travel_style': 'balanced',
            'booking_history': []
        }
    
    async def _query_available_items(
        self,
        budget: float,
        dates: Dict[str, str],
        item_type: str,
        preferences: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Query available hotels/tours from database."""
        # TODO: Implement actual database query
        # For now, return mock data
        
        if item_type == 'hotel':
            return self._get_mock_hotels(budget)
        else:
            return self._get_mock_tours(budget)
    
    def _get_mock_hotels(self, budget: float) -> List[Dict[str, Any]]:
        """Generate mock hotel data for testing."""
        hotels = [
            {
                'id': 'hotel-1',
                'name': 'Angkor Paradise Hotel',
                'type': 'hotel',
                'price_per_night': 80,
                'currency': 'USD',
                'average_rating': 4.5,
                'amenities': ['wifi', 'pool', 'breakfast', 'spa'],
                'location': {'city': 'Siem Reap', 'latitude': 13.3671, 'longitude': 103.8448}
            },
            {
                'id': 'hotel-2',
                'name': 'Phnom Penh Boutique',
                'type': 'hotel',
                'price_per_night': 60,
                'currency': 'USD',
                'average_rating': 4.2,
                'amenities': ['wifi', 'restaurant', 'bar', 'gym'],
                'location': {'city': 'Phnom Penh', 'latitude': 11.5564, 'longitude': 104.9282}
            },
            {
                'id': 'hotel-3',
                'name': 'Riverside Resort',
                'type': 'hotel',
                'price_per_night': 120,
                'currency': 'USD',
                'average_rating': 4.8,
                'amenities': ['wifi', 'pool', 'spa', 'restaurant', 'breakfast'],
                'location': {'city': 'Siem Reap', 'latitude': 13.3622, 'longitude': 103.8597}
            }
        ]
        
        return [h for h in hotels if h['price_per_night'] <= budget]
    
    def _get_mock_tours(self, budget: float) -> List[Dict[str, Any]]:
        """Generate mock tour data for testing."""
        tours = [
            {
                'id': 'tour-1',
                'name': 'Angkor Wat Sunrise Tour',
                'type': 'tour',
                'price_per_person': 45,
                'currency': 'USD',
                'average_rating': 4.7,
                'duration': {'days': 1, 'nights': 0},
                'difficulty': 'easy',
                'category': ['cultural', 'history'],
                'location': {'city': 'Siem Reap'}
            },
            {
                'id': 'tour-2',
                'name': 'Tonle Sap Lake Adventure',
                'type': 'tour',
                'price_per_person': 35,
                'currency': 'USD',
                'average_rating': 4.3,
                'duration': {'days': 1, 'nights': 0},
                'difficulty': 'moderate',
                'category': ['nature', 'cultural'],
                'location': {'city': 'Siem Reap'}
            }
        ]
        
        return [t for t in tours if t['price_per_person'] <= budget]
    
    async def _get_user_interactions(self, user_id: str) -> Dict[str, float]:
        """Get user's past interactions (bookings, ratings)."""
        # TODO: Query from database
        return {}
    
    async def _build_user_item_matrix(self) -> Dict[str, Dict[str, float]]:
        """
        Build user-item interaction matrix from booking history and ratings.
        
        Returns:
            Nested dictionary: {user_id: {item_id: rating}}
        """
        try:
            # Check cache first
            if self.user_item_matrix:
                return self.user_item_matrix
            
            # TODO: Query from database
            # For now, build from mock data
            # In production, this would query:
            # - Bookings table for completed bookings
            # - Reviews table for explicit ratings
            # - Wishlists for implicit positive signals
            
            matrix = defaultdict(dict)
            
            # Mock data for demonstration
            # In production, replace with actual database queries
            mock_interactions = {
                'user-1': {'hotel-1': 5.0, 'hotel-2': 4.0, 'tour-1': 5.0},
                'user-2': {'hotel-1': 4.0, 'hotel-3': 5.0, 'tour-2': 4.0},
                'user-3': {'hotel-2': 3.0, 'hotel-3': 4.0, 'tour-1': 4.0},
                'user-4': {'hotel-1': 5.0, 'hotel-3': 4.0, 'tour-2': 5.0},
            }
            
            for user, items in mock_interactions.items():
                matrix[user] = items
            
            # Cache the matrix
            self.user_item_matrix = dict(matrix)
            
            return self.user_item_matrix
            
        except Exception as e:
            logger.error(f"Error building user-item matrix: {str(e)}")
            return {}
    
    async def _find_similar_users(
        self,
        user_id: str,
        user_item_matrix: Dict[str, Dict[str, float]],
        top_k: int = 10
    ) -> List[Tuple[str, float]]:
        """
        Find top K similar users based on interaction patterns using cosine similarity.
        
        Args:
            user_id: Target user ID
            user_item_matrix: User-item interaction matrix
            top_k: Number of similar users to return
            
        Returns:
            List of (user_id, similarity_score) tuples, sorted by similarity
        """
        try:
            # Check cache
            cache_key = f"{user_id}_{top_k}"
            if cache_key in self.user_similarity_cache:
                return self.user_similarity_cache[cache_key]
            
            target_user_items = user_item_matrix.get(user_id, {})
            
            if not target_user_items:
                return []
            
            # Calculate similarity with all other users
            similarities = []
            
            for other_user_id, other_user_items in user_item_matrix.items():
                if other_user_id == user_id:
                    continue
                
                # Find common items
                common_items = set(target_user_items.keys()) & set(other_user_items.keys())
                
                if not common_items:
                    continue
                
                # Build vectors for common items
                target_vector = np.array([target_user_items[item] for item in common_items])
                other_vector = np.array([other_user_items[item] for item in common_items])
                
                # Calculate cosine similarity
                similarity = self._calculate_cosine_similarity(target_vector, other_vector)
                
                if similarity > 0:
                    similarities.append((other_user_id, similarity))
            
            # Sort by similarity and return top K
            similarities.sort(key=lambda x: x[1], reverse=True)
            result = similarities[:top_k]
            
            # Cache the result
            self.user_similarity_cache[cache_key] = result
            
            logger.info(f"Found {len(result)} similar users for {user_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error finding similar users: {str(e)}", exc_info=True)
            return []
    
    def _calculate_cosine_similarity(
        self,
        vector1: np.ndarray,
        vector2: np.ndarray
    ) -> float:
        """
        Calculate cosine similarity between two vectors.
        
        Args:
            vector1: First vector
            vector2: Second vector
            
        Returns:
            Similarity score (0-1)
        """
        try:
            dot_product = np.dot(vector1, vector2)
            norm1 = np.linalg.norm(vector1)
            norm2 = np.linalg.norm(vector2)
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
            
            similarity = dot_product / (norm1 * norm2)
            
            # Ensure result is in 0-1 range
            return max(0.0, min(1.0, similarity))
            
        except Exception as e:
            logger.error(f"Error calculating cosine similarity: {str(e)}")
            return 0.0
    
    async def _get_user_item_rating(
        self,
        user_id: str,
        item_id: str
    ) -> Optional[float]:
        """
        Get user's rating for a specific item.
        
        Args:
            user_id: User identifier
            item_id: Item (hotel/tour) identifier
            
        Returns:
            Rating value (1-5) or None if no rating exists
        """
        try:
            # Get from cached matrix first
            if self.user_item_matrix:
                user_ratings = self.user_item_matrix.get(user_id, {})
                return user_ratings.get(item_id)
            
            # TODO: Query from database
            # In production, this would query the Reviews table:
            # SELECT ratings->>'overall' FROM reviews 
            # WHERE user_id = ? AND (hotel_id = ? OR tour_id = ?)
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting user-item rating: {str(e)}")
            return None
    
    async def _get_events_in_date_range(
        self,
        dates: Dict[str, str]
    ) -> List[Dict[str, Any]]:
        """Get events happening during specified dates."""
        # TODO: Query from database
        # For now, return mock events
        try:
            check_in = datetime.fromisoformat(dates.get('check_in', '').replace('Z', '+00:00'))
            check_out = datetime.fromisoformat(dates.get('check_out', '').replace('Z', '+00:00'))
            
            # Mock events
            events = [
                {
                    'id': 'event-1',
                    'name': 'Khmer New Year Festival',
                    'location': {'city': 'Siem Reap'},
                    'start_date': '2025-04-14',
                    'end_date': '2025-04-16',
                    'cultural_significance': 'Major Cambodian holiday'
                }
            ]
            
            return events
        except Exception:
            return []
    
    def _add_recommendation_metadata(
        self,
        items: List[Dict[str, Any]],
        user_profile: Dict[str, Any],
        preferences: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Add confidence scores and explanations to recommendations.
        
        Args:
            items: Recommended items
            user_profile: User profile data
            preferences: User preferences
            
        Returns:
            Items with added metadata
        """
        for item in items:
            # Use combined score if available, otherwise recommendation score
            score = item.get('combined_score', item.get('recommendation_score', 0.5))
            
            # Calculate confidence (0-100)
            confidence = int(score * 100)
            item['confidence'] = confidence
            
            # Generate explanation reasons
            reasons = []
            
            # Event-based reasons
            if item.get('event_boost_applied'):
                event_count = item.get('event_count', 0)
                if event_count > 1:
                    reasons.append(f"Near {event_count} cultural events during your visit")
                else:
                    reasons.append("Near cultural events during your visit")
            
            # Value-based reasons
            value_score = item.get('value_score', 0)
            if value_score > 0.8:
                reasons.append("Exceptional value for money")
            elif value_score > 0.6:
                reasons.append("Great value for money")
            
            # Rating-based reasons
            rating = item.get('average_rating', 0)
            if rating >= 4.7:
                reasons.append("Exceptional ratings from travelers")
            elif rating >= 4.3:
                reasons.append("Highly rated by travelers")
            
            # Amenity matching
            amenities = item.get('amenities', [])
            preferred = preferences.get('amenities', [])
            matching_amenities = set(amenities) & set(preferred)
            if matching_amenities and len(matching_amenities) >= 2:
                amenity_list = ', '.join(list(matching_amenities)[:3])
                reasons.append(f"Has your preferred amenities: {amenity_list}")
            
            # Budget fit
            remaining = item.get('remaining_budget', 0)
            if remaining > 0:
                reasons.append(f"Leaves ${remaining:.0f} in your budget")
            
            # Alternative suggestion
            if item.get('is_alternative'):
                exceeded = item.get('budget_exceeded_by', 0)
                reasons.append(f"Slightly over budget by ${exceeded:.0f} but highly recommended")
            
            # Default reason if none found
            if not reasons:
                reasons.append("Matches your travel preferences")
            
            item['recommendation_reasons'] = reasons
            
            # Add recommendation type
            if item.get('event_boost_applied'):
                item['recommendation_type'] = 'event-based'
            elif value_score > 0.7:
                item['recommendation_type'] = 'value-focused'
            elif rating >= 4.5:
                item['recommendation_type'] = 'highly-rated'
            else:
                item['recommendation_type'] = 'personalized'
        
        return items
