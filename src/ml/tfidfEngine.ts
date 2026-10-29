import { Product, Recommendation, ModelSummary, UserProfile, PersonalizedRecommendation } from '../types';

// Standard English stopwords matching Scikit-learn
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most',
  'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'our', 'ours', 'ourselves', 'out', 'over', 'own', 's', 'same', 'she', 'should', 'so', 'some',
  'such', 't', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there',
  'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was',
  'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with',
  'you', 'your', 'yours', 'yourself', 'yourselves'
]);

export class MLRecommenderEngine {
  private products: Product[] = [];
  private vocabulary: Map<string, number> = new Map(); // term -> feature_index
  private featureNames: string[] = []; // index -> term
  private idf: Float64Array = new Float64Array(0);
  private tfidfVectors: Float64Array[] = []; // Normalized L2 vectors per product
  private similarityMatrix: Float64Array[] = [];
  private idToIndex: Map<string, number> = new Map();
  public isFitted = false;

  constructor() {}

  /**
   * Tokenizes text into unigrams and bigrams, stripping punctuation and stopwords.
   */
  public tokenize(text: string): string[] {
    const clean = text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
    const rawTokens = clean.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
    
    const tokens: string[] = [...rawTokens];
    // Add bigrams
    for (let i = 0; i < rawTokens.length - 1; i++) {
      tokens.push(`${rawTokens[i]} ${rawTokens[i + 1]}`);
    }
    return tokens;
  }

  /**
   * Fits TF-IDF on product corpus and computes Cosine Similarity matrix.
   */
  public fit(products: Product[]): void {
    this.products = [...products];
    this.idToIndex.clear();
    this.vocabulary.clear();
    this.featureNames = [];

    const N = this.products.length;
    if (N === 0) return;

    // Build combined feature strings: 2x title + 2x category + brand + description
    const documents: string[][] = [];
    const docFrequencies = new Map<string, number>();

    this.products.forEach((p, idx) => {
      this.idToIndex.set(p.product_id, idx);
      const combined = `${p.title} ${p.title} ${p.category} ${p.category} ${p.brand} ${p.description}`;
      p.combined_features = combined;
      const tokens = this.tokenize(combined);
      documents.push(tokens);

      const uniqueTokensInDoc = new Set(tokens);
      uniqueTokensInDoc.forEach(term => {
        docFrequencies.set(term, (docFrequencies.get(term) || 0) + 1);
      });
    });

    // Filter vocabulary: must appear in at least 1 document, cap features at 1500
    const sortedTerms = Array.from(docFrequencies.entries())
      .filter(([_, df]) => df >= 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 1500);

    sortedTerms.forEach(([term, _], index) => {
      this.vocabulary.set(term, index);
      this.featureNames.push(term);
    });

    const V = this.featureNames.length;
    this.idf = new Float64Array(V);

    // Compute Scikit-Learn smooth IDF: log((1 + N)/(1 + df)) + 1
    for (let j = 0; j < V; j++) {
      const term = this.featureNames[j];
      const df = docFrequencies.get(term) || 1;
      this.idf[j] = Math.log((1 + N) / (1 + df)) + 1.0;
    }

    // Build TF-IDF vectors for all documents
    this.tfidfVectors = [];

    for (let i = 0; i < N; i++) {
      const tokens = documents[i];
      const termCounts = new Map<number, number>();
      for (const t of tokens) {
        const featureIdx = this.vocabulary.get(t);
        if (featureIdx !== undefined) {
          termCounts.set(featureIdx, (termCounts.get(featureIdx) || 0) + 1);
        }
      }

      const vec = new Float64Array(V);
      let normSq = 0;

      // Sublinear TF scaling: 1 + log(tf)
      termCounts.forEach((count, featureIdx) => {
        const tf = 1 + Math.log(count);
        const weight = tf * this.idf[featureIdx];
        vec[featureIdx] = weight;
        normSq += weight * weight;
      });

      // L2 Normalization
      const norm = Math.sqrt(normSq);
      if (norm > 0) {
        for (let j = 0; j < V; j++) {
          vec[j] /= norm;
        }
      }

      this.tfidfVectors.push(vec);
    }

    // Precompute All-Pairs Cosine Similarity Matrix (dot product of L2 normalized vectors)
    this.similarityMatrix = [];
    for (let i = 0; i < N; i++) {
      const row = new Float64Array(N);
      const vecA = this.tfidfVectors[i];
      for (let j = 0; j < N; j++) {
        if (i === j) {
          row[j] = 1.0;
        } else if (j < i) {
          row[j] = this.similarityMatrix[j][i];
        } else {
          const vecB = this.tfidfVectors[j];
          let dot = 0;
          for (let k = 0; k < V; k++) {
            if (vecA[k] !== 0 && vecB[k] !== 0) {
              dot += vecA[k] * vecB[k];
            }
          }
          row[j] = Math.max(0, Math.min(1, dot));
        }
      }
      this.similarityMatrix.push(row);
    }

    this.isFitted = true;
  }

