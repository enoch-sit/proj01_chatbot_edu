import argparse
import json
import os
import re
from pathlib import Path
from typing import Optional

try:
    import boto3  # type: ignore
except ImportError:
    boto3 = None

try:
    from botocore.exceptions import ClientError  # type: ignore
except ImportError:  # pragma: no cover - only hit if botocore missing entirely
    ClientError = None

try:
    import requests  # type: ignore
except ImportError:
    requests = None

try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv(override=True)  # Override system env vars with .env values
except ImportError:
    pass  # dotenv is optional


def load_expectations(expectation_path: Path) -> dict:
    """Parse expectation markdown into a mapping keyed by step number and default."""
    text = expectation_path.read_text(encoding="utf-8")
    sections = {}
    current_key = "default"
    buffer = []

    step_pattern = re.compile(r"^##\s+Step\s+(\d+)", re.IGNORECASE)

    for line in text.splitlines():
        match = step_pattern.match(line.strip())
        if match:
            if buffer:
                sections[current_key] = "\n".join(buffer).strip()
                buffer = []
            current_key = int(match.group(1))
        elif line.startswith("## "):
            if buffer:
                sections[current_key] = "\n".join(buffer).strip()
                buffer = []
            current_key = line[3:].strip().lower()
        else:
            buffer.append(line)

    if buffer:
        sections[current_key] = "\n".join(buffer).strip()

    return sections


def select_expectation(expectations: dict, step: int) -> str:
    if step in expectations and expectations[step]:
        return expectations[step]
    if "step" in expectations and expectations["step"]:
        return expectations["step"]
    return expectations.get("default", "")


def build_prompt(expectation: str, user_text: str, ai_text: str) -> str:
    expectation_text = expectation.strip() or "No explicit expectation provided. Focus on general quality."

    return (
        "You judge whether the assistant response satisfies the expectation.\n\n"
        "IMPORTANT: The assistant's response contains markdown formatting (HTML code blocks, markdown tables, bold text, etc.). "
        "Review the content as rendered markdown, not raw text. Look for structure and content within the markdown.\n\n"
        "Expectation:\n"
        f"{expectation_text}\n\n"
        "Conversation snippet:\n"
        f"User: {user_text}\n"
        f"Assistant (markdown format): {ai_text}\n\n"
        "Decide PASS if the assistant meets the expectation, otherwise FAIL. "
        "Consider the markdown structure when evaluating.\n"
        "Respond with compact JSON: {\"result\": \"PASS|FAIL\", \"rationale\": \"short justification\"}."
    )


def call_bedrock(prompt: str, model_id: str, temperature: float, max_tokens: int, region: str) -> dict:
    if boto3 is None:
        raise SystemExit("boto3 is required. Install it with `pip install boto3` and configure AWS credentials.")

    client = boto3.client("bedrock-runtime", region_name=region)
    payload = {
        "inputText": prompt,
        "textGenerationConfig": {
            "temperature": temperature,
            "topP": 0.9,
            "maxTokenCount": max_tokens,
        },
    }

    try:
        response = client.invoke_model(modelId=model_id, body=json.dumps(payload))
    except Exception as exc:  # pragma: no cover - network/auth failures
        if ClientError and isinstance(exc, ClientError):
            error_info = exc.response.get("Error", {}) if hasattr(exc, "response") else {}
            code = error_info.get("Code", "Unknown")
            message = error_info.get("Message", str(exc))
            raise SystemExit(f"Bedrock invoke_model failed ({code}): {message}")
        raise SystemExit(f"Bedrock invoke_model failed: {exc}")
    body = json.loads(response["body"].read())
    text = body.get("outputText", "").strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"result": "ERROR", "rationale": text or "Model returned non-JSON response."}


