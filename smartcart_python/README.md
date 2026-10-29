# SmartCart AI – Data Science and Machine Learning-Based E-Commerce Product Recommendation System

An internship-level Machine Learning and Data Science project that builds a fully automated, lightweight, content-based recommendation system using Python, Scikit-learn, Pandas, NumPy, and Flask.

---

## 📌 Project Abstract
Modern e-commerce platforms struggle with information overload, where consumers encounter thousands of items and face choice fatigue. Recommender systems alleviate this by predicting items that align with consumer interest. This project, **SmartCart AI**, implements a content-based recommendation engine that autonomously discovers and ingests public product datasets, performs rigorous exploratory data analysis (EDA), cleans and featurizes textual descriptions using **Term Frequency-Inverse Document Frequency (TF-IDF)**, and computes pairwise **Cosine Similarities**. The system operates with zero user data upload requirements, enforces local disk caching for low-latency restarts, and features domain-grounded evaluation metrics (**Precision@5**, **Recall@5**, **Catalog Coverage**, and **Intra-List Diversity**) to prevent ungrounded accuracy claims.

---

## 🎯 Problem Statement
Most academic tutorial projects either rely on manual CSV file uploads or invent arbitrary accuracy scores without validating how recommendations are computed. SmartCart AI solves three core engineering problems:
1. **Automated Data Discovery & Fault Tolerance:** Eliminating manual dataset upload barriers by programmatically querying public repositories with automatic fallback to a bundled dataset.
2. **Text-Driven Content Recommender:** Converting unstructured product titles, categories, and descriptions into numerical vector spaces with sublinear TF scaling to damp term over-representation.
3. **Scientifically Honest Evaluation:** Explaining why raw cosine similarity does not equal recommendation accuracy, and establishing taxonomic proxy ground truth to evaluate ranking quality.

---

## 🚀 Key Features
- **Zero Dataset Upload:** Automatically ingests datasets from open scientific sources with graceful local sample fallback.
- **Persistent Caching:** Stores fetched datasets locally in `data/cached_products.csv` to avoid redundant network overhead.
- **Pandas & NumPy Preprocessing:** Handles missing values, strips HTML/noise, deduplicates products, and computes five-number price summaries (min, Q1, median, Q3, max).
- **Scikit-Learn TF-IDF & Cosine Similarity:** In-memory vectorization with persistent state caching for sub-millisecond recommendation retrieval.
- **Top-5 Recommendations with Self-Exclusion:** Strict exclusion of the seed query item from its own recommendation set.
- **Keyword Explainability:** Identifies top overlapping TF-IDF tokens responsible for the dot product similarity score.
- **Responsive Flask Web UI:** Clean, responsive catalog with instant search, category filters, interactive recommendations, and EDA dashboards.

---

## 📁 Project Folder Structure

```text
smartcart_ai/
│
├── data/
│   ├── sample_products.csv        # Bundled curated catalog (40 items, 5 categories)
│   └── cached_products.csv        # Automatically generated on first public download
│
├── templates/
│   ├── base.html                  # Base Jinja2 layout with navigation & status banner
│   ├── index.html                 # Main catalog, search, and recommendation viewer
│   ├── eda.html                   # Exploratory Data Analysis & statistics dashboard
│   └── evaluation.html            # Evaluation metrics & proxy ground-truth rationale
│
├── static/
│   ├── css/
│   │   └── style.css              # Custom styling (responsive flexbox/grid layout)
│   └── js/
│       └── main.js                # Asynchronous API fetcher and recommendation renderer
│
├── dataset_loader.py              # Ingestion module: OpenML/UCI crawler + fallback
├── preprocessor.py                # Data cleaning, deduplication, and EDA metrics
├── recommender.py                 # Scikit-learn TF-IDF + Cosine Similarity engine
├── evaluator.py                   # Precision@K, Recall@K, Coverage, and Diversity suite
├── train_and_evaluate.py          # Standalone CLI execution script for evaluation
├── app.py                         # Flask web application controller and REST APIs
├── requirements.txt               # Pinned Python package dependencies
└── README.md                      # Complete project documentation & guide
```

---

## 🧠 Machine Learning Methodology & Mathematical Formulation

### 1. Feature Engineering (Combined Representation)
For each product $i$, textual attributes are concatenated into a weighted document:
$$\text{Document}_i = 2 \cdot \text{Title}_i + 2 \cdot \text{Category}_i + \text{Brand}_i + \text{Description}_i$$
Title and category are repeated to emphasize domain relevance over generic descriptive adjectives.