  /**
   * Vectorizes arbitrary raw text (search query or combined user profile) into normalized TF-IDF space.
   */
  public vectorizeText(text: string): Float64Array {
    const V = this.featureNames.length;
    const vec = new Float64Array(V);
    if (!this.isFitted || V === 0) return vec;

    const tokens = this.tokenize(text);
    const termCounts = new Map<number, number>();
    for (const t of tokens) {
      const featureIdx = this.vocabulary.get(t);
      if (featureIdx !== undefined) {
        termCounts.set(featureIdx, (termCounts.get(featureIdx) || 0) + 1);
      }
    }

    let normSq = 0;
    termCounts.forEach((count, featureIdx) => {
      const tf = 1 + Math.log(count);
      const weight = tf * this.idf[featureIdx];
      vec[featureIdx] = weight;
      normSq += weight * weight;
    });

    const norm = Math.sqrt(normSq);
    if (norm > 0) {
      for (let j = 0; j < V; j++) {
        vec[j] /= norm;
      }
    }

    return vec;
  }

  /**
   * Finds the top overlapping terms contributing to cosine similarity.
   */
  public explainSimilarity(queryIdx: number, candIdx: number, topK = 4): string[] {
    const vecA = this.tfidfVectors[queryIdx];
    const vecB = this.tfidfVectors[candIdx];
    if (!vecA || !vecB) return ['related category'];

    const contributions: { term: string; score: number }[] = [];
    for (let k = 0; k < this.featureNames.length; k++) {
      const prod = vecA[k] * vecB[k];
      if (prod > 0) {
        contributions.push({ term: this.featureNames[k], score: prod });
      }
    }

    contributions.sort((a, b) => b.score - a.score);
    return contributions.slice(0, topK).map(c => c.term);
  }

  /**
   * Recommends top-K products for seed product_id (excludes self).
   */
  public recommend(productId: string, topK = 5): Recommendation[] {
    if (!this.isFitted) return [];

    const targetIdx = this.idToIndex.get(productId);
    if (targetIdx === undefined) return [];

    const simScores = Array.from(this.similarityMatrix[targetIdx]).map((score, idx) => ({
      idx,
      score
    }));

    // Sort descending
    simScores.sort((a, b) => b.score - a.score);

    const recs: Recommendation[] = [];
    for (const item of simScores) {
      if (item.idx === targetIdx) continue; // Exclude seed
      if (recs.length >= topK) break;

      const p = this.products[item.idx];
      const explanation = this.explainSimilarity(targetIdx, item.idx);

      recs.push({
        product: p,
        similarity_score: Math.round(item.score * 10000) / 10000,
        similarity_percentage: Math.round(item.score * 1000) / 10,
        explanation_terms: explanation
      });
    }

    return recs;
  }

