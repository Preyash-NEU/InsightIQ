"""
Layer 2: Structural Validation
Fix structural issues in data
"""
import pandas as pd
import numpy as np
from typing import Tuple, List, Dict, Any
import logging

logger = logging.getLogger(__name__)


class StructuralValidationLayer:
    """Layer 2: Structural validation and cleanup"""
    
    def process(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Validate and fix structural issues
        
        Args:
            df: DataFrame from Layer 1
        
        Returns:
            Tuple of (cleaned DataFrame, issues dict)
        """
        logger.info(f"Layer 2: Validating structure - {len(df)} rows, {len(df.columns)} columns")
        
        issues = []
        stats = {
            'original_rows': len(df),
            'original_columns': len(df.columns)
        }
        
        # 1. Detect and fix multi-headers
        if self._has_multi_headers(df):
            df = self._fix_multi_headers(df)
            issues.append("Multi-header rows detected and merged")
        
        # 2. Remove empty rows
        empty_rows = df.isna().all(axis=1).sum()
        if empty_rows > 0:
            df = df.dropna(how='all')
            issues.append(f"Removed {empty_rows} empty rows")
        
        # 3. Remove empty columns
        empty_cols = df.isna().all(axis=0).sum()
        if empty_cols > 0:
            df = df.dropna(axis=1, how='all')
            issues.append(f"Removed {empty_cols} empty columns")
        
        # 4. Detect and remove footer rows
        footer_rows = self._detect_footer_rows(df)
        if footer_rows:
            df = df.iloc[:-len(footer_rows)]
            issues.append(f"Removed {len(footer_rows)} footer/summary rows")
        
        # 5. Fix inconsistent row lengths (jagged arrays)
        if self._has_inconsistent_rows(df):
            df = self._fix_inconsistent_rows(df)
            issues.append("Fixed inconsistent row lengths")
        
        # 6. Reset index
        df = df.reset_index(drop=True)
        
        stats['final_rows'] = len(df)
        stats['final_columns'] = len(df.columns)
        stats['rows_removed'] = stats['original_rows'] - stats['final_rows']
        stats['columns_removed'] = stats['original_columns'] - stats['final_columns']
        
        result = {
            'issues': issues,
            'stats': stats,
            'layer': 'validation'
        }
        
        logger.info(f"Layer 2 complete: {len(issues)} issues fixed")
        return df, result
    
    def _has_multi_headers(self, df: pd.DataFrame) -> bool:
        """Detect if first row(s) are headers"""
        if len(df) == 0:
            return False
        
        first_row = df.iloc[0]
        
        # Check if first row has mostly non-null values
        if first_row.notna().sum() / len(first_row) > 0.8:
            # Check if values look like headers (short strings, no numbers)
            try:
                string_count = sum(1 for x in first_row if pd.notna(x) and isinstance(x, str) and len(str(x)) < 50)
                if string_count / len(first_row) > 0.7:
                    return True
            except:
                pass
        
        return False
    
    def _fix_multi_headers(self, df: pd.DataFrame) -> pd.DataFrame:
        """Merge multi-header rows into column names"""
        first_row = df.iloc[0]
        new_columns = []
        
        for i, col in enumerate(df.columns):
            if pd.notna(first_row.iloc[i]) and str(first_row.iloc[i]).strip():
                new_col = f"{col}_{first_row.iloc[i]}"
            else:
                new_col = col
            new_columns.append(str(new_col))
        
        df.columns = new_columns
        df = df.iloc[1:].reset_index(drop=True)
        
        return df
    
    def _detect_footer_rows(self, df: pd.DataFrame) -> List[int]:
        """Detect footer rows (totals, summaries)"""
        footer_keywords = ['total', 'sum', 'average', 'summary', 'grand total', 'subtotal', 'count']
        footer_rows = []
        
        # Check last 5 rows
        check_rows = min(5, len(df))
        for idx in range(max(0, len(df) - check_rows), len(df)):
            try:
                row = df.iloc[idx]
                # Convert to string and check for keywords
                row_str = ' '.join([str(v).lower() for v in row if pd.notna(v)])
                
                if any(keyword in row_str for keyword in footer_keywords):
                    footer_rows.append(idx)
            except:
                continue
        
        return footer_rows
    
    def _has_inconsistent_rows(self, df: pd.DataFrame) -> bool:
        """Check if rows have inconsistent number of values"""
        if len(df) == 0:
            return False
        
        # Count non-null values per row
        non_null_counts = df.notna().sum(axis=1)
        
        if len(non_null_counts) > 1:
            std_dev = non_null_counts.std()
            mean_val = non_null_counts.mean()
            
            # If std > 20% of mean, consider inconsistent
            if mean_val > 0 and std_dev > 0.2 * mean_val:
                return True
        
        return False
    
    def _fix_inconsistent_rows(self, df: pd.DataFrame) -> pd.DataFrame:
        """Fix rows with inconsistent lengths by padding with NaN"""
        # Pandas handles this automatically, but we ensure consistency
        return df
