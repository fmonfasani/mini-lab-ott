from flask import Flask, request, jsonify
import os, json, base64
import jwt
from datetime import datetime, timedelta
from prometheus_client import Counter, generate_latest, CONTENT_TYPE_LATEST

app = Flask(__name__)
SECRET = os.getenv("DRM_SECRET", "change-me")

VALID_CONTENT = {
    "video_123": {"title": "Premium Movie", "tier_required": "premium"},
    "video_456": {"title": "Basic Show", "tier_required": "basic"}
}

REQS = Counter("drm_license_requests_total", "DRM license requests", ["status"])

@app.route("/api/health", methods=["GET"])
def health():
    return {"status": "ok"}, 200

@app.route("/metrics")
def metrics():
    return generate_latest(), 200, {"Content-Type": CONTENT_TYPE_LATEST}

@app.route("/api/token", methods=["POST"])
def token():
    data = request.get_json(force=True) or {}
    user_id = data.get("user_id", "demo")
    tier = data.get("subscription_tier", "basic")
    payload = {
        "user_id": user_id,
        "subscription_tier": tier,
        "exp": datetime.utcnow() + timedelta(hours=2),
        "iat": datetime.utcnow(),
        "iss": "mini-lab-drm"
    }
    tok = jwt.encode(payload, SECRET, algorithm="HS256")
    return {"token": tok}

@app.route("/api/drm/license", methods=["POST"])
def license():
    try:
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            REQS.labels(status="HTTP_401").inc()
            return jsonify({"error": "Missing token"}), 401

        token = auth.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])

        data = request.get_json(force=True) or {}
        video_id = data.get("videoId")
        if video_id not in VALID_CONTENT:
            REQS.labels(status="HTTP_404").inc()
            return jsonify({"error": "Content not found"}), 404

        required = VALID_CONTENT[video_id]["tier_required"]
        if payload.get("subscription_tier") not in (required, "premium"):
            REQS.labels(status="HTTP_403").inc()
            return jsonify({"error": "Insufficient subscription"}), 403

        lic = {
            "user_id": payload["user_id"],
            "video_id": video_id,
            "expires": (datetime.utcnow() + timedelta(hours=24)).isoformat() + "Z",
            "playback_allowed": True
        }
        lic_b64 = base64.b64encode(json.dumps(lic).encode()).decode()
        REQS.labels(status="HTTP_200").inc()
        return jsonify({"licenseKey": lic_b64, "expires": lic["expires"]}), 200

    except jwt.ExpiredSignatureError:
        REQS.labels(status="HTTP_401").inc()
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        REQS.labels(status="HTTP_401").inc()
        return jsonify({"error": "Invalid token"}), 401
    except Exception as e:
        REQS.labels(status="HTTP_500").inc()
        return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
