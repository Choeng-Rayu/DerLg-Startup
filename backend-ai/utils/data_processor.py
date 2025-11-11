"""Data processing utilities."""

from typing import List, Dict, Any
from datetime import datetime, timedelta


class DataProcessor:
    """Utility class for processing and transforming data."""
    
    @staticmethod
    def normalize_price(price: float, currency: str = "USD") -> float:
        """
        Normalize price to USD.
        
        Args:
            price: Price value
            currency: Currency code (USD, KHR)
            
        Returns:
            Normalized price in USD
        """
        if currency == "KHR":
            # Convert KHR to USD (approximate rate: 4000 KHR = 1 USD)
            return price / 4000
        return price
    
    @staticmethod
    def calculate_date_range(check_in: str, check_out: str) -> int:
        """
        Calculate number of nights between dates.
        
        Args:
            check_in: Check-in date (ISO format)
            check_out: Check-out date (ISO format)
            
        Returns:
            Number of nights
        """
        try:
            start = datetime.fromisoformat(check_in.replace('Z', '+00:00'))
            end = datetime.fromisoformat(check_out.replace('Z', '+00:00'))
            return (end - start).days
        except Exception:
            return 1
    
    @staticmethod
    def filter_by_budget(
        items: List[Dict[str, Any]],
        budget: float,
        price_key: str = "price"
    ) -> List[Dict[str, Any]]:
        """
        Filter items within budget constraint.
        
        Args:
            items: List of items to filter
            budget: Maximum budget
            price_key: Key for price field in items
            
        Returns:
            Filtered items within budget
        """
        return [
            item for item in items
            if item.get(price_key, float('inf')) <= budget
        ]
    
    @staticmethod
    def calculate_budget_allocation(
        total_budget: float,
        days: int
    ) -> Dict[str, float]:
        """
        Allocate budget across different categories.
        
        Args:
            total_budget: Total available budget
            days: Number of days
            
        Returns:
            Budget allocation by category
        """
        return {
            "accommodation": total_budget * 0.40,  # 40% for hotels
            "activities": total_budget * 0.30,     # 30% for tours/activities
            "meals": total_budget * 0.20,          # 20% for food
            "transportation": total_budget * 0.10  # 10% for transport
        }
    
    @staticmethod
    def extract_amenities(amenities: List[str]) -> Dict[str, bool]:
        """
        Convert amenity list to feature dictionary.
        
        Args:
            amenities: List of amenity codes
            
        Returns:
            Dictionary of amenity features
        """
        standard_amenities = [
            "wifi", "parking", "pool", "gym", "spa",
            "restaurant", "bar", "breakfast", "ac", "tv"
        ]
        
        return {
            amenity: amenity in amenities
            for amenity in standard_amenities
        }
    
    @staticmethod
    def clean_text(text: str) -> str:
        """
        Clean and normalize text for processing.
        
        Args:
            text: Raw text
            
        Returns:
            Cleaned text
        """
        if not text:
            return ""
        
        # Remove extra whitespace
        text = " ".join(text.split())
        
        # Remove special characters (keep basic punctuation)
        # TODO: Add more sophisticated cleaning if needed
        
        return text.strip()
