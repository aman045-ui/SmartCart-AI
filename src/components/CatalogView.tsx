import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, Recommendation, UserProfile } from '../types';
import { recommenderEngine } from '../ml/tfidfEngine';
import { Search, Sparkles, Star, Tag, X, ChevronRight, ShoppingCart, Check, Zap, Plus, ArrowUpDown, History, Clock, Flame, ShoppingBag } from 'lucide-react';

interface CatalogViewProps {
  products: Product[];
  currentUser: UserProfile | null;
  onAddToCart: (productId: string) => void;
  onBuyProduct: (product: Product) => void;
  onAddSearchQuery?: (query: string) => void;
  onRemoveSearchQuery?: (query: string) => void;
  onSelectInspectProduct?: (product: Product) => void;
  liveSearchQuery: string;
  setLiveSearchQuery: (query: string) => void;
}

const TRENDING_KEYWORDS = [
  "Noise Canceling",
  "Espresso Machine",
  "Air Fryer",
  "Adjustable Dumbbells",
  "Mechanical Keyboard",
  "OLED Curved Monitor",
  "RFID Slim Wallet"
];

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  currentUser,
  onAddToCart,
  onBuyProduct,
  onAddSearchQuery,
  onRemoveSearchQuery,
  onSelectInspectProduct,
  liveSearchQuery,
  setLiveSearchQuery
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [selectedSeedProduct, setSelectedSeedProduct] = useState<Product | null>(() => products[0] || null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(() => {
    return products.length > 0 ? recommenderEngine.recommend(products[0].product_id, 5) : [];
  });
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  
  // Search history flyout state
  const [isSearchHistoryOpen, setIsSearchHistoryOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const recSectionRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchHistoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set of product IDs currently in active cart
  const cartProductIds = useMemo(() => {
    return new Set(currentUser?.cartItems.map(c => c.product_id) || []);
  }, [currentUser]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => set.add(p.category));
    return ['All', ...Array.from(set).sort()];
  }, [products]);

  // Real-time search query recommendations (when user searches for a new item)
  const searchQueryRecommendations = useMemo(() => {
    if (!liveSearchQuery.trim()) return [];
    return recommenderEngine.recommendForQuery(liveSearchQuery, new Set(), 5);
  }, [liveSearchQuery, products]);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesCat = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
        const q = liveSearchQuery.toLowerCase().trim();
        const matchesQuery = !q || 
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q);
        return matchesCat && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0; // featured
      });
  }, [products, selectedCategory, liveSearchQuery, sortBy]);

  const handleGetRecommendations = (product: Product) => {
    setSelectedSeedProduct(product);
    const recs = recommenderEngine.recommend(product.product_id, 5);
    setRecommendations(recs);

    setTimeout(() => {
      recSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  const handleAddToCartClick = (productId: string) => {
    onAddToCart(productId);
    setAddedProductId(productId);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  const handleApplySearchHistoryItem = (term: string) => {
    setLiveSearchQuery(term);
    setIsSearchHistoryOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Real-time Search-Driven Recommendation Banner (Triggers when user searches for new item) */}
      {liveSearchQuery.trim().length > 2 && searchQueryRecommendations.length > 0 && (
        <section className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 shadow-md border border-blue-500/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/30 flex items-center justify-center text-blue-300">
                <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    Live Search ML Recommendations for: <span className="text-amber-300 font-mono">"{liveSearchQuery}"</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase">
                    Query-Vectorized
                  </span>
                </div>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Query mapped into TF-IDF vector & ranked with catalog products via Cosine Similarity.
                </p>
              </div>
            </div>

            {currentUser && onAddSearchQuery && !currentUser.searchHistory.includes(liveSearchQuery.trim()) && (
              <button
                onClick={() => onAddSearchQuery(liveSearchQuery.trim())}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save to User Profile History</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {searchQueryRecommendations.map((rec, i) => (
              <div
                key={rec.product.product_id}
                className="bg-slate-950/80 rounded-xl border border-indigo-900/60 p-3 flex flex-col justify-between hover:border-indigo-400 transition-all text-xs"
              >
                <div>
                  <div className="w-full h-24 rounded-lg overflow-hidden mb-2 bg-slate-900 border border-indigo-950">
                    <img
                      src={rec.product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80'}
                      alt={rec.product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.2 rounded">
                      #{i + 1} &bull; {rec.similarity_percentage}% Match
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      cos={rec.similarity_score.toFixed(3)}
                    </span>
                  </div>
                  <h4 className="font-bold text-white line-clamp-1">{rec.product.title}</h4>
                  <div className="text-[10px] text-indigo-300 font-medium truncate">
                    {rec.product.brand} &bull; {rec.product.category}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-indigo-900/60 flex items-center justify-between">
                  <span className="font-extrabold text-white">${rec.product.price.toFixed(2)}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleAddToCartClick(rec.product.product_id)}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                    >
                      + Cart
                    </button>
                    <button
                      onClick={() => onBuyProduct(rec.product)}
                      className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer flex items-center gap-0.5"
                    >
                      <ShoppingBag className="w-2.5 h-2.5" />
                      <span>Buy</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Active Seed Product & Recommendations Section */}
      {selectedSeedProduct && (
        <section
          ref={recSectionRef}
          className="rounded-2xl bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-white border border-blue-200/80 p-5 sm:p-6 shadow-sm transition-all"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-blue-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white tracking-wide uppercase mb-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Product-to-Product ML Recommendation (Item-Based)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Recommendations for: <span className="text-blue-700">{selectedSeedProduct.title}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Computed via Scikit-Learn TF-IDF vectorization and pairwise Cosine Similarity (K=5).
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onSelectInspectProduct && (
                <button
                  onClick={() => onSelectInspectProduct(selectedSeedProduct)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  Inspect TF-IDF Vector &rarr;
                </button>
              )}
              <button
                onClick={() => setSelectedSeedProduct(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white transition-colors cursor-pointer"
                title="Collapse recommendations"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Seed Product Highlight Banner with Photo */}
          <div className="mt-4 p-3.5 bg-white/90 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                <img
                  src={selectedSeedProduct.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80'}
                  alt={selectedSeedProduct.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] font-bold text-slate-700 mr-2">
                  ID #{selectedSeedProduct.product_id}
                </span>
                <span className="font-semibold text-slate-800">{selectedSeedProduct.brand}</span>
                <span className="text-slate-400 mx-1.5">•</span>
                <span className="text-slate-600">{selectedSeedProduct.category} &gt; {selectedSeedProduct.subcategory}</span>
                <div className="text-slate-900 font-bold mt-0.5">{selectedSeedProduct.title}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-500">Seed Price: <strong className="text-slate-900">${selectedSeedProduct.price.toFixed(2)}</strong></span>
              <div className="flex items-center gap-1 text-amber-500 font-semibold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{selectedSeedProduct.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* 5 Recommendations Grid with Images */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Top 5 Similar Products (Ranked by Cosine Similarity)
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Self-exclusion enforced (Seed omitted)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {recommendations.map((rec, index) => {
                const inCart = cartProductIds.has(rec.product.product_id);
                const isJustAdded = addedProductId === rec.product.product_id;

                return (
                  <div
                    key={rec.product.product_id}
                    className="bg-white rounded-xl border border-slate-200/90 hover:border-blue-400 p-3.5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group"
                  >
                    <div>
                      {/* Product Image */}
                      <div className="w-full h-32 rounded-lg overflow-hidden bg-slate-100 mb-2.5 relative border border-slate-100">
                        <img
                          src={rec.product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80'}
                          alt={rec.product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                          #{index + 1} &bull; {rec.similarity_percentage}%
                        </span>
                      </div>

                      <div className="text-[10px] font-bold uppercase tracking-wide text-blue-600 truncate">
                        {rec.product.category}
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2 mt-0.5 group-hover:text-blue-600 transition-colors">
                        {rec.product.title}
                      </h4>

                      {/* Shared TF-IDF Key Tokens */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                        {rec.explanation_terms.map((term, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-100 text-slate-700"
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-sm font-extrabold text-slate-900">
                        ${rec.product.price.toFixed(2)}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAddToCartClick(rec.product.product_id)}
                          className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isJustAdded || inCart
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                          title={inCart ? 'In cart' : 'Add to cart'}
                        >
                          {isJustAdded || inCart ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => onBuyProduct(rec.product)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer flex items-center gap-1"
                          title="Instant Buy Now"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Buy</span>
                        </button>

                        <button
                          onClick={() => handleGetRecommendations(rec.product)}
                          className="p-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                          title="Re-run recommendation engine with this product as seed"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 3. Product Catalog Controls & Filtering Bar with Search History Popover */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search bar with Click-to-Open Search History */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
            <input
              type="text"
              value={liveSearchQuery}
              onFocus={() => setIsSearchHistoryOpen(true)}
              onClick={() => setIsSearchHistoryOpen(true)}
              onChange={(e) => setLiveSearchQuery(e.target.value)}
              placeholder="Click to search or view past queries..."
              className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50/50 focus:bg-white"
            />
            {liveSearchQuery && (
              <button
                onClick={() => setLiveSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Interactive Search History Dropdown Popover */}
            {isSearchHistoryOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-30 space-y-3 animate-in fade-in duration-150">
                {/* Recent user searches */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span>{currentUser ? `${currentUser.name}'s Search History` : 'Recent Searches'}</span>
                    </span>
                    {currentUser && currentUser.searchHistory.length > 0 && (
                      <span className="text-[10px] text-slate-400 lowercase font-normal">click to search</span>
                    )}
                  </div>

                  {currentUser && currentUser.searchHistory.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {currentUser.searchHistory.map((query, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition-colors cursor-pointer group"
                        >
                          <span onClick={() => handleApplySearchHistoryItem(query)}>
                            "{query}"
                          </span>
                          {onRemoveSearchQuery && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveSearchQuery(query);
                              }}
                              className="text-blue-400 hover:text-red-500 ml-1 cursor-pointer"
                              title="Delete from history"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No previous searches recorded yet.</p>
                  )}
                </div>

                {/* Popular / Trending Searches */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-500" />
                    <span>Popular Catalog Topics</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {TRENDING_KEYWORDS.map((k, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleApplySearchHistoryItem(k)}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 hidden lg:inline">
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
          <span>
            Showing <strong className="text-slate-800">{filteredProducts.length}</strong> of{' '}
            <strong className="text-slate-800">{products.length}</strong> catalog items
          </span>
          <span className="text-slate-400">
            Click <strong>"Get ML Recs"</strong> or <strong>"+ Cart"</strong> to personalize recommendations
          </span>
        </div>
      </div>

      {/* 4. Main Catalog Grid with High-Resolution Product Images */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-sm font-medium text-slate-600">No products found matching your search.</p>
          <button
            onClick={() => {
              setLiveSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-3 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const isSelected = selectedSeedProduct?.product_id === product.product_id;
            const inCart = cartProductIds.has(product.product_id);
            const isJustAdded = addedProductId === product.product_id;

            return (
              <div
                key={product.product_id}
                className={`bg-white rounded-xl border p-3.5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Product Card Image */}
                  <div className="w-full h-44 rounded-lg overflow-hidden bg-slate-100 mb-3 relative border border-slate-100">
                    <img
                      src={product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'}
                      alt={product.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-800 shadow-xs flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-current" />
                      <span>{product.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                    {product.category} &bull; {product.brand}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug mt-1 group-hover:text-blue-600 transition-colors">
                    {product.title}
                  </h3>

                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-lg font-extrabold text-slate-900">
                    ${product.price.toFixed(2)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleAddToCartClick(product.product_id)}
                      className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                        isJustAdded || inCart
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                      title={inCart ? 'Item in cart' : 'Add to cart'}
                    >
                      {isJustAdded || inCart ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span className="text-[11px] hidden sm:inline">In Cart</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span className="text-[11px] hidden sm:inline">Cart</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onBuyProduct(product)}
                      className="px-2.5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer flex items-center gap-1"
                      title="Instant Buy Now"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Buy</span>
                    </button>

                    <button
                      onClick={() => handleGetRecommendations(product)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-900 text-white hover:bg-blue-600'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isSelected ? 'Active' : 'Get Recs'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
