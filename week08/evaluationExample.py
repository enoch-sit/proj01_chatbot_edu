import requests
import json
import re
from pathlib import Path
from datetime import datetime


BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"


def encode_base64(data: bytes) -> str:
    if not data:
        return ""

    encoded_chars = []
    for i in range(0, len(data), 3):
        chunk = data[i:i + 3]
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
FLOWISE_API_URL = "https://aiagent.qefmoodle.com/api/v1/prediction/16fee693-5871-4362-918b-6109fe48d939"
PATH_TOOL_API_URL = 'https://aai.eduhk.hk/simpletool/path'
PATH_TOOL_API_KEY = 'JePCs6VP-Dc7rE42s1hToGpqQguwzOBHwzlUt1cEcp8'  # From the provided tool code

MAP_IMAGE_PATH = Path(__file__).with_name("mapfortask5.png")
SAMPLE_MAP_NAME = MAP_IMAGE_PATH.name
SAMPLE_MAP_MIME = "image/png"
SAMPLE_MAP_BASE64 = load_map_base64(MAP_IMAGE_PATH)

SESSION_ID = f"test_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"  # Unique session for each run

# Sample conversation flow from user query
CONVERSATION_FLOW = [
    {"user": "let's learn", "expect_map": True},
    {"user": "turn left"},
    {"user": "yes"},
    {"user": "walk straguth, the hospital is on your left"},
    {"user": "Task 2"},
    {"user": "exit Book shop, turn left, walk along West street and police station is on your right"},
    {"user": "Task 3"},
    {"user": "Exit from sports Center into North Street. turn right, walk along North street and turn right into East Street and supermark is on your left"},
    {"user": "Task 4"},
    {"user": "turn left and walk along and turn right"},
    {"user": "preview This is a map", "is_upload": True},  # Simulate Task 5 upload
    {"user": "Exit building and turn left and walk along and turn right"}
]

# Function to send message to Flowise API
def send_to_flowise(question, uploads=None, override_config=None):
    payload = {
        "question": question,
        "overrideConfig": override_config or {"sessionId": SESSION_ID}
    }
    if uploads:
        payload["uploads"] = uploads
    
    response = requests.post(FLOWISE_API_URL, json=payload)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return None

# Function to call Path Tool API for correct directions
def get_correct_path(start, end):
    options = {
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {PATH_TOOL_API_KEY}"
        },
        "body": json.dumps({"start": start, "end": end})
    }
    
    response = requests.post(PATH_TOOL_API_URL, **options)
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            # Extract turn-by-turn directions as list
            directions = []
            for edge in data["edges"]:
                if edge["turn"] == "start":
                    continue
                direction_str = f"{edge['turn'].capitalize()} {edge['direction'].lower()} from {edge['from']} to {edge['to']}."
                directions.append(direction_str)
            # Add final position
            if data["edges"]:
                last_turn = data["edges"][-1]["turn"]  # Assuming last has the on left/right
                directions.append(f"{end} is on your {last_turn}.")
            return directions
        else:
            return None
    else:
        print(f"Path Tool Error: {response.status_code}")
        return None

# Function to extract locations from AI response (e.g., "from Post Office to Hospital")
def extract_locations(ai_response_text):
    match = re.search(r"from ([\w\s]+) to ([\w\s]+)\?", ai_response_text)
    if match:
        return match.group(1).strip(), match.group(2).strip()
    return None, None

# Function to extract revised directions from AI's table
def extract_revised_directions(table_text):
    lines = table_text.split("\n")
    revised = []
    for line in lines[2:]:  # Skip header
        if "|" in line:
            parts = line.split("|")
            if len(parts) >= 3:
                revised.append(parts[2].strip())
    return revised

# Function to evaluate response
def evaluate_response(step, user_msg, ai_response, prev_context):
    print(f"\nStep {step}: User: {user_msg}")
    print(f"AI Response: {ai_response.get('text', 'No text')}")
    
    evaluation = {"passed": True, "notes": []}
    
    # Check for map display in first response
    if "expect_map" in prev_context and "<iframe" not in ai_response.get('text', ''):
        evaluation["passed"] = False
        evaluation["notes"].append("Missing map iframe")
    
    # Check for correction table
    if "Original" in ai_response.get('text', '') and "Revised" in ai_response.get('text', ''):
        print("Table detected.")
    else:
        if "Task" not in user_msg:  # Tasks initiations don't need table
            evaluation["passed"] = False
            evaluation["notes"].append("Missing correction table")
    
    # For tasks 1-4, verify directions against path tool
    if any(task in user_msg.lower() for task in ["task 1", "task 2", "task 3", "task 4"]) or "next step" in ai_response.get('text', '').lower():
        start, end = extract_locations(ai_response.get('text', '') or prev_context.get('last_opening', ''))
        if start and end:
            correct_directions = get_correct_path(start, end)
            if correct_directions:
                revised = extract_revised_directions(ai_response.get('text', ''))
                # Simple match check (can be improved with fuzzy matching)
                if len(revised) > 0 and any(any(dir_part in rev for dir_part in correct_directions) for rev in revised):
                    print("Directions seem to match.")
                else:
                    evaluation["passed"] = False
                    evaluation["notes"].append("Directions do not match correct path")
            else:
                evaluation["notes"].append("Could not get correct path")
    
    # For Task 5, check if no tool used (as per prompt) and guiding question
    if "Task 5" in ai_response.get('text', '') or "your map" in ai_response.get('text', ''):
        if "reading_the_map_adv_3" in ai_response.get('text', ''):  # Should not use tool
            evaluation["passed"] = False
            evaluation["notes"].append("Used forbidden tool in Task 5")
    
    print("Evaluation:", evaluation)
    return evaluation

# Run the automation
def run_evaluation():
    responses = []
    evaluations = []
    context = {}
    
    for i, turn in enumerate(CONVERSATION_FLOW, 1):
        user_msg = turn["user"]
        uploads = None
        if turn.get("is_upload"):
            # Prepare upload
            uploads = [{
                "data": f"data:{SAMPLE_MAP_MIME};base64,{SAMPLE_MAP_BASE64}",
                "type": "file",
                "name": SAMPLE_MAP_NAME,
                "mime": SAMPLE_MAP_MIME
            }]
        
        ai_response = send_to_flowise(user_msg, uploads=uploads)
        if ai_response:
            responses.append(ai_response)
            eval_result = evaluate_response(i, user_msg, ai_response, context)
            evaluations.append(eval_result)
            
            # Update context
            if "from" in ai_response.get('text', '') and "to" in ai_response.get('text', ''):
                context["last_opening"] = ai_response["text"]
        
    # Summary
    passed_count = sum(1 for e in evaluations if e["passed"])
    print(f"\nSummary: {passed_count}/{len(evaluations)} steps passed.")
    for idx, ev in enumerate(evaluations, 1):
        if not ev["passed"]:
            print(f"Step {idx} failed: {ev['notes']}")

if __name__ == "__main__":
    run_evaluation()