import React, { useState } from 'react';
import { Product, ModelSummary } from '../types';
import { recommenderEngine } from '../ml/tfidfEngine';
import { Cpu, Binary, Calculator, Hash, Layers, CheckCircle2, Search } from 'lucide-react';

interface MLArchitectureViewProps {
  products: Product[];
  modelSummary: ModelSummary;
  inspectedProduct?: Product;
}

export const MLArchitectureView: React.FC<MLArchitectureViewProps> = ({
  products,
  modelSummary,
  inspectedProduct
}) => {
  const [selectedProductA, setSelectedProductA] = useState<string>(
    inspectedProduct?.product_id || products[0]?.product_id || '101'
  );
  const [selectedProductB, setSelectedProductB] = useState<string>(
    products[1]?.product_id || '102'
  );

  const productA = products.find(p => p.product_id === selectedProductA);
  const productB = products.find(p => p.product_id === selectedProductB);

  // TF-IDF vector terms for Product A
  const termsA = productA ? recommenderEngine.getTfidfVector(productA.product_id) : [];
  const termsB = productB ? recommenderEngine.getTfidfVector(productB.product_id) : [];

  // Pairwise dot product calculation breakdown
  const termsBMap = new Map(termsB.map(t => [t.term, t.weight]));
  const sharedTokens: { term: string; weightA: number; weightB: number; product: number }[] = [];

  termsA.forEach(tA => {
    if (termsBMap.has(tA.term)) {
      const weightB = termsBMap.get(tA.term) || 0;
      sharedTokens.push({
        term: tA.term,
        weightA: tA.weight,
        weightB: weightB,
        product: Math.round(tA.weight * weightB * 1000) / 1000
      });
    }
  });

  sharedTokens.sort((a, b) => b.product - a.product);
  const dotProductSum = sharedTokens.reduce((acc, item) => acc + item.product, 0);

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>Machine Learning Architecture</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              TF-IDF Vector Space & Cosine Similarity Engine
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Detailed inspection of feature extraction, sublinear term frequency weighting, document-term sparsity, and vector dot products.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Scikit-Learn Standard Formulae
            </span>
          </div>
        </div>
      </div>

      {/* Model Parameters & Matrix Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Vocabulary Dimension</span>
            <Hash className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {modelSummary.vocabulary_size} <span className="text-xs font-normal text-slate-500">features</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Unigrams + Bigrams (1, 2) filtered by English stopwords</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Catalog Matrix Shape</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 font-mono">
            {modelSummary.catalog_size} × {modelSummary.vocabulary_size}
          </div>
          <p className="mt-1 text-xs text-slate-500">{modelSummary.catalog_size} document rows by {modelSummary.vocabulary_size} term columns</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Matrix Sparsity</span>
            <Binary className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {modelSummary.matrix_sparsity_percent}%
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {modelSummary.matrix_non_zeros} non-zero entries (efficient compressed representation)
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Runtime Latency</span>
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            &lt; 1 ms
          </div>
          <p className="mt-1 text-xs text-slate-500">Precomputed dot products reused across requests</p>
        </div>
      </div>

      {/* Mathematical Formulations Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-blue-600" />
          <span>Core Mathematical Formulations</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block text-sm">1. Sublinear Term Frequency (TF)</span>
            <div className="p-2.5 bg-white rounded-lg font-mono text-blue-700 font-bold border border-slate-200 text-center">
              tf_scaled = 1 + ln(tf) (if tf &gt; 0)
            </div>
            <p className="text-slate-600 leading-relaxed">
              Standard frequency linear scaling overweights repetitive terms. Sublinear logarithmic dampening prevents high-frequency common words from dominating vector magnitude.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block text-sm">2. Smooth Inverse Document Frequency (IDF)</span>
            <div className="p-2.5 bg-white rounded-lg font-mono text-indigo-700 font-bold border border-slate-200 text-center">
              idf(t) = ln((1 + N) / (1 + df(t))) + 1
            </div>
            <p className="text-slate-600 leading-relaxed">
              Adds pseudo-counts to numerator and denominator to prevent division by zero for rare tokens, penalizing terms that appear in virtually every product description.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block text-sm">3. L2 Normalization & Cosine Similarity</span>
            <div className="p-2.5 bg-white rounded-lg font-mono text-emerald-700 font-bold border border-slate-200 text-center">
              cos(u, v) = u · v = Σ (u_k · v_k)
            </div>
            <p className="text-slate-600 leading-relaxed">
              Each document vector is normalized to unit Euclidean length (||u|| = 1), transforming cosine similarity into a direct inner product bounded strictly in [0.0, 1.0].
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Pairwise Dot Product Inspector */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Pairwise Vector Dot-Product Comparator
            </h3>
            <p className="text-xs text-slate-500">
              Select any two catalog products to see the exact token-by-token multiplication that produces their Cosine Similarity score.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">
            <span>Dot Product: {dotProductSum.toFixed(4)}</span>
            <span>&bull;</span>
            <span>{(dotProductSum * 100).toFixed(1)}% Match</span>
          </div>
        </div>

        {/* Product Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Vector A (Seed Product):
            </label>
            <select
              value={selectedProductA}
              onChange={(e) => setSelectedProductA(e.target.value)}
              className="w-full text-xs font-medium p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
            >
              {products.map(p => (
                <option key={p.product_id} value={p.product_id}>
                  [{p.category}] {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Vector B (Candidate Product):
            </label>
            <select
              value={selectedProductB}
              onChange={(e) => setSelectedProductB(e.target.value)}
              className="w-full text-xs font-medium p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
            >
              {products.map(p => (
                <option key={p.product_id} value={p.product_id}>
                  [{p.category}] {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Shared Token Dot Products Table */}
        <div className="mt-4">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Shared Vocabulary Tokens Contributing to Cosine Similarity ({sharedTokens.length} terms):
          </div>

          {sharedTokens.length === 0 ? (
            <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
              Vectors A and B are orthogonal in TF-IDF space (no shared vocabulary tokens after stopword filtering). Cosine similarity = 0.000.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-2 px-3">Shared Feature Token</th>
                    <th className="py-2 px-3">Weight in Vector A (u_k)</th>
                    <th className="py-2 px-3">Weight in Vector B (v_k)</th>
                    <th className="py-2 px-3">Contribution (u_k · v_k)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {sharedTokens.map((item, idx) => (
                    <tr key={idx} className={idx < 3 ? 'bg-blue-50/30' : ''}>
                      <td className="py-2 px-3 font-sans font-semibold text-slate-800">
                        {item.term}
                      </td>
                      <td className="py-2 px-3 text-slate-600">{item.weightA.toFixed(4)}</td>
                      <td className="py-2 px-3 text-slate-600">{item.weightB.toFixed(4)}</td>
                      <td className="py-2 px-3 font-bold text-blue-700">+{item.product.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
