import os, jwt
from datetime import datetime, timedelta

SECRET = os.getenv("DRM_SECRET", "change-me")

def generate_token(user_id="demo", subscription_tier="premium"):
    payload = {
        "user_id": user_id,
        "subscription_tier": subscription_tier,
        "exp": datetime.utcnow() + timedelta(hours=2),
        "iat": datetime.utcnow(),
        "iss": "mini-lab-drm"
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")

if __name__ == "__main__":
    print(generate_token())
