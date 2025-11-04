#!/usr/bin/env python3
"""
AEON Infinity Setup Script
Helps users configure their OpenRouter API key
"""

import os
from pathlib import Path

def setup_api_key():
    """Interactive setup for OpenRouter API key"""
    print("🌌 AEON Infinity Setup")
    print("=" * 40)
    print()

    env_file = Path(".env")

    if env_file.exists():
        print("📁 Found existing .env file")
        with open(env_file, 'r') as f:
            content = f.read()

        if "your_openrouter_api_key_here" in content:
            print("⚠️  API key not configured yet")
        else:
            print("✅ API key appears to be configured")
            print("If you're still getting errors, please check your API key is valid.")
            return
    else:
        print("📁 Creating new .env file")

    print()
    print("🔑 To get your OpenRouter API key:")
    print("1. Go to https://openrouter.ai/keys")
    print("2. Sign up for a free account")
    print("3. Create a new API key")
    print("4. Copy the key (it starts with 'sk-or-v1-')")
    print()

    api_key = input("🔐 Enter your OpenRouter API key (or press Enter to skip): ").strip()

    if api_key:
        if not api_key.startswith("sk-or-v1-"):
            print("⚠️  Warning: API key should start with 'sk-or-v1-'")
            confirm = input("Continue anyway? (y/N): ").strip().lower()
            if confirm != 'y':
                print("❌ Setup cancelled")
                return

        # Update .env file
        env_content = f"""# AEON Infinity (Infinity Intelligence) Environment Configuration
# Created by Apratim Mrinal

# OpenRouter API Configuration
OPENROUTER_API_KEY={api_key}

# Flask Configuration
FLASK_ENV=development
PORT=5000
SECRET_KEY=aeon-infinity-secret-key-change-in-production

# Application Configuration
DEBUG=True
MEMORY_LIMIT=20
"""

        with open(env_file, 'w') as f:
            f.write(env_content)

        print("✅ API key saved to .env file")
        print("🚀 You can now run: python app.py")
    else:
        print("❌ No API key provided")
        print("The app will run but AI responses won't work until you add an API key")
        print("Edit the .env file manually to add your API key later")

    print()
    print("💡 Need help? Visit: https://openrouter.ai/docs")

if __name__ == "__main__":
    setup_api_key()