def call_azure_openai(prompt: str, endpoint: str, api_key: str, temperature: float, max_tokens: int, model: str = "gpt-4o-mini") -> dict:
    if requests is None:
        raise SystemExit("requests is required. Install it with `pip install requests`.")

    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": "You are a judge evaluating assistant responses against expectations."
                    }
                ]
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            }
        ],
        "stream": False,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    headers = {
        "Content-Type": "application/json",
        "api-key": api_key,
    }

    try:
        response = requests.post(endpoint, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise SystemExit(f"Azure OpenAI request failed: {exc}")

    data = response.json()
    choices = data.get("choices", [])
    if not choices:
        return {"result": "ERROR", "rationale": "No choices returned by Azure OpenAI."}

    message = choices[0].get("message", {})
    content = message.get("content", "").strip()

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {"result": "ERROR", "rationale": content or "Model returned non-JSON response."}


def judge_log(log_path: Path, expectation_path: Path, model_id: str, region: str, temperature: float, max_tokens: int, steps=None, azure_endpoint=None, azure_api_key=None, azure_model=None):
    data = json.loads(log_path.read_text(encoding="utf-8"))
    expectations = load_expectations(expectation_path)

    results = []

    # Prefer Azure OpenAI if endpoint and key are provided, otherwise fall back to Bedrock
    use_azure = bool(azure_endpoint and azure_api_key)

    for turn in data.get("turns", []):
        step = turn.get("step")
        if steps and step not in steps:
            continue
        user_text = turn.get("user", "")
        ai_text = (turn.get("ai_response") or {}).get("text", "")
        expectation = select_expectation(expectations, step)
        prompt = build_prompt(expectation, user_text, ai_text)

        if use_azure:
            judge_output = call_azure_openai(prompt, azure_endpoint, azure_api_key, temperature, max_tokens, azure_model or "gpt-4o-mini")
        else:
            judge_output = call_bedrock(prompt, model_id, temperature, max_tokens, region)

        results.append({
            "step": step,
            "user": user_text,
            "assistant": ai_text,
            "expectation": expectation,
            "judge": judge_output,
        })

    return {
        "log": str(log_path),
        "log_tag": log_path.stem,
        "model": f"{azure_endpoint} ({azure_model or 'gpt-4o-mini'})" if use_azure else model_id,
        "results": results,
    }


def resolve_log_path(log_arg: Path) -> Path:
    if str(log_arg).lower() != "latest":
        return log_arg

    base_dir = Path(__file__).parent
    logs_dir = base_dir / "evaluation_logs"
    latest: Optional[Path] = None
    for candidate in logs_dir.glob("evaluation_test_session_*.json"):
        if latest is None or candidate.stat().st_mtime > latest.stat().st_mtime:
            latest = candidate

    if latest is None:
        raise FileNotFoundError(f"No evaluation_test_session logs found in {logs_dir}")

    return latest


def parse_args():
    parser = argparse.ArgumentParser(description="Run LLM judge on evaluation log using expectation markdown.")
    parser.add_argument("log", type=Path, help="Path to evaluation log JSON file, or use 'latest' to pick the newest log.")
    parser.add_argument("expectation", type=Path, help="Path to expectation markdown file.")
    parser.add_argument("--model", default=os.environ.get("BEDROCK_MODEL", "amazon.nova-lite-v1:0"), help="Bedrock model ID.")
    parser.add_argument("--region", default=os.environ.get("AWS_REGION", "us-east-1"), help="AWS region for Bedrock.")
    parser.add_argument("--azure-endpoint", default=os.environ.get("AZURE_OPENAI_ENDPOINT"), help="Azure OpenAI endpoint URL.")
    parser.add_argument("--azure-api-key", default=os.environ.get("AZURE_OPENAI_API_KEY"), help="Azure OpenAI API key.")
    parser.add_argument("--azure-model", default=os.environ.get("AZURE_OPENAI_MODEL", "gpt-4o-mini"), help="Azure OpenAI model name.")
    parser.add_argument("--temperature", type=float, default=0.0, help="Sampling temperature.")
    parser.add_argument("--max-tokens", type=int, default=512, help="Max tokens for judge response.")
    parser.add_argument("--steps", type=int, nargs="*", help="Optional specific steps to judge.")
    parser.add_argument("--output", type=Path, help="Optional path to save judge results JSON.")
    return parser.parse_args()


def main():
    args = parse_args()
    log_path = resolve_log_path(args.log)
    report = judge_log(
        log_path=log_path,
        expectation_path=args.expectation,
        model_id=args.model,
        region=args.region,
        temperature=args.temperature,
        max_tokens=args.max_tokens,
        steps=set(args.steps) if args.steps else None,
        azure_endpoint=args.azure_endpoint,
        azure_api_key=args.azure_api_key,
        azure_model=args.azure_model,
    )

    output_text = json.dumps(report, indent=2)

    if args.output:
        args.output.write_text(output_text, encoding="utf-8")
        print(f"Saved judge report to {args.output}")
    else:
        print(output_text)


if __name__ == "__main__":
    main()
