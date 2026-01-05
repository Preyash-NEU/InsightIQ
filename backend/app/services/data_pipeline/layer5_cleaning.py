"""
Layer 5: Data Cleaning & Imputation
Handle missing values, outliers, and duplicates
"""
import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any
import logging

logger = logging.getLogger(__name__)


class DataCleaningLayer:
    """Layer 5: Data cleaning and imputation"""
    
    def process(self, df: pd.DataFrame, type_info: Dict) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Clean data and handle missing values
        
        Args:
            df: DataFrame from Layer 4
            type_info: Type information from Layer 4
        
        Returns:
            Tuple of (cleaned DataFrame, cleaning report)
        """
        logger.info(f"Layer 5: Cleaning {len(df.columns)} columns")
        
        cleaning_report = {}
        
        for col in df.columns:
            col_type = type_info[col]['detected_type']
            
            # 1. Handle missing values
            original_nulls = df[col].isna().sum()
            df[col], imputation_method = self._handle_missing_values(df[col], col_type)
            final_nulls = df[col].isna().sum()
            imputed_count = original_nulls - final_nulls
            
            # 2. Handle outliers (for numeric columns)
            if col_type in ['integer', 'float', 'currency']:
                outliers_count, df[col] = self._handle_outliers(df[col])
            else:
                outliers_count = 0
            
            # 3. Trim whitespace (for string columns)
            if col_type == 'string':
                df[col] = df[col].astype(str).str.strip()
                df[col] = df[col].replace('nan', np.nan)
            
            # 4. Check for duplicates in ID-like columns
            duplicates_removed = 0
            if self._is_id_column(col):
                before_count = len(df)
                df = df.drop_duplicates(subset=[col], keep='first')
                duplicates_removed = before_count - len(df)
            
            cleaning_report[col] = {
                'original_nulls': int(original_nulls),
                'imputed_nulls': int(imputed_count),
                'final_nulls': int(final_nulls),
                'imputation_method': imputation_method,
                'outliers_handled': int(outliers_count),
                'duplicates_removed': int(duplicates_removed)
            }
        
        result = {
            'cleaning_report': cleaning_report,
            'total_imputed': sum(c['imputed_nulls'] for c in cleaning_report.values()),
            'total_outliers': sum(c['outliers_handled'] for c in cleaning_report.values()),
            'layer': 'cleaning'
        }
        
        logger.info(f"Layer 5 complete: Imputed {result['total_imputed']} values, handled {result['total_outliers']} outliers")
        return df, result
    
    def _handle_missing_values(self, series: pd.Series, col_type: str) -> Tuple[pd.Series, str]:
        """Handle missing values based on column type"""
        if series.isna().sum() == 0:
            return series, 'none'
        
        if col_type in ['integer', 'float', 'currency']:
            return self._handle_numeric_missing(series)
        elif col_type == 'boolean':
            return self._handle_boolean_missing(series)
        elif col_type in ['date', 'datetime']:
            return self._handle_date_missing(series)
        else:  # string, email, url
            return self._handle_categorical_missing(series)
    
    def _handle_numeric_missing(self, series: pd.Series) -> Tuple[pd.Series, str]:
        """Handle missing values in numeric columns"""
        if len(series.dropna()) == 0:
            return series, 'none'
        
        # Strategy based on distribution
        unique_count = series.nunique()
        
        if unique_count < 10:
            # Few unique values → mode
            if not series.mode().empty:
                series = series.fillna(series.mode()[0])
                return series, 'mode'
            else:
                return series, 'none'
        
        # Check skewness
        try:
            skewness = series.skew()
            if abs(skewness) > 1:
                # Skewed distribution → median
                series = series.fillna(series.median())
                return series, 'median'
            else:
                # Normal distribution → mean
                series = series.fillna(series.mean())
                return series, 'mean'
        except:
            # Fallback to median
            series = series.fillna(series.median())
            return series, 'median'
    
    def _handle_boolean_missing(self, series: pd.Series) -> Tuple[pd.Series, str]:
        """Handle missing values in boolean columns"""
        # Use most frequent value (mode)
        if not series.mode().empty:
            series = series.fillna(series.mode()[0])
            return series, 'mode'
        else:
            # If no mode, use False as default
            series = series.fillna(False)
            return series, 'default_false'
    
    def _handle_categorical_missing(self, series: pd.Series) -> Tuple[pd.Series, str]:
        """Handle missing values in categorical/string columns"""
        # Use most frequent value
        if not series.mode().empty:
            series = series.fillna(series.mode()[0])
            return series, 'mode'
        else:
            series = series.fillna('Unknown')
            return series, 'default_unknown'
    
    def _handle_date_missing(self, series: pd.Series) -> Tuple[pd.Series, str]:
        """Handle missing values in date columns"""
        # Forward fill (assume same as previous row)
        if series.notna().any():
            series = series.fillna(method='ffill')
            # If still have NaN at the start, backward fill
            series = series.fillna(method='bfill')
            return series, 'forward_fill'
        else:
            return series, 'none'
    
    def _handle_outliers(self, series: pd.Series, method: str = 'iqr') -> Tuple[int, pd.Series]:
        """Detect and handle outliers using IQR method"""
        try:
            if len(series.dropna()) < 4:
                return 0, series
            
            Q1 = series.quantile(0.25)
            Q3 = series.quantile(0.75)
            IQR = Q3 - Q1
            
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            # Count outliers
            outliers_count = ((series < lower_bound) | (series > upper_bound)).sum()
            
            # Clip outliers to bounds
            series = series.clip(lower=lower_bound, upper=upper_bound)
            
            return int(outliers_count), series
        except:
            return 0, series
    
    def _is_id_column(self, col_name: str) -> bool:
        """Check if column name suggests it's an ID column"""
        id_indicators = ['id', 'key', 'code', 'number', 'identifier', 'reference']
        col_lower = col_name.lower()
        
        return any(indicator in col_lower for indicator in id_indicators)
