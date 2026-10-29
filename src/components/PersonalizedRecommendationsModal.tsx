import React from 'react';
import { PersonalizedRecommendation, UserProfile, Product } from '../types';
import { UserHistoryPanel } from './UserHistoryPanel';
import { Sparkles, X, UserCheck } from 'lucide-react';

interface PersonalizedRecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
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
  onOpenLoginModal: () => void;
}

export const PersonalizedRecommendationsModal: React.FC<PersonalizedRecommendationsModalProps> = ({
  isOpen,
  onClose,
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
  onOpenLoginModal
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative max-w-6xl w-full my-6 max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl">
        {currentUser ? (
          <UserHistoryPanel
            currentUser={currentUser}
            productsMap={productsMap}
            recommendations={recommendations}
            onOpenSwitchModal={onOpenSwitchModal}
            onLogout={onLogout}
            onAddToCart={onAddToCart}
            onBuyProduct={onBuyProduct}
            onRemoveFromCart={onRemoveFromCart}
            onAddSearchQuery={onAddSearchQuery}
            onRemoveSearchQuery={onRemoveSearchQuery}
            onSelectProductSeed={onSelectProductSeed}
            liveSearchQuery={liveSearchQuery}
            onClose={onClose}
          />
        ) : (
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 shadow-2xl border border-indigo-900/60 relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-xl transition-colors cursor-pointer border border-slate-700"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-w-md mx-auto text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-7 h-7 animate-pulse" />
              </div>

              <h3 className="text-2xl font-bold text-white tracking-tight">
                Personalized ML Recommendations
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                Log in to one of the 5 demo student/shopper profiles to see pre-carted items, search histories, and real-time TF-IDF vector-space predictions.
              </p>

              <button
                onClick={() => {
                  onClose();
                  onOpenLoginModal();
                }}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Select from 5 Demo Profiles &rarr;</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
