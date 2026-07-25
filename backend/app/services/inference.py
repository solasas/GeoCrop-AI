# Alias module pointing to inference_service.py for flexible import paths
from app.services.inference_service import (
    get_or_train_yield_model,
    extract_agronomic_features,
    calculate_shap_explanations,
    predict_crop_yield
)

__all__ = [
    "get_or_train_yield_model",
    "extract_agronomic_features",
    "calculate_shap_explanations",
    "predict_crop_yield"
]
