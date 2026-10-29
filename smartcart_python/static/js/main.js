// SmartCart AI - Frontend Interactivity
document.addEventListener("DOMContentLoaded", () => {
    const catalogGrid = document.getElementById("catalogGrid");
    const productCountEl = document.getElementById("productCount");
    const searchInput = document.getElementById("searchInput");
    const categorySelect = document.getElementById("categorySelect");
    const recSection = document.getElementById("recommendationSection");
    const targetProductTitle = document.getElementById("targetProductTitle");
    const targetProductDetails = document.getElementById("targetProductDetails");
    const recommendationsGrid = document.getElementById("recommendationsGrid");
    const closeRecBtn = document.getElementById("closeRecBtn");

    if (!catalogGrid) return;

    let debounceTimer = null;

    function fetchProducts() {
        const query = searchInput ? searchInput.value.trim() : "";
        const category = categorySelect ? categorySelect.value : "all";

        const url = `/api/products?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`;
        
        catalogGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #64748b;">Filtering products...</div>`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                const products = data.products || [];
                if (productCountEl) productCountEl.textContent = products.length;

                if (products.length === 0) {
                    catalogGrid.innerHTML = `
                        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: #fff; border-radius: 8px; border: 1px dashed #cbd5e1;">
                            <p style="color: #64748b; font-weight: 500;">No products match your criteria.</p>
                            <button onclick="resetFilters()" style="margin-top: 0.5rem; padding: 0.35rem 0.8rem; background: #2563eb; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Reset Search</button>
                        </div>
                    `;
                    return;
                }

                catalogGrid.innerHTML = products.map(p => `
                    <div class="product-card" data-id="${p.product_id}">
                        <div>
                            <div class="card-category">${p.category} &bull; ${p.brand || 'Item'}</div>
                            <h4 class="card-title">${p.title}</h4>
                            <p class="card-desc">${p.description}</p>
                        </div>
                        <div class="card-footer">
                            <span class="card-price">$${parseFloat(p.price).toFixed(2)}</span>
                            <button class="btn-recommend" onclick="getRecommendations('${p.product_id}')">
                                Get ML Recs &rarr;
                            </button>
                        </div>
                    </div>
                `).join("");
            })
            .catch(err => {
                catalogGrid.innerHTML = `<div style="grid-column: 1/-1; color: #dc2626; padding: 1rem;">Failed to load catalog: ${err.message}</div>`;
            });
    }

    window.getRecommendations = function(productId) {
        if (!recSection) return;

        recSection.style.display = "block";
        recSection.scrollIntoView({ behavior: "smooth", block: "start" });
        recommendationsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #64748b;">Calculating Cosine Similarities via TF-IDF...</div>`;

        fetch(`/api/recommend/${productId}`)
            .then(res => res.json())
            .then(data => {
                if (!data.success) {
                    recommendationsGrid.innerHTML = `<div style="grid-column: 1/-1; color: #dc2626;">Error: ${data.error}</div>`;
                    return;
                }

                const query = data.query_product;
                if (targetProductTitle) targetProductTitle.textContent = query.title;
                if (targetProductDetails) {
                    targetProductDetails.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                            <div>
                                <strong style="font-size: 1.1rem; color: #1e293b;">${query.title}</strong>
                                <div style="font-size: 0.85rem; color: #64748b; margin-top: 0.2rem;">
                                    Category: <strong>${query.category}</strong> | Brand: <strong>${query.brand}</strong> | Price: <strong>$${query.price.toFixed(2)}</strong>
                                </div>
                            </div>
                            <span style="font-size: 0.82rem; background: #e0f2fe; color: #0369a1; padding: 0.25rem 0.6rem; border-radius: 4px; font-weight: 600;">
                                Query Seed Product
                            </span>
                        </div>
                    `;
                }

                const recs = data.recommendations || [];
                if (recs.length === 0) {
                    recommendationsGrid.innerHTML = `<div style="grid-column: 1/-1; color: #64748b;">No similar items found above threshold.</div>`;
                    return;
                }

                recommendationsGrid.innerHTML = recs.map((r, i) => `
                    <div class="rec-card">
                        <div>
                            <div class="rec-similarity-badge">#${i + 1} &bull; ${r.similarity_percentage}% Match</div>
                            <div style="font-size: 0.72rem; color: #2563eb; font-weight: 600; text-transform: uppercase;">${r.category}</div>
                            <h4 style="font-size: 0.9rem; margin: 0.3rem 0; color: #0f172a;">${r.title}</h4>
                            <p style="font-size: 0.78rem; color: #64748b; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${r.description}</p>
                            <div class="rec-keywords">
                                <div style="font-size: 0.68rem; font-weight: 600; color: #475569; margin-bottom: 0.2rem;">Shared Feature Tokens:</div>
                                ${r.explanation_terms.map(t => `<span>${t}</span>`).join("")}
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.8rem; padding-top: 0.5rem; border-top: 1px solid #f1f5f9;">
                            <strong style="color: #0f172a; font-size: 1rem;">$${r.price.toFixed(2)}</strong>
                            <button onclick="getRecommendations('${r.product_id}')" style="background: none; border: 1px solid #cbd5e1; border-radius: 4px; padding: 0.2rem 0.5rem; font-size: 0.72rem; cursor: pointer; color: #2563eb;">
                                Re-pivot &rarr;
                            </button>
                        </div>
                    </div>
                `).join("");
            })
            .catch(err => {
                recommendationsGrid.innerHTML = `<div style="grid-column: 1/-1; color: #dc2626;">Recommendation failed: ${err.message}</div>`;
            });
    };

    window.resetFilters = function() {
        if (searchInput) searchInput.value = "";
        if (categorySelect) categorySelect.value = "all";
        fetchProducts();
    };

    if (closeRecBtn) {
        closeRecBtn.addEventListener("click", () => {
            recSection.style.display = "none";
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(fetchProducts, 250);
        });
    }

    if (categorySelect) {
        categorySelect.addEventListener("change", fetchProducts);
    }

    // Initial load
    fetchProducts();
});
