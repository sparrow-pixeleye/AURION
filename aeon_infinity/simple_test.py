#!/usr/bin/env python3

print("🧪 Starting AEON Infinity Debug Test...")

# Test 1: Check if basic imports work
try:
    import flask
    print("✅ Flask imported successfully")
except ImportError as e:
    print(f"❌ Flask import failed: {e}")
    exit(1)

try:
    import requests
    print("✅ Requests imported successfully")
except ImportError as e:
    print(f"❌ Requests import failed: {e}")
    exit(1)

try:
    from dotenv import load_dotenv
    print("✅ python-dotenv imported successfully")
except ImportError as e:
    print(f"❌ python-dotenv import failed: {e}")
    exit(1)

# Test 2: Check if utils.py can be imported
try:
    import utils
    print("✅ utils.py imported successfully")
except ImportError as e:
    print(f"❌ utils.py import failed: {e}")
    exit(1)

# Test 3: Check if utils functions work
try:
    from utils import detect_query_type, get_time_info
    result = detect_query_type("what time is it")
    print(f"✅ detect_query_type works: {result}")

    time_result = get_time_info("what time is it")
    print(f"✅ get_time_info works: {time_result[:50]}...")
except Exception as e:
    print(f"❌ utils functions failed: {e}")
    exit(1)

# Test 4: Check environment variables
import os
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv('OPENROUTER_API_KEY')
print(f"✅ Environment variables loaded")
print(f"   API Key configured: {'Yes' if api_key else 'No'}")
print(f"   API Key length: {len(api_key) if api_key else 0}")

print("\n🎉 All tests passed! The basic functionality should work.")
print("If you're still seeing errors, the issue might be:")
print("1. Missing OpenRouter API key in .env file")
print("2. Network connectivity issues")
print("3. Invalid OpenRouter model ID")