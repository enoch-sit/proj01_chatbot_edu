#!/usr/bin/env python3
"""
Dynamic LLM-driven conversation logger for chatbot.
Uses an LLM to generate user responses based on the interaction guide,
creating a realistic conversation flow. No evaluation or judging - just pure conversation logging.
"""
import requests
import json
import re
import os
import uuid
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, List

try:
    from dotenv import load_dotenv

    # Load .env from the script's directory
    env_path = Path(__file__).parent / ".env"
    load_dotenv(dotenv_path=env_path, override=True)
except ImportError:
    pass


BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"


def encode_base64(data: bytes) -> str:
    if not data:
        return ""

    encoded_chars = []
    for i in range(0, len(data), 3):
        chunk = data[i : i + 3]
        pad_len = 3 - len(chunk)
        chunk_value = int.from_bytes(chunk, "big") << (pad_len * 8)

        for shift in range(18, -1, -6):
            encoded_chars.append(BASE64_ALPHABET[(chunk_value >> shift) & 0x3F])

        if pad_len:
            encoded_chars[-pad_len:] = "=" * pad_len

    return "".join(encoded_chars)


def load_map_base64(image_path: Path) -> str:
    if not image_path.exists():
        raise FileNotFoundError(f"Map image not found at {image_path}")
    return encode_base64(image_path.read_bytes())


# Configuration
FLOWISE_API_URL = "https://aiagent.qefmoodle.com/api/v1/prediction/23cb0684-1a5a-4492-8a7e-832dab5a22b4"
# FLOWISE_API_URL = "https://aiagent.qefmoodle.com/api/v1/prediction/16fee693-5871-4362-918b-6109fe48d939"
# FLOWISE_API_URL = "https://aiagent.qefmoodle.com/api/v1/prediction/a60fe525-0ba0-4292-a3c6-d5f05ab560a4"
# Azure OpenAI for user simulation
AZURE_ENDPOINT = os.environ.get("AZURE_OPENAI_ENDPOINT")
AZURE_API_KEY = os.environ.get("AZURE_OPENAI_API_KEY")
AZURE_MODEL = os.environ.get("AZURE_OPENAI_MODEL", "gpt-4o-mini")

MAP_IMAGE_PATH = Path(__file__).with_name("mapfortask5.png")
SAMPLE_MAP_NAME = MAP_IMAGE_PATH.name
SAMPLE_MAP_MIME = "image/png"
SAMPLE_MAP_BASE64 = load_map_base64(MAP_IMAGE_PATH)

# Generate a UUID session ID for this evaluation run
# All 5 tasks will use the same session ID to maintain conversation context
SESSION_ID = str(uuid.uuid4())
LOGS_DIR = Path(__file__).parent / "evaluation_logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)


def load_interaction_guide() -> str:
    """Load the interaction guide for LLM reference."""
    guide_path = Path(__file__).parent / "interaction_Guide.md"
    if guide_path.exists():
        return guide_path.read_text(encoding="utf-8")
    return ""


def call_azure_for_user_input(
    conversation_history: List[Dict[str, str]],
    current_task: str,
    interaction_guide: str,
) -> str:
    """
    Use Azure OpenAI to generate the next user input based on:
    - Conversation history
    - Current task context
    - Interaction guide patterns
    """
    if not AZURE_ENDPOINT or not AZURE_API_KEY:
        raise ValueError(
            "Azure OpenAI endpoint and API key required for dynamic evaluation"
        )

    # Build context for the LLM
    context = f"""You are simulating a student learning to give directions using a map.

INTERACTION GUIDE REFERENCE:
{interaction_guide[:2000]}  # Truncate to save tokens

CURRENT TASK: {current_task}

CONVERSATION HISTORY:
"""
    for entry in conversation_history[-6:]:  # Last 6 exchanges for context
        assistant_text = entry.get("assistant", "").strip()
        # Skip entries with empty or error responses
        if assistant_text and not assistant_text.startswith("{"):
            context += f"Student: {entry.get('user', '')}\n"
            context += f"Chatbot: {assistant_text[:200]}...\n\n"

    context += """
Generate the NEXT student input following these rules:
1. For very first interaction (Task 1), start with "let's learn" to begin
2. If chatbot just displayed the map, respond with a direction attempt (give directions from one place to another)
3. If chatbot asked for confirmation, respond "yes" or "I accept"
4. If chatbot provided a correction table, try the task again with improvements or accept and continue
5. If chatbot asked to start a new task, provide directions for that task
6. Make deliberate mistakes (spelling, grammar, wrong directions) to simulate realistic student behavior
7. Use natural student language (lowercase, informal, incomplete sentences sometimes)
8. Keep practicing direction-giving in the current task
9. Vary your direction attempts (different locations, different phrasings)
10. For Task 5 only, if asked to upload a map, say "preview This is a map"

Respond ONLY with the student's next input text (no explanations):"""

    headers = {"Content-Type": "application/json", "api-key": AZURE_API_KEY}

    payload = {
        "messages": [{"role": "user", "content": [{"type": "text", "text": context}]}],
        "model": AZURE_MODEL,
        "temperature": 0.7,  # Some creativity for varied responses
        "max_tokens": 100,
    }

    response = requests.post(AZURE_ENDPOINT, headers=headers, json=payload, timeout=30)
    response.raise_for_status()

    data = response.json()
    return data["choices"][0]["message"]["content"].strip()


