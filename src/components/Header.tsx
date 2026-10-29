import React from 'react';
import { ShoppingBag, Activity, RefreshCw, Code2, BookOpen, Cpu, Sparkles, User, ShoppingCart } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  datasetSource: string;
  isSampleData: boolean;
  totalProducts: number;
  onRefreshDataset: () => void;
  isReloading: boolean;
  currentUser: UserProfile | null;
  onOpenLoginModal: () => void;
  onOpenRecommendationsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  datasetSource,
  isSampleData,
  totalProducts,
  onRefreshDataset,
  isReloading,
  currentUser,
  onOpenLoginModal,
  onOpenRecommendationsModal
}) => {
  const tabs = [
    { id: 'catalog', label: 'Catalog & Recommender', icon: ShoppingBag },
    { id: 'eda', label: 'EDA & Data Science', icon: Activity },
    { id: 'ml-math', label: 'ML Vectorizer & Math', icon: Cpu },
    { id: 'evaluation', label: 'ML Evaluation Suite', icon: Sparkles },
    { id: 'code', label: 'Python Source Code', icon: Code2 },
    { id: 'report', label: 'Project Report', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                SmartCart <span className="text-blue-600">AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Internship ML Project
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">
              Machine Learning-Based E-Commerce Product Recommendation System
            </p>
          </div>
        </div>

        {/* Center: Ingestion Pill (Hidden on small mobile) */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-900 max-w-[130px] truncate" title={datasetSource}>
              {datasetSource}
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-bold text-blue-600">{totalProducts} Items</span>
          </div>

          <button
            onClick={onRefreshDataset}
            disabled={isReloading}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            title="Reload dataset"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Right Corner: [Recommended Button (LEFT)] + [User Login Icon (TOP-RIGHT CORNER)] */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Recommended Button (Directly to the left of the Login Icon) */}
          <button
            onClick={onOpenRecommendationsModal}
            className="relative group inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-900 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 border border-amber-300 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer shadow-xs"
            title="Open AI-Driven Personalized Recommendations based on history"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500/20 group-hover:rotate-12 transition-transform" />
            <span className="tracking-tight">Recommended</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          </button>

          {/* User Login Icon (Top-Right Corner) */}
          {currentUser ? (
            <button
              onClick={onOpenLoginModal}
              className="inline-flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
              title={`Logged in as ${currentUser.name} (${currentUser.persona}). Click to switch demo user.`}
            >
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover ring-2 ring-indigo-400"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-slate-900"></span>
              </div>
              <span className="hidden sm:inline font-bold truncate max-w-[90px]">
                {currentUser.name.split(' ')[0]}
              </span>
              <span className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-200 text-[10px] font-bold">
                <ShoppingCart className="w-2.5 h-2.5 text-amber-300" />
                <span>{currentUser.cartItems.length}</span>
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
              title="Click to sign in with 5 demo user personas"
            >
              <User className="w-4 h-4 text-indigo-300" />
              <span className="hidden sm:inline">Sign In (5 IDs)</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
