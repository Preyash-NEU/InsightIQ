import pandas as pd
from typing import Dict, List, Any, Tuple
import logging
from datetime import datetime
import pandas as pd

logger = logging.getLogger(__name__)

class DataValidator:
    """Utility for validating uploaded data."""
    
    @staticmethod
    def validate_csv_structure(df: pd.DataFrame) -> Tuple[bool, List[str]]:
        """
        Validate CSV file structure and data quality.
        
        Returns:
            Tuple of (is_valid, list_of_issues)
        """
        issues = []
        
        # Check if DataFrame is empty
        if df.empty:
            issues.append("CSV file has no data rows")
            return False, issues
        
        # Check for empty column names
        unnamed_cols = [col for col in df.columns if 'Unnamed' in str(col)]
        if unnamed_cols:
            issues.append(f"Found {len(unnamed_cols)} unnamed columns")
        
        # Check for duplicate column names
        duplicate_cols = df.columns[df.columns.duplicated()].tolist()
        if duplicate_cols:
            issues.append(f"Duplicate column names found: {', '.join(duplicate_cols)}")
        
        # Check for columns with all null values
        all_null_cols = [col for col in df.columns if df[col].isnull().all()]
        if all_null_cols:
            issues.append(f"Columns with all null values: {', '.join(all_null_cols)}")
        
        # Check data quality
        total_cells = df.shape[0] * df.shape[1]
        null_cells = df.isnull().sum().sum()
        null_percentage = (null_cells / total_cells) * 100 if total_cells > 0 else 0
        
        if null_percentage > 50:
            issues.append(f"High percentage of missing data: {null_percentage:.1f}%")
        
        # Check for very wide DataFrames (potential parsing issues)
        if df.shape[1] > 100:
            issues.append(f"Unusually high number of columns: {df.shape[1]}. Possible CSV parsing issue?")
        
        # Check for very narrow DataFrames
        if df.shape[1] < 2:
            issues.append("Only 1 column detected. Check if CSV delimiter is correct.")
        
        is_valid = len(issues) == 0
        
        return is_valid, issues
    
    @staticmethod
    def infer_column_types(df: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Infer and validate column data types with enhanced detection.
        
        Returns:
            List of column information with better type detection
        """
        columns_info = []
        
        for col in df.columns:
            dtype = str(df[col].dtype)
            
            # Get sample values and convert to JSON-serializable format
            sample_values = df[col].dropna().head(3).tolist()
            
            # Convert any datetime objects to strings
            sample_values = [
                val.isoformat() if isinstance(val, (pd.Timestamp, datetime)) else val
                for val in sample_values
            ]
            
            # Enhanced type detection
            col_info = {
                "name": col,
                "type": dtype,
                "null_count": int(df[col].isnull().sum()),
                "unique_count": int(df[col].nunique()),
                "sample_values": sample_values  # Now JSON-serializable
            }
            
            # Try to detect if numeric column is actually categorical
            if pd.api.types.is_numeric_dtype(df[col]):
                unique_ratio = df[col].nunique() / len(df[col]) if len(df[col]) > 0 else 0
                
                if unique_ratio < 0.05 and df[col].nunique() < 20:
                    col_info["suggested_type"] = "categorical"
                    # Convert categories dict values to JSON-serializable
                    categories = df[col].value_counts().head(10).to_dict()
                    col_info["categories"] = {str(k): int(v) for k, v in categories.items()}
                else:
                    col_info["suggested_type"] = "numeric"
                    col_info["stats"] = {
                        "min": float(df[col].min()) if not df[col].empty else None,
                        "max": float(df[col].max()) if not df[col].empty else None,
                        "mean": float(df[col].mean()) if not df[col].empty else None
                    }
            
            # Try to detect datetime columns
            elif dtype == 'object':
                # Try parsing as datetime
                try:
                    pd.to_datetime(df[col].dropna().head(100), errors='raise')
                    col_info["suggested_type"] = "datetime"
                except:
                    # Check if it's categorical
                    unique_ratio = df[col].nunique() / len(df[col]) if len(df[col]) > 0 else 0
                    
                    if unique_ratio < 0.1 or df[col].nunique() < 50:
                        col_info["suggested_type"] = "categorical"
                        # Convert to JSON-serializable
                        categories = df[col].value_counts().head(10).to_dict()
                        col_info["categories"] = {str(k): int(v) for k, v in categories.items()}
                    else:
                        col_info["suggested_type"] = "text"
            
            columns_info.append(col_info)
        
        return columns_info
    
    @staticmethod
    def get_data_quality_report(df: pd.DataFrame) -> Dict[str, Any]:
        """
        Generate comprehensive data quality report.
        
        Returns:
            Dictionary with data quality metrics (all JSON-serializable)
        """
        total_cells = df.shape[0] * df.shape[1]
        null_cells = df.isnull().sum().sum()
        
        # Calculate completeness
        completeness = ((total_cells - null_cells) / total_cells * 100) if total_cells > 0 else 0
        
        # Find columns with missing data
        columns_with_nulls = []
        for col in df.columns:
            null_count = df[col].isnull().sum()
            if null_count > 0:
                columns_with_nulls.append({
                    "column": str(col),  # Convert to string
                    "null_count": int(null_count),
                    "null_percentage": round(float(null_count / len(df) * 100), 2)
                })
        
        # Check for duplicate rows
        duplicate_rows = df.duplicated().sum()
        
        # Memory usage
        memory_mb = df.memory_usage(deep=True).sum() / (1024 * 1024)
        
        return {
            "total_rows": int(len(df)),
            "total_columns": int(len(df.columns)),
            "total_cells": int(total_cells),
            "completeness_percentage": round(float(completeness), 2),
            "null_cells": int(null_cells),
            "duplicate_rows": int(duplicate_rows),
            "memory_usage_mb": round(float(memory_mb), 2),
            "columns_with_nulls": columns_with_nulls
        }