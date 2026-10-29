import React from 'react';
import { Product, Recommendation } from '../types';
import { recommenderEngine } from '../ml/tfidfEngine';
import { CheckCircle2, X, ShoppingBag, ArrowRight, Sparkles, Star } from 'lucide-react';

interface BuySuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSelectProductSeed: (product: Product) => void;
  onBuyAnother: (product: Product) => void;
}

export const BuySuccessModal: React.FC<BuySuccessModalProps> = ({
  isOpen,
  onClose,
  product,
  onSelectProductSeed,
  onBuyAnother
}) => {
  if (!isOpen || !product) return null;

  // Generate 3 post-purchase recommendations
  const postPurchaseRecs: Recommendation[] = recommenderEngine.recommend(product.product_id, 3);
  const orderId = `SC-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative my-8 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Order Confirmation Banner */}
        <div className="text-center space-y-2 pb-5 border-b border-slate-100">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Order Placed Successfully!
          </h2>
          <p className="text-xs text-slate-500">
            Order ID: <strong className="font-mono text-slate-800">#{orderId}</strong> &bull; Estimated delivery: 2-3 business days
          </p>
        </div>

        {/* Purchased Product Preview */}
        <div className="my-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3.5">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-white shrink-0 border border-slate-200">
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
              {product.category}
            </span>
            <h4 className="text-sm font-bold text-slate-900 truncate">
              {product.title}
            </h4>
            <div className="text-xs text-slate-500">
              Quantity: 1 &bull; <strong className="text-slate-900">${product.price.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Post-Purchase ML Recommendations */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Recommended Next (ML Cosine Similarity)</span>
          </div>

          <div className="space-y-2">
            {postPurchaseRecs.map((rec, i) => (
              <div
                key={rec.product.product_id}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 bg-white flex items-center justify-between gap-3 text-xs transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img
                      src={rec.product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80'}
                      alt={rec.product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 truncate">
                    <div className="font-semibold text-slate-900 truncate">{rec.product.title}</div>
                    <div className="text-[10px] text-emerald-600 font-bold">
                      {rec.similarity_percentage}% Match &bull; ${rec.product.price.toFixed(2)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onBuyAnother(rec.product)}
                  className="px-2.5 py-1 rounded text-[11px] font-bold bg-slate-900 hover:bg-blue-600 text-white transition-colors cursor-pointer shrink-0"
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Close action */}
        <div className="mt-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
