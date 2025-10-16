#!/usr/bin/env python3
"""
Run multiple evaluations with different user personas.
Each persona has a distinct communication style to simulate different types of students.
"""
import json
import os
from pathlib import Path
from datetime import datetime

# Load environment variables before importing evaluationDynamic
try:
    from dotenv import load_dotenv

    env_path = Path(__file__).parent / ".env"
    load_dotenv(dotenv_path=env_path, override=True)
except ImportError:
    pass
from evaluationDynamic import (
    LOGS_DIR,
    send_to_flowise,
    load_interaction_guide,
    AZURE_ENDPOINT,
    AZURE_API_KEY,
    AZURE_MODEL,
    SAMPLE_MAP_BASE64,
    SAMPLE_MAP_MIME,
    SAMPLE_MAP_NAME,
)
import uuid
import requests
import re

# Define 10 different personas with distinct communication styles
PERSONAS = [
    {
        "name": "Short & Concise",
        "description": "Uses very short phrases like 'turn left', 'walk straight', 'on your right'",
        "style_prompt": """You are a student who speaks in very short phrases.
Examples: "turn left", "walk ahead", "it's on right", "go straight", "turn around"
Keep responses under 5 words. No complete sentences. Very brief.""",
        "temperature": 0.5,
    },
    {
        "name": "Detailed Explainer",
        "description": "Gives elaborate, detailed directions with lots of context",
        "style_prompt": """You are a student who gives very detailed, elaborate directions.
Use complete sentences, add extra context, landmarks, distances.
Example: "First, you should turn to your left and walk straight ahead for about 50 meters until you see the big tree, then..."
Be verbose and thorough.""",
        "temperature": 0.7,
    },
    {
        "name": "Casual & Informal",
        "description": "Uses casual language, slang, lowercase, incomplete sentences",
        "style_prompt": """You are a casual student who types informally.
Use lowercase, slang, contractions, incomplete sentences.
Examples: "yeah just go left lol", "its like over there by the thing", "idk maybe turn right?"
Very relaxed and informal tone.""",
        "temperature": 0.8,
    },
    {
        "name": "Hesitant & Uncertain",
        "description": "Often unsure, asks questions, uses tentative language",
        "style_prompt": """You are an uncertain student who lacks confidence.
Use words like: "maybe", "I think", "probably", "not sure but...", "is it...?"
Often phrase things as questions. Show hesitation.
Example: "um, maybe turn left? or is it right? I think it's near the corner..."
Be tentative and questioning.""",
        "temperature": 0.6,
    },
    {
        "name": "Step-by-Step Robot",
        "description": "Gives directions in numbered steps, very structured",
        "style_prompt": """You are a student who organizes everything in numbered steps.
Format directions as: "Step 1: Turn left. Step 2: Walk 10 meters. Step 3: ..."
Be very structured and methodical. Always number your steps.""",
        "temperature": 0.4,
    },
    {
        "name": "Visual Describer",
        "description": "Focuses on visual landmarks and what you'll see",
        "style_prompt": """You are a student who describes everything visually.
Focus on what you see: "you'll see a red building", "look for the tall tree", "there's a blue sign"
Emphasize visual cues and landmarks. Paint a picture with words.""",
        "temperature": 0.7,
    },
    {
        "name": "Minimalist",
        "description": "Absolute minimum words, sometimes just directional words",
        "style_prompt": """You are extremely minimalist. Use the absolute minimum words.
Examples: "left", "straight", "right there", "turn", "stop"
Single words or 2-word phrases only. Ultra-brief.""",
        "temperature": 0.3,
    },
    {
        "name": "Overcorrector",
        "description": "Frequently corrects themselves mid-sentence",
        "style_prompt": """You are a student who constantly corrects themselves.
Use phrases like: "turn left, I mean right", "go straight, no wait, turn first", "it's here, actually over there"
Always second-guess and change your mind. Self-correct frequently.""",
        "temperature": 0.8,
    },
    {
        "name": "Reference User",
        "description": "Always relates directions to previously mentioned locations",
        "style_prompt": """You are a student who always references previous locations.
Use phrases like: "like before when we...", "similar to the last one", "remember that place? it's near there"
Always connect to earlier parts of the conversation. Build on previous context.""",
        "temperature": 0.6,
    },
    {
        "name": "Question Asker",
        "description": "Asks many clarifying questions before giving directions",
        "style_prompt": """You are a student who asks questions before answering.
Examples: "which direction are we facing?", "from which building?", "do you mean the main entrance?"
But when giving directions, be clear. Mix questions with responses.""",
        "temperature": 0.7,
    },
]


