"""
Pipeline Orchestrator
Coordinates all 7 layers of data processing
"""
import pandas as pd
from pathlib import Path
from typing import Dict, Any
import logging
from datetime import datetime

from .layer1_ingestion import IngestionLayer
from .layer2_validation import StructuralValidationLayer
from .layer3_normalization import ColumnNormalizationLayer
from .layer4_typing import TypeDetectionLayer
from .layer5_cleaning import DataCleaningLayer
from .layer6_quality import DataQualityLayer
from .layer7_storage import StorageLayer

logger = logging.getLogger(__name__)


class DataPipeline:
    """7-Layer Data Processing Pipeline"""
    
    def __init__(self, storage_path: str):
        """
        Initialize pipeline
        
        Args:
            storage_path: Base path for storing processed data
        """
        self.storage_path = Path(storage_path)
        
        # Initialize layers
        self.layer1 = IngestionLayer(self.storage_path)
        self.layer2 = StructuralValidationLayer()
        self.layer3 = ColumnNormalizationLayer()
        self.layer4 = TypeDetectionLayer()
        self.layer5 = DataCleaningLayer()
        self.layer6 = DataQualityLayer()
        self.layer7 = StorageLayer(self.storage_path)
    
    def process(
        self,
        file_path: str,
        source_type: str,
        source_id: str,
        sheet_name: int = 0
    ) -> Dict[str, Any]:
        """
        Process data through all 7 layers
        
        Args:
            file_path: Path to data file
            source_type: Type of source (csv, excel, json, parquet, tsv)
            source_id: Unique identifier for this data source
            sheet_name: Excel sheet index (default: 0)
        
        Returns:
            Complete processing report with all metadata
        """
        start_time = datetime.utcnow()
        logger.info(f"=== Starting pipeline for {source_type}: {file_path} ===")
        
        try:
            # Initialize report
            report = {
                'source_id': source_id,
                'source_type': source_type,
                'file_path': file_path,
                'started_at': start_time.isoformat(),
                'layers': {}
            }
            
            # LAYER 1: Ingestion
            logger.info("--- Layer 1: Ingestion ---")
            df, metadata = self.layer1.process(file_path, source_type, sheet_name)
            report['layers']['layer1'] = metadata
            logger.info(f"Layer 1 output: {len(df)} rows, {len(df.columns)} columns")
            
            # LAYER 2: Structural Validation
            logger.info("--- Layer 2: Structural Validation ---")
            df, validation_report = self.layer2.process(df)
            report['layers']['layer2'] = validation_report
            logger.info(f"Layer 2 output: {len(df)} rows, {len(df.columns)} columns")
            
            # LAYER 3: Column Normalization
            logger.info("--- Layer 3: Column Normalization ---")
            df, normalization_report = self.layer3.process(df)
            report['layers']['layer3'] = normalization_report
            logger.info(f"Layer 3 output: {normalization_report['transformation_count']} columns normalized")
            
            # LAYER 4: Type Detection
            logger.info("--- Layer 4: Type Detection ---")
            df, typing_report = self.layer4.process(df)
            report['layers']['layer4'] = typing_report
            logger.info(f"Layer 4 output: Types detected for {len(df.columns)} columns")
            
            # LAYER 5: Data Cleaning
            logger.info("--- Layer 5: Data Cleaning ---")
            df, cleaning_report = self.layer5.process(df, typing_report['type_info'])
            report['layers']['layer5'] = cleaning_report
            logger.info(f"Layer 5 output: {cleaning_report['total_imputed']} values imputed")
            
            # LAYER 6: Quality Assessment
            logger.info("--- Layer 6: Quality Assessment ---")
            quality_report = self.layer6.process(
                df,
                typing_report['type_info'],
                cleaning_report['cleaning_report']
            )
            report['layers']['layer6'] = quality_report
            logger.info(f"Layer 6 output: Quality score {quality_report['quality_report']['overall_score']}")
            
            # LAYER 7: Optimized Storage
            logger.info("--- Layer 7: Optimized Storage ---")
            storage_report = self.layer7.process(df, source_id, metadata)
            report['layers']['layer7'] = storage_report
            logger.info(f"Layer 7 output: Stored {storage_report['storage']['parquet_size_bytes']:,} bytes")
            
            # Finalize report
            end_time = datetime.utcnow()
            duration = (end_time - start_time).total_seconds()
            
            report['completed_at'] = end_time.isoformat()
            report['duration_seconds'] = round(duration, 2)
            report['success'] = True
            report['final_stats'] = {
                'rows': len(df),
                'columns': len(df.columns),
                'quality_score': quality_report['quality_report']['overall_score'],
                'quality_level': quality_report['quality_report']['overall_level']
            }
            
            logger.info(f"=== Pipeline complete in {duration:.2f}s ===")
            logger.info(f"Final: {len(df)} rows, {len(df.columns)} columns, quality {report['final_stats']['quality_score']}")
            
            return report
            
        except Exception as e:
            logger.error(f"Pipeline failed: {str(e)}", exc_info=True)
            
            end_time = datetime.utcnow()
            duration = (end_time - start_time).total_seconds()
            
            report['completed_at'] = end_time.isoformat()
            report['duration_seconds'] = round(duration, 2)
            report['success'] = False
            report['error'] = str(e)
            report['error_type'] = type(e).__name__
            
            return report
    
    def get_processed_data(self, source_id: str) -> pd.DataFrame:
        """
        Load processed data from storage
        
        Args:
            source_id: Source identifier
        
        Returns:
            Processed DataFrame
        """
        parquet_path = self.storage_path / 'clean' / f"{source_id}_clean.parquet"
        
        if not parquet_path.exists():
            raise FileNotFoundError(f"Processed data not found for source {source_id}")
        
        return pd.read_parquet(parquet_path)
    
    def get_preview_data(self, source_id: str) -> pd.DataFrame:
        """
        Load preview data (first 1000 rows)
        
        Args:
            source_id: Source identifier
        
        Returns:
            Preview DataFrame
        """
        preview_path = self.storage_path / 'preview' / f"{source_id}_preview.parquet"
        
        if not preview_path.exists():
            raise FileNotFoundError(f"Preview data not found for source {source_id}")
        
        return pd.read_parquet(preview_path)
