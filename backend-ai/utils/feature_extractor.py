"""Feature extraction utilities for ML models."""

from typing import List, Dict, Any
import numpy as np


class FeatureExtractor:
    """Extract features from raw data for machine learning models."""
    
    @staticmethod
    def extract_hotel_features(hotel: Dict[str, Any]) -> np.ndarray:
        """
        Extract numerical features from hotel data.
        
        Args:
            hotel: Hotel data dictionary
            
        Returns:
            Feature vector as numpy array
        """
        features = []
        
        # Price feature (normalized)
        price = hotel.get("price_per_night", 0)
        features.append(price / 1000)  # Normalize to 0-1 range
        
        # Rating feature
        rating = hotel.get("average_rating", 0)
        features.append(rating / 5.0)  # Normalize to 0-1 range
        
        # Amenity features (binary)
        amenities = hotel.get("amenities", [])
        standard_amenities = [
            "wifi", "parking", "pool", "gym", "spa",
            "restaurant", "bar", "breakfast"
        ]
        for amenity in standard_amenities:
            features.append(1.0 if amenity in amenities else 0.0)
        
        # Location features (if available)
        location = hotel.get("location", {})
        if location.get("latitude") and location.get("longitude"):
            # Normalize coordinates (Cambodia approximate bounds)
            lat = (location["latitude"] - 10) / 5  # Rough normalization
            lng = (location["longitude"] - 102) / 5
            features.extend([lat, lng])
        else:
            features.extend([0.0, 0.0])
        
        return np.array(features)
    
    @staticmethod
    def extract_user_preferences(
        user_data: Dict[str, Any]
    ) -> np.ndarray:
        """
        Extract user preference features.
        
        Args:
            user_data: User profile and preference data
            
        Returns:
            User preference vector
        """
        features = []
        
        # Budget preference (normalized)
        budget = user_data.get("budget", 100)
        features.append(min(budget / 1000, 1.0))
        
        # Preferred amenities
        preferred_amenities = user_data.get("preferred_amenities", [])
        standard_amenities = [
            "wifi", "parking", "pool", "gym", "spa",
            "restaurant", "bar", "breakfast"
        ]
        for amenity in standard_amenities:
            features.append(1.0 if amenity in preferred_amenities else 0.0)
        
        # Travel style (if available)
        travel_style = user_data.get("travel_style", "balanced")
        style_encoding = {
            "budget": [1.0, 0.0, 0.0],
            "balanced": [0.0, 1.0, 0.0],
            "luxury": [0.0, 0.0, 1.0]
        }
        features.extend(style_encoding.get(travel_style, [0.0, 1.0, 0.0]))
        
        return np.array(features)
    
    @staticmethod
    def extract_tour_features(tour: Dict[str, Any]) -> np.ndarray:
        """
        Extract numerical features from tour data.
        
        Args:
            tour: Tour data dictionary
            
        Returns:
            Feature vector as numpy array
        """
        features = []
        
        # Price feature
        price = tour.get("price_per_person", 0)
        features.append(price / 500)  # Normalize
        
        # Duration feature
        duration = tour.get("duration", {})
        days = duration.get("days", 1)
        features.append(min(days / 7, 1.0))  # Normalize to week
        
        # Difficulty feature
        difficulty_map = {"easy": 0.33, "moderate": 0.66, "challenging": 1.0}
        difficulty = tour.get("difficulty", "moderate")
        features.append(difficulty_map.get(difficulty, 0.66))
        
        # Category features
        categories = tour.get("category", [])
        standard_categories = [
            "cultural", "adventure", "nature", "food", "history"
        ]
        for category in standard_categories:
            features.append(1.0 if category in categories else 0.0)
        
        return np.array(features)
    
    @staticmethod
    def calculate_similarity(
        vector1: np.ndarray,
        vector2: np.ndarray
    ) -> float:
        """
        Calculate cosine similarity between two feature vectors.
        
        Args:
            vector1: First feature vector
            vector2: Second feature vector
            
        Returns:
            Similarity score (0-1)
        """
        # Ensure same length
        if len(vector1) != len(vector2):
            return 0.0
        
        # Calculate cosine similarity
        dot_product = np.dot(vector1, vector2)
        norm1 = np.linalg.norm(vector1)
        norm2 = np.linalg.norm(vector2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return float(dot_product / (norm1 * norm2))
