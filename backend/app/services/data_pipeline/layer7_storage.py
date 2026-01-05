"""
Layer 7: Optimized Storage & Indexing
Store cleaned data efficiently
"""
import pandas as pd
from pathlib import Path
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


class StorageLayer:
    """Layer 7: Optimized storage and indexing"""
    
    def __init__(self, storage_path: Path):
        self.storage_path = storage_path
    
    def process(self, df: pd.DataFrame, source_id: str, metadata: Dict) -> Dict[str, Any]:
        """
        Store cleaned data efficiently
        
        Args:
            df: Cleaned DataFrame from Layer 5
            source_id: Unique identifier for this data source
            metadata: Combined metadata from all previous layers
        
        Returns:
            Storage metadata dict
        """
        logger.info(f"Layer 7: Storing {len(df)} rows, {len(df.columns)} columns")
        
        # 1. Create storage directories
        clean_dir = self.storage_path / 'clean'
        preview_dir = self.storage_path / 'preview'
        clean_dir.mkdir(parents=True, exist_ok=True)
        preview_dir.mkdir(parents=True, exist_ok=True)
        
        # 2. Convert to Parquet (columnar format, compressed)
        parquet_path = clean_dir / f"{source_id}_clean.parquet"
        df.to_parquet(
            parquet_path,
            engine='pyarrow',
            compression='snappy',
            index=False
        )
        
        # Get file size
        parquet_size = parquet_path.stat().st_size
        
        # 3. Create preview sample (first 1000 rows)
        preview_rows = min(1000, len(df))
        preview_path = preview_dir / f"{source_id}_preview.parquet"
        df.head(preview_rows).to_parquet(
            preview_path,
            engine='pyarrow',
            compression='snappy',
            index=False
        )
        
        preview_size = preview_path.stat().st_size
        
        # 4. Store column statistics
        column_stats = {}
        for col in df.columns:
            col_stats = {
                'dtype': str(df[col].dtype),
                'non_null_count': int(df[col].notna().sum()),
                'null_count': int(df[col].isna().sum()),
                'unique_count': int(df[col].nunique())
            }
            
            # Add numeric statistics
            if pd.api.types.is_numeric_dtype(df[col]):
                try:
                    col_stats['min'] = float(df[col].min())
                    col_stats['max'] = float(df[col].max())
                    col_stats['mean'] = float(df[col].mean())
                    col_stats['median'] = float(df[col].median())
                except:
                    pass
            
            column_stats[col] = col_stats
        
        result = {
            'storage': {
                'parquet_path': str(parquet_path),
                'parquet_size_bytes': parquet_size,
                'preview_path': str(preview_path),
                'preview_size_bytes': preview_size,
                'preview_rows': preview_rows,
                'compression': 'snappy',
                'format': 'parquet'
            },
            'column_stats': column_stats,
            'layer': 'storage'
        }
        
        compression_ratio = 0
        if 'file_size' in metadata and metadata['file_size']:
            compression_ratio = (1 - parquet_size / metadata['file_size']) * 100
            result['storage']['compression_ratio_percent'] = round(compression_ratio, 2)
        
        logger.info(f"Layer 7 complete: Stored {parquet_size:,} bytes (compression: {compression_ratio:.1f}%)")
        return result
