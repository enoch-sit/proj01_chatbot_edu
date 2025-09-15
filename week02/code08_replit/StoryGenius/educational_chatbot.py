#!/usr/bin/env python3
"""
Educational Chatbot - An AI-powered vocabulary and grammar learning assistant
Uses OpenRouter API for natural language processing and educational content generation
"""

import json
import os
import requests
import datetime
from typing import Dict, List, Any, Optional

# Configuration
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL_NAME = "openai/gpt-4o"  # You can change this to other available models
NOTEBOOK_FILE = "learning_notebook.json"  # File to persist learning data

class EducationalChatbot:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.session_start = datetime.datetime.now()
        
        # Load existing notebook or create new one
        self.notebook = self.load_notebook()
        
        # Conversation history
        self.conversation_history = []
        
        print("🎓 Welcome to your Educational Chatbot!")
        print("I'll help you improve your vocabulary and grammar through our conversations.")
        print("After each message, I'll provide personalized learning content.")
        print("\nCommands:")
        print("- 'review' or 'show notebook': View all learned items")
        print("- 'quiz': Take a quiz on learned content")
        print("- 'export': Save your learning notebook to a file")
        print("- 'exit': End the session")
        print("-" * 60)

    def load_notebook(self) -> Dict[str, List[Dict]]:
        """Load learning notebook from file or create new one"""
        try:
            if os.path.exists(NOTEBOOK_FILE):
                with open(NOTEBOOK_FILE, 'r', encoding='utf-8') as f:
                    loaded_data = json.load(f)
                    # Validate structure
                    if isinstance(loaded_data, dict) and all(key in loaded_data for key in ["vocabulary", "idioms", "grammar"]):
                        print(f"📚 Loaded existing notebook with {sum(len(loaded_data[cat]) for cat in loaded_data)} items")
                        return loaded_data
        except (json.JSONDecodeError, FileNotFoundError, KeyError):
            pass
        
        # Return new notebook structure
        return {
            "vocabulary": [],
            "idioms": [],
            "grammar": []
        }

    def save_notebook(self):
        """Save learning notebook to file"""
        try:
            with open(NOTEBOOK_FILE, 'w', encoding='utf-8') as f:
                json.dump(self.notebook, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"⚠️ Could not save notebook: {e}")

    def make_api_request(self, messages: List[Dict], system_prompt: str = "") -> Optional[str]:
        """Make a request to OpenRouter API"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        request_messages = []
        if system_prompt:
            request_messages.append({"role": "system", "content": system_prompt})
        
        request_messages.extend(messages)
        
        data = {
            "model": MODEL_NAME,
            "messages": request_messages,
            "temperature": 0.7,
            "max_tokens": 1000
        }
        
        try:
            response = requests.post(OPENROUTER_API_URL, headers=headers, json=data)
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
        except requests.exceptions.RequestException as e:
            print(f"❌ API Error: {e}")
            return None
        except KeyError as e:
            print(f"❌ Response parsing error: {e}")
            return None

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
            else:
                json_content = response
            
            parsed_data = json.loads(json_content)
            
            # Validate and sanitize the parsed data
            return self.validate_educational_content(parsed_data)
            
        except json.JSONDecodeError:
            print("⚠️ Could not parse educational content. Continuing conversation...")
            return {"vocabulary": [], "idioms": [], "grammar": []}

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

    def generate_response(self, user_input: str) -> str:
        """Generate a conversational response to user input"""
        system_prompt = "You are a friendly, encouraging educational chatbot. Respond to the user's message naturally and helpfully. Keep responses concise but engaging."
        
        # Include recent conversation history for context
        messages = []
        if len(self.conversation_history) > 6:  # Keep last 3 exchanges
            messages = self.conversation_history[-6:]
        else:
            messages = self.conversation_history.copy()
        
        messages.append({"role": "user", "content": user_input})
        
        response = self.make_api_request(messages, system_prompt)
        return response or "I'm having trouble responding right now. Could you try rephrasing that?"

    def display_learning_content(self, content: Dict[str, List[Dict]]):
        """Display the generated educational content"""
        if not any(content.values()):
            return
        
        print("\n" + "="*60)
        print("📚 YOUR LEARNING CONTENT")
        print("="*60)
        
        # Vocabulary
        if content["vocabulary"]:
            print("\n🔤 VOCABULARY WORDS:")
            for i, vocab in enumerate(content["vocabulary"], 1):
                print(f"\n{i}. {vocab['word'].upper()}")
                print(f"   Definition: {vocab['definition']}")
                print(f"   Example: {vocab['example_sentence']}")
                print(f"   Synonyms: {', '.join(vocab['synonyms'])}")
        
        # Idioms
        if content["idioms"]:
            print("\n💭 IDIOMS:")
            for i, idiom in enumerate(content["idioms"], 1):
                print(f"\n{i}. \"{idiom['idiom']}\"")
                print(f"   Meaning: {idiom['meaning']}")
                print(f"   Example: {idiom['example']}")
        
        # Grammar
        if content["grammar"]:
            print("\n📝 GRAMMAR CONCEPTS:")
            for i, grammar in enumerate(content["grammar"], 1):
                print(f"\n{i}. {grammar['concept']}")
                print(f"   Explanation: {grammar['explanation']}")
                print(f"   Correct: {grammar['example_correct']}")
                if "example_incorrect" in grammar and grammar["example_incorrect"]:
                    print(f"   Incorrect: {grammar['example_incorrect']}")

    def add_to_notebook(self, content: Dict[str, List[Dict]]):
        """Add learning content to the persistent notebook"""
        items_added = 0
        for category in ["vocabulary", "idioms", "grammar"]:
            for item in content[category]:
                # Avoid duplicates
                if category == "vocabulary":
                    if not any(existing["word"] == item["word"] for existing in self.notebook[category]):
                        self.notebook[category].append(item)
                        items_added += 1
                elif category == "idioms":
                    if not any(existing["idiom"] == item["idiom"] for existing in self.notebook[category]):
                        self.notebook[category].append(item)
                        items_added += 1
                elif category == "grammar":
                    if not any(existing["concept"] == item["concept"] for existing in self.notebook[category]):
                        self.notebook[category].append(item)
                        items_added += 1
        
        # Save notebook after updates
        if items_added > 0:
            self.save_notebook()

    def show_notebook(self):
        """Display the complete learning notebook"""
        print("\n" + "="*60)
        print("📖 YOUR LEARNING NOTEBOOK")
        print("="*60)
        
        total_items = sum(len(self.notebook[cat]) for cat in self.notebook)
        if total_items == 0:
            print("Your notebook is empty. Keep chatting to learn new things!")
            return
        
        print(f"Total items learned: {total_items}")
        print(f"Session started: {self.session_start.strftime('%Y-%m-%d %H:%M:%S')}")
        
        for category in ["vocabulary", "idioms", "grammar"]:
            items = self.notebook[category]
            if items:
                print(f"\n{category.upper()} ({len(items)} items):")
                for i, item in enumerate(items, 1):
                    if category == "vocabulary":
                        print(f"  {i}. {item['word']} - {item['definition']}")
                    elif category == "idioms":
                        print(f"  {i}. \"{item['idiom']}\" - {item['meaning']}")
                    elif category == "grammar":
                        print(f"  {i}. {item['concept']} - {item['explanation']}")

    def export_notebook(self):
        """Export the notebook to a text file"""
        filename = f"learning_notebook_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write("EDUCATIONAL CHATBOT - LEARNING NOTEBOOK\n")
            f.write("="*50 + "\n")
            f.write(f"Session Date: {self.session_start.strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Export Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Total Items: {sum(len(self.notebook[cat]) for cat in self.notebook)}\n\n")
            
            for category in ["vocabulary", "idioms", "grammar"]:
                items = self.notebook[category]
                if items:
                    f.write(f"{category.upper()}\n")
                    f.write("-" * 20 + "\n")
                    for i, item in enumerate(items, 1):
                        if category == "vocabulary":
                            f.write(f"{i}. {item['word'].upper()}\n")
                            f.write(f"   Definition: {item['definition']}\n")
                            f.write(f"   Example: {item['example_sentence']}\n")
                            f.write(f"   Synonyms: {', '.join(item['synonyms'])}\n\n")
                        elif category == "idioms":
                            f.write(f"{i}. \"{item['idiom']}\"\n")
                            f.write(f"   Meaning: {item['meaning']}\n")
                            f.write(f"   Example: {item['example']}\n\n")
                        elif category == "grammar":
                            f.write(f"{i}. {item['concept']}\n")
                            f.write(f"   Explanation: {item['explanation']}\n")
                            f.write(f"   Correct: {item['example_correct']}\n")
                            if "example_incorrect" in item and item["example_incorrect"]:
                                f.write(f"   Incorrect: {item['example_incorrect']}\n")
                            f.write("\n")
                    f.write("\n")
        
        print(f"✅ Notebook exported to: {filename}")

    def quiz_mode(self):
        """Interactive quiz on learned content"""
        all_items = []
        for category in ["vocabulary", "idioms", "grammar"]:
            for item in self.notebook[category]:
                all_items.append((category, item))
        
        if not all_items:
            print("📝 No items in your notebook yet. Keep learning!")
            return
        
        print(f"\n📝 QUIZ TIME! You have {len(all_items)} items to review.")
        print("Type your answer, or 'skip' to see the answer, or 'quit' to end quiz.")
        
        import random
        random.shuffle(all_items)
        
        score = 0
        total = min(5, len(all_items))  # Quiz on up to 5 items
        questions_attempted = 0
        
        for i in range(total):
            questions_attempted = i + 1
            category, item = all_items[i]
            print(f"\n--- Question {i+1}/{total} ---")
            
            if category == "vocabulary":
                print(f"What does '{item['word']}' mean?")
                answer = input("Your answer: ").strip()
                if answer.lower() == 'quit':
                    break
                elif answer.lower() == 'skip':
                    print(f"Answer: {item['definition']}")
                else:
                    print(f"Correct answer: {item['definition']}")
                    if any(word in answer.lower() for word in item['definition'].lower().split()[:3]):
                        print("✅ Good job!")
                        score += 1
                    else:
                        print("❌ Not quite right, but keep trying!")
                        
            elif category == "idioms":
                print(f"What does the idiom '{item['idiom']}' mean?")
                answer = input("Your answer: ").strip()
                if answer.lower() == 'quit':
                    break
                elif answer.lower() == 'skip':
                    print(f"Answer: {item['meaning']}")
                else:
                    print(f"Correct answer: {item['meaning']}")
                    if any(word in answer.lower() for word in item['meaning'].lower().split()[:3]):
                        print("✅ Excellent!")
                        score += 1
                    else:
                        print("❌ Close! Keep practicing!")
                        
            elif category == "grammar":
                print(f"Explain the grammar concept: {item['concept']}")
                answer = input("Your answer: ").strip()
                if answer.lower() == 'quit':
                    break
                elif answer.lower() == 'skip':
                    print(f"Answer: {item['explanation']}")
                else:
                    print(f"Correct answer: {item['explanation']}")
                    if len(answer) > 10:  # Give credit for effort
                        print("✅ Great effort!")
                        score += 1
                    else:
                        print("❌ Try to be more detailed!")
        
        if questions_attempted > 0:  # If at least one question was attempted
            print(f"\n🎯 Quiz complete! Score: {score}/{questions_attempted}")
            percentage = (score / questions_attempted) * 100
            if percentage >= 80:
                print("🌟 Excellent work!")
            elif percentage >= 60:
                print("👍 Good job!")
            else:
                print("📚 Keep studying!")

    def run(self):
        """Main chatbot loop"""
        if not self.api_key:
            print("❌ OpenRouter API key not found!")
            print("Please set the OPENROUTER_API_KEY environment variable.")
            print("You can get your API key from: https://openrouter.ai/")
            return
        
        while True:
            try:
                print("\n" + "-"*60)
                user_input = input("You: ").strip()
                
                if not user_input:
                    print("Please enter a message or command.")
                    continue
                
                # Handle special commands
                if user_input.lower() in ['exit', 'quit', 'bye']:
                    print("\n👋 Thank you for learning with me! Keep practicing!")
                    break
                
                elif user_input.lower() in ['review', 'show notebook', 'notebook']:
                    self.show_notebook()
                    continue
                
                elif user_input.lower() in ['quiz', 'test']:
                    self.quiz_mode()
                    continue
                
                elif user_input.lower() in ['export', 'save', 'download']:
                    self.export_notebook()
                    continue
                
                # Handle short inputs
                if len(user_input.split()) < 3:
                    print("\n🤔 That's quite brief! Could you tell me more? The more you write, the better I can help you learn new vocabulary and grammar!")
                    continue
                
                print("\n🤖 Bot:", end=" ")
                
                # Generate conversational response
                bot_response = self.generate_response(user_input)
                print(bot_response)
                
                # Add to conversation history
                self.conversation_history.extend([
                    {"role": "user", "content": user_input},
                    {"role": "assistant", "content": bot_response}
                ])
                
                # Analyze and generate educational content
                print("\n⏳ Analyzing your message for learning opportunities...")
                educational_content = self.analyze_user_input(user_input)
                
                # Display educational content
                self.display_learning_content(educational_content)
                
                # Add to notebook
                self.add_to_notebook(educational_content)
                
            except KeyboardInterrupt:
                print("\n\n👋 Session interrupted. Goodbye!")
                break
            except Exception as e:
                print(f"❌ An error occurred: {e}")
                print("Please try again.")

def main():
    """Main function to start the chatbot"""
    # Read API key from environment variable
    api_key = os.environ.get("OPENROUTER_API_KEY")
    
    if not api_key:
        print("❌ OPENROUTER_API_KEY environment variable not set!")
        print("Please set your OpenRouter API key as an environment variable:")
        print("export OPENROUTER_API_KEY='your-api-key-here'")
        print("You can get your API key from: https://openrouter.ai/")
        return
    
    chatbot = EducationalChatbot(api_key)
    chatbot.run()

if __name__ == "__main__":
    main()