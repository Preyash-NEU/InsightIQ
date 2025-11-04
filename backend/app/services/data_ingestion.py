import pandas as pd
import shortuuid
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from typing import Dict, Any
from fastapi import HTTPException

from app.core.config import settings
from app.models.dataset import Dataset
from app.utils.csv_parser import CSVParser


class DataIngestionService:
    
    @staticmethod
    def generate_table_name() -> str:
        return f"ds_{shortuuid.uuid()[:8]}"
    
    @staticmethod
    def pandas_to_sql_type(dtype: str) -> str:
        dtype_lower = dtype.lower()
        if 'int' in dtype_lower:
            return 'BIGINT'
        elif 'float' in dtype_lower:
            return 'DOUBLE PRECISION'
        elif 'bool' in dtype_lower:
            return 'BOOLEAN'
        elif 'datetime' in dtype_lower:
            return 'TIMESTAMP'
        elif 'date' in dtype_lower:
            return 'DATE'
        else:
            return 'TEXT'
    
    @staticmethod
    async def ingest_dataframe(df: pd.DataFrame, dataset: Dataset, db: Session) -> None:
        table_name = dataset.table_name
        
        try:
            columns_def = []
            for col in df.columns:
                col_type = DataIngestionService.pandas_to_sql_type(str(df[col].dtype))
                columns_def.append(f'"{col}" {col_type}')
            
            columns_def.insert(0, '"id" SERIAL PRIMARY KEY')
            
            create_table_sql = f"""
            CREATE TABLE IF NOT EXISTS {table_name} (
                {', '.join(columns_def)}
            )
            """
            
            db.execute(text(create_table_sql))
            db.commit()
            
            engine = create_engine(settings.DATABASE_URL)
            df_clean = df.where(pd.notnull(df), None)
            
            df_clean.to_sql(
                table_name,
                engine,
                if_exists='append',
                index=False,
                method='multi',
                chunksize=1000
            )
            
            engine.dispose()
            
        except Exception as e:
            try:
                db.execute(text(f"DROP TABLE IF EXISTS {table_name}"))
                db.commit()
            except:
                pass
            raise HTTPException(status_code=500, detail=f"Failed to ingest data: {str(e)}")
    
    @staticmethod
    async def get_preview(table_name: str, db: Session, limit: int = 50) -> Dict[str, Any]:
        try:
            query = text(f"SELECT * FROM {table_name} LIMIT :limit")
            result = db.execute(query, {"limit": limit})
            
            rows = []
            columns = list(result.keys())
            
            for row in result:
                rows.append(dict(zip(columns, row)))
            
            count_query = text(f"SELECT COUNT(*) as count FROM {table_name}")
            total_rows = db.execute(count_query).scalar()
            
            return {
                "columns": columns,
                "rows": rows,
                "total_rows": total_rows,
                "showing_rows": len(rows)
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch preview: {str(e)}")
    
    @staticmethod
    async def delete_table(table_name: str, db: Session) -> None:
        try:
            db.execute(text(f"DROP TABLE IF EXISTS {table_name} CASCADE"))
            db.commit()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to delete table: {str(e)}")