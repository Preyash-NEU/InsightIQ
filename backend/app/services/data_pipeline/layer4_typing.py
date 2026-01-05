"""
Layer 4: Data Type Detection & Casting
Smart type inference and conversion
"""
import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any, List
import re
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class TypeDetectionLayer:
    """Layer 4: Smart type detection and casting"""
    
    # Date formats to try
    DATE_FORMATS = [
        '%Y-%m-%d',           # 2024-01-15
        '%m/%d/%Y',           # 01/15/2024
        '%d/%m/%Y',           # 15/01/2024
        '%Y/%m/%d',           # 2024/01/15
        '%b %d, %Y',          # Jan 15, 2024
        '%B %d, %Y',          # January 15, 2024
        '%d-%b-%Y',           # 15-Jan-2024
        '%Y%m%d',             # 20240115
        '%m-%d-%Y',           # 01-15-2024
        '%d.%m.%Y',           # 15.01.2024
    ]
    
    def process(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Detect and cast data types
        
        Args:
            df: DataFrame from Layer 3
        
        Returns:
            Tuple of (DataFrame with proper types, type info dict)
        """
        logger.info(f"Layer 4: Detecting types for {len(df.columns)} columns")
        
        type_info = {}
        
        for col in df.columns:
            series = df[col]
            
            # Detect type
            detected_type = self._detect_column_type(series)
            
            # Cast to appropriate type
            df[col], conversion_info = self._cast_column(series, detected_type)
            
            type_info[col] = {
                'detected_type': detected_type,
                'original_dtype': str(series.dtype),
                'final_dtype': str(df[col].dtype),
                'conversion_success_rate': conversion_info['success_rate'],
                'failed_conversions': conversion_info['failed_count'],
                'sample_values': self._get_sample_values(df[col])
            }
        
        result = {
            'type_info': type_info,
            'layer': 'typing'
        }
        
        logger.info(f"Layer 4 complete: Types detected and cast")
        return df, result
    
    def _detect_column_type(self, series: pd.Series) -> str:
        """Detect the most appropriate type for a column"""
        # Remove null values for type detection
        non_null = series.dropna()
        
        if len(non_null) == 0:
            return 'string'
        
        # Sample for performance (max 1000 values)
        sample_size = min(1000, len(non_null))
        sample = non_null.sample(sample_size, random_state=42) if sample_size < len(non_null) else non_null
        
        # Try type detection in order of specificity
        if self._is_boolean(sample):
            return 'boolean'
        elif self._is_integer(sample):
            return 'integer'
        elif self._is_currency(sample):
            return 'currency'
        elif self._is_percentage(sample):
            return 'percentage'
        elif self._is_float(sample):
            return 'float'
        elif self._is_datetime(sample):
            return 'datetime'
        elif self._is_date(sample):
            return 'date'
        elif self._is_email(sample):
            return 'email'
        elif self._is_url(sample):
            return 'url'
        else:
            return 'string'
    
    def _is_boolean(self, series: pd.Series) -> bool:
        """Check if series contains boolean values"""
        try:
            unique_values = set(str(v).strip().lower() for v in series.unique() if pd.notna(v))
            
            boolean_values = {
                'true', 'false', 't', 'f', 'yes', 'no', 'y', 'n',
                '1', '0', 'on', 'off', 'enabled', 'disabled'
            }
            
            # If all unique values are in boolean set
            return len(unique_values) > 0 and len(unique_values) <= 5 and unique_values.issubset(boolean_values)
        except:
            return False
    
    def _is_integer(self, series: pd.Series) -> bool:
        """Check if series contains integers"""
        try:
            # Try converting to numeric
            numeric_series = pd.to_numeric(series, errors='coerce')
            
            # Check if >90% can be converted
            success_rate = (numeric_series.notna().sum() / len(series))
            if success_rate < 0.9:
                return False
            
            # Check if values are integers
            non_null_numeric = numeric_series.dropna()
            if len(non_null_numeric) == 0:
                return False
            
            # Check if all values are whole numbers
            is_whole = (non_null_numeric == non_null_numeric.astype(int)).all()
            
            return is_whole
            
        except:
            return False
    
    def _is_float(self, series: pd.Series) -> bool:
        """Check if series contains floats"""
        try:
            # Try converting to numeric
            numeric_series = pd.to_numeric(series, errors='coerce')
            
            # Check if >90% can be converted
            success_rate = (numeric_series.notna().sum() / len(series))
            
            return success_rate >= 0.9
            
        except:
            return False
    
    def _is_currency(self, series: pd.Series) -> bool:
        """Check if series contains currency values"""
        try:
            # Check if values have currency symbols
            sample_str = series.astype(str).head(min(10, len(series)))
            has_currency = any(
                any(symbol in str(val) for symbol in ['$', '€', '£', 'USD', 'EUR', 'GBP'])
                for val in sample_str
            )
            
            if not has_currency:
                return False
            
            # Try parsing as currency
            parsed_count = 0
            check_count = min(10, len(series))
            for val in series.head(check_count):
                if self._parse_currency(val) is not None:
                    parsed_count += 1
            
            return parsed_count >= check_count * 0.8  # At least 80% parseable
        except:
            return False
    
    def _is_percentage(self, series: pd.Series) -> bool:
        """Check if series contains percentage values"""
        try:
            # Check if values have % symbol
            sample_str = series.astype(str).head(min(10, len(series)))
            has_percent = sum(1 for val in sample_str if '%' in str(val))
            
            return has_percent >= len(sample_str) * 0.5  # At least 50% have %
        except:
            return False
    
    def _is_datetime(self, series: pd.Series) -> bool:
        """Check if series contains datetime values"""
        try:
            # Try pandas datetime conversion
            dt_series = pd.to_datetime(series, errors='coerce')
            
            # Check if >80% can be converted
            success_rate = (dt_series.notna().sum() / len(series))
            if success_rate < 0.8:
                return False
            
            # Check if values have time component (not just dates)
            non_null_dt = dt_series.dropna()
            if len(non_null_dt) == 0:
                return False
            
            # Check if any value has non-midnight time
            has_time = (non_null_dt.dt.hour != 0).any() or (non_null_dt.dt.minute != 0).any()
            
            return has_time
            
        except:
            return False
    
    def _is_date(self, series: pd.Series) -> bool:
        """Check if series contains date values (no time)"""
        try:
            # Try pandas datetime conversion
            dt_series = pd.to_datetime(series, errors='coerce')
            
            # Check if >80% can be converted
            success_rate = (dt_series.notna().sum() / len(series))
            
            return success_rate >= 0.8
            
        except:
            return False
    
    def _is_email(self, series: pd.Series) -> bool:
        """Check if series contains email addresses"""
        try:
            email_pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
            
            sample = series.head(min(10, len(series)))
            matches = sum(1 for val in sample if pd.notna(val) and re.match(email_pattern, str(val)))
            
            return matches >= len(sample) * 0.8  # At least 80%
        except:
            return False
    
    def _is_url(self, series: pd.Series) -> bool:
        """Check if series contains URLs"""
        try:
            url_pattern = r'^https?://'
            
            sample = series.head(min(10, len(series)))
            matches = sum(1 for val in sample if pd.notna(val) and re.match(url_pattern, str(val)))
            
            return matches >= len(sample) * 0.8  # At least 80%
        except:
            return False
    
    def _cast_column(self, series: pd.Series, detected_type: str) -> Tuple[pd.Series, Dict]:
        """Cast column to detected type"""
        original_length = len(series)
        original_null_count = series.isna().sum()
        
        if detected_type == 'boolean':
            result = series.apply(self._parse_boolean)
        elif detected_type == 'integer':
            result = pd.to_numeric(series, errors='coerce').astype('Int64')
        elif detected_type == 'float':
            result = pd.to_numeric(series, errors='coerce')
        elif detected_type == 'currency':
            result = series.apply(self._parse_currency)
        elif detected_type == 'percentage':
            result = series.apply(self._parse_percentage)
        elif detected_type in ['datetime', 'date']:
            result = series.apply(self._parse_date)
        else:
            result = series.astype(str).replace('nan', np.nan)
        
        # Calculate conversion success rate
        new_null_count = result.isna().sum()
        failed_count = new_null_count - original_null_count
        non_null_original = original_length - original_null_count
        
        if non_null_original > 0:
            success_count = non_null_original - failed_count
            success_rate = (success_count / non_null_original) * 100
        else:
            success_rate = 100
        
        conversion_info = {
            'success_rate': round(max(0, success_rate), 2),
            'failed_count': int(max(0, failed_count))
        }
        
        return result, conversion_info
    
    def _parse_boolean(self, value: Any) -> Any:
        """Parse boolean value"""
        if pd.isna(value):
            return None
        
        str_val = str(value).strip().lower()
        
        # True values
        if str_val in ['true', 't', 'yes', 'y', '1', 'on', 'enabled']:
            return True
        
        # False values
        if str_val in ['false', 'f', 'no', 'n', '0', 'off', 'disabled']:
            return False
        
        return None
    
    def _parse_currency(self, value: Any) -> float:
        """Parse currency value"""
        if pd.isna(value):
            return None
        
        try:
            # Remove currency symbols and commas
            cleaned = str(value)
            for symbol in ['$', '€', '£', 'USD', 'EUR', 'GBP', ',', ' ']:
                cleaned = cleaned.replace(symbol, '')
            
            cleaned = cleaned.strip()
            
            return float(cleaned)
        except:
            return None
    
    def _parse_percentage(self, value: Any) -> float:
        """Parse percentage value to decimal"""
        if pd.isna(value):
            return None
        
        try:
            str_val = str(value).strip()
            
            # Remove % sign
            if '%' in str_val:
                cleaned = str_val.replace('%', '').strip()
                return float(cleaned) / 100.0
            
            # Already decimal
            num = float(str_val)
            # If between 0 and 1, assume it's already decimal
            if 0 <= num <= 1:
                return num
            else:
                # Assume it's percentage (e.g., 45 means 0.45)
                return num / 100.0
        except:
            return None
    
    def _parse_date(self, value: Any) -> Any:
        """Parse date/datetime with multiple formats"""
        if pd.isna(value):
            return pd.NaT
        
        # Try each date format
        for fmt in self.DATE_FORMATS:
            try:
                return pd.to_datetime(value, format=fmt)
            except:
                continue
        
        # Fallback to pandas auto-detection
        try:
            return pd.to_datetime(value)
        except:
            return pd.NaT
    
    def _get_sample_values(self, series: pd.Series, n: int = 5) -> List:
        """Get sample non-null values"""
        non_null = series.dropna()
        if len(non_null) == 0:
            return []
        
        sample_size = min(n, len(non_null))
        sample = non_null.head(sample_size).tolist()
        
        # Convert to JSON-serializable strings
        result = []
        for v in sample:
            if isinstance(v, (pd.Timestamp, datetime)):
                result.append(v.isoformat())
            elif isinstance(v, (np.integer, np.floating)):
                result.append(float(v))
            else:
                result.append(str(v))
        
        return result
