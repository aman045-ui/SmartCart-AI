"""
train_and_evaluate.py
SmartCart AI - Standalone CLI Training & Model Evaluation Script

Usage:
    python train_and_evaluate.py [--refresh]

Executes:
1. Automated Public Dataset Discovery & Loading (with local caching & sample fallback).
2. Data Preprocessing, Deduplication, and Feature Engineering.
3. Exploratory Data Analysis (EDA) metrics calculation.
4. TF-IDF Matrix Vectorization & Cosine Similarity generation.
5. Recommendation System Evaluation (Precision@5, Recall@5, Coverage, Diversity).
6. Exports evaluation results to `evaluation_report.json`.
"""

import sys
import json
from dataset_loader import load_dataset
from preprocessor import preprocess_data
from recommender import ContentBasedRecommender
from evaluator import RecommenderEvaluator

def main():
    force_refresh = "--refresh" in sys.argv
    print("=" * 70)
    print(" SmartCart AI – Standalone Training & Evaluation Pipeline")
    print("=" * 70)

    # 1. Dataset Loading
    print("\n[Step 1/5] Ingesting Dataset...")
    df_raw, meta = load_dataset(force_refresh=force_refresh)
    print(f" -> Source: {meta['source']}")
    print(f" -> Record Count: {meta['record_count']}")
    print(f" -> Columns: {', '.join(meta['columns'])}")

    # 2. Preprocessing & EDA
    print("\n[Step 2/5] Cleaning & Feature Engineering...")
    df_clean, report, eda = preprocess_data(df_raw)
    print(f" -> Cleaned rows: {report['final_rows']} (Dropped {report['duplicates_removed']} duplicates)")
    print(f" -> Categories: {eda['total_categories']} unique departments")
    print(f" -> Price: Min=${eda['price_metrics']['min']}, Median=${eda['price_metrics']['median']}, Max=${eda['price_metrics']['max']}")
    print(f" -> Avg Description Word Count: {eda['text_metrics']['mean_word_count']}")

    # 3. Model Training
    print("\n[Step 3/5] Fitting TF-IDF Vectorizer & Cosine Similarity Matrix...")
    recommender = ContentBasedRecommender()
    recommender.fit(df_clean)
    summary = recommender.get_model_summary()
    print(f" -> Algorithm: {summary['algorithm']}")
    print(f" -> Vocabulary Dimensions: {summary['vocabulary_size']} features")
    print(f" -> Catalog Matrix Dimensions: {summary['catalog_size']} items")
    print(f" -> Matrix Sparsity: {summary['matrix_sparsity_percent']}%")

    # 4. Evaluation
    print("\n[Step 4/5] Evaluating Recommendation Quality (Proxy Ground Truth)...")
    evaluator = RecommenderEvaluator(recommender)
    eval_results = evaluator.evaluate_catalog(k=5)
    metrics = eval_results["metrics"]

    print("\n" + "-" * 40)
    print(" EVALUATION METRICS REPORT")
    print("-" * 40)
    print(f" Precision@5 (Category Level)   : {metrics['precision_at_k_category'] * 100:.2f}%")
    print(f" Precision@5 (Subcategory Level): {metrics['precision_at_k_subcategory'] * 100:.2f}%")
    print(f" Recall@5 (Category Level)      : {metrics['recall_at_k_category'] * 100:.2f}%")
    print(f" Catalog Coverage               : {metrics['catalog_coverage_percentage']:.2f}%")
    print(f" Intra-List Diversity (ILD)     : {metrics['intra_list_diversity_score'] * 100:.2f}%")
    print("-" * 40)

    # 5. Sample Recommendations
    print("\n[Step 5/5] Sample Recommendation Qualitative Spot-Checks:")
    for case in eval_results["qualitative_cases"]:
        print(f"\n Seed Item: {case['seed_product']}")
        print(f" Relevance: {case['relevance_verdict']}")
        for rec in case["top_recommendations"]:
            print(f"   • {rec}")

    # Export report to JSON
    output_file = "evaluation_report.json"
    with open(output_file, "w") as f:
        json.dump(eval_results, f, indent=2)
    print(f"\n[SmartCart AI] Full evaluation report exported to '{output_file}'.")
    print("=" * 70)

if __name__ == "__main__":
    main()
