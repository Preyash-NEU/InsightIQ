"""
Layer 1: Ingestion & Raw Storage
Safely intake data and preserve original
"""
import pandas as pd
import numpy as np
import chardet
import hashlib
from pathlib import Path
from typing import Tuple, Dict, Any
import logging

logger = logging.getLogger(__name__)


class IngestionLayer:
    """Layer 1: Data Ingestion with encoding detection"""
    
    def __init__(self, storage_path: Path):
        self.storage_path = storage_path
        self.detected_encoding = None
        self.detected_delimiter = None
    
    def process(self, file_path: str, source_type: str, sheet_name: int = 0) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Ingest data from various sources
        
        Args:
            file_path: Path to the file or connection string
            source_type: 'csv', 'excel', 'json', 'parquet', 'tsv'
            sheet_name: Excel sheet index (default: 0)
        
        Returns:
            Tuple of (DataFrame, metadata dict)
        """
        logger.info(f"Layer 1: Ingesting {source_type} from {file_path}")
        
        try:
            # Read data based on type
            if source_type == 'csv':
                df = self._read_csv(file_path)
            elif source_type == 'excel':
                df = self._read_excel(file_path, sheet_name)
            elif source_type == 'json':
                df = self._read_json(file_path)
            elif source_type == 'parquet':
                df = pd.read_parquet(file_path)
            elif source_type == 'tsv':
                df = self._read_tsv(file_path)
            else:
                raise ValueError(f"Unsupported source type: {source_type}")
            
            # Generate fingerprint
            data_hash = self._generate_fingerprint(df)
            
            # Store raw copy
            raw_path = self._store_raw(df, data_hash)
            
            # Extract metadata
            file_size = Path(file_path).stat().st_size if Path(file_path).exists() else None
            
            metadata = {
                'source_type': source_type,
                'row_count': len(df),
                'column_count': len(df.columns),
                'file_size': file_size,
                'encoding': self.detected_encoding,
                'delimiter': self.detected_delimiter,
                'fingerprint': data_hash,
                'raw_path': str(raw_path),
                'columns': list(df.columns),
                'layer': 'ingestion',
                'sheet_name': sheet_name if source_type == 'excel' else None
            }
            
            logger.info(f"Layer 1 complete: {len(df)} rows, {len(df.columns)} columns")
            return df, metadata
            
        except Exception as e:
            logger.error(f"Layer 1 failed: {str(e)}", exc_info=True)
            raise
    
    def _read_csv(self, file_path: str) -> pd.DataFrame:
        """Read CSV with encoding detection"""
        # Detect encoding
        with open(file_path, 'rb') as f:
            raw_data = f.read(10000)  # Read first 10KB
            result = chardet.detect(raw_data)
            self.detected_encoding = result['encoding'] or 'utf-8'
        
        # Detect delimiter
        with open(file_path, 'r', encoding=self.detected_encoding, errors='ignore') as f:
            first_line = f.readline()
            self.detected_delimiter = self._detect_delimiter(first_line)
        
        # Read CSV
        df = pd.read_csv(
            file_path,
            encoding=self.detected_encoding,
            delimiter=self.detected_delimiter,
            low_memory=False,
            skip_blank_lines=False,  # We'll handle this in Layer 2
            encoding_errors='ignore'
        )
        
        return df
    
    def _detect_delimiter(self, line: str) -> str:
        """Detect CSV delimiter"""
        delimiters = [',', ';', '\t', '|', ':']
        counts = {d: line.count(d) for d in delimiters}
        return max(counts, key=counts.get)
    
    def _read_excel(self, file_path: str, sheet_name: int = 0) -> pd.DataFrame:
        """Read Excel file"""
        df = pd.read_excel(
            file_path,
            sheet_name=sheet_name,
            engine='openpyxl'
        )
        return df
    
    def _read_json(self, file_path: str) -> pd.DataFrame:
        """Read JSON file"""
        df = pd.read_json(file_path)
        return df
    
    def _read_tsv(self, file_path: str) -> pd.DataFrame:
        """Read TSV file"""
        self.detected_delimiter = '\t'
        df = pd.read_csv(
            file_path,
            delimiter='\t',
            low_memory=False,
            encoding_errors='ignore'
        )
        return df
    
    def _generate_fingerprint(self, df: pd.DataFrame) -> str:
        """Generate SHA-256 hash of data"""
        # Create hash from shape + sample of data
        data_string = f"{df.shape}_{df.columns.tolist()}"
        
        # Add sample from first and last rows
        if len(df) > 0:
            data_string += f"_{df.head(5).to_json()}"
        if len(df) > 5:
            data_string += f"_{df.tail(5).to_json()}"
        
        return hashlib.sha256(data_string.encode()).hexdigest()
    
    def _store_raw(self, df: pd.DataFrame, data_hash: str) -> Path:
        """Store raw copy as Parquet"""
        raw_dir = self.storage_path / 'raw'
        raw_dir.mkdir(parents=True, exist_ok=True)
        
        raw_path = raw_dir / f"{data_hash}_raw.parquet"
        df.to_parquet(raw_path, index=False, engine='pyarrow')
        
        logger.info(f"Stored raw data at: {raw_path}")
        return raw_path
