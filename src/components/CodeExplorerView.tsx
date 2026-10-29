import React, { useState } from 'react';
import { PROJECT_CODE_FILES, CodeFile } from '../data/codeFiles';
import { FolderTree, Copy, Check, FileCode, Terminal, Download, FileText, CheckCircle2 } from 'lucide-react';

export const CodeExplorerView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(PROJECT_CODE_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
              <FileCode className="w-3.5 h-3.5" />
              <span>GitHub-Ready Python Codebase</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Project Source Code & VS Code Setup
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Complete, self-contained Python scripts for dataset discovery, Scikit-learn TF-IDF modeling, Flask API, and evaluation.
            </p>
          </div>

          <button
            onClick={handleDownloadFile}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download {selectedFile.name}</span>
          </button>
        </div>
      </div>

      {/* VS Code Quickstart Guide */}
      <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 text-slate-100 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
            Quickstart: How to Run in VS Code (5 Simple Commands)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 space-y-2">
            <div className="text-slate-400 text-[11px] font-sans font-semibold">1. Create Environment & Install</div>
            <div className="text-emerald-300">python -m venv venv</div>
            <div className="text-emerald-300">source venv/bin/activate  # On Windows: venv\Scripts\activate</div>
            <div className="text-emerald-300">pip install -r requirements.txt</div>
          </div>

          <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 space-y-2">
            <div className="text-slate-400 text-[11px] font-sans font-semibold">2. Run Pipeline & Start Flask</div>
            <div className="text-amber-300"># Run standalone training & evaluation metrics</div>
            <div className="text-emerald-300">python train_and_evaluate.py</div>
            <div className="text-amber-300"># Start interactive Flask web server</div>
            <div className="text-emerald-300">python app.py</div>
          </div>
        </div>
      </div>

      {/* Code Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Folder Tree & File Selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              <FolderTree className="w-4 h-4 text-blue-600" />
              <span>Project Folder Architecture</span>
            </div>

            <div className="font-mono text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 whitespace-pre leading-relaxed overflow-x-auto">
{`smartcart_ai/
├── data/
│   ├── sample_products.csv
│   └── cached_products.csv
├── templates/
│   ├── base.html
│   ├── index.html
│   ├── eda.html
│   └── evaluation.html
├── static/
│   ├── css/style.css
│   └── js/main.js
├── dataset_loader.py
├── preprocessor.py
├── recommender.py
├── evaluator.py
├── train_and_evaluate.py
├── app.py
├── requirements.txt
└── README.md`}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Python Source File:
            </div>
            <div className="space-y-1">
              {PROJECT_CODE_FILES.map((file) => {
                const isSelected = selectedFile.name === file.name;
                return (
                  <button
                    key={file.name}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {file.language}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Code Viewer */}
        <div className="lg:col-span-8">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md overflow-hidden flex flex-col h-full min-h-[500px]">
            {/* Viewer Header */}
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5 mr-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="font-mono text-xs font-semibold text-slate-200">
                  {selectedFile.path}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer border border-slate-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Description bar */}
            <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>{selectedFile.description}</span>
            </div>

            {/* Code Body */}
            <div className="p-4 overflow-x-auto font-mono text-xs text-slate-200 leading-relaxed flex-1">
              <pre className="whitespace-pre">
                {selectedFile.content}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
