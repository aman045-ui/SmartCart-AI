"""
app.py
SmartCart AI - Flask Application Controller with User Profile & History-Driven ML Recommendations
"""

import os
from flask import Flask, render_template, request, jsonify
from dataset_loader import load_dataset
from preprocessor import preprocess_data
from recommender import ContentBasedRecommender
from evaluator import RecommenderEvaluator

app = Flask(__name__)

# Global state
RAW_DATASET_META = {}
CLEANING_REPORT = {}
EDA_STATS = {}
CLEANED_DF = None
RECOMMENDER = ContentBasedRecommender()
EVALUATION_RESULTS = {}

# 5 Pre-loaded Demo User Profiles (Not database dependent - perfect for internship demo)
MOCK_USERS = [
    {
        "id": "user-01",
        "name": "Alex Rivera",
        "persona": "Audiophile & Software Engineer",
        "badge": "Tech & Audio Pro",
        "email": "alex.rivera@techdev.io",
        "cart_items": ["101", "106"], # Sony ANC Headphones, Logitech MX Master
        "search_history": ["noise canceling headphones", "mechanical keyboard tactile", "4k usb-c hub monitor"]
    },
    {
        "id": "user-02",
        "name": "Chef Samantha Reed",
        "persona": "Home Cook & Specialty Barista",
        "badge": "Culinary Connoisseur",
        "email": "samantha.kitchen@cuisines.org",
        "cart_items": ["115", "118"], # Instant Pot Duo, Breville Barista Espresso
        "search_history": ["air fryer dual basket", "cast iron pre-seasoned skillet", "single serve coffee pod maker"]
    },
    {
        "id": "user-03",
        "name": "Marcus Chen",
        "persona": "Marathon Runner & Strength Trainer",
        "badge": "Fitness Athlete",
        "email": "marcus.fit@athletelab.com",
        "cart_items": ["124", "137"], # Bowflex Dumbbells, Hydro Flask 32oz
        "search_history": ["gps running smartwatch amoled", "yoga non-slip alignment mat", "doorway pull up bar"]
    },
    {
        "id": "user-04",
        "name": "Elena Rostova",
        "persona": "Digital Nomad & Frequent Flyer",
        "badge": "Travel & Minimalism",
        "email": "elena.wander@nomadpulse.net",
        "cart_items": ["132", "134"], # Bellroy Backpack, Samsonite Luggage
        "search_history": ["rfid slim metal wallet", "power bank 24000mah 140w", "compact gan fast wall charger"]
    },
    {
        "id": "user-05",
        "name": "David Miller",
        "persona": "Competitive Esports & PC Modder",
        "badge": "Gaming Enthusiast",
        "email": "david.fps@esportshub.gg",
        "cart_items": ["111", "108"], # LG Gaming Monitor, Razer Mouse
        "search_history": ["mechanical keyboard rgb tenkeyless", "curved oled gaming monitor", "gaming headset"]
    }
]

def initialize_system(force_refresh=False):
    global RAW_DATASET_META, CLEANING_REPORT, EDA_STATS, CLEANED_DF, RECOMMENDER, EVALUATION_RESULTS
    raw_df, meta = load_dataset(force_refresh=force_refresh)
    RAW_DATASET_META = meta
    cleaned_df, report, eda = preprocess_data(raw_df)
    CLEANED_DF = cleaned_df
    CLEANING_REPORT = report
    EDA_STATS = eda

    recommender = ContentBasedRecommender()
    recommender.fit(cleaned_df)
    RECOMMENDER = recommender

    evaluator = RecommenderEvaluator(RECOMMENDER)
    EVALUATION_RESULTS = evaluator.evaluate_catalog(k=5)

initialize_system()

# ----------------- WEB ROUTES ----------------- #

@app.route("/")
def index():
    categories = sorted(CLEANED_DF["category"].unique().tolist())
    products_sample = CLEANED_DF.head(12).to_dict(orient="records")
    return render_template(
        "index.html",
        categories=categories,
        products=products_sample,
        dataset_meta=RAW_DATASET_META,
        model_meta=RECOMMENDER.get_model_summary(),
        mock_users=MOCK_USERS
    )

@app.route("/eda")
def eda_view():
    return render_template("eda.html", eda_stats=EDA_STATS, cleaning_report=CLEANING_REPORT, dataset_meta=RAW_DATASET_META)

@app.route("/evaluation")
def evaluation_view():
    return render_template("evaluation.html", evaluation=EVALUATION_RESULTS, model_meta=RECOMMENDER.get_model_summary())

# ----------------- REST API ENDPOINTS ----------------- #

@app.route("/api/products", methods=["GET"])
def api_products():
    query = request.args.get("q", "").lower().strip()
    category = request.args.get("category", "").strip()

    filtered = CLEANED_DF.copy()
    if category and category.lower() != "all":
        filtered = filtered[filtered["category"].str.lower() == category.lower()]

    if query:
        filtered = filtered[
            filtered["title"].str.lower().str.contains(query) |
            filtered["brand"].str.lower().str.contains(query) |
            filtered["description"].str.lower().str.contains(query)
        ]

    results = filtered[["product_id", "title", "category", "subcategory", "brand", "price", "rating", "description"]].to_dict(orient="records")
    return jsonify({"count": len(results), "products": results})

@app.route("/api/recommend/<product_id>", methods=["GET"])
def api_recommend(product_id):
    k = request.args.get("k", 5, type=int)
    return jsonify(RECOMMENDER.recommend(product_id, top_k=k))

@app.route("/api/recommend-query", methods=["GET"])
def api_recommend_query():
    query = request.args.get("q", "").strip()
    k = request.args.get("k", 5, type=int)
    recs = RECOMMENDER.recommend_for_query(query, top_k=k)
    return jsonify({"query": query, "recommendations": recs})

@app.route("/api/users", methods=["GET"])
def api_get_users():
    """Returns the 5 demo users with their pre-loaded cart and search history."""
    return jsonify({"users": MOCK_USERS})

@app.route("/api/user/<user_id>/recommendations", methods=["GET"])
def api_user_recommendations(user_id):
    """Generates personalized ML predictions based on user's cart & search history."""
    user = next((u for u in MOCK_USERS if u["id"] == user_id), None)
    if not user:
        return jsonify({"error": "User not found"}), 404

    live_query = request.args.get("live_q", "").strip()
    k = request.args.get("k", 5, type=int)

    recs = RECOMMENDER.recommend_for_user(
        cart_ids=user["cart_items"],
        search_queries=user["search_history"],
        live_query=live_query,
        top_k=k
    )

    return jsonify({
        "user_id": user["id"],
        "user_name": user["name"],
        "cart_items_count": len(user["cart_items"]),
        "search_history": user["search_history"],
        "recommendations": recs
    })

@app.route("/api/user/<user_id>/cart", methods=["POST"])
def api_user_add_cart(user_id):
    """Adds a product to the user's cart and returns updated recommendations."""
    user = next((u for u in MOCK_USERS if u["id"] == user_id), None)
    if not user:
        return jsonify({"error": "User not found"}), 404

    product_id = str(request.json.get("product_id"))
    if product_id not in user["cart_items"]:
        user["cart_items"].append(product_id)

    return jsonify({"message": "Cart updated", "cart_items": user["cart_items"]})

@app.route("/api/user/<user_id>/search", methods=["POST"])
def api_user_add_search(user_id):
    """Adds a query to the user's search history."""
    user = next((u for u in MOCK_USERS if u["id"] == user_id), None)
    if not user:
        return jsonify({"error": "User not found"}), 404

    query = request.json.get("query", "").strip()
    if query and query not in user["search_history"]:
        user["search_history"].insert(0, query)

    return jsonify({"message": "Search history updated", "search_history": user["search_history"]})

@app.route("/api/eda", methods=["GET"])
def api_eda():
    return jsonify({"dataset_meta": RAW_DATASET_META, "cleaning_report": CLEANING_REPORT, "eda_stats": EDA_STATS})

@app.route("/api/evaluation", methods=["GET"])
def api_evaluation():
    return jsonify(EVALUATION_RESULTS)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[SmartCart AI] Running Flask on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
