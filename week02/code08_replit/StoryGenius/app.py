#!/usr/bin/env python3
"""
Educational Chatbot Web App - Flask Backend
"""

from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
import json
import os
import requests
import datetime
import uuid
from typing import Dict, List, Any, Optional

# Flask app configuration
app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')
CORS(app)

# Configuration
EDUHK_API_BASE_URL = "https://aai02.eduhk.hk"
DEPLOYMENT_NAME = "gpt-4o-mini"  # Available: gpt-4o-mini, gpt-4, gpt-35-turbo
API_VERSION = "2024-02-15-preview"
NOTEBOOK_FILE = "learning_notebook.json"

class EducationalChatbotAPI:
    def __init__(self, api_key: str):
        self.api_key = api_key
        
    def make_api_request(self, messages: List[Dict], system_prompt: str = "") -> Optional[str]:
        """Make a streaming request to EdUHK Azure OpenAI Mimic API"""
        headers = {
            "Content-Type": "application/json",
            "api-key": self.api_key,
            "Accept": "text/event-stream"
        }
        
        # Construct the EdUHK API URL
        url = f"{EDUHK_API_BASE_URL}/openai/deployments/{DEPLOYMENT_NAME}/chat/completions"
        if API_VERSION:
            url += f"?api-version={API_VERSION}"
        
        request_messages = []
        if system_prompt:
            request_messages.append({"role": "system", "content": system_prompt})
        
        request_messages.extend(messages)
        
        data = {
            "model": DEPLOYMENT_NAME,
            "messages": request_messages,
            "temperature": 0.7,
            "max_tokens": 1000,
            "stream": True,
            "stream_options": {
                "include_usage": True
            }
        }
        
        try:
            response = requests.post(url, headers=headers, json=data, timeout=120, stream=True)
            response.raise_for_status()
            
            # Parse Server-Sent Events (SSE) stream
            content_buffer = ""
            
            for line in response.iter_lines(decode_unicode=True):
                if not line:
                    continue
                    
                if line.startswith("data: "):
                    data_content = line[6:]  # Remove "data: " prefix
                    
                    if data_content == "[DONE]":
                        break
                        
                    try:
                        chunk = json.loads(data_content)
                        
                        # Check for error in chunk
                        if "error" in chunk:
                            app.logger.error(f"API Error in stream: {chunk['error']}")
                            return None
                            
                        # Extract content from delta
                        if ("choices" in chunk and 
                            len(chunk["choices"]) > 0 and
                            "delta" in chunk["choices"][0] and
                            "content" in chunk["choices"][0]["delta"]):
                            
                            delta_content = chunk["choices"][0]["delta"]["content"]
                            if delta_content is not None:
                                content_buffer += delta_content
                            
                    except json.JSONDecodeError as e:
                        # Skip malformed chunks
                        app.logger.warning(f"Skipping malformed chunk: {e}")
                        continue
            
            response.close()
            return content_buffer if content_buffer else None
            
        except requests.exceptions.RequestException as e:
            app.logger.error(f"API Error: {e}")
            return None
        except Exception as e:
            app.logger.error(f"Streaming error: {e}")
            return None
    
    def validate_educational_content(self, data: Any) -> Dict[str, List[Dict]]:
        """Validate and sanitize educational content to prevent KeyErrors"""
        result = {"vocabulary": [], "idioms": [], "grammar": []}
        
        if not isinstance(data, dict):
            return result
        
        # Validate vocabulary
        if "vocabulary" in data and isinstance(data["vocabulary"], list):
            for item in data["vocabulary"]:
                if isinstance(item, dict):
                    vocab_item = {
                        "word": item.get("word", "Unknown"),
                        "definition": item.get("definition", "No definition available"),
                        "example_sentence": item.get("example_sentence", "No example available"),
                        "synonyms": item.get("synonyms", [])
                    }
                    if not isinstance(vocab_item["synonyms"], list):
                        vocab_item["synonyms"] = []
                    result["vocabulary"].append(vocab_item)
        
        # Validate idioms
        if "idioms" in data and isinstance(data["idioms"], list):
            for item in data["idioms"]:
                if isinstance(item, dict):
                    idiom_item = {
                        "idiom": item.get("idiom", "Unknown idiom"),
                        "meaning": item.get("meaning", "No meaning available"),
                        "example": item.get("example", "No example available")
                    }
                    result["idioms"].append(idiom_item)
        
        # Validate grammar
        if "grammar" in data and isinstance(data["grammar"], list):
            for item in data["grammar"]:
                if isinstance(item, dict):
                    grammar_item = {
                        "concept": item.get("concept", "Unknown concept"),
                        "explanation": item.get("explanation", "No explanation available"),
                        "example_correct": item.get("example_correct", "No example available"),
                        "example_incorrect": item.get("example_incorrect", "")
                    }
                    result["grammar"].append(grammar_item)
        
        return result
    
    def analyze_user_input(self, user_input: str) -> Dict[str, List[Dict]]:
        """Analyze user input to generate educational content"""
        system_prompt = """You are an expert language teacher. Analyze the user's input and generate educational content in JSON format.

For the user's message, provide:
1. 3 vocabulary words (uncommon/advanced words related to the theme)
2. 3 idioms (relevant to enhance expression)
3. 3 grammar concepts (improvements or rules related to the input)

Respond in this exact JSON format:
{
  "vocabulary": [
    {
      "word": "example_word",
      "definition": "clear definition",
      "example_sentence": "example using the word",
      "synonyms": ["synonym1", "synonym2"]
    }
  ],
  "idioms": [
    {
      "idiom": "example idiom",
      "meaning": "what it means",
      "example": "example sentence using the idiom"
    }
  ],
  "grammar": [
    {
      "concept": "grammar rule name",
      "explanation": "clear explanation",
      "example_correct": "correct usage example",
      "example_incorrect": "incorrect usage example (if applicable)"
    }
  ]
}"""

        messages = [{"role": "user", "content": f"Analyze this text for educational content: '{user_input}'"}]
        
        response = self.make_api_request(messages, system_prompt)
        if not response:
            return {"vocabulary": [], "idioms": [], "grammar": []}
        
        try:
            # Try to extract JSON from the response
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_content = response[json_start:json_end].strip()
            elif "```" in response:
                json_start = response.find("```") + 3
                json_end = response.find("```", json_start)
                json_content = response[json_start:json_end].strip()
            else:
                json_content = response
            
            parsed_data = json.loads(json_content)
            return self.validate_educational_content(parsed_data)
            
        except json.JSONDecodeError as e:
            app.logger.warning(f"Could not parse educational content: {e}")
            return {"vocabulary": [], "idioms": [], "grammar": []}

    def generate_response(self, user_input: str, conversation_history: Optional[List[Dict]] = None) -> str:
        """Generate a conversational response to user input"""
        system_prompt = "You are a friendly, encouraging educational chatbot. Respond to the user's message naturally and helpfully. Keep responses concise but engaging."
        
        messages = []
        if conversation_history:
            # Keep last 6 messages for context
            messages = conversation_history[-6:] if len(conversation_history) > 6 else conversation_history.copy()
        
        messages.append({"role": "user", "content": user_input})
        
        response = self.make_api_request(messages, system_prompt)
        return response or "I'm having trouble responding right now. Could you try rephrasing that?"

# Global chatbot instance
chatbot_api = None

def get_chatbot():
    """Get or create chatbot instance"""
    global chatbot_api
    if not chatbot_api:
        api_key = os.environ.get("EDUHK_API_KEY")
        if not api_key:
            raise ValueError("EDUHK_API_KEY environment variable not set")
        # If multiple keys are provided (comma-separated), use the first one
        api_key = api_key.split(',')[0].strip()
        chatbot_api = EducationalChatbotAPI(api_key)
    return chatbot_api

def load_notebook() -> Dict[str, List[Dict]]:
    """Load learning notebook from file or create new one"""
    try:
        if os.path.exists(NOTEBOOK_FILE):
            with open(NOTEBOOK_FILE, 'r', encoding='utf-8') as f:
                loaded_data = json.load(f)
                # Validate structure
                if isinstance(loaded_data, dict) and all(key in loaded_data for key in ["vocabulary", "idioms", "grammar"]):
                    return loaded_data
    except (json.JSONDecodeError, FileNotFoundError, KeyError):
        pass
    
    # Return new notebook structure
    return {"vocabulary": [], "idioms": [], "grammar": []}

def save_notebook(notebook: Dict[str, List[Dict]]):
    """Save learning notebook to file"""
    try:
        with open(NOTEBOOK_FILE, 'w', encoding='utf-8') as f:
            json.dump(notebook, f, indent=2, ensure_ascii=False)
    except Exception as e:
        app.logger.error(f"Could not save notebook: {e}")

def add_to_notebook(notebook: Dict[str, List[Dict]], content: Dict[str, List[Dict]]) -> int:
    """Add learning content to the notebook and return number of items added"""
    items_added = 0
    for category in ["vocabulary", "idioms", "grammar"]:
        for item in content[category]:
            # Avoid duplicates
            if category == "vocabulary":
                if not any(existing["word"] == item["word"] for existing in notebook[category]):
                    notebook[category].append(item)
                    items_added += 1
            elif category == "idioms":
                if not any(existing["idiom"] == item["idiom"] for existing in notebook[category]):
                    notebook[category].append(item)
                    items_added += 1
            elif category == "grammar":
                if not any(existing["concept"] == item["concept"] for existing in notebook[category]):
                    notebook[category].append(item)
                    items_added += 1
    
    return items_added

def init_session():
    """Initialize session data"""
    if 'conversation_history' not in session:
        session['conversation_history'] = []
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())

@app.route('/')
def index():
    """Serve the main chat interface"""
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat messages"""
    try:
        init_session()
        
        data = request.get_json()
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({"error": "Empty message"}), 400
        
        if len(user_message.split()) < 3:
            return jsonify({
                "bot_response": "That's quite brief! Could you tell me more? The more you write, the better I can help you learn new vocabulary and grammar!",
                "educational_content": {"vocabulary": [], "idioms": [], "grammar": []},
                "items_added": 0
            })
        
        # Get chatbot and generate response
        chatbot = get_chatbot()
        bot_response = chatbot.generate_response(user_message, session.get('conversation_history') or [])
        
        # Update conversation history
        session['conversation_history'] = session.get('conversation_history', [])
        session['conversation_history'].extend([
            {"role": "user", "content": user_message},
            {"role": "assistant", "content": bot_response}
        ])
        
        # Analyze for educational content
        educational_content = chatbot.analyze_user_input(user_message)
        
        # Load notebook, add new content, save
        notebook = load_notebook()
        items_added = add_to_notebook(notebook, educational_content)
        if items_added > 0:
            save_notebook(notebook)
        
        return jsonify({
            "bot_response": bot_response,
            "educational_content": educational_content,
            "items_added": items_added
        })
        
    except Exception as e:
        app.logger.error(f"Chat error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/notebook')
def get_notebook():
    """Get the learning notebook"""
    try:
        notebook = load_notebook()
        total_items = sum(len(notebook[cat]) for cat in notebook)
        return jsonify({
            "notebook": notebook,
            "total_items": total_items
        })
    except Exception as e:
        app.logger.error(f"Notebook error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/quiz')
def get_quiz():
    """Generate quiz questions from notebook"""
    try:
        notebook = load_notebook()
        
        # Collect all items for quiz
        all_items = []
        for category in ["vocabulary", "idioms", "grammar"]:
            for item in notebook[category]:
                all_items.append({"category": category, "item": item})
        
        if not all_items:
            return jsonify({"questions": [], "total_items": 0})
        
        # Generate up to 5 quiz questions
        import random
        random.shuffle(all_items)
        questions = []
        
        for i, data in enumerate(all_items[:5]):
            category = data["category"]
            item = data["item"]
            
            if category == "vocabulary":
                questions.append({
                    "id": i,
                    "type": "vocabulary",
                    "question": f"What does '{item['word']}' mean?",
                    "answer": item['definition'],
                    "word": item['word']
                })
            elif category == "idioms":
                questions.append({
                    "id": i,
                    "type": "idiom",
                    "question": f"What does the idiom '{item['idiom']}' mean?",
                    "answer": item['meaning'],
                    "idiom": item['idiom']
                })
            elif category == "grammar":
                questions.append({
                    "id": i,
                    "type": "grammar",
                    "question": f"Explain the grammar concept: {item['concept']}",
                    "answer": item['explanation'],
                    "concept": item['concept']
                })
        
        return jsonify({
            "questions": questions,
            "total_items": len(all_items)
        })
        
    except Exception as e:
        app.logger.error(f"Quiz error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/export')
def export_notebook():
    """Export notebook as downloadable file"""
    try:
        notebook = load_notebook()
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Create export content
        content = f"EDUCATIONAL CHATBOT - LEARNING NOTEBOOK\n{'='*50}\n"
        content += f"Export Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        content += f"Total Items: {sum(len(notebook[cat]) for cat in notebook)}\n\n"
        
        for category in ["vocabulary", "idioms", "grammar"]:
            items = notebook[category]
            if items:
                content += f"{category.upper()}\n{'-' * 20}\n"
                for i, item in enumerate(items, 1):
                    if category == "vocabulary":
                        content += f"{i}. {item['word'].upper()}\n"
                        content += f"   Definition: {item['definition']}\n"
                        content += f"   Example: {item['example_sentence']}\n"
                        content += f"   Synonyms: {', '.join(item['synonyms'])}\n\n"
                    elif category == "idioms":
                        content += f"{i}. \"{item['idiom']}\"\n"
                        content += f"   Meaning: {item['meaning']}\n"
                        content += f"   Example: {item['example']}\n\n"
                    elif category == "grammar":
                        content += f"{i}. {item['concept']}\n"
                        content += f"   Explanation: {item['explanation']}\n"
                        content += f"   Correct: {item['example_correct']}\n"
                        if item["example_incorrect"]:
                            content += f"   Incorrect: {item['example_incorrect']}\n"
                        content += "\n"
                content += "\n"
        
        return jsonify({
            "content": content,
            "filename": f"learning_notebook_{timestamp}.txt"
        })
        
    except Exception as e:
        app.logger.error(f"Export error: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Check for API key
    if not os.environ.get("EDUHK_API_KEY"):
        print("❌ EDUHK_API_KEY environment variable not set!")
        print("Please set your EdUHK API key as an environment variable.")
        exit(1)
    
    app.run(host='0.0.0.0', port=5000, debug=True)