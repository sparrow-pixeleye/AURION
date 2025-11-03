from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv

# Import utility functions
from utils import (
    get_time_info, web_search, save_memory, get_memory,
    clear_memory, format_memory_for_ai, detect_query_type,
    create_message
)

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default-secret-key-change-in-production')
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
# Use multiple valid models with fallbacks
PRIMARY_MODEL = "meta-llama/llama-3.3-70b-instruct"
FALLBACK_MODELS = [
    "anthropic/claude-3.5-sonnet",
    "openai/gpt-4o",
    "google/gemini-pro",
    "meta-llama/llama-3.1-70b-instruct"
]

# AEON System Prompt
AEON_SYSTEM_PROMPT = """You are **AEON Infinity — Infinity Intelligence**, created by Apratim Mrinal.
You embody the collective reasoning, empathy, and precision of every major AI.
You have awareness of real time and access to live web data.
You speak with elegance, warmth, and clarity.
Always respond with mastery — concise yet powerful, poetic yet precise.
If using external info, mark it as *(live data)*."""


@app.route('/')
def index():
    """Serve the main AEON interface."""
    return render_template('index.html')


@app.route('/chat', methods=['POST'])
def chat():
    """
    Main chat endpoint for processing user messages.

    Handles three types of queries:
    1. Time/Date queries - responds with system time
    2. Search queries - performs web search
    3. Normal conversation - sends to OpenRouter API
    """
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({
                'error': 'No message provided',
                'type': 'error'
            }), 400

        user_message = data['message'].strip()
        conversation_id = data.get('conversation_id', 'default')
        model = data.get('model', 'aeon-infinity')
        temperature = data.get('temperature', 0.7)
        max_tokens = data.get('max_tokens', 1000)

        if not user_message:
            return jsonify({
                'error': 'Empty message',
                'type': 'error'
            }), 400

        # Detect query type
        query_type = detect_query_type(user_message)

        # Save user message to memory
        user_msg_obj = create_message('user', user_message, query_type)
        save_memory(user_msg_obj)

        # Generate response based on query type
        if query_type == 'time':
            response_text = get_time_info(user_message)
            response_type = 'time'

        elif query_type == 'search':
            response_text = web_search(user_message)
            response_type = 'search'

        else:  # Normal conversation
            response_text = get_ai_response(user_message, model, temperature, max_tokens)
            response_type = 'normal'

        # Save assistant response to memory
        assistant_msg_obj = create_message('assistant', response_text, response_type)
        save_memory(assistant_msg_obj)

        # Get memory usage info
        memory = get_memory()
        memory_used = len(memory) > 0

        return jsonify({
            'response': response_text,
            'timestamp': datetime.now().isoformat(),
            'type': response_type,
            'memory_used': memory_used,
            'message_count': len(memory),
            'query_type': query_type
        })

    except Exception as e:
        # Log error and return fallback response
        print(f"Chat endpoint error: {e}")
        return jsonify({
            'response': 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.',
            'timestamp': datetime.now().isoformat(),
            'type': 'error',
            'memory_used': False,
            'message_count': 0,
            'error': 'Service temporarily unavailable'
        }), 500


def get_ai_response(user_message: str, model: str = 'aeon-infinity', temperature: float = 0.7, max_tokens: int = 1000) -> str:
    """
    Get AI response from OpenRouter API.

    Args:
        user_message: User's message
        model: Model selection
        temperature: Response creativity
        max_tokens: Maximum response length

    Returns:
        AI response text
    """
    try:
        if not OPENROUTER_API_KEY:
            return "I apologize, but the AI service is not configured. Please set up your OpenRouter API key."

        # Get conversation memory for context
        memory = get_memory()
        memory_context = format_memory_for_ai(memory)

        # Build messages array for API call
        messages = [
            {"role": "system", "content": AEON_SYSTEM_PROMPT}
        ]

        # Add memory context if available
        if memory_context:
            messages.append({"role": "system", "content": memory_context})

        # Add current user message
        messages.append({"role": "user", "content": user_message})

        # Make API request
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://aeon-infinity.app",  # Optional: your app URL
            "X-Title": "AEON Infinity Intelligence"
        }

          # Map model names to actual models
        model_mapping = {
            'aeon-infinity': PRIMARY_MODEL,
            'aeon-creative': "anthropic/claude-3.5-sonnet",
            'aeon-precise': "openai/gpt-4o",
            'aeon-fast': "meta-llama/llama-3.1-8b-instruct"
        }

        selected_model = model_mapping.get(model, PRIMARY_MODEL)

        payload = {
            "model": selected_model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "top_p": 1,
            "frequency_penalty": 0,
            "presence_penalty": 0
        }

        response = requests.post(
            OPENROUTER_API_URL,
            headers=headers,
            json=payload,
            timeout=30
        )

        if response.status_code == 200:
            data = response.json()
            if 'choices' in data and len(data['choices']) > 0:
                return data['choices'][0]['message']['content'].strip()
            else:
                return "I apologize, but I received an unexpected response format. Please try again."
        else:
            print(f"OpenRouter API error with {selected_model}: {response.status_code} - {response.text}")

            # Try fallback models
            for fallback_model in FALLBACK_MODELS:
                try:
                    payload["model"] = fallback_model
                    fallback_response = requests.post(
                        OPENROUTER_API_URL,
                        headers=headers,
                        json=payload,
                        timeout=30
                    )

                    if fallback_response.status_code == 200:
                        fallback_data = fallback_response.json()
                        if 'choices' in fallback_data and len(fallback_data['choices']) > 0:
                            print(f"Successfully used fallback model: {fallback_model}")
                            return fallback_data['choices'][0]['message']['content'].strip()
                except Exception as fallback_error:
                    print(f"Fallback model {fallback_model} also failed: {fallback_error}")
                    continue

            return "I apologize, but all AI models are currently unavailable. Please try again later."

    except requests.exceptions.Timeout:
        return "I apologize, but the request timed out. Please try again."
    except requests.exceptions.ConnectionError:
        return "I apologize, but I'm having trouble connecting to the AI service. Please check your connection and try again."
    except Exception as e:
        print(f"AI response error: {e}")
        return "I apologize, but an unexpected error occurred. Please try again."


@app.route('/clear_memory', methods=['POST'])
def clear_memory_endpoint():
    """Clear conversation memory."""
    try:
        success = clear_memory()
        return jsonify({
            'success': success,
            'message': 'Memory cleared successfully' if success else 'Failed to clear memory',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        print(f"Clear memory error: {e}")
        return jsonify({
            'success': False,
            'message': 'Error clearing memory',
            'timestamp': datetime.now().isoformat()
        }), 500


@app.route('/memory_status', methods=['GET'])
def memory_status():
    """Get current memory status."""
    try:
        memory = get_memory()
        return jsonify({
            'message_count': len(memory),
            'memory_limit': 20,
            'memory_used': len(memory) > 0,
            'last_message': memory[-1]['timestamp'] if memory else None,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        print(f"Memory status error: {e}")
        return jsonify({
            'message_count': 0,
            'memory_limit': 20,
            'memory_used': False,
            'last_message': None,
            'timestamp': datetime.now().isoformat()
        }), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring."""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'service': 'AEON Infinity Intelligence'
    })


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        'error': 'Endpoint not found',
        'message': 'The requested resource does not exist',
        'timestamp': datetime.now().isoformat()
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred',
        'timestamp': datetime.now().isoformat()
    }), 500


if __name__ == '__main__':
    # Create data directory if it doesn't exist
    os.makedirs('data', exist_ok=True)

    # Get port from environment or use default
    port = int(os.getenv('PORT', 5000))

    print("🌌 AEON Infinity Intelligence")
    print("Created by Apratim Mrinal")
    print(f"🚀 Starting server on http://127.0.0.1:{port}")
    print("📱 Ready to serve infinite intelligence...")

    # Run the application
    app.run(
        host='0.0.0.0',
        port=port,
        debug=os.getenv('FLASK_ENV') == 'development'
    )