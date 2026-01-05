"""
Layer 3: Column Normalization
Standardize column names
"""
import pandas as pd
import re
from typing import Tuple, Dict, Any, List
import logging

logger = logging.getLogger(__name__)


class ColumnNormalizationLayer:
    """Layer 3: Column name normalization"""
    
    def process(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Normalize column names
        
        Args:
            df: DataFrame from Layer 2
        
        Returns:
            Tuple of (DataFrame with normalized columns, mapping dict)
        """
        logger.info(f"Layer 3: Normalizing {len(df.columns)} column names")
        
        column_mapping = {}
        
        for col in df.columns:
            original = col
            normalized = self._normalize_column_name(col)
            
            # Handle duplicates
            if normalized in column_mapping.values():
                normalized = self._handle_duplicate(normalized, column_mapping)
            
            column_mapping[original] = normalized
        
        # Rename columns
        df = df.rename(columns=column_mapping)
        
        transformations = self._get_transformation_summary(column_mapping)
        
        result = {
            'column_mapping': column_mapping,
            'transformations': transformations,
            'transformation_count': len(transformations),
            'layer': 'normalization'
        }
        
        logger.info(f"Layer 3 complete: {len(transformations)} columns normalized")
        return df, result
    
    def _normalize_column_name(self, col: str) -> str:
        """Normalize a single column name"""
        # Convert to string
        normalized = str(col)
        
        # Remove leading/trailing whitespace
        normalized = normalized.strip()
        
        # Convert to lowercase
        normalized = normalized.lower()
        
        # Replace spaces with underscores
        normalized = normalized.replace(' ', '_')
        
        # Replace slashes with underscores
        normalized = normalized.replace('/', '_')
        normalized = normalized.replace('\\', '_')
        
        # Replace hyphens with underscores
        normalized = normalized.replace('-', '_')
        
        # Replace dots with underscores (except if it's a decimal number)
        normalized = normalized.replace('.', '_')
        
        # Handle special characters
        replacements = {
            '$': 'dollars',
            '€': 'euros',
            '£': 'pounds',
            '%': 'percent',
            '#': 'number',
            '@': 'at',
            '&': 'and',
            '+': 'plus',
            '=': 'equals'
        }
        
        for char, replacement in replacements.items():
            if char in normalized:
                normalized = normalized.replace(char, f'_{replacement}_')
        
        # Remove parentheses and brackets
        normalized = re.sub(r'[()[\]{}]', '', normalized)
        
        # Remove any remaining special characters (keep alphanumeric and underscore)
        normalized = re.sub(r'[^\w\s_]', '', normalized)
        
        # Replace multiple underscores with single underscore
        normalized = re.sub(r'_+', '_', normalized)
        
        # Remove leading/trailing underscores
        normalized = normalized.strip('_')
        
        # Ensure it doesn't start with a number
        if normalized and normalized[0].isdigit():
            normalized = f"col_{normalized}"
        
        # If empty after normalization, generate a name
        if not normalized:
            normalized = "unnamed_column"
        
        return normalized
    
    def _handle_duplicate(self, normalized: str, existing_mapping: Dict[str, str]) -> str:
        """Handle duplicate column names by appending number"""
        i = 1
        new_name = f"{normalized}_{i}"
        
        while new_name in existing_mapping.values():
            i += 1
            new_name = f"{normalized}_{i}"
        
        return new_name
    
    def _get_transformation_summary(self, mapping: Dict[str, str]) -> List[Dict[str, str]]:
        """Get summary of significant transformations"""
        transformations = []
        
        for original, normalized in mapping.items():
            if str(original) != str(normalized):
                transformations.append({
                    'original': str(original),
                    'normalized': str(normalized)
                })
        
        return transformations
