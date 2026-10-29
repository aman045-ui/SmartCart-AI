import React, { useState } from 'react';
import { UserProfile, Product, PersonalizedRecommendation } from '../types';
import { ShoppingCart, Search, Sparkles, UserCheck, Trash2, Plus, ArrowRight, Tag, Zap, ChevronRight, Check, ShoppingBag, X } from 'lucide-react';

interface UserHistoryPanelProps {
  currentUser: UserProfile;
  productsMap: Map<string, Product>;
  recommendations: PersonalizedRecommendation[];
  onOpenSwitchModal: () => void;
  onLogout: () => void;
  onAddToCart: (productId: string) => void;
  onBuyProduct: (product: Product) => void;
  onRemoveFromCart: (productId: string) => void;
  onAddSearchQuery: (query: string) => void;
  onRemoveSearchQuery: (query: string) => void;
  onSelectProductSeed: (product: Product) => void;
  liveSearchQuery: string;
  onClose?: () => void;
}

export const UserHistoryPanel: React.FC<UserHistoryPanelProps> = ({
  currentUser,
  productsMap,
  recommendations,
  onOpenSwitchModal,
  onLogout,
  onAddToCart,
  onBuyProduct,
  onRemoveFromCart,
  onAddSearchQuery,
  onRemoveSearchQuery,
  onSelectProductSeed,
  liveSearchQuery,
  onClose
}) => {
  const [newSearchInput, setNewSearchInput] = useState('');
  const [cartSuccessId, setCartSuccessId] = useState<string | null>(null);

  const cartProducts = currentUser.cartItems
    .map(c => ({ product: productsMap.get(c.product_id), quantity: c.quantity, addedAt: c.addedAt }))
    .filter(item => item.product !== undefined) as { product: Product; quantity: number; addedAt: string }[];

  const cartTotal = cartProducts.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleAddNewSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSearchInput.trim()) {
      onAddSearchQuery(newSearchInput.trim());
      setNewSearchInput('');
    }
  };

  const handleQuickAdd = (productId: string) => {
    onAddToCart(productId);
    setCartSuccessId(productId);
    setTimeout(() => setCartSuccessId(null), 1500);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-7 shadow-lg border border-indigo-900/60 space-y-6">
      {/* User Header Profile */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-indigo-800/50">
        <div className="flex items-center gap-3.5">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-400/40 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{currentUser.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                {currentUser.badge}
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              {currentUser.persona} &bull; <span className="font-mono text-indigo-300">{currentUser.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenSwitchModal}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Switch User (5 Profiles)</span>
          </button>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700"
          >
            Log Out (Guest Mode)
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border border-slate-700 ml-1"
              title="Close Recommended Modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Two Column Layout: Left (Cart & Search History) | Right (Real-time ML Recommendations) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User History Signals (Cart & Past Searches) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Active Cart */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-indigo-900/40 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
                <span>Previously Carted Items ({cartProducts.length})</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold">${cartTotal.toFixed(2)}</span>
            </div>

            {cartProducts.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Cart is empty. Add products below to influence ML vector!</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {cartProducts.map(({ product, quantity, addedAt }) => (
                  <div
                    key={product.product_id}
                    className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-900/30 flex items-center justify-between text-xs gap-2.5"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-8 h-8 rounded-md overflow-hidden bg-slate-900 shrink-0 border border-indigo-900/50">
                        <img
                          src={product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80'}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-slate-200 truncate">{product.title}</div>
                        <div className="text-[10px] text-slate-400">
                          ${product.price.toFixed(2)} {quantity > 1 ? `(x${quantity})` : ''} &bull; {addedAt}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveFromCart(product.product_id)}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Searches & Live Search Input */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-indigo-900/40 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-400" />
                <span>User Search History ({currentUser.searchHistory.length})</span>
              </div>
            </div>

            {/* Quick add new search */}
            <form onSubmit={handleAddNewSearch} className="flex gap-2">
              <input
                type="text"
                value={newSearchInput}
                onChange={(e) => setNewSearchInput(e.target.value)}
                placeholder="Simulate new search query..."
                className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-indigo-900/60 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                title="Add to search history and re-predict"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Query Chips */}
            <div className="flex flex-wrap gap-1.5">
              {currentUser.searchHistory.map((query, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono bg-indigo-900/40 text-indigo-200 border border-indigo-800/40"
                >
                  <span>"{query}"</span>
                  <button
                    onClick={() => onRemoveSearchQuery(query)}
                    className="text-indigo-400 hover:text-red-300 cursor-pointer text-[10px]"
                    title="Remove query"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {liveSearchQuery && (
              <div className="p-2 rounded-lg bg-blue-950/70 border border-blue-500/40 text-xs text-blue-200 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Active Live Search: <strong>"{liveSearchQuery}"</strong> (Weight 2.5x)</span>
              </div>
            )}
          </div>
        </div>

        {/* Personalized Recommendations Grid */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                ML Predicted For You (TF-IDF User Profile Centroid Vector)
              </h3>
            </div>
            <span className="text-[11px] text-indigo-300 font-mono hidden sm:inline">
              Synthesized from Cart + Searches
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {recommendations.slice(0, 5).map((rec, index) => {
              const isAdded = cartSuccessId === rec.product.product_id;

              return (
                <div
                  key={rec.product.product_id}
                  className="bg-slate-900/90 rounded-xl border border-indigo-900/60 p-3.5 flex flex-col justify-between hover:border-indigo-500 transition-all shadow-md group text-xs"
                >
                  <div>
                    {/* Recommendation Card Product Photo */}
                    <div className="w-full h-28 rounded-lg overflow-hidden bg-slate-950 mb-2 relative border border-indigo-950">
                      <img
                        src={rec.product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80'}
                        alt={rec.product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/90 text-white shadow-xs">
                        #{index + 1} &bull; {rec.similarity_percentage}%
                      </span>
                    </div>

                    {/* Trigger Rationale */}
                    <div className="mb-1.5 px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/40 text-[10px] text-amber-300 font-medium truncate" title={rec.triggeredBy}>
                      ⚡ {rec.triggeredBy}
                    </div>

                    <div className="text-[10px] font-bold uppercase tracking-wide text-indigo-400 truncate">
                      {rec.product.category} &bull; {rec.product.brand}
                    </div>

                    <h4 className="text-sm font-bold text-white line-clamp-1 mt-0.5 group-hover:text-indigo-300 transition-colors">
                      {rec.product.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {rec.product.description}
                    </p>

                    {/* Shared TF-IDF Feature Tokens */}
                    <div className="mt-3 pt-2 border-t border-indigo-900/40 flex flex-wrap gap-1">
                      {rec.explanation_terms.map((term, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-indigo-200 border border-indigo-900/60"
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-indigo-900/40 flex items-center justify-between gap-2">
                    <div className="text-base font-extrabold text-white">
                      ${rec.product.price.toFixed(2)}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectProductSeed(rec.product)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Inspect item-to-item similar products"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleQuickAdd(rec.product.product_id)}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-slate-800 text-emerald-300'
                            : 'bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200'
                        }`}
                        title="Add to cart"
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>In Cart</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3 h-3" />
                            <span>Cart</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => onBuyProduct(rec.product)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs cursor-pointer flex items-center gap-1"
                        title="Instant Buy Now"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Buy</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