def call_azure_with_persona(
    conversation_history, current_task, interaction_guide, persona
):
    """
    Modified version of call_azure_for_user_input that incorporates persona.
    """
    if not AZURE_ENDPOINT or not AZURE_API_KEY:
        raise ValueError(
            "Azure OpenAI endpoint and API key required for dynamic evaluation"
        )

    # Build context with persona
    context = f"""You are simulating a student with this communication style:

PERSONA: {persona['name']}
{persona['description']}

STYLE INSTRUCTIONS:
{persona['style_prompt']}

INTERACTION GUIDE REFERENCE:
{interaction_guide[:1500]}

CURRENT TASK: {current_task}

CONVERSATION HISTORY:
"""
    for entry in conversation_history[-6:]:
        assistant_text = entry.get("assistant", "").strip()
        if assistant_text and not assistant_text.startswith("{"):
            context += f"Student: {entry.get('user', '')}\n"
            context += f"Chatbot: {assistant_text[:200]}...\n\n"

    context += """
Generate the NEXT student input following these rules:
1. For very first interaction (Task 1), start with "let's learn" to begin
2. If chatbot just displayed the map, respond with a direction attempt (give directions from one place to another)
3. If chatbot asked for confirmation, respond "yes" or "I accept" (in your persona style)
4. If chatbot provided a correction table, try the task again with improvements or accept and continue
5. If chatbot asked to start a new task, provide directions for that task
6. Make deliberate mistakes (spelling, grammar, wrong directions) to simulate realistic student behavior
7. Use YOUR PERSONA'S communication style consistently
8. Keep practicing direction-giving in the current task
9. Vary your direction attempts (different locations, different phrasings)
10. For Task 5 only, if asked to upload a map, say "preview This is a map"

IMPORTANT: Stay in character with your persona's style!

Respond ONLY with the student's next input text (no explanations):"""

    headers = {"Content-Type": "application/json", "api-key": AZURE_API_KEY}

    payload = {
        "messages": [{"role": "user", "content": [{"type": "text", "text": context}]}],
        "model": AZURE_MODEL,
        "temperature": persona["temperature"],
        "max_tokens": 150,
    }

    response = requests.post(AZURE_ENDPOINT, headers=headers, json=payload, timeout=30)
    response.raise_for_status()

    data = response.json()
    return data["choices"][0]["message"]["content"].strip()


def run_evaluation_with_persona(persona, run_number, max_turns_per_task=10):
    """
    Run a single evaluation with a specific persona.
    """
    print("\n" + "=" * 80)
    print(f"RUN #{run_number}/10 - PERSONA: {persona['name']}")
    print(f"Style: {persona['description']}")
    print("=" * 80)

    # Generate unique session ID for this run
    session_id = str(uuid.uuid4())

    interaction_guide = load_interaction_guide()
    conversation_history = []
    current_task = "Task 1"

    user_input = "let's learn"
    total_step = 0

    # Loop through all 5 tasks
    for task_num in range(1, 6):
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

            # Send to chatbot with session ID
            override_config = {"sessionId": session_id}
            response = send_to_flowise(
                user_input, uploads=uploads, override_config=override_config
            )

            if not response:
                print("Failed to get response from chatbot")
                break

            assistant_text = response.get("text", "")

            # Check for content filter or empty response
            if not assistant_text or assistant_text.strip().startswith("{"):
                print(f"⚠️  Content filtered or empty response. Skipping this turn.")
                total_step -= 1
                turns_in_current_task -= 1
                try:
                    user_input = call_azure_with_persona(
                        conversation_history, current_task, interaction_guide, persona
                    )
                    print(f"Retrying with: {user_input}")
                    continue
                except Exception as e:
                    print(f"Failed to generate retry input: {e}")
                    break

            print(f"AI Response: {assistant_text[:200]}...")

            # Store turn
            turn_data = {
                "step": total_step,
                "task": task_num,
                "turn_in_task": turn_in_task,
                "user": user_input,
                "assistant": assistant_text,
                "task_context": current_task,
                "timestamp": datetime.now().isoformat(),
                "full_response": response,
            }
            conversation_history.append(turn_data)

            # Check if we should move to next task
            if turn_in_task >= max_turns_per_task:
                if task_num < 5:
                    print(
                        f"\nTask {task_num} completed ({max_turns_per_task} turns). Moving to Task {task_num + 1}..."
                    )
                    user_input = f"task {task_num + 1}"
                    break
                else:
                    print(f"\nTask 5 completed. Ending session.")
                    break

            # Generate next user input using persona
            try:
                user_input = call_azure_with_persona(
                    conversation_history, current_task, interaction_guide, persona
                )
                print(f"Next input ({persona['name']}): {user_input}")

            except Exception as e:
                print(f"Failed to generate next input: {e}")
                break

            print()

    # Save results with persona information
    log_data = {
        "session_id": session_id,
        "run_number": run_number,
        "persona": {
            "name": persona["name"],
            "description": persona["description"],
            "temperature": persona["temperature"],
        },
        "created_at": datetime.now().isoformat(),
        "conversation_type": "persona_driven",
        "max_turns_per_task": max_turns_per_task,
        "total_turns": len(conversation_history),
        "tasks_completed": task_num if task_num <= 5 else 5,
        "turns": conversation_history,
        "azure_model": AZURE_MODEL,
    }

    log_filename = f"persona_{run_number:02d}_{persona['name'].replace(' ', '_').replace('&', 'and')}_{session_id}.json"
    log_path = LOGS_DIR / log_filename
    log_path.write_text(json.dumps(log_data, indent=2), encoding="utf-8")

    print("=" * 80)
    print(
        f"Run #{run_number} Summary: {len(conversation_history)} total turns recorded."
    )
    print(f"Tasks completed: {task_num if task_num <= 5 else 5}/5")
    print(f"Saved to {log_path.name}")

    return log_path, log_data


def run_all_evaluations(max_turns_per_task=10):
    """
    Run all 10 evaluations with different personas.
    """
    print("=" * 80)
    print("MULTI-PERSONA EVALUATION RUN")
    print("=" * 80)
    print(f"Total runs: {len(PERSONAS)}")
    print(f"Max turns per task: {max_turns_per_task}")
    print(f"Logs directory: {LOGS_DIR}")
    print()

    results = []
    start_time = datetime.now()

    for i, persona in enumerate(PERSONAS, 1):
        try:
            log_path, log_data = run_evaluation_with_persona(
                persona, i, max_turns_per_task
            )
            results.append(
                {
                    "run_number": i,
                    "persona": persona["name"],
                    "status": "success",
                    "log_file": log_path.name,
                    "total_turns": log_data["total_turns"],
                    "tasks_completed": log_data["tasks_completed"],
                }
            )
        except Exception as e:
            print(f"\n❌ Error in run #{i} ({persona['name']}): {e}")
            results.append(
                {
                    "run_number": i,
                    "persona": persona["name"],
                    "status": "failed",
                    "error": str(e),
                }
            )

        print("\n" + "=" * 80)
        print(f"Completed run #{i}/{len(PERSONAS)}")
        print("=" * 80 + "\n")

    end_time = datetime.now()
    duration = end_time - start_time

    # Save summary report
    summary = {
        "total_runs": len(PERSONAS),
        "successful_runs": sum(1 for r in results if r["status"] == "success"),
        "failed_runs": sum(1 for r in results if r["status"] == "failed"),
        "start_time": start_time.isoformat(),
        "end_time": end_time.isoformat(),
        "duration_seconds": duration.total_seconds(),
        "max_turns_per_task": max_turns_per_task,
        "personas": PERSONAS,
        "results": results,
    }

    summary_path = LOGS_DIR / f"summary_{start_time.strftime('%Y%m%d_%H%M%S')}.json"
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    # Print final summary
    print("\n" + "=" * 80)
    print("FINAL SUMMARY")
    print("=" * 80)
    print(f"Total runs: {summary['total_runs']}")
    print(f"Successful: {summary['successful_runs']}")
    print(f"Failed: {summary['failed_runs']}")
    print(f"Duration: {duration}")
    print(f"\nSummary saved to: {summary_path}")
    print("\nResults by persona:")
    for result in results:
        status_icon = "✅" if result["status"] == "success" else "❌"
        print(f"  {status_icon} Run #{result['run_number']}: {result['persona']}")
        if result["status"] == "success":
            print(
                f"     Turns: {result['total_turns']}, Tasks: {result['tasks_completed']}/5"
            )
    print("=" * 80)

    return summary


if __name__ == "__main__":
    run_all_evaluations(max_turns_per_task=10)
