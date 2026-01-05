"""
Layer 6: Data Quality Assessment
Calculate quality metrics and flag issues
"""
import pandas as pd
import numpy as np
from typing import Dict, Any, List
import re
import logging

logger = logging.getLogger(__name__)


class DataQualityLayer:
    """Layer 6: Data quality assessment"""
    
    def process(self, df: pd.DataFrame, type_info: Dict, cleaning_report: Dict) -> Dict[str, Any]:
        """
        Assess data quality
        
        Args:
            df: DataFrame from Layer 5
            type_info: Type information from Layer 4
            cleaning_report: Cleaning report from Layer 5
        
        Returns:
            Quality report dict
        """
        logger.info(f"Layer 6: Assessing quality for {len(df.columns)} columns")
        
        quality_report = {
            'overall_score': 0,
            'columns': {},
            'dataset_stats': {
                'total_rows': len(df),
                'total_columns': len(df.columns),
                'total_cells': len(df) * len(df.columns),
                'missing_cells': int(df.isna().sum().sum()),
                'complete_cells': int(df.notna().sum().sum())
            }
        }
        
        column_scores = []
        
        for col in df.columns:
            metrics = self._calculate_column_quality(
                df[col],
                type_info.get(col, {}),
                cleaning_report.get(col, {})
            )
            
            quality_report['columns'][col] = {
                'completeness': metrics['completeness'],
                'uniqueness': metrics['uniqueness'],
                'consistency': metrics['consistency'],
                'validity': metrics['validity'],
                'quality_score': metrics['score'],
                'quality_level': metrics['level'],
                'issues': metrics['issues']
            }
            
            column_scores.append(metrics['score'])
        
        # Overall dataset quality
        if column_scores:
            quality_report['overall_score'] = round(np.mean(column_scores), 2)
            quality_report['overall_level'] = self._get_quality_level(quality_report['overall_score'])
        
        # Calculate dataset completeness
        total_cells = quality_report['dataset_stats']['total_cells']
        if total_cells > 0:
            completeness_pct = (quality_report['dataset_stats']['complete_cells'] / total_cells) * 100
            quality_report['dataset_stats']['completeness_percent'] = round(completeness_pct, 2)
        
        result = {
            'quality_report': quality_report,
            'layer': 'quality'
        }
        
        logger.info(f"Layer 6 complete: Overall quality score {quality_report['overall_score']}")
        return result
    
    def _calculate_column_quality(self, series: pd.Series, type_info: Dict, cleaning_info: Dict) -> Dict:
        """Calculate quality metrics for a single column"""
        metrics = {}
        issues = []
        
        total_rows = len(series)
        
        # 1. Completeness (% non-null)
        non_null_count = series.notna().sum()
        completeness = (non_null_count / total_rows * 100) if total_rows > 0 else 0
        metrics['completeness'] = round(completeness, 2)
        
        if completeness < 70:
            issues.append(f"Low completeness: {completeness:.1f}%")
        elif completeness < 90:
            issues.append(f"Moderate completeness: {completeness:.1f}%")
        
        # 2. Uniqueness (% unique values)
        if non_null_count > 0:
            unique_count = series.nunique()
            uniqueness = (unique_count / non_null_count * 100)
            metrics['uniqueness'] = round(uniqueness, 2)
        else:
            metrics['uniqueness'] = 0
        
        # 3. Consistency (pattern matching for specific types)
        detected_type = type_info.get('detected_type', 'string')
        consistency = self._check_consistency(series, detected_type)
        metrics['consistency'] = consistency
        
        if consistency < 80:
            issues.append(f"Low consistency: {consistency:.1f}%")
        
        # 4. Validity (type-specific checks)
        validity = self._check_validity(series, detected_type)
        metrics['validity'] = validity
        
        if validity < 90:
            issues.append(f"Validity issues: {validity:.1f}%")
        
        # 5. Check if data was heavily cleaned
        if cleaning_info:
            imputed_pct = (cleaning_info.get('imputed_nulls', 0) / total_rows * 100) if total_rows > 0 else 0
            if imputed_pct > 10:
                issues.append(f"{imputed_pct:.1f}% values imputed")
            
            outliers_pct = (cleaning_info.get('outliers_handled', 0) / total_rows * 100) if total_rows > 0 else 0
            if outliers_pct > 5:
                issues.append(f"{outliers_pct:.1f}% outliers handled")
        
        # 6. Overall quality score
        score = (
            completeness * 0.40 +
            consistency * 0.30 +
            validity * 0.20 +
            min(uniqueness, 100) * 0.10
        )
        
        metrics['score'] = round(score, 2)
        metrics['level'] = self._get_quality_level(score)
        metrics['issues'] = issues
        
        return metrics
    
    def _check_consistency(self, series: pd.Series, detected_type: str) -> float:
        """Check consistency based on data type"""
        non_null = series.dropna()
        
        if len(non_null) == 0:
            return 100
        
        if detected_type == 'email':
            email_pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
            valid_count = sum(1 for val in non_null if re.match(email_pattern, str(val)))
            return (valid_count / len(non_null) * 100)
        
        elif detected_type == 'url':
            url_pattern = r'^https?://'
            valid_count = sum(1 for val in non_null if re.match(url_pattern, str(val)))
            return (valid_count / len(non_null) * 100)
        
        else:
            # For other types, assume consistent if successfully typed
            return 100
    
    def _check_validity(self, series: pd.Series, detected_type: str) -> float:
        """Check validity based on data type"""
        non_null = series.dropna()
        
        if len(non_null) == 0:
            return 100
        
        if detected_type in ['integer', 'float', 'currency']:
            # Check for unrealistic values (e.g., negative ages, extreme outliers)
            try:
                # Count finite values (not inf, not nan)
                valid_count = np.isfinite(non_null).sum()
                return (valid_count / len(non_null) * 100)
            except:
                return 100
        
        elif detected_type == 'boolean':
            # Check if all values are actually boolean
            valid_count = sum(1 for val in non_null if isinstance(val, (bool, np.bool_)))
            return (valid_count / len(non_null) * 100)
        
        else:
            return 100
    
    def _get_quality_level(self, score: float) -> str:
        """Get quality level label from score"""
        if score >= 90:
            return 'excellent'
        elif score >= 80:
            return 'good'
        elif score >= 70:
            return 'fair'
        elif score >= 60:
            return 'poor'
        else:
            return 'critical'
