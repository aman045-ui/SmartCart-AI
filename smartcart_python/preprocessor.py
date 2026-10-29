"""
preprocessor.py
SmartCart AI - Data Science Preprocessing & EDA Module

Performs:
1. Column standardization and missing value imputation.
2. Deduplication based on title and ID.
3. Text cleaning (punctuation handling, lowercase normalization, whitespace collapse).
4. Feature engineering: constructs unified content string (title + category + brand + description).
5. Comprehensive EDA metrics computation (distributions, price quartiles, category counts).
"""

import re
import numpy as np
import pandas as pd

def standardize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize arbitrary dataset column names into canonical SmartCart schema."""
    df = df.copy()
    col_mapping = {}
    for col in df.columns:
        c_low = col.lower().strip().replace(" ", "_")
        if c_low in ["id", "item_id", "product_id", "asin", "sku"]:
            col_mapping[col] = "product_id"
        elif c_low in ["name", "title", "product_name", "item_name"]:
            col_mapping[col] = "title"
        elif c_low in ["category", "cat", "department", "primary_category"]:
            col_mapping[col] = "category"
        elif c_low in ["subcategory", "sub_category", "sub_cat"]:
            col_mapping[col] = "subcategory"
        elif c_low in ["brand", "manufacturer", "make"]:
            col_mapping[col] = "brand"
        elif c_low in ["price", "cost", "sale_price", "retail_price"]:
            col_mapping[col] = "price"
        elif c_low in ["rating", "score", "review_score", "stars"]:
            col_mapping[col] = "rating"
        elif c_low in ["description", "desc", "details", "about", "product_description"]:
            col_mapping[col] = "description"

    df = df.rename(columns=col_mapping)

    # Ensure mandatory fields exist with smart defaults
    if "product_id" not in df.columns:
        df["product_id"] = np.arange(1, len(df) + 1)
    if "title" not in df.columns:
        df["title"] = "Product " + df["product_id"].astype(str)
    if "category" not in df.columns:
        df["category"] = "General"
    if "subcategory" not in df.columns:
        df["subcategory"] = df["category"]
    if "brand" not in df.columns:
        df["brand"] = "Generic"
    if "price" not in df.columns:
        df["price"] = 29.99
    if "rating" not in df.columns:
        df["rating"] = 4.5
    if "description" not in df.columns:
        df["description"] = df["title"]

    return df

def clean_text(text: str) -> str:
    """Cleans textual features by lowering case, removing HTML tags and non-alphanumeric noise."""
    if not isinstance(text, str):
        return ""
    # Strip HTML tags
    text = re.sub(r"<[^>]+>", " ", text)
    # Remove unwanted punctuation but keep alphanumeric and hyphens
    text = re.sub(r"[^\w\s\-]", " ", text)
    # Collapse consecutive whitespace
    text = re.sub(r"\s+", " ", text).strip().lower()
    return text

def preprocess_data(raw_df: pd.DataFrame):
    """
    Cleans, deduplicates, and feature-engineers the raw product dataset.
    
    Returns:
        tuple: (cleaned_df: pd.DataFrame, cleaning_report: dict, eda_stats: dict)
    """
    initial_records = len(raw_df)
    
    # 1. Standardize column names
    df = standardize_columns(raw_df)
    
    # 2. Track missing values before cleaning
    missing_before = df.isnull().sum().to_dict()

    # 3. Handle missing values
    df["title"] = df["title"].fillna("Untitled Item").astype(str)
    df["category"] = df["category"].fillna("General").astype(str)
    df["subcategory"] = df["subcategory"].fillna("General").astype(str)
    df["brand"] = df["brand"].fillna("Generic").astype(str)
    df["description"] = df["description"].fillna("No description available.").astype(str)
    
    # Numerical sanitization
    df["price"] = pd.to_numeric(df["price"], errors="coerce").fillna(29.99)
    df["price"] = df["price"].apply(lambda p: max(0.99, round(float(p), 2)))
    df["rating"] = pd.to_numeric(df["rating"], errors="coerce").fillna(4.0)
    df["rating"] = df["rating"].apply(lambda r: min(5.0, max(1.0, round(float(r), 1))))
    
    # 4. Remove duplicate items (by title and product_id)
    duplicates_count = df.duplicated(subset=["title"]).sum()
    df = df.drop_duplicates(subset=["title"]).reset_index(drop=True)
    df["product_id"] = df["product_id"].astype(str)

    # 5. Clean textual strings
    df["cleaned_title"] = df["title"].apply(clean_text)
    df["cleaned_category"] = df["category"].apply(clean_text)
    df["cleaned_brand"] = df["brand"].apply(clean_text)
    df["cleaned_description"] = df["description"].apply(clean_text)

    # 6. Feature Engineering: Weighted Combined Features
    # Title and category are given double textual weight to boost content-based matching precision
    df["combined_features"] = (
        df["cleaned_title"] + " " +
        df["cleaned_title"] + " " + 
        df["cleaned_category"] + " " +
        df["cleaned_brand"] + " " +
        df["cleaned_description"]
    )

    # 7. Calculate EDA statistics
    category_counts = df["category"].value_counts().to_dict()
    price_stats = {
        "min": float(df["price"].min()),
        "max": float(df["price"].max()),
        "mean": float(round(df["price"].mean(), 2)),
        "median": float(round(df["price"].median(), 2)),
        "std": float(round(df["price"].std(), 2)) if len(df) > 1 else 0.0,
        "q25": float(round(df["price"].quantile(0.25), 2)),
        "q75": float(round(df["price"].quantile(0.75), 2)),
    }
    rating_stats = {
        "mean": float(round(df["rating"].mean(), 2)),
        "min": float(df["rating"].min()),
        "max": float(df["rating"].max()),
    }
    
    # Text length stats
    df["desc_word_count"] = df["description"].apply(lambda d: len(str(d).split()))
    text_stats = {
        "mean_word_count": float(round(df["desc_word_count"].mean(), 1)),
        "max_word_count": int(df["desc_word_count"].max()),
        "min_word_count": int(df["desc_word_count"].min()),
    }

    cleaning_report = {
        "initial_rows": initial_records,
        "final_rows": len(df),
        "duplicates_removed": int(duplicates_count),
        "missing_values_handled": {k: int(v) for k, v in missing_before.items()},
    }

    eda_stats = {
        "category_distribution": category_counts,
        "price_metrics": price_stats,
        "rating_metrics": rating_stats,
        "text_metrics": text_stats,
        "total_categories": len(category_counts),
        "total_brands": int(df["brand"].nunique()),
    }

    return df, cleaning_report, eda_stats

if __name__ == "__main__":
    from dataset_loader import load_dataset
    df_raw, _ = load_dataset()
    df_clean, rep, eda = preprocess_data(df_raw)
    print("Preprocessing Complete!")
    print("Report:", rep)
    print("EDA Summary:", eda)
