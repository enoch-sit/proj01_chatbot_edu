# Conversation Logging Commands

## Virtual Environment

- `python -m venv .venv`
- `.venv\Scripts\activate`
- `pip install -r requirements.txt`

## Run Dynamic Conversation Logging

- `python evaluationDynamic.py` (simulates student using Azure OpenAI)
- Students start with "let's learn" and switch tasks with "task 2", "task 3", "task 4", "task 5"
- Default: 10 turns per task × 5 tasks = 50 total conversation turns
- Requires: `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_MODEL` in `.env`
- Output: `evaluation_logs/conversation_test_session_YYYYMMDD_HHMMSS.json`

## Run with Custom Settings (Recommended)

- `python evaluate_and_judge.py` (runs conversation logging and displays summary)
- `python evaluate_and_judge.py --max-turns 15` (customize turns per task)
- Pure conversation logging - no evaluation or judging

## View Conversation in Browser

- Open `evaluation_logs/viewer.html` in a browser
- Load conversation log file
- View clean conversation: user requests → chatbot responses
- Beautiful card-based layout with task/turn tracking

## Dependency Management

- `pip freeze > requirements.txt`
- `pip install boto3`
- `pip install python-dotenv`
