import pandas as pd
import json
import logging
from typing import Dict, Any, BinaryIO, Optional
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

class FileParser:
    """Utility for parsing different file formats into pandas DataFrames."""
    
    SUPPORTED_FORMATS = {
        '.csv': 'CSV File',
        '.xlsx': 'Excel File (xlsx)',
        '.xls': 'Excel File (xls)',
        '.json': 'JSON File',
        '.parquet': 'Parquet File',
        '.txt': 'Text File (Tab-separated)',
        '.tsv': 'Tab-Separated Values'
    }
    
    @staticmethod
    def get_file_type(filename: str) -> str:
        """Get file extension from filename."""
        return '.' + filename.split('.')[-1].lower() if '.' in filename else ''
    
    @staticmethod
    def parse_csv(content: bytes, **kwargs) -> pd.DataFrame:
        """Parse CSV file."""
        try:
            # Try with default encoding
            df = pd.read_csv(pd.io.common.BytesIO(content), **kwargs)
            logger.info(f"Successfully parsed CSV: {len(df)} rows, {len(df.columns)} columns")
            return df
        except UnicodeDecodeError:
            # Try with different encoding
            try:
                df = pd.read_csv(pd.io.common.BytesIO(content), encoding='latin1', **kwargs)
                logger.info(f"Parsed CSV with latin1 encoding: {len(df)} rows")
                return df
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to parse CSV file: {str(e)}"
                )
    
    @staticmethod
    def parse_excel(content: bytes, sheet_name: Optional[str] = None) -> pd.DataFrame:
        """Parse Excel file (.xlsx or .xls)."""
        try:
            # Read Excel file
            if sheet_name:
                df = pd.read_excel(pd.io.common.BytesIO(content), sheet_name=sheet_name)
            else:
                # Read first sheet by default
                df = pd.read_excel(pd.io.common.BytesIO(content), sheet_name=0)
            
            logger.info(f"Successfully parsed Excel: {len(df)} rows, {len(df.columns)} columns")
            return df
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to parse Excel file: {str(e)}"
            )
    
    @staticmethod
    def parse_json(content: bytes) -> pd.DataFrame:
        """Parse JSON file."""
        try:
            # Try to load as JSON
            json_data = json.loads(content.decode('utf-8'))
            
            # Convert to DataFrame
            if isinstance(json_data, list):
                # List of objects
                df = pd.DataFrame(json_data)
            elif isinstance(json_data, dict):
                # Single object or nested structure
                # Try to flatten if needed
                if all(isinstance(v, (list, dict)) for v in json_data.values()):
                    # Nested structure - try to normalize
                    df = pd.json_normalize(json_data)
                else:
                    # Simple dict - convert to single row
                    df = pd.DataFrame([json_data])
            else:
                raise ValueError("JSON must be an object or array")
            
            logger.info(f"Successfully parsed JSON: {len(df)} rows, {len(df.columns)} columns")
            return df
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid JSON format: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to parse JSON file: {str(e)}"
            )
    
    @staticmethod
    def parse_parquet(content: bytes) -> pd.DataFrame:
        """Parse Parquet file."""
        try:
            df = pd.read_parquet(pd.io.common.BytesIO(content))
            logger.info(f"Successfully parsed Parquet: {len(df)} rows, {len(df.columns)} columns")
            return df
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to parse Parquet file: {str(e)}"
            )
    
    @staticmethod
    def parse_tsv(content: bytes) -> pd.DataFrame:
        """Parse TSV (Tab-Separated Values) file."""
        try:
            df = pd.read_csv(pd.io.common.BytesIO(content), sep='\t')
            logger.info(f"Successfully parsed TSV: {len(df)} rows, {len(df.columns)} columns")
            return df
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to parse TSV file: {str(e)}"
            )
    
    @staticmethod
    def parse_file(filename: str, content: bytes, **kwargs) -> pd.DataFrame:
        """
        Parse file based on extension.
        
        Args:
            filename: Name of the file
            content: File content as bytes
            **kwargs: Additional parameters (e.g., sheet_name for Excel)
            
        Returns:
            Parsed DataFrame
        """
        file_type = FileParser.get_file_type(filename)
        
        if file_type not in FileParser.SUPPORTED_FORMATS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type: {file_type}. Supported: {', '.join(FileParser.SUPPORTED_FORMATS.keys())}"
            )
        
        logger.info(f"Parsing file: {filename} (type: {file_type})")
        
        # Route to appropriate parser
        if file_type == '.csv':
            return FileParser.parse_csv(content)
        elif file_type in ['.xlsx', '.xls']:
            sheet_name = kwargs.get('sheet_name')
            return FileParser.parse_excel(content, sheet_name)
        elif file_type == '.json':
            return FileParser.parse_json(content)
        elif file_type == '.parquet':
            return FileParser.parse_parquet(content)
        elif file_type in ['.txt', '.tsv']:
            return FileParser.parse_tsv(content)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Parser not implemented for {file_type}"
            )
    
    @staticmethod
    def get_excel_sheets(content: bytes) -> list:
        """Get list of sheet names from Excel file."""
        try:
            excel_file = pd.ExcelFile(pd.io.common.BytesIO(content))
            return excel_file.sheet_names
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to read Excel sheets: {str(e)}"
            )