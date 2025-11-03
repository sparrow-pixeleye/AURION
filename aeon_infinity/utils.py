import json
import os
import requests
from datetime import datetime
from bs4 import BeautifulSoup
import time
from typing import Dict, List, Optional

# Configuration
MEMORY_FILE = "data/memory.json"
MEMORY_LIMIT = 20


def get_time_info(query: str) -> str:
    """
    Get current time and date information based on user query.

    Args:
        query: User's time-related query

    Returns:
        Formatted time/date response
    """
    now = datetime.now()

    query_lower = query.lower()

    if "time" in query_lower and "date" in query_lower:
        return f"It's {now.strftime('%I:%M %p')} on {now.strftime('%A, %B %d, %Y')}."
    elif "time" in query_lower:
        return f"The current time is {now.strftime('%I:%M %p')} ({now.strftime('%H:%M')} in 24-hour format)."
    elif "date" in query_lower:
        return f"Today is {now.strftime('%A, %B %d, %Y')}."
    elif "day" in query_lower:
        return f"Today is {now.strftime('%A')}, {now.strftime('%B %d')}."
    else:
        return f"It's {now.strftime('%I:%M %p')} on {now.strftime('%A, %B %d, %Y')}."


def web_search(query: str) -> str:
    """
    Perform web search using DuckDuckGo and Wikipedia APIs.

    Args:
        query: Search query

    Returns:
        Search results with (live data) attribution
    """
    try:
        # Clean the query
        clean_query = _clean_query(query)

        # Try DuckDuckGo first
        ddg_result = _duckduckgo_search(clean_query)
        if ddg_result:
            return f"{ddg_result} *(live data)*"

        # Fallback to Wikipedia
        wiki_result = _wikipedia_search(clean_query)
        if wiki_result:
            return f"{wiki_result} *(live data)*"

        return "No relevant information found in my search. *(live data)*"

    except Exception as e:
        return "Search service temporarily unavailable. Please try again later."


def _clean_query(query: str) -> str:
    """Remove search keywords and clean the query."""
    search_keywords = [
        "search for", "search", "what is", "tell me about",
        "latest", "news", "find", "look up", "query"
    ]

    cleaned = query.lower()
    for keyword in search_keywords:
        cleaned = cleaned.replace(keyword, "")

    # Remove extra spaces and articles
    words = cleaned.strip().split()
    words = [word for word in words if word not in ["the", "a", "an"]]

    return " ".join(words)


def _duckduckgo_search(query: str) -> Optional[str]:
    """Search using DuckDuckGo instant answers."""
    try:
        url = "https://api.duckduckgo.com/"
        params = {
            "q": query,
            "format": "json",
            "no_html": 1,
            "skip_disambig": 1
        }

        response = requests.get(url, params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()

            # Try different response fields
            if data.get("AbstractText"):
                return data["AbstractText"][:500]  # Limit length
            elif data.get("RelatedTopics"):
                for topic in data["RelatedTopics"][:3]:
                    if isinstance(topic, dict) and topic.get("Text"):
                        return topic["Text"][:500]
            elif data.get("Answer"):
                return data["Answer"][:500]

    except Exception:
        pass

    return None


def _wikipedia_search(query: str) -> Optional[str]:
    """Search using Wikipedia API."""
    try:
        # Search for article
        search_url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + query.replace(" ", "_")

        response = requests.get(search_url, timeout=5)
        if response.status_code == 200:
            data = response.json()

            if data.get("extract") and data["extract"] != "Not found.":
                # Limit to first 2-3 sentences
                sentences = data["extract"].split(". ")[:3]
                return ". ".join(sentences).strip() + "."

    except Exception:
        pass

    return None


def save_memory(message: Dict[str, str]) -> None:
    """
    Save a message to memory storage.

    Args:
        message: Message dictionary with role, content, timestamp, type
    """
    try:
        # Ensure data directory exists
        os.makedirs(os.path.dirname(MEMORY_FILE), exist_ok=True)

        # Load existing memory
        memory = get_memory()

        # Add new message
        memory.append(message)

        # Keep only last MEMORY_LIMIT messages
        if len(memory) > MEMORY_LIMIT:
            memory = memory[-MEMORY_LIMIT:]

        # Save to file
        with open(MEMORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(memory, f, indent=2, ensure_ascii=False)

    except Exception as e:
        # Continue without memory if there's an error
        print(f"Memory save error: {e}")


def get_memory() -> List[Dict[str, str]]:
    """
    Load conversation memory from storage.

    Returns:
        List of message dictionaries
    """
    try:
        if os.path.exists(MEMORY_FILE):
            with open(MEMORY_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        print(f"Memory load error: {e}")

    return []


def clear_memory() -> bool:
    """
    Clear all conversation memory.

    Returns:
        True if successful, False otherwise
    """
    try:
        if os.path.exists(MEMORY_FILE):
            os.remove(MEMORY_FILE)
        return True
    except Exception as e:
        print(f"Memory clear error: {e}")
        return False


def format_memory_for_ai(memory: List[Dict[str, str]]) -> str:
    """
    Format memory messages for AI context.

    Args:
        memory: List of memory messages

    Returns:
        Formatted memory string for AI prompt
    """
    if not memory:
        return ""

    formatted = "Previous conversation context:\n"
    for msg in memory[-10:]:  # Include last 10 messages for context
        role = "User" if msg["role"] == "user" else "Assistant"
        formatted += f"{role}: {msg['content']}\n"

    return formatted + "\n"


def detect_query_type(message: str) -> str:
    """
    Detect the type of query based on keywords.

    Args:
        message: User message

    Returns:
        Query type: 'time', 'search', or 'normal'
    """
    message_lower = message.lower()

    # Time queries
    time_keywords = ["time", "date", "day", "what time", "current time", "today"]
    if any(keyword in message_lower for keyword in time_keywords):
        return "time"

    # Search queries
    search_keywords = [
        "search", "query", "news", "latest", "what is", "tell me about",
        "find", "look up", "who is", "when was", "where is", "why is"
    ]
    if any(keyword in message_lower for keyword in search_keywords):
        return "search"

    return "normal"


def create_message(role: str, content: str, msg_type: str = "normal") -> Dict[str, str]:
    """
    Create a standardized message object.

    Args:
        role: 'user' or 'assistant'
        content: Message content
        msg_type: 'normal', 'search', 'time', or 'error'

    Returns:
        Message dictionary with timestamp
    """
    return {
        "role": role,
        "content": content,
        "timestamp": datetime.now().isoformat(),
        "type": msg_type
    }