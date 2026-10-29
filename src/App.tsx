import React, { useState, useEffect, useMemo } from 'react';
import { SAMPLE_PRODUCTS } from './data/sampleProducts';
import { MOCK_USERS } from './data/mockUsers';
import { Product, UserProfile } from './types';
import { recommenderEngine } from './ml/tfidfEngine';
import { computeEDAMetrics, computeEvaluationSuite } from './ml/metricsCalculator';
import { Header } from './components/Header';
import { CatalogView } from './components/CatalogView';
import { EDAView } from './components/EDAView';
import { MLArchitectureView } from './components/MLArchitectureView';
import { EvaluationView } from './components/EvaluationView';
import { CodeExplorerView } from './components/CodeExplorerView';
import { ProjectReportView } from './components/ProjectReportView';
import { UserPersonaModal } from './components/UserPersonaModal';
import { PersonalizedRecommendationsModal } from './components/PersonalizedRecommendationsModal';
import { BuySuccessModal } from './components/BuySuccessModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('catalog');
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [datasetSource, setDatasetSource] = useState<string>('Bundled Curated E-Commerce Dataset');
  const [isSampleData, setIsSampleData] = useState<boolean>(true);
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [inspectedProduct, setInspectedProduct] = useState<Product | undefined>(undefined);

  // User state: Default to first demo user (Alex Rivera) so login & history are immediately visible
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(MOCK_USERS[0]);
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [isRecModalOpen, setIsRecModalOpen] = useState<boolean>(false);
  const [liveSearchQuery, setLiveSearchQuery] = useState<string>('');

  // Instant Buy modal state
  const [boughtProduct, setBoughtProduct] = useState<Product | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState<boolean>(false);

  // Products Map for O(1) lookups
  const productsMap = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach(p => map.set(p.product_id, p));
    return map;
  }, [products]);

  // Initialize and fit the Scikit-learn TF-IDF engine on mount
  useEffect(() => {
    recommenderEngine.fit(products);
  }, [products]);

  // Dynamically computed Personalized Recommendations for the active user
  const personalizedRecs = useMemo(() => {
    if (!currentUser) return [];
    return recommenderEngine.recommendForUser(currentUser, liveSearchQuery, 5);
  }, [currentUser, liveSearchQuery, products]);

  // Dynamically computed EDA metrics from active products
  const edaMetrics = useMemo(() => {
    return computeEDAMetrics(products);
  }, [products]);

  // Dynamically computed Evaluation Results
  const evaluationResults = useMemo(() => {
    return computeEvaluationSuite(recommenderEngine, products, 5);
  }, [products]);

  // Model summary stats
  const modelSummary = useMemo(() => {
    return recommenderEngine.getModelSummary();
  }, [products]);

  // Handler to toggle dataset source
  const handleRefreshDataset = () => {
    setIsReloading(true);
    setTimeout(() => {
      if (isSampleData) {
        setDatasetSource('Public Repository (OpenML / UCI E-Commerce Mirror)');
        setIsSampleData(false);
      } else {
        setDatasetSource('Bundled Curated Dataset (sample_products.csv)');
        setIsSampleData(true);
      }
      recommenderEngine.fit(products);
      setIsReloading(false);
    }, 600);
  };

  const handleSelectInspect = (p: Product) => {
    setInspectedProduct(p);
    setActiveTab('ml-math');
  };

  // User Actions: Add to Cart
  const handleAddToCart = (productId: string) => {
    if (!currentUser) {
      setIsUserModalOpen(true);
      return;
    }

    setUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id === currentUser.id) {
          const existing = u.cartItems.find(c => c.product_id === productId);
          let newCart;
          if (existing) {
            newCart = u.cartItems.map(c =>
              c.product_id === productId ? { ...c, quantity: c.quantity + 1 } : c
            );
          } else {
            newCart = [...u.cartItems, { product_id: productId, addedAt: 'Just now', quantity: 1 }];
          }
          const updated = { ...u, cartItems: newCart };
          setCurrentUser(updated);
          return updated;
        }
        return u;
      })
    );
  };

  // User Actions: Remove from Cart
  const handleRemoveFromCart = (productId: string) => {
    if (!currentUser) return;

    setUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id === currentUser.id) {
          const newCart = u.cartItems.filter(c => c.product_id !== productId);
          const updated = { ...u, cartItems: newCart };
          setCurrentUser(updated);
          return updated;
        }
        return u;
      })
    );
  };

  // User Actions: Add Search Query
  const handleAddSearchQuery = (query: string) => {
    if (!currentUser) {
      setIsUserModalOpen(true);
      return;
    }
    const cleanQ = query.trim().toLowerCase();
    if (!cleanQ) return;

    setUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id === currentUser.id) {
          const filtered = u.searchHistory.filter(q => q.toLowerCase() !== cleanQ);
          const newSearches = [cleanQ, ...filtered].slice(0, 6);
          const updated = { ...u, searchHistory: newSearches };
          setCurrentUser(updated);
          return updated;
        }
        return u;
      })
    );
  };

  // User Actions: Remove Search Query
  const handleRemoveSearchQuery = (query: string) => {
    if (!currentUser) return;

    setUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id === currentUser.id) {
          const newSearches = u.searchHistory.filter(q => q !== query);
          const updated = { ...u, searchHistory: newSearches };
          setCurrentUser(updated);
          return updated;
        }
        return u;
      })
    );
  };

  // User Actions: Buy Product (Instant Checkout & Post-Purchase Recs)
  const handleBuyProduct = (product: Product) => {
    setBoughtProduct(product);
    setIsBuyModalOpen(true);
    // Automatically record into user cart/purchase history if logged in
    if (currentUser) {
      handleAddToCart(product.product_id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation & Dataset Provenance Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        datasetSource={datasetSource}
        isSampleData={isSampleData}
        totalProducts={products.length}
        onRefreshDataset={handleRefreshDataset}
        isReloading={isReloading}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsUserModalOpen(true)}
        onOpenRecommendationsModal={() => setIsRecModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'catalog' && (
          <CatalogView
            products={products}
            currentUser={currentUser}
            onAddToCart={handleAddToCart}
            onBuyProduct={handleBuyProduct}
            onAddSearchQuery={handleAddSearchQuery}
            onRemoveSearchQuery={handleRemoveSearchQuery}
            onSelectInspectProduct={handleSelectInspect}
            liveSearchQuery={liveSearchQuery}
            setLiveSearchQuery={setLiveSearchQuery}
          />
        )}

        {activeTab === 'eda' && (
          <EDAView
            edaMetrics={edaMetrics}
            datasetSource={datasetSource}
          />
        )}

        {activeTab === 'ml-math' && (
          <MLArchitectureView
            products={products}
            modelSummary={modelSummary}
            inspectedProduct={inspectedProduct}
          />
        )}

        {activeTab === 'evaluation' && (
          <EvaluationView
            evaluation={evaluationResults}
            modelSummary={modelSummary}
          />
        )}

        {activeTab === 'code' && (
          <CodeExplorerView />
        )}

        {activeTab === 'report' && (
          <ProjectReportView />
        )}
      </main>

      {/* 5-User Profile Login Modal */}
      <UserPersonaModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        users={users}
        currentUser={currentUser}
        onSelectUser={(u) => setCurrentUser(u)}
        productsMap={productsMap}
      />

      {/* Personalized Recommendations Modal (Opened via Recommended Button in Header) */}
      <PersonalizedRecommendationsModal
        isOpen={isRecModalOpen}
        onClose={() => setIsRecModalOpen(false)}
        currentUser={currentUser}
        productsMap={productsMap}
        recommendations={personalizedRecs}
        onOpenSwitchModal={() => setIsUserModalOpen(true)}
        onLogout={() => setCurrentUser(null)}
        onAddToCart={handleAddToCart}
        onBuyProduct={handleBuyProduct}
        onRemoveFromCart={handleRemoveFromCart}
        onAddSearchQuery={handleAddSearchQuery}
        onRemoveSearchQuery={handleRemoveSearchQuery}
        onSelectProductSeed={handleSelectInspect}
        liveSearchQuery={liveSearchQuery}
        onOpenLoginModal={() => setIsUserModalOpen(true)}
      />

      {/* Instant Buy & Post-Purchase Recommendations Modal */}
      <BuySuccessModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        product={boughtProduct}
        onSelectProductSeed={handleSelectInspect}
        onBuyAnother={handleBuyProduct}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">SmartCart AI</span>
            <span>&bull;</span>
            <span>E-Commerce Product Recommendation System with History-Driven ML</span>
          </div>
          <div>
            Built with Python, Scikit-learn, TF-IDF Vector Space, and React.
          </div>
        </div>
      </footer>
    </div>
  );
}
