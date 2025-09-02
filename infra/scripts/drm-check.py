#!/usr/bin/env python3
import os, requests, json

DRM = os.getenv("DRM_URL", "http://localhost:5000")

def main():
    r = requests.post(f"{DRM}/api/token", json={"user_id": "u1", "subscription_tier": "premium"})
    r.raise_for_status()
    token = r.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.post(f"{DRM}/api/drm/license", headers=headers, json={"videoId": "video_123"})
    print("Status:", r.status_code)
    print("Body:", r.text)

if __name__ == "__main__":
    main()
