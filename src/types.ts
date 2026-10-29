export interface Product {
  product_id: string;
  title: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  rating: number;
  description: string;
  image_url?: string;
  combined_features?: string;
}

export interface Recommendation {
  product: Product;
  similarity_score: number;
  similarity_percentage: number;
  explanation_terms: string[];
}

export interface CartItem {
  product_id: string;
  addedAt: string;
  quantity: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  persona: string;
  badge: string;
  cartItems: CartItem[];
  searchHistory: string[];
  recentViews: string[];
  bio: string;
}

export interface PersonalizedRecommendation extends Recommendation {
  triggeredBy: string;
  signalType: 'cart' | 'search' | 'hybrid';
}

export interface EDAMetrics {
  total_products: number;
  categories_count: number;
  brands_count: number;
  category_distribution: Record<string, number>;
  price_metrics: {
    min: number;
    max: number;
    mean: number;
    median: number;
    std: number;
    q25: number;
    q75: number;
  };
  rating_metrics: {
    mean: number;
    min: number;
    max: number;
  };
  text_metrics: {
    mean_word_count: number;
    max_word_count: number;
    min_word_count: number;
  };
  cleaning_audit: {
    initial_rows: number;
    final_rows: number;
    duplicates_removed: number;
    missing_handled: Record<string, number>;
  };
}

export interface EvaluationResults {
  evaluation_framework: string;
  evaluated_products_count: number;
  k_value: number;
  metrics: {
    precision_at_k_category: number;
    precision_at_k_subcategory: number;
    recall_at_k_category: number;
    catalog_coverage_percentage: number;
    intra_list_diversity_score: number;
  };
  qualitative_cases: Array<{
    seed_product: string;
    relevance_verdict: string;
    top_recommendations: string[];
  }>;
  scientific_disclaimer: string;
}

export interface ModelSummary {
  algorithm: string;
  vectorizer: string;
  similarity_metric: string;
  vocabulary_size: number;
  catalog_size: number;
  matrix_non_zeros: number;
  matrix_sparsity_percent: number;
  status: string;
}
