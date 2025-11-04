import pandas as pd
import io
from typing import Dict, List, Any, Tuple
from fastapi import UploadFile, HTTPException


class CSVParser:
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    
    @staticmethod
    async def parse_upload(file: UploadFile) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
        content = await file.read()
        
        if len(content) > CSVParser.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400, 
                detail=f"File too large. Maximum size is {CSVParser.MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        
        try:
            df = pd.read_csv(io.BytesIO(content), encoding='utf-8', parse_dates=True, infer_datetime_format=True)
        except UnicodeDecodeError:
            try:
                df = pd.read_csv(io.BytesIO(content), encoding='latin-1', parse_dates=True, infer_datetime_format=True)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")
        
        if df.empty:
            raise HTTPException(status_code=400, detail="CSV file is empty")
        
        if len(df.columns) == 0:
            raise HTTPException(status_code=400, detail="CSV file has no columns")
        
        df.columns = CSVParser._clean_column_names(df.columns.tolist())
        
        metadata = {
            "original_filename": file.filename,
            "file_size_bytes": len(content),
            "row_count": len(df),
            "column_count": len(df.columns)
        }
        
        return df, metadata
    
    @staticmethod
    def _clean_column_names(columns: List[str]) -> List[str]:
        cleaned = []
        for col in columns:
            col = col.strip().lower()
            col = ''.join(c if c.isalnum() else '_' for c in col)
            while '__' in col:
                col = col.replace('__', '_')
            col = col.strip('_')
            if col and col[0].isdigit():
                col = f"col_{col}"
            cleaned.append(col or 'unnamed')
        
        seen = {}
        for i, col in enumerate(cleaned):
            if col in seen:
                seen[col] += 1
                cleaned[i] = f"{col}_{seen[col]}"
            else:
                seen[col] = 0
        
        return cleaned
    
    @staticmethod
    def get_column_metadata(df: pd.DataFrame) -> List[Dict[str, Any]]:
        metadata = []
        for col in df.columns:
            col_data = df[col]
            col_info = {
                "name": col,
                "dtype": str(col_data.dtype),
                "null_count": int(col_data.isnull().sum()),
                "unique_count": int(col_data.nunique())
            }
            
            if pd.api.types.is_numeric_dtype(col_data):
                col_info["min_value"] = float(col_data.min()) if not col_data.isnull().all() else None
                col_info["max_value"] = float(col_data.max()) if not col_data.isnull().all() else None
                col_info["mean_value"] = float(col_data.mean()) if not col_data.isnull().all() else None
            
            sample_values = col_data.dropna().unique()[:5].tolist()
            col_info["sample_values"] = [str(v) for v in sample_values]
            
            metadata.append(col_info)
        
        return metadata