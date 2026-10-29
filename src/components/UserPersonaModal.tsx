import React from 'react';
import { UserProfile, Product } from '../types';
import { ShoppingCart, Search, UserCheck, Sparkles, ArrowRight, X } from 'lucide-react';

interface UserPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
  currentUser: UserProfile | null;
  onSelectUser: (user: UserProfile) => void;
  productsMap: Map<string, Product>;
}

export const UserPersonaModal: React.FC<UserPersonaModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onSelectUser,
  productsMap
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 relative my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Client-Side Mock User Login (5 Personas)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Select a Demo User to Test History-Based ML Recommendations
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Each user profile contains pre-loaded cart products and search queries. Logging in will construct a composite User Intent Vector in TF-IDF space to generate personalized predictions.
          </p>
        </div>

        {/* 5 User Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => {
            const isCurrent = currentUser?.id === u.id;
            const cartItems = u.cartItems.map(c => productsMap.get(c.product_id)).filter(Boolean) as Product[];

            return (
              <div
                key={u.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-2.5">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-slate-900">{u.name}</h4>
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-600 text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-blue-700 block">{u.persona}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {u.bio}
                  </p>

                  {/* Pre-added Cart Products */}
                  <div className="mb-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                      <ShoppingCart className="w-3 h-3 text-amber-600" />
                      <span>Previously Added in Cart ({u.cartItems.length}):</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-700 font-medium">
                      {cartItems.map((cp) => (
                        <li key={cp.product_id} className="truncate text-[11px] text-slate-800">
                          • {cp.title} (${cp.price.toFixed(2)})
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Previous Searches */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                      <Search className="w-3 h-3 text-blue-600" />
                      <span>Past Search Queries ({u.searchHistory.length}):</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {u.searchHistory.map((q, qIdx) => (
                        <span
                          key={qIdx}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white text-slate-700 border border-slate-200 truncate max-w-[170px]"
                        >
                          "{q}"
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectUser(u);
                    onClose();
                  }}
                  className={`mt-4 w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-900 text-white hover:bg-blue-600'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isCurrent ? 'Continue as this User' : 'Login & Load Recommendations'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