def send_to_flowise(question, uploads=None, override_config=None):
    payload = {
        "question": question,
        "overrideConfig": override_config or {"sessionId": SESSION_ID},
    }
    if uploads:
        payload["uploads"] = uploads

    response = requests.post(FLOWISE_API_URL, json=payload, timeout=30)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return None


def run_dynamic_evaluation(max_turns_per_task: int = 10):
    """
    Run dynamic conversation logging with LLM-generated user inputs.
    Simply records the conversation without evaluation or judging.

    Args:
        max_turns_per_task: Maximum number of conversation turns per task (default: 10)
    """
    print("=" * 80)
    print("DYNAMIC CONVERSATION LOGGING")
    print("=" * 80)
    print(f"Session ID: {SESSION_ID}")
    print(f"Max turns per task: {max_turns_per_task}")
    print("NOTE: All 5 tasks will use the SAME UUID session ID")
    print()

    interaction_guide = load_interaction_guide()
    conversation_history = []
    current_task = "Task 1"
    current_task_number = 1
    total_step = 0

    # Start conversation
    user_input = "let's learn"

    # Loop through all 5 tasks
    for task_num in range(1, 6):  # Task 1 to Task 5
        print(f"\n{'='*80}")
        print(f"TASK {task_num} - Max {max_turns_per_task} turns")
        print(f"{'='*80}\n")

        turns_in_current_task = 0

        for turn_in_task in range(1, max_turns_per_task + 1):
            total_step += 1
            turns_in_current_task += 1

            print(
                f"Step {total_step} (Task {task_num}, Turn {turn_in_task}/{max_turns_per_task}): User: {user_input}"
            )

            # Check for task transitions
            if user_input.lower().startswith("task"):
                current_task = user_input
                # Extract task number
                task_match = re.search(r"task\s*(\d+)", user_input.lower())
                if task_match:
                    current_task_number = int(task_match.group(1))

            # Handle uploads for Task 5
            uploads = None
            if "preview" in user_input.lower() and "map" in user_input.lower():
                uploads = [
                    {
                        "data": f"data:{SAMPLE_MAP_MIME};base64,{SAMPLE_MAP_BASE64}",
                        "type": "file",
                        "name": SAMPLE_MAP_NAME,
                        "mime": SAMPLE_MAP_MIME,
                    }
                ]

            # Send to chatbot
            response = send_to_flowise(user_input, uploads=uploads)
            if not response:
                print("Failed to get response from chatbot")
                break

            assistant_text = response.get("text", "")

            # Check for content filter or empty response
            if not assistant_text or assistant_text.strip().startswith("{"):
                print(f"⚠️  Content filtered or empty response. Skipping this turn.")
                # Don't count this as a valid turn
                total_step -= 1
                turns_in_current_task -= 1
                # Retry with a different input
                try:
                    user_input = call_azure_for_user_input(
                        conversation_history, current_task, interaction_guide
                    )
                    print(f"Retrying with: {user_input}")
                    continue
                except Exception as e:
                    print(f"Failed to generate retry input: {e}")
                    break

            print(f"AI Response: {assistant_text[:200]}...")

            # Store turn with full response data
            turn_data = {
                "step": total_step,
                "task": task_num,
                "turn_in_task": turn_in_task,
                "user": user_input,
                "assistant": assistant_text,
                "task_context": current_task,
                "timestamp": datetime.now().isoformat(),
                "full_response": response,  # Store complete raw response
            }
            conversation_history.append(turn_data)

            # Check if we should move to next task
            if turn_in_task >= max_turns_per_task:
                if task_num < 5:  # Don't transition after Task 5
                    print(
                        f"\nTask {task_num} completed ({max_turns_per_task} turns). Moving to Task {task_num + 1}..."
                    )
                    user_input = f"task {task_num + 1}"
                    break
                else:
                    print(f"\nTask 5 completed. Ending session.")
                    break

            # Generate next user input using LLM
            try:
                user_input = call_azure_for_user_input(
                    conversation_history, current_task, interaction_guide
                )
                print(f"Next input (LLM-generated): {user_input}")

            except Exception as e:
                print(f"Failed to generate next input: {e}")
                break

            print()

    # Save results
    log_data = {
        "session_id": SESSION_ID,
        "created_at": datetime.now().isoformat(),
        "conversation_type": "dynamic_llm_driven",
        "max_turns_per_task": max_turns_per_task,
        "total_turns": len(conversation_history),
        "tasks_completed": task_num if task_num <= 5 else 5,
        "turns": conversation_history,
        "azure_model": AZURE_MODEL,
    }

    log_path = LOGS_DIR / f"conversation_{SESSION_ID}.json"
    log_path.write_text(json.dumps(log_data, indent=2), encoding="utf-8")

    print("=" * 80)
    print(f"Summary: {len(conversation_history)} total turns recorded.")
    print(f"Tasks completed: {task_num if task_num <= 5 else 5}/5")
    print(f"Saved evaluation log to {log_path}")

    return log_path


if __name__ == "__main__":
    run_dynamic_evaluation()
