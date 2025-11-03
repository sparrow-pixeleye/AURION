# AEON Infinity (Infinity Intelligence)

*Created by Apratim Mrinal*

> The ultimate AI web application that embodies the collective reasoning, empathy, and precision of every major AI system. AEON ∞ combines advanced conversational intelligence with real-time web search, time awareness, and a breathtaking 3D animated interface.

![AEON Logo](https://img.shields.io/badge/AEON-∞%20Infinity%20Intelligence-00FFFF?style=for-the-badge&logo=infinity)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python)
![Flask](https://img.shields.io/badge/Flask-3.0+-000000?style=for-the-badge&logo=flask)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

## ✨ Features

### 🧠 Advanced Intelligence
- **Conversational AI**: Powered by Meta LLaMA 3.3 70B Instruct via OpenRouter
- **Real-time Web Search**: Live data from DuckDuckGo and Wikipedia APIs
- **Time & Date Awareness**: System datetime integration with natural language queries
- **Memory System**: Short-term conversation memory (last 20 messages)
- **Smart Query Detection**: Automatic classification of time, search, and normal queries

### 🎨 Revolutionary UI/UX
- **3D Animated Interface**: Living particle background with mouse-reactive effects
- **Glassmorphism Design**: Translucent panels with blur effects and depth
- **Holographic AEON Logo**: Breathing orb that responds during AI processing
- **Smooth Transitions**: Cubic-bezier easing for all interactions
- **Theme System**: Dark/Light mode with smooth color interpolation
- **Responsive Design**: Optimized for desktop, tablet, and mobile

### ⚡ Performance & Accessibility
- **Instant Response**: Full message API responses with fade-in animations
- **Keyboard Shortcuts**: Power user shortcuts for all major functions
- **Cross-browser Compatible**: Chrome, Firefox, Safari, Edge support
- **Accessibility Ready**: ARIA labels, keyboard navigation, screen reader support
- **Reduced Motion Support**: Respects user accessibility preferences

## 🚀 Quick Start

### Prerequisites
- Python 3.9 or higher
- OpenRouter API key (get one at [OpenRouter.ai](https://openrouter.ai))
- Git (optional, for cloning)

### Installation

1. **Clone or Download** the project:
   ```bash
   # If you have this repository, navigate to the AEON folder
   cd AURION/aeon_infinity
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set Up Environment**:
   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit .env with your OpenRouter API key
   # OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

4. **Run AEON ∞**:
   ```bash
   python app.py
   ```

5. **Open Your Browser**:
   Navigate to [http://127.0.0.1:5000](http://127.0.0.1:5000)

## 🎮 Usage Guide

### Basic Conversation
Simply type your message and press Enter to send. AEON will respond with intelligent, contextually aware answers.

### Special Commands

#### Time & Date Queries
- "What time is it?"
- "Today's date?"
- "What day is it?"
- "Current time and date?"

#### Web Search Queries
- "Search for latest AI news"
- "Tell me about quantum computing"
- "What is machine learning?"
- "Latest developments in space exploration"

#### Keyboard Shortcuts
- **Enter**: Send message
- **Shift + Enter**: New line in input
- **Ctrl + L**: Clear conversation memory
- **Ctrl + T**: Toggle dark/light theme
- **Escape**: Focus input field

### Memory Management
AEON maintains the last 20 messages for conversation context. Toggle between:
- **Session Memory**: Messages clear on page refresh
- **Persistent Memory**: Messages saved to file (default)

## 🏗️ Project Structure

```
aeon_infinity/
├── app.py                    # Main Flask application
├── utils.py                  # Utility functions (time, search, memory)
├── requirements.txt          # Python dependencies
├── .env.example             # Environment variables template
├── README.md                # This documentation
├── data/
│   └── memory.json          # Conversation memory storage
├── templates/
│   └── index.html           # Main UI template
└── static/
    ├── style.css            # Advanced styling and animations
    ├── script.js            # Frontend interactivity
    └── assets/              # Images, icons, audio files
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# OpenRouter API Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Flask Configuration
FLASK_ENV=development
PORT=5000
SECRET_KEY=your_flask_secret_key_here

# Application Configuration
DEBUG=True
MEMORY_LIMIT=20
```

### Getting OpenRouter API Key

1. Visit [OpenRouter.ai](https://openrouter.ai)
2. Create an account and verify your email
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the key to your `.env` file

## 🌐 API Endpoints

### `/chat` (POST)
Main chat endpoint for processing user messages.

**Request:**
```json
{
  "message": "user input text",
  "conversation_id": "optional_session_identifier"
}
```

**Response:**
```json
{
  "response": "ai response text",
  "timestamp": "2025-01-03T12:00:00Z",
  "type": "normal|search|time|error",
  "memory_used": true,
  "message_count": 15,
  "query_type": "normal|search|time"
}
```

### `/clear_memory` (POST)
Clear conversation memory.

### `/memory_status` (GET)
Get current memory status and message count.

### `/health` (GET)
Health check endpoint for monitoring.

## 🎨 Customization

### Themes
Modify CSS variables in `static/style.css`:

```css
:root {
  --bg-primary: #0A0F1F;      /* Main background */
  --accent-cyan: #00FFFF;      /* Primary accent */
  --accent-violet: #A855F7;    /* Secondary accent */
  /* ... more variables */
}
```

### Particle Effects
Adjust particle count and behavior in `static/script.js`:

```javascript
// Modify particle count
const particleCount = Math.min(100, Math.floor((window.innerWidth * window.innerHeight) / 15000));

// Adjust particle colors
particle.hue = Math.random() * 60 + 160; // Cyan to violet range
```

### System Prompt
Customize AEON's personality in `app.py`:

```javascript
AEON_SYSTEM_PROMPT = """You are **AEON ∞ — Infinity Intelligence**, created by Apratim Mrinal.
// ... customize the prompt here
"""
```

## 🚀 Deployment

### Local Development
```bash
python app.py
```

### Production Deployment

#### Render Platform
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy with Python 3.9+ environment
4. Start command: `python app.py`

#### HuggingFace Spaces
1. Create a new Space with Flask template
2. Upload all project files
3. Set environment variables
4. Deploy!

#### Vercel (Serverless)
1. Install Flask-Vercel adapter
2. Create `vercel.json` configuration
3. Deploy functions as serverless endpoints

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "app.py"]
```

## 🔧 Troubleshooting

### Common Issues

#### "AI service not configured"
- Ensure your OpenRouter API key is set in `.env`
- Verify the API key is valid and active

#### "Search service unavailable"
- Check internet connection
- DuckDuckGo/Wikipedia APIs might be temporarily down

#### Memory not saving
- Ensure `data/` directory has write permissions
- Check disk space availability

#### Slow response times
- Check OpenRouter API status
- Monitor your internet connection
- Consider reducing model complexity

### Debug Mode
Enable debug logging:
```bash
FLASK_ENV=development python app.py
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout - feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Meta LLaMA 3.3 70B** - For the powerful language model
- **OpenRouter** - For providing API access to cutting-edge AI models
- **DuckDuckGo & Wikipedia** - For real-time search capabilities
- **Flask Community** - For the excellent web framework

## 📞 Support

For support, feature requests, or bug reports:

- 📧 Email: [your-email@example.com]
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/aeon-infinity/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-username/aeon-infinity/discussions)

---

**Created by Apratim Mrinal**
*Pushing the boundaries of artificial intelligence, one conversation at a time.*

> *"In the realm of infinite intelligence, every question sparks a universe of possibilities."*

---

![AEON Infinity](https://img.shields.io/badge/AEON-∞%20Infinity%20Intelligence-00FFFF?style=for-the-badge)