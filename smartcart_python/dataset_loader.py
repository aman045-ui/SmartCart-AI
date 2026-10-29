"""
dataset_loader.py
SmartCart AI - Automated Dataset Ingestion Module

Features:
1. Attempts to fetch public e-commerce product data from open repositories (OpenML / UCI mirrors).
2. Transparently falls back to bundled sample dataset (data/sample_products.csv) if offline/error.
3. Automatically caches successfully downloaded datasets locally for zero-latency restarts.
4. Returns standardized pandas DataFrame with dataset provenance metadata.
"""

import os
import io
import requests
import pandas as pd

CACHE_DIR = os.path.join(os.path.dirname(__file__), "data")
CACHE_FILE = os.path.join(CACHE_DIR, "cached_products.csv")
SAMPLE_FILE = os.path.join(CACHE_DIR, "sample_products.csv")

# Trusted public open dataset endpoints (OpenML / GitHub Open Science mirrors)
PUBLIC_DATASET_URLS = [
    # OpenML verified e-commerce product catalog snippet
    "https://raw.githubusercontent.com/dataprofessor/data/master/ecommerce_products.csv",
    # Reliable backup public repository of catalog products
    "https://raw.githubusercontent.com/datasets/ecommerce-products/master/data/products.csv",
]

def ensure_data_directory():
    """Ensure data directory exists."""
    os.makedirs(CACHE_DIR, exist_ok=True)

def load_dataset(force_refresh=False):
    """
    Loads product dataset with automatic source detection, online discovery, caching, and fallback.
    
    Returns:
        tuple: (df: pd.DataFrame, metadata: dict)
    """
    ensure_data_directory()
    
    metadata = {
        "source": "Unknown",
        "is_sample_data": False,
        "record_count": 0,
        "columns": [],
        "cache_used": False,
        "error_message": None
    }

    # 1. Check local cache first (if not forcing refresh)
    if not force_refresh and os.path.exists(CACHE_FILE):
        try:
            df = pd.read_csv(CACHE_FILE)
            if not df.empty and len(df) >= 10:
                metadata["source"] = f"Local Cache ({CACHE_FILE})"
                metadata["is_sample_data"] = False
                metadata["record_count"] = len(df)
                metadata["columns"] = list(df.columns)
                metadata["cache_used"] = True
                print(f"[SmartCart AI] Loaded {len(df)} records from local cache.")
                return df, metadata
        except Exception as e:
            print(f"[SmartCart AI] Cache read error: {e}. Re-attempting fetch...")

    # 2. Attempt online download from trusted repositories
    downloaded_df = None
    successful_url = None

    for url in PUBLIC_DATASET_URLS:
        try:
            print(f"[SmartCart AI] Attempting download from public repository: {url}")
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                content = response.content.decode("utf-8", errors="ignore")
                df_temp = pd.read_csv(io.StringIO(content))
                
                # Check for required textual and identifier fields
                cols = [c.lower() for c in df_temp.columns]
                has_text = any("name" in c or "title" in c or "desc" in c for c in cols)
                if not df_temp.empty and len(df_temp) >= 10 and has_text:
                    downloaded_df = df_temp
                    successful_url = url
                    break
        except Exception as err:
            print(f"[SmartCart AI] Public repository attempt failed ({url}): {err}")
            continue

    # 3. If online download succeeded, cache and return
    if downloaded_df is not None:
        try:
            downloaded_df.to_csv(CACHE_FILE, index=False)
            metadata["source"] = f"Public Repository ({successful_url})"
            metadata["is_sample_data"] = False
            metadata["record_count"] = len(downloaded_df)
            metadata["columns"] = list(downloaded_df.columns)
            metadata["cache_used"] = False
            print(f"[SmartCart AI] Successfully fetched & cached {len(downloaded_df)} records.")
            return downloaded_df, metadata
        except Exception as save_err:
            print(f"[SmartCart AI] Failed to write cache: {save_err}")

    # 4. Fallback to bundled curated sample dataset
    if os.path.exists(SAMPLE_FILE):
        try:
            df = pd.read_csv(SAMPLE_FILE)
            metadata["source"] = f"Bundled Curated Dataset ({os.path.basename(SAMPLE_FILE)})"
            metadata["is_sample_data"] = True
            metadata["record_count"] = len(df)
            metadata["columns"] = list(df.columns)
            metadata["cache_used"] = False
            print(f"[SmartCart AI] Using verified sample dataset with {len(df)} products.")
            return df, metadata
        except Exception as e:
            metadata["error_message"] = f"Failed to load sample dataset: {e}"
            print(f"[SmartCart AI] Sample file error: {e}")

    # 5. Last resort emergency fallback if file missing
    emergency_records = [
        {"product_id": 1, "title": "Wireless Noise Canceling Headphones", "category": "Electronics", "subcategory": "Audio", "brand": "AudioTech", "price": 199.99, "rating": 4.6, "description": "High fidelity over-ear headphones with active noise cancellation and 30-hour battery life."},
        {"product_id": 2, "title": "Ergonomic Mechanical Keyboard", "category": "Electronics", "subcategory": "Accessories", "brand": "TypeMaster", "price": 89.99, "rating": 4.7, "description": "Mechanical tactile keyboard with RGB backlighting, custom switches, and wrist rest."},
        {"product_id": 3, "title": "Digital Single Serve Coffee Maker", "category": "Home & Kitchen", "subcategory": "Appliances", "brand": "BrewPro", "price": 79.99, "rating": 4.4, "description": "Fast brewing single cup pod coffee machine with reusable filter basket."},
    ]
    df = pd.DataFrame(emergency_records)
    metadata["source"] = "Emergency Fallback Memory Dataset"
    metadata["is_sample_data"] = True
    metadata["record_count"] = len(df)
    metadata["columns"] = list(df.columns)
    return df, metadata

if __name__ == "__main__":
    df, meta = load_dataset()
    print("Dataset Loaded Successfully!")
    print(meta)
    print(df.head())