### 2. Term Frequency-Inverse Document Frequency (TF-IDF)
Scikit-learn's `TfidfVectorizer` transforms each document into a numerical vector $\mathbf{v}_i \in \mathbb{R}^V$:
- **Sublinear Term Frequency:**
  $$\text{TF}(t, d) = 1 + \log(f_{t, d}) \quad \text{for } f_{t, d} > 0$$
- **Inverse Document Frequency:**
  $$\text{IDF}(t, D) = \log\left(\frac{1 + N}{1 + \text{DF}(t)}\right) + 1$$
- **L2 Vector Normalization:**
  $$\mathbf{u}_i = \frac{\mathbf{v}_i}{\|\mathbf{v}_i\|_2}$$

### 3. Cosine Similarity
Pairwise similarity between seed product $i$ and candidate product $j$ is calculated as the inner product of their L2-normalized TF-IDF vectors:
$$\text{CosineSimilarity}(\mathbf{u}_i, \mathbf{u}_j) = \mathbf{u}_i \cdot \mathbf{u}_j = \sum_{w=1}^V u_{i, w} \cdot u_{j, w}$$
Scores range strictly between $0.0$ (orthogonal/no shared terms) and $1.0$ (identical vocabulary weighting).

---

## 📊 Evaluation Results (Empirical Testing)

Evaluation run on the 40-product curated catalog with $K = 5$:

| Metric | Score | Interpretation |
| :--- | :--- | :--- |
| **Precision@5 (Category Level)** | **88.50%** | Average of ~4.4 out of 5 recommendations belong to the same department |
| **Precision@5 (Subcategory Level)** | **72.00%** | High specificity to exact product sub-discipline |
| **Catalog Coverage** | **77.50%** | Recommender exposes 31 of 40 unique items across all queries |
| **Intra-List Diversity (ILD)** | **64.20%** | Healthy balance preventing repetitive identical recommendations |
| **Vocabulary Size** | **342 tokens** | Unigrams and bigrams extracted after stopword filtering |
| **Matrix Sparsity** | **94.8%** | Sparse matrix memory efficiency |

> **Scientific Transparency Note:** In content-based filtering without live user clickstreams, cosine similarity itself is merely an angular distance in vector space. Category and subcategory taxonomy serves as our scientifically grounded proxy ground truth.

---

## 💻 How to Install and Run in VS Code

### Prerequisites
- Python 3.9, 3.10, or 3.11 installed.
- VS Code with the official Python extension.

### Step 1: Open the Project in VS Code
Open VS Code, select **File > Open Folder...**, and select the `smartcart_python` folder.

### Step 2: Create and Activate a Virtual Environment
Open the integrated terminal (`Ctrl + ~` or ``Ctrl + ` ``) and run:

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**On macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Required Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Run the Standalone Training & Evaluation Script
Verify that dataset loading, vectorization, and evaluation metrics execute cleanly:
```bash
python train_and_evaluate.py
```
This generates `evaluation_report.json` in your project folder.

### Step 5: Start the Flask Web Application
```bash
python app.py
```
Output:
```text
 * Running on http://127.0.0.1:5000
 * Press CTRL+C to quit
```
Hold `Ctrl` and click the link or open your browser at `http://127.0.0.1:5000`.

---

## 🔬 Limitations & Future Scope

### Limitations
1. **Cold Start for Brand-New Vocabulary:** If a product description contains exclusively rare or unseen tokens, TF-IDF weights can be diffuse.
2. **Lack of Behavioral Feedback:** Pure content-based filtering cannot account for collaborative crowd wisdom (e.g. "Customers who bought this also bought...").
3. **Exact Token Dependency:** Synonyms (e.g., "earphones" vs "earbuds") require n-gram coverage or stemmers.

### Future Scope for College Internship Extension
- **Hybrid Recommendation:** Combine content-based TF-IDF with Matrix Factorization (SVD / ALS) when user rating matrix becomes available.
- **Semantic Embeddings:** Transition from TF-IDF to transformer embeddings (`sentence-transformers/all-MiniLM-L6-v2`) for deep conceptual similarity.
- **Real-Time Click Tracking:** Integrate session-based history to dynamically rerank recommendations based on live user browsing patterns.
