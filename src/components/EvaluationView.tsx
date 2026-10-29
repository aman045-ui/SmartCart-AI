import React from 'react';
import { EvaluationResults, ModelSummary } from '../types';
import { Target, CheckCircle2, ShieldCheck, HelpCircle, Layers, Sparkles, Scale, Info } from 'lucide-react';

interface EvaluationViewProps {
  evaluation: EvaluationResults;
  modelSummary: ModelSummary;
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({ evaluation, modelSummary }) => {
  const { metrics, qualitative_cases, scientific_disclaimer } = evaluation;

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Scientific ML Evaluation</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Recommendation Quality & Proxy Ground Truth Audit
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Rigorous quantitative metrics (Precision@5, Recall@5, Catalog Coverage, Diversity) and qualitative spot checks.
            </p>
          </div>

          <div className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-700">
            K = 5 Recommendations Evaluated
          </div>
        </div>
      </div>

      {/* Critical Data Science Ethics Callout */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 sm:p-5 flex gap-3.5 items-start">
        <Scale className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-amber-900 space-y-1">
          <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
            <span>Data Science Integrity: Why Cosine Similarity ≠ Accuracy</span>
          </h4>
          <p className="text-amber-800 leading-relaxed">
            {scientific_disclaimer}
          </p>
          <div className="pt-1 text-xs text-amber-700 font-medium">
            <strong>Methodology Standard:</strong> In absence of live user interaction logs, academic & industry practice establishes
            taxonomy matching (Category & Subcategory alignment) as an empirical proxy for recommendation relevance.
          </div>
        </div>
      </div>

      {/* Evaluation KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Precision@5 Category */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Precision@5 (Category)</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">
            {(metrics.precision_at_k_category * 100).toFixed(1)}%
          </div>
          <p className="mt-1 text-xs text-slate-500">
            ~{(metrics.precision_at_k_category * 5).toFixed(1)} of 5 recommended items match the seed product's high-level department.
          </p>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${metrics.precision_at_k_category * 100}%` }}
            />
          </div>
        </div>

        {/* Precision@5 Subcategory */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Precision@5 (Subcategory)</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">
            {(metrics.precision_at_k_subcategory * 100).toFixed(1)}%
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Strict domain alignment (e.g. Headphones recommended for Headphones, Cookware for Cookware).
          </p>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full"
              style={{ width: `${metrics.precision_at_k_subcategory * 100}%` }}
            />
          </div>
        </div>

        {/* Catalog Coverage */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Catalog Coverage</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">
            {metrics.catalog_coverage_percentage}%
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Fraction of total catalog items recommended at least once across all seed queries (guards against popularity bias).
          </p>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full"
              style={{ width: `${metrics.catalog_coverage_percentage}%` }}
            />
          </div>
        </div>

        {/* Intra-List Diversity */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Intra-List Diversity (ILD)</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">
            {(metrics.intra_list_diversity_score * 100).toFixed(1)}%
          </div>
          <p className="mt-1 text-xs text-slate-500">
            1 minus average pairwise similarity within each top-5 list, ensuring recommendations offer genuine choice.
          </p>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full"
              style={{ width: `${metrics.intra_list_diversity_score * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Qualitative Validation Cases */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Qualitative Recommendation Spot-Checks</h3>
            <p className="text-xs text-slate-500">
              Examining top recommendations and overlapping TF-IDF keywords for representative seed items.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700">
            Manual Verification
          </span>
        </div>

        <div className="space-y-4">
          {qualitative_cases.map((testCase, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                <span className="text-sm font-bold text-slate-800">
                  Seed Test Item: <span className="text-blue-700">{testCase.seed_product}</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                  {testCase.relevance_verdict}
                </span>
              </div>

              <div className="mt-3">
                <div className="text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Top Recommended Items & Trigger Keywords:
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                  {testCase.top_recommendations.map((recText, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{recText}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evaluation Methodology Detailed Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Evaluation Metrics Glossary (For Internship Vivas & Technical Interviews)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Metric Name</th>
                <th className="py-2.5 px-3">Mathematical Definition</th>
                <th className="py-2.5 px-3">Why It Matters in SmartCart AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Precision@K (K=5)</td>
                <td className="py-2.5 px-3 font-mono text-slate-600">|Rel ∩ Rec(K)| / K</td>
                <td className="py-2.5 px-3 text-slate-600">
                  Measures how many of the 5 recommendations are actually relevant to the seed product's category.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Recall@K (K=5)</td>
                <td className="py-2.5 px-3 font-mono text-slate-600">|Rel ∩ Rec(K)| / |Total Catalog Rel|</td>
                <td className="py-2.5 px-3 text-slate-600">
                  Measures what portion of total relevant catalog items are captured in the top-5 recommendation window.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Catalog Coverage (%)</td>
                <td className="py-2.5 px-3 font-mono text-slate-600">|Unique Recommended Items| / |Catalog|</td>
                <td className="py-2.5 px-3 text-slate-600">
                  Guarantees that the algorithm explores diverse catalog products rather than repeatedly suggesting only the 2 most generic items.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Intra-List Diversity (ILD)</td>
                <td className="py-2.5 px-3 font-mono text-slate-600">1 - (2 / (K(K-1))) Σ sim(i, j)</td>
                <td className="py-2.5 px-3 text-slate-600">
                  Prevents "filter bubbles" where the 5 recommended items are clone replicas of each other with zero variance.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
