"""
Data Pipeline Package
7-Layer data processing pipeline for InsightIQ
"""
from .pipeline_orchestrator import DataPipeline
from .layer1_ingestion import IngestionLayer
from .layer2_validation import StructuralValidationLayer
from .layer3_normalization import ColumnNormalizationLayer
from .layer4_typing import TypeDetectionLayer
from .layer5_cleaning import DataCleaningLayer
from .layer6_quality import DataQualityLayer
from .layer7_storage import StorageLayer

__all__ = [
    'DataPipeline',
    'IngestionLayer',
    'StructuralValidationLayer',
    'ColumnNormalizationLayer',
    'TypeDetectionLayer',
    'DataCleaningLayer',
    'DataQualityLayer',
    'StorageLayer'
]

__version__ = '1.0.0'
