"""
recommender.py
SmartCart AI - Machine Learning Recommendation Engine

Implements Content-Based Filtering with:
1. Scikit-learn TfidfVectorizer (ngram_range=(1,2), sublinear_tf=True, stop_words='english')
2. Pairwise Cosine Similarity matrix calculation
3. Stateful model caching to eliminate per-request vectorization overhead
4. Top-5 recommendation generation with self-exclusion
5. Term explainability: extracts overlapping high-weight TF-IDF keywords
6. User Profile Vectorization: synthesized centroid vector from user's cart items + search queries
7. Real-Time Query Vectorization: instant recommendations for live user search queries
"""

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class ContentBasedRecommender:
    def __init__(self, stop_words="english", max_features=5000):
        self.stop_words = stop_words
        self.max_features = max_features
        self.vectorizer = None
        self.tfidf_matrix = None
        self.similarity_matrix = None
        self.products_df = None
        self.id_to_index = {}
        self.index_to_id = {}
        self.feature_names = []
        self.is_fitted = False

    def fit(self, df: pd.DataFrame):
        """
        Fits the TF-IDF vectorizer on combined_features and precomputes the Cosine Similarity matrix.
        """
        if df.empty or "combined_features" not in df.columns:
            raise ValueError("Input DataFrame is empty or missing 'combined_features' column.")

        self.products_df = df.copy().reset_index(drop=True)
        self.id_to_index = {str(row["product_id"]): idx for idx, row in self.products_df.iterrows()}
        self.index_to_id = {idx: str(row["product_id"]) for idx, row in self.products_df.iterrows()}

        self.vectorizer = TfidfVectorizer(
            stop_words=self.stop_words,
            ngram_range=(1, 2),
            sublinear_tf=True,
            max_features=self.max_features
        )

        self.tfidf_matrix = self.vectorizer.fit_transform(self.products_df["combined_features"])
        self.feature_names = np.array(self.vectorizer.get_feature_names_out())
        self.similarity_matrix = cosine_similarity(self.tfidf_matrix, self.tfidf_matrix)
        self.is_fitted = True
        return self

    def vectorize_text(self, text: str):
        """Vectorizes arbitrary text string (search query or combined profile) into TF-IDF space."""
        if not self.is_fitted:
            raise RuntimeError("Model must be fitted before vectorizing text.")
        return self.vectorizer.transform([text])

    def explain_similarity(self, query_vec, cand_idx: int, top_n_terms: int = 4):
        """Explains similarity by finding highest overlapping feature products."""
        cand_vec = self.tfidf_matrix[cand_idx].toarray().flatten()
        q_arr = query_vec.toarray().flatten() if hasattr(query_vec, "toarray") else query_vec.flatten()
        contrib = q_arr * cand_vec
        non_zero_indices = np.where(contrib > 0)[0]
        if len(non_zero_indices) == 0:
            return ["category affinity", "related features"]
        top_indices = non_zero_indices[np.argsort(contrib[non_zero_indices])[::-1]][:top_n_terms]
        return [self.feature_names[i] for i in top_indices]

    def recommend(self, product_id, top_k: int = 5):
        """Item-to-item recommendation for a single product_id (excludes self)."""
        if not self.is_fitted:
            raise RuntimeError("Recommender has not been fitted yet.")

        pid_str = str(product_id)
        if pid_str not in self.id_to_index:
            return {"success": False, "error": f"Product '{product_id}' not found.", "recommendations": []}

        target_idx = self.id_to_index[pid_str]
        sim_scores = list(enumerate(self.similarity_matrix[target_idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

        target_vec = self.tfidf_matrix[target_idx]
        recs = []
        for idx, score in sim_scores:
            if idx == target_idx:
                continue
            if len(recs) >= top_k:
                break
            product_row = self.products_df.iloc[idx].to_dict()
            explanation_terms = self.explain_similarity(target_vec, idx)
            recs.append({
                "product_id": str(product_row.get("product_id")),
                "title": product_row.get("title"),
                "category": product_row.get("category"),
                "subcategory": product_row.get("subcategory"),
                "brand": product_row.get("brand"),
                "price": float(product_row.get("price", 0.0)),
                "rating": float(product_row.get("rating", 0.0)),
                "description": product_row.get("description"),
                "similarity_score": round(float(score), 4),
                "similarity_percentage": round(float(score) * 100, 1),
                "explanation_terms": explanation_terms
            })

        query_product = self.products_df.iloc[target_idx].to_dict()
        return {
            "success": True,
            "query_product": {
                "product_id": str(query_product.get("product_id")),
                "title": query_product.get("title"),
                "category": query_product.get("category"),
                "brand": query_product.get("brand"),
                "price": float(query_product.get("price", 0.0)),
            },
            "recommendations": recs
        }

    def recommend_for_query(self, query_text: str, top_k: int = 5):
        """Recommends products directly from a live search query in TF-IDF space."""
        if not self.is_fitted or not query_text.strip():
            return []

        query_vec = self.vectorize_text(query_text)
        sim_scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        top_indices = np.argsort(sim_scores)[::-1][:top_k]

        recs = []
        for idx in top_indices:
            score = sim_scores[idx]
            if score <= 0.01:
                continue
            p = self.products_df.iloc[idx].to_dict()
            explanation = self.explain_similarity(query_vec, idx)
            recs.append({
                "product_id": str(p["product_id"]),
                "title": p["title"],
                "category": p["category"],
                "subcategory": p.get("subcategory", p["category"]),
                "brand": p["brand"],
                "price": float(p["price"]),
                "similarity_score": round(float(score), 4),
                "similarity_percentage": round(float(score) * 100, 1),
                "explanation_terms": explanation
            })
        return recs

    def recommend_for_user(self, cart_ids, search_queries, live_query="", top_k: int = 5):
        """
        Synthesizes a user profile centroid vector from:
        - Cart items (2.0x weight)
        - Search queries (1.2x weight)
        - Live search query (2.5x high priority weight)
        Excludes items already present in cart_ids.
        """
        if not self.is_fitted:
            raise RuntimeError("Model must be fitted.")

        cart_id_set = set(str(cid) for cid in cart_ids)
        combined_text_parts = []

        # 1. Add cart products
        for cid in cart_ids:
            if str(cid) in self.id_to_index:
                idx = self.id_to_index[str(cid)]
                prod_text = self.products_df.iloc[idx]["combined_features"]
                combined_text_parts.append((prod_text + " ") * 2)

        # 2. Add search queries
        for q in search_queries:
            if q.strip():
                combined_text_parts.append((q.strip() + " ") * 2)

        # 3. Add live search query if active
        if live_query.strip():
            combined_text_parts.append((live_query.strip() + " ") * 4)

        if not combined_text_parts:
            return self.recommend(self.products_df.iloc[0]["product_id"], top_k=top_k)["recommendations"]

        user_text = " ".join(combined_text_parts)
        user_vec = self.vectorize_text(user_text)

        sim_scores = cosine_similarity(user_vec, self.tfidf_matrix).flatten()
        sorted_indices = np.argsort(sim_scores)[::-1]

        recs = []
        for idx in sorted_indices:
            pid = str(self.products_df.iloc[idx]["product_id"])
            if pid in cart_id_set:
                continue # Exclude items already in cart
            if len(recs) >= top_k:
                break

            score = sim_scores[idx]
            p = self.products_df.iloc[idx].to_dict()
            explanation = self.explain_similarity(user_vec, idx)

            trigger = "Hybrid Profile Alignment"
            if live_query and score > 0.25:
                trigger = f"Live search: '{live_query}'"
            elif search_queries:
                trigger = f"Search interest: '{search_queries[0]}'"

            recs.append({
                "product_id": pid,
                "title": p["title"],
                "category": p["category"],
                "subcategory": p.get("subcategory", p["category"]),
                "brand": p["brand"],
                "price": float(p["price"]),
                "similarity_score": round(float(score), 4),
                "similarity_percentage": round(float(score) * 100, 1),
                "explanation_terms": explanation,
                "triggered_by": trigger
            })

        return recs

    def get_model_summary(self):
        if not self.is_fitted:
            return {"status": "Not Fitted"}
        n_samples, n_features = self.tfidf_matrix.shape
        non_zeros = self.tfidf_matrix.nnz
        total_elements = n_samples * n_features
        sparsity = 1.0 - (non_zeros / total_elements) if total_elements > 0 else 0.0
        return {
            "algorithm": "Content-Based Filtering (TF-IDF + Cosine Similarity)",
            "vectorizer": "Scikit-Learn TfidfVectorizer (1-2 ngrams, sublinear TF)",
            "similarity_metric": "Cosine Similarity",
            "vocabulary_size": int(n_features),
            "catalog_size": int(n_samples),
            "matrix_non_zeros": int(non_zeros),
            "matrix_sparsity_percent": round(sparsity * 100, 2),
            "status": "Trained & Active"
        }