  /**
   * Recommends products directly from a raw search query (real-time query-driven ML recommendation).
   */
  public recommendForQuery(queryText: string, excludeIds: Set<string> = new Set(), topK = 5): Recommendation[] {
    if (!this.isFitted || !queryText.trim()) return [];

    const queryVec = this.vectorizeText(queryText);
    const V = this.featureNames.length;

    const scores: { idx: number; score: number }[] = [];
    for (let i = 0; i < this.products.length; i++) {
      const p = this.products[i];
      if (excludeIds.has(p.product_id)) continue;

      const prodVec = this.tfidfVectors[i];
      let dot = 0;
      for (let k = 0; k < V; k++) {
        if (queryVec[k] !== 0 && prodVec[k] !== 0) {
          dot += queryVec[k] * prodVec[k];
        }
      }

      if (dot > 0.02) {
        scores.push({ idx: i, score: dot });
      }
    }

    scores.sort((a, b) => b.score - a.score);

    return scores.slice(0, topK).map(item => {
      const p = this.products[item.idx];
      const prodVec = this.tfidfVectors[item.idx];
      const contribs: { term: string; score: number }[] = [];
      for (let k = 0; k < V; k++) {
        if (queryVec[k] > 0 && prodVec[k] > 0) {
          contribs.push({ term: this.featureNames[k], score: queryVec[k] * prodVec[k] });
        }
      }
      contribs.sort((a, b) => b.score - a.score);
      const explanation = contribs.slice(0, 3).map(c => c.term);

      return {
        product: p,
        similarity_score: Math.round(item.score * 10000) / 10000,
        similarity_percentage: Math.round(item.score * 1000) / 10,
        explanation_terms: explanation.length > 0 ? explanation : ['search affinity', 'matching features']
      };
    });
  }

  /**
   * Recommends personalized items for a logged-in UserProfile based on their Cart & Search History.
   * If liveSearchQuery is provided, it incorporates it with high real-time priority!
   */
  public recommendForUser(
    user: UserProfile,
    liveSearchQuery = '',
    topK = 5
  ): PersonalizedRecommendation[] {
    if (!this.isFitted) return [];

    const V = this.featureNames.length;
    const compositeVec = new Float64Array(V);
    const cartProductIds = new Set(user.cartItems.map(c => c.product_id));

    let totalWeight = 0;

    // 1. Incorporate Cart Items (weighted 2.0x each)
    const cartProducts: Product[] = [];
    user.cartItems.forEach(cartItem => {
      const idx = this.idToIndex.get(cartItem.product_id);
      if (idx !== undefined) {
        const prodVec = this.tfidfVectors[idx];
        cartProducts.push(this.products[idx]);
        for (let k = 0; k < V; k++) {
          compositeVec[k] += prodVec[k] * 2.0 * cartItem.quantity;
        }
        totalWeight += 2.0 * cartItem.quantity;
      }
    });

    // 2. Incorporate Past Search Queries (weighted 1.2x each)
    user.searchHistory.forEach(q => {
      if (q.trim()) {
        const qVec = this.vectorizeText(q);
        for (let k = 0; k < V; k++) {
          compositeVec[k] += qVec[k] * 1.2;
        }
        totalWeight += 1.2;
      }
    });

    // 3. Incorporate Live Search Query if user is currently searching (weighted 2.5x high priority!)
    let hasLiveSearch = false;
    if (liveSearchQuery && liveSearchQuery.trim()) {
      hasLiveSearch = true;
      const liveVec = this.vectorizeText(liveSearchQuery);
      for (let k = 0; k < V; k++) {
        compositeVec[k] += liveVec[k] * 2.5;
      }
      totalWeight += 2.5;
    }

    if (totalWeight === 0) {
      // If user has empty history, fallback to general popular recommendations
      return this.recommend(this.products[0]?.product_id || '101', topK).map(r => ({
        ...r,
        triggeredBy: 'Catalog Starter Recommendation',
        signalType: 'hybrid'
      }));
    }

    // L2 Normalize the composite User Profile Vector
    let normSq = 0;
    for (let k = 0; k < V; k++) {
      normSq += compositeVec[k] * compositeVec[k];
    }
    const norm = Math.sqrt(normSq);
    if (norm > 0) {
      for (let k = 0; k < V; k++) {
        compositeVec[k] /= norm;
      }
    }

    // Compute dot product against all products in catalog (exclude items already in cart)
    const scores: { idx: number; score: number }[] = [];
    for (let i = 0; i < this.products.length; i++) {
      const p = this.products[i];
      if (cartProductIds.has(p.product_id)) continue; // Don't re-recommend items in their current cart

      const prodVec = this.tfidfVectors[i];
      let dot = 0;
      for (let k = 0; k < V; k++) {
        if (compositeVec[k] !== 0 && prodVec[k] !== 0) {
          dot += compositeVec[k] * prodVec[k];
        }
      }

      scores.push({ idx: i, score: dot });
    }

    scores.sort((a, b) => b.score - a.score);

    return scores.slice(0, topK).map(item => {
      const cand = this.products[item.idx];
      const candVec = this.tfidfVectors[item.idx];

      // Determine primary trigger rationale
      let primaryTrigger = '';
      let signalType: 'cart' | 'search' | 'hybrid' = 'hybrid';

      // Check highest similarity to individual cart items
      let maxCartSim = 0;
      let maxCartProduct: Product | null = null;
      cartProducts.forEach(cp => {
        const cpIdx = this.idToIndex.get(cp.product_id);
        if (cpIdx !== undefined) {
          const sim = this.similarityMatrix[cpIdx][item.idx];
          if (sim > maxCartSim) {
            maxCartSim = sim;
            maxCartProduct = cp;
          }
        }
      });

      if (hasLiveSearch && item.score > 0.3) {
        primaryTrigger = `Live search query: "${liveSearchQuery}"`;
        signalType = 'search';
      } else if (maxCartSim > 0.25 && maxCartProduct) {
        primaryTrigger = `Based on cart item: "${(maxCartProduct as Product).title}"`;
        signalType = 'cart';
      } else if (user.searchHistory.length > 0) {
        primaryTrigger = `Matched search interest: "${user.searchHistory[0]}"`;
        signalType = 'search';
      } else {
        primaryTrigger = `Aligned with ${user.persona} profile preferences`;
        signalType = 'hybrid';
      }

      // Feature terms
      const contribs: { term: string; score: number }[] = [];
      for (let k = 0; k < V; k++) {
        if (compositeVec[k] > 0 && candVec[k] > 0) {
          contribs.push({ term: this.featureNames[k], score: compositeVec[k] * candVec[k] });
        }
      }
      contribs.sort((a, b) => b.score - a.score);
      const explanation = contribs.slice(0, 3).map(c => c.term);

      return {
        product: cand,
        similarity_score: Math.round(item.score * 10000) / 10000,
        similarity_percentage: Math.round(item.score * 1000) / 10,
        explanation_terms: explanation.length > 0 ? explanation : ['profile alignment', cand.category.toLowerCase()],
        triggeredBy: primaryTrigger,
        signalType: signalType
      };
    });
  }

