import logging
from typing import Dict, Any, Optional
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
import pandas as pd
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

class DatabaseConnector:
    """Utility for connecting to external databases."""
    
    SUPPORTED_DATABASES = {
        'postgresql': 'PostgreSQL',
        'mysql': 'MySQL/MariaDB',
        'sqlite': 'SQLite'
    }
    
    @staticmethod
    def build_connection_string(
        db_type: str,
        host: str,
        port: int,
        database: str,
        username: str,
        password: str
    ) -> str:
        """
        Build database connection string.
        
        Args:
            db_type: Database type (postgresql, mysql, sqlite)
            host: Database host
            port: Database port
            database: Database name
            username: Database username
            password: Database password
            
        Returns:
            Connection string
        """
        if db_type == 'postgresql':
            return f"postgresql://{username}:{password}@{host}:{port}/{database}"
        elif db_type == 'mysql':
            return f"mysql+pymysql://{username}:{password}@{host}:{port}/{database}"
        elif db_type == 'sqlite':
            return f"sqlite:///{database}"  # For SQLite, database is the file path
        else:
            raise ValueError(f"Unsupported database type: {db_type}")
    
    @staticmethod
    def test_connection(connection_string: str) -> Dict[str, Any]:
        """
        Test database connection.
        
        Args:
            connection_string: Database connection string
            
        Returns:
            Dictionary with connection status and metadata
        """
        try:
            # Create engine
            engine = create_engine(connection_string, pool_pre_ping=True)
            
            # Test connection
            with engine.connect() as conn:
                # Try a simple query
                result = conn.execute(text("SELECT 1")).fetchone()
                
                # Get database version if possible
                try:
                    version_result = conn.execute(text("SELECT VERSION()")).fetchone()
                    version = version_result[0] if version_result else "Unknown"
                except:
                    version = "Unknown"
                
                logger.info(f"Database connection successful: {connection_string.split('@')[1] if '@' in connection_string else 'local'}")
                
                return {
                    "status": "success",
                    "message": "Connection successful",
                    "version": version
                }
                
        except Exception as e:
            logger.error(f"Database connection failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Database connection failed: {str(e)}"
            )
        finally:
            if 'engine' in locals():
                engine.dispose()
    
    @staticmethod
    def list_tables(connection_string: str) -> list:
        """
        Get list of tables from database.
        
        Args:
            connection_string: Database connection string
            
        Returns:
            List of table names
        """
        try:
            engine = create_engine(connection_string, pool_pre_ping=True)
            
            with engine.connect() as conn:
                # Get database type
                if 'postgresql' in connection_string:
                    query = text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
                elif 'mysql' in connection_string:
                    db_name = connection_string.split('/')[-1].split('?')[0]
                    query = text(f"SELECT table_name FROM information_schema.tables WHERE table_schema = '{db_name}'")
                elif 'sqlite' in connection_string:
                    query = text("SELECT name FROM sqlite_master WHERE type='table'")
                else:
                    raise ValueError("Unsupported database type")
                
                result = conn.execute(query)
                tables = [row[0] for row in result]
                
                return tables
                
        except Exception as e:
            logger.error(f"Failed to list tables: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to list tables: {str(e)}"
            )
        finally:
            if 'engine' in locals():
                engine.dispose()
    
    @staticmethod
    def execute_query(connection_string: str, query: str, limit: Optional[int] = None) -> pd.DataFrame:
        """
        Execute SQL query on database.
        
        Args:
            connection_string: Database connection string
            query: SQL query to execute
            limit: Optional row limit
            
        Returns:
            Query results as DataFrame
        """
        try:
            # Add LIMIT clause if specified
            if limit:
                # Simple LIMIT addition (works for PostgreSQL, MySQL, SQLite)
                if 'LIMIT' not in query.upper():
                    query = f"{query.rstrip(';')} LIMIT {limit}"
            
            engine = create_engine(connection_string, pool_pre_ping=True)
            
            # Execute query and return as DataFrame
            df = pd.read_sql_query(query, engine)
            
            logger.info(f"Query executed successfully: {len(df)} rows returned")
            
            return df
            
        except Exception as e:
            logger.error(f"Query execution failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Query execution failed: {str(e)}"
            )
        finally:
            if 'engine' in locals():
                engine.dispose()
    
    @staticmethod
    def get_table_preview(connection_string: str, table_name: str, limit: int = 100) -> pd.DataFrame:
        """
        Get preview of a database table.
        
        Args:
            connection_string: Database connection string
            table_name: Name of the table
            limit: Number of rows to return
            
        Returns:
            DataFrame with table preview
        """
        query = f"SELECT * FROM {table_name} LIMIT {limit}"
        return DatabaseConnector.execute_query(connection_string, query)
    
    @staticmethod
    def get_table_info(connection_string: str, table_name: str) -> Dict[str, Any]:
        """
        Get metadata about a table.
        
        Args:
            connection_string: Database connection string
            table_name: Name of the table
            
        Returns:
            Dictionary with table metadata
        """
        try:
            engine = create_engine(connection_string, pool_pre_ping=True)
            
            with engine.connect() as conn:
                # Get column information
                if 'postgresql' in connection_string:
                    query = text(f"""
                        SELECT column_name, data_type, is_nullable
                        FROM information_schema.columns
                        WHERE table_name = '{table_name}'
                    """)
                elif 'mysql' in connection_string:
                    query = text(f"DESCRIBE {table_name}")
                elif 'sqlite' in connection_string:
                    query = text(f"PRAGMA table_info({table_name})")
                else:
                    raise ValueError("Unsupported database type")
                
                result = conn.execute(query)
                columns = [dict(row._mapping) for row in result]
                
                # Get row count
                count_query = text(f"SELECT COUNT(*) FROM {table_name}")
                row_count = conn.execute(count_query).fetchone()[0]
                
                return {
                    "table_name": table_name,
                    "columns": columns,
                    "row_count": row_count
                }
                
        except Exception as e:
            logger.error(f"Failed to get table info: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get table info: {str(e)}"
            )
        finally:
            if 'engine' in locals():
                engine.dispose()