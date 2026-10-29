import React from 'react';
import { EDAMetrics } from '../types';
import { BarChart3, TrendingUp, Layers, CheckCircle2, DollarSign, FileText, PieChart, ShieldAlert } from 'lucide-react';

interface EDAViewProps {
  edaMetrics: EDAMetrics;
  datasetSource: string;
}

export const EDAView: React.FC<EDAViewProps> = ({ edaMetrics, datasetSource }) => {
  const { total_products, category_distribution, price_metrics, text_metrics, cleaning_audit } = edaMetrics;

  const maxCategoryCount = Math.max(...Object.values(category_distribution));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Pandas & NumPy Descriptive Analysis</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Exploratory Data Analysis (EDA) Dashboard
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Automated data inspection, distribution profiling, missing value audits, and feature engineering metrics.
            </p>
          </div>

          <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <span className="text-slate-500 font-medium">Underlying Ingestion:</span>
            <div className="font-bold text-slate-800 truncate max-w-[260px]">{datasetSource}</div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Cleaned Catalog</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">
            {total_products}
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{cleaning_audit.duplicates_removed} duplicates dropped</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Average Price (Mean)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">
            ${price_metrics.mean.toFixed(2)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Median: <strong>${price_metrics.median.toFixed(2)}</strong> (IQR: ${price_metrics.q75 - price_metrics.q25})
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Categories</span>
            <PieChart className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">
            {edaMetrics.categories_count}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Spread across {edaMetrics.brands_count} distinctive brands
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Avg Description Words</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">
            {text_metrics.mean_word_count}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Range: {text_metrics.min_word_count} - {text_metrics.max_word_count} tokens
          </div>
        </div>
      </div>

      {/* Main EDA Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Category Distribution</h3>
                <p className="text-xs text-slate-500">Frequency of products classified per high-level domain.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700">
                Frequency (count)
              </span>
            </div>

            <div className="space-y-3.5 mt-4">
              {Object.entries(category_distribution).map(([cat, count]) => {
                const pct = Math.round((count / total_products) * 100);
                const barWidth = Math.round((count / maxCategoryCount) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{cat}</span>
                      <span className="text-slate-500 font-mono">
                        {count} items ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Balanced multi-class distribution for cold-start testing</span>
            <span className="font-mono text-slate-400">N={total_products}</span>
          </div>
        </div>

        {/* Five-Number Price Summary & Quartile Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Price Distribution & Quartiles</h3>
                <p className="text-xs text-slate-500">Five-number summary computed via NumPy quantiles.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700">
                USD ($)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Statistic</th>
                    <th className="py-2.5 px-3">Value</th>
                    <th className="py-2.5 px-3">Analytical Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-2 px-3 text-slate-700 font-semibold">Minimum</td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">${price_metrics.min.toFixed(2)}</td>
                    <td className="py-2 px-3 text-slate-500">Floor budget accessories</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-700 font-semibold">25th Percentile (Q1)</td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">${price_metrics.q25.toFixed(2)}</td>
                    <td className="py-2 px-3 text-slate-500">25% of catalog falls below this value</td>
                  </tr>
                  <tr className="bg-blue-50/40">
                    <td className="py-2 px-3 text-blue-900 font-bold">Median (Q2)</td>
                    <td className="py-2 px-3 font-mono font-extrabold text-blue-700">${price_metrics.median.toFixed(2)}</td>
                    <td className="py-2 px-3 text-blue-700 font-semibold">Resistant measure of central tendency</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-700 font-semibold">75th Percentile (Q3)</td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">${price_metrics.q75.toFixed(2)}</td>
                    <td className="py-2 px-3 text-slate-500">75% of items are under this threshold</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-700 font-semibold">Maximum</td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">${price_metrics.max.toFixed(2)}</td>
                    <td className="py-2 px-3 text-slate-500">Premium flagship devices</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-700 font-semibold">Standard Deviation</td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">${price_metrics.std.toFixed(2)}</td>
                    <td className="py-2 px-3 text-slate-500">High dispersion reflecting luxury vs entry tier</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual Box-plot representation */}
          <div className="mt-5 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1">
              <span>Min: ${price_metrics.min}</span>
              <span className="font-bold text-blue-700">Median: ${price_metrics.median}</span>
              <span>Max: ${price_metrics.max}</span>
            </div>
            <div className="relative w-full h-4 bg-slate-200 rounded-full flex items-center">
              <div
                className="absolute h-full bg-blue-500/40 rounded-full border border-blue-600"
                style={{
                  left: `${(price_metrics.q25 / price_metrics.max) * 100}%`,
                  width: `${((price_metrics.q75 - price_metrics.q25) / price_metrics.max) * 100}%`
                }}
              />
              <div
                className="absolute w-2 h-6 bg-blue-700 rounded-sm -top-1"
                style={{ left: `${(price_metrics.median / price_metrics.max) * 100}%` }}
                title={`Median: $${price_metrics.median}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preprocessing & Feature Engineering Audit Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="w-4 h-4 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">
            Data Preprocessing & Feature Engineering Pipeline
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Automated cleaning rules executed in <code>preprocessor.py</code> before fitting the Scikit-learn TF-IDF model.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">1. Deduplication & Sanitization</span>
            <p className="text-slate-600 leading-relaxed">
              Scanned for identical titles and product keys. Dropped {cleaning_audit.duplicates_removed} duplicate records
              and reset dataframe indices.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">2. Missing Value Imputation</span>
            <p className="text-slate-600 leading-relaxed">
              Checked 5 columns: missing titles imputed with placeholder, missing prices imputed with median $29.99,
              and empty descriptions populated with title text.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">3. Feature Weighting Concatenation</span>
            <p className="text-slate-600 leading-relaxed">
              Engineered <code>combined_features</code>: Title (2x weight) + Category (2x weight) + Brand (1x) +
              Description (1x) to emphasize product intent over generic adjectives.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