  public getProducts(): Product[] {
    return this.products;
  }

  public getSimilarityMatrix(): Float64Array[] {
    return this.similarityMatrix;
  }

  public getFeatureNames(): string[] {
    return this.featureNames;
  }

  public getTfidfVector(productId: string): { term: string; weight: number }[] {
    const idx = this.idToIndex.get(productId);
    if (idx === undefined) return [];
    const vec = this.tfidfVectors[idx];
    const items: { term: string; weight: number }[] = [];
    for (let i = 0; i < this.featureNames.length; i++) {
      if (vec[i] > 0) {
        items.push({ term: this.featureNames[i], weight: Math.round(vec[i] * 1000) / 1000 });
      }
    }
    return items.sort((a, b) => b.weight - a.weight).slice(0, 15);
  }

  public getModelSummary(): ModelSummary {
    if (!this.isFitted) {
      return {
        algorithm: 'Content-Based Filtering (TF-IDF + Cosine Similarity)',
        vectorizer: 'Scikit-Learn Standard TfidfVectorizer',
        similarity_metric: 'Cosine Similarity',
        vocabulary_size: 0,
        catalog_size: 0,
        matrix_non_zeros: 0,
        matrix_sparsity_percent: 0,
        status: 'Unfitted'
      };
    }

    const nSamples = this.products.length;
    const nFeatures = this.featureNames.length;
    let nonZeros = 0;

    for (const vec of this.tfidfVectors) {
      for (let j = 0; j < nFeatures; j++) {
        if (vec[j] !== 0) nonZeros++;
      }
    }

    const totalElements = nSamples * nFeatures;
    const sparsity = totalElements > 0 ? (1.0 - (nonZeros / totalElements)) * 100 : 0;

    return {
      algorithm: 'Content-Based Filtering (TF-IDF + Cosine Similarity)',
      vectorizer: 'TfidfVectorizer (N-grams 1-2, sublinear TF)',
      similarity_metric: 'Cosine Similarity (Inner Product of L2 Vectors)',
      vocabulary_size: nFeatures,
      catalog_size: nSamples,
      matrix_non_zeros: nonZeros,
      matrix_sparsity_percent: Math.round(sparsity * 10) / 10,
      status: 'Trained & Operational'
    };
  }
}

export const recommenderEngine = new MLRecommenderEngine();
