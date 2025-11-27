from dotenv import load_dotenv

load_dotenv()
import os
import json
import uuid
import datetime
from typing import List, Dict, Any, Optional, TypedDict
from langchain_aws import ChatBedrock
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage
from tmdb_tools import (
    tmdb_search_movie,
    tmdb_discover_movies,
    tmdb_get_genres,
    tmdb_get_movie_videos,
)

# ====== 配置 ======
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
BEDROCK_MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
CHAT_HISTORY_DIR = "./movie_agent_chat_history"
os.makedirs(CHAT_HISTORY_DIR, exist_ok=True)

if not TMDB_API_KEY:
    raise ValueError("请先设置环境变量 TMDB_API_KEY")

# 可用模型配置
AVAILABLE_MODELS = {
    "1": {
        "name": "AWS Bedrock Nova Lite",
        "provider": "bedrock",
        "model_id": "amazon.nova-lite-v1:0",
    },
    "2": {"name": "GPT-4.1", "provider": "openrouter", "model_id": "openai/gpt-4.1"},
    # DeepSeek V2.5 在工具调用时会被路由到 Novita 导致错误,暂时禁用
    # "3": {"name": "DeepSeek Chat V2.5", "provider": "openrouter", "model_id": "deepseek/deepseek-chat"},
}

# ====== 工具注册 ======
tools = [
    tmdb_search_movie,
    tmdb_discover_movies,
    tmdb_get_genres,
    tmdb_get_movie_videos,
]
tool_node = ToolNode(tools)

# Removed loading of external TMDB API markdown files and embedding into the system prompt

# ====== Agent提示词 ======
# 获取当前日期,供 LLM 计算时间范围
current_date = datetime.date.today().strftime("%Y-%m-%d")

system_prompt = f"""
你是一个专业的电影AI助手,使用 TMDB API 为用户提供电影查询和推荐服务。

⏰ **当前日期**: {current_date}
💡 当用户询问"最近上映"/"正在上映"/"本周新片"时,请根据当前日期计算时间范围,使用 primary_release_date_gte/lte 参数

# 核心规则
- 数据来源: 所有电影信息（标题、评分、预告片等）必须来自 tmdb_search_movie/tmdb_discover_movies 等工具返回的 raw_data 字段
- 禁止行为:
  1. 禁止编造电影信息（如虚构评分、上映时间）
  2. 禁止跳过工具直接回答（即使已知电影信息）
  3. 禁止跳过思考步骤
  4. 禁止修改工具返回的核心数据（如评分、预告片链接）

 
# TMDB 可用参数列表（含格式示例）
- sort_by: **必须保持默认 "popularity.desc"（按热度排序）。即使用户要求"高分"或"评分最高"，也必须用热度排序，通过 vote_average.gte 来筛选高分电影，而不是改变排序方式**
- with_genres: 类型ID（纯数字字符串，完整映射如下）
  - 动作：28 | 冒险：12 | 动画：16 | 喜剧：35 | 犯罪：80 | 纪录片：99 | 剧情：18 | 家庭：10751 | 奇幻：14 | 历史：36
  - 恐怖：27 | 音乐：10402 | 悬疑：9648 | 爱情：10749 | 科幻：878 | 惊悚：53 | 战争：10752 | 西部：37 | 电视电影：10770
- without_genres: 排除类型（格式同 with_genres）
- vote_average.gte/lte: 评分范围（0-10，float，如 7.5）**。用这个参数来筛选高分电影，保持热度排序**
- vote_count.gte: 最低评分人数（int，**无默认值，不要设置此参数除非用户明确要求，保持灵活性以支持冷门电影搜索**）
- primary_release_year: 首映年份（int，如 2023）
- primary_release_date.gte/lte: 日期范围（字符串，如 "2024-01-01"）
- with_origin_country: 制作地区（国家代码，如 CN=中国、JP=日本、KR=韩国、TW=中国台湾、HK=中国香港）
- with_original_language: 原始语言（代码，如 zh=中文、en=英文、ja=日文、ko=韩文）
- with_runtime.gte/lte: 时长范围（分钟，int，如 90）
- with_companies: 制片公司ID（纯数字字符串，多值用 | 或 , 分隔）
- with_cast: 演员ID（纯数字字符串，多值用 | 或 , 分隔）
- with_release_type: 发行状态（int，3=院线上映中，1=未上映，2=数字发行）
- query: 电影标题（精确搜索用，字符串，如 "无间道"）
- region: 发行地区（国家代码，如 CN/US/TW）
- page: 页码（int，默认 1）
- count: 返回结果数量（工具内部截取）
- include_adult: 是否包含成人内容（boolean，默认 false）

# 工具调用流程（按场景选择）
1. 精确搜索（已知电影名/年份）→ tmdb_search_movie
   - 场景示例："找《盗梦空间》"、"2010年的《inception》"、"搜索《无间道》"
2. 条件推荐/筛选（按类型/年份/地区等）→ tmdb_discover_movies
   - 场景示例："Find popular action movies"、"推荐高分科幻片"、"2023年中国台湾爱情片"、"正在上映的喜剧片"
3. 获取YouTube预告片直接链接 → tmdb_get_movie_videos
   - 场景示例："《盗梦空间》的YouTube预告片"、"要能直接播放的预告片链接"
   - 注意：推荐列表默认包含TMDB预告片页面链接，仅用户明确要YouTube直接链接时使用

# 推理内容要求
**重要**：每次回复必须严格分离"推理过程"和"最终答案"：

1. **推理过程**（思考部分）：
   - 用 <thinking>...</thinking> 标签包裹你的所有推理和思考
   - 在标签内自由表达你的思维过程，包括分析、判断、决策等
   - 这部分只给用户看你的思考，不包含最终答案

2. **最终答案**（回复部分）：
   - 在 </thinking> 标签之后输出最终答案
   - **必须**包含三个部分：
     a) **开场白**（1-2句话）：自然地回应用户需求，如"根据您的要求..."、"为您找到了..."等
     b) **格式化电影列表**：严格按照"电影输出格式要求"展示
     c) **结尾总结**（1-2句话）：补充推荐理由、提供建议或友好问候
   - 让回复像一个真人助手在对话，而不是机器在输出数据

**示例结构**：
```
<thinking>
用户要搜索科幻片...我需要用 tmdb_discover_movies...参数应该是...
</thinking>

根据您的需求，我为您找到了以下几部高分科幻片：

1. **电影标题** (年份)
   - 评分: 8.5/10
   ...

2. **电影标题2** (年份)
   - 评分: 8.2/10
   ...

这几部都是口碑和热度兼具的佳作，特别推荐第一部！如有其他需求请随时告诉我～
```

# 格式规范
## 电影输出格式要求（必须至少包含以下信息，如果有其他有用的信息也可以展示出来）
1. **电影标题** (年份)
   - 评分: X.X/10 (X,XXX人评价)
   - 热度: XX.X
   - 简介: **[重要] 如果简介超过80字，请自动压缩为核心剧情概括（保留主角、主线冲突、情感基调），控制在80字以内**
   🎬 预告片: https://www.themoviedb.org/movie/{{{{movie_id}}}}/videos

2. **电影标题2** (年份)
   - 评分: X.X/10
   - 热度: XX.X  
   - 简介: **[压缩规则同上，80字以内]**
   🎬 预告片: 暂无预告片
   
"""

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
    ]
)
# llm_with_tools 将在 MovieAgent 内部初始化


# ====== 状态定义 ======
class AgentState(TypedDict):
    memory: list
    thoughts: List[str]
    iterations: int
    max_iterations: int
    current_tool_calls: List[Dict[str, Any]]
    current_turn_id: str


# ====== Agent入口 ======
class MovieAgent:
    def __init__(
        self,
        user_id: str = "default_user",
        max_history_messages: int = 20,
        model_choice: str = "2",  # 默认使用 GPT-4.1
    ):
        self.model_choice = model_choice
        self.current_model_info = AVAILABLE_MODELS[model_choice]
        self.llm = self._init_llm()
        self.llm_with_tools = prompt | self.llm.bind_tools(tools)
        self.graph = self._build_graph()
        self.memory = []  # 用list管理历史消息
        self.max_history_messages = max_history_messages
        self.state: AgentState = {
            "memory": self.memory,
            "thoughts": [],
            "iterations": 0,
            "max_iterations": 5,  # 增加到5轮，支持复杂查询
            "current_tool_calls": [],
            "current_turn_id": "",
        }
        print(f"✅ 已加载模型: {self.current_model_info['name']}")

    def _init_llm(self):
        """初始化 LLM (支持 Bedrock 和 OpenRouter)"""
        provider = self.current_model_info["provider"]
        model_id = self.current_model_info["model_id"]

        try:
            if provider == "bedrock":
                import boto3

                client_kwargs = {"region_name": AWS_REGION}
                if AWS_ACCESS_KEY and AWS_SECRET_KEY:
                    client_kwargs.update(
                        {
                            "aws_access_key_id": AWS_ACCESS_KEY,
                            "aws_secret_access_key": AWS_SECRET_KEY,
                        }
                    )
                bedrock_client = boto3.client("bedrock-runtime", **client_kwargs)
                return ChatBedrock(
                    client=bedrock_client,
                    model_id=model_id,
                    model_kwargs={"temperature": 0.2, "max_tokens": 2048},
                )
            elif provider == "openrouter":
                from langchain_openai import ChatOpenAI

                if not OPENROUTER_API_KEY:
                    raise ValueError("请先设置环境变量 OPENROUTER_API_KEY")

                # 配置 headers,优先使用官方提供商,避免第三方提供商余额问题
                headers = {
                    "HTTP-Referer": "https://github.com/your-repo",
                    "X-Title": "Movie Agent",
                }

                # 对于 OpenAI 模型,要求使用 OpenAI 官方
                if "openai/" in model_id or "gpt" in model_id.lower():
                    headers["X-OpenRouter-Provider-Order"] = "OpenAI"
                # 对于 DeepSeek 模型,排除 Novita 提供商
                elif "deepseek/" in model_id:
                    # 使用排除列表,不使用 Novita
                    headers["X-OpenRouter-Provider-Preferences"] = (
                        '{"ignore": ["Novita"]}'
                    )

                return ChatOpenAI(
                    model=model_id,
                    openai_api_key=OPENROUTER_API_KEY,
                    openai_api_base="https://openrouter.ai/api/v1",
                    temperature=0.2,
                    max_tokens=2048,
                    default_headers=headers,
                )
        except Exception as e:
            print(f"❌ LLM 初始化失败: {str(e)}")
            raise

    def switch_model(self, model_choice: str):
        """运行时切换模型"""
        if model_choice not in AVAILABLE_MODELS:
            print(f"❌ 无效的模型选择，请输入 1-{len(AVAILABLE_MODELS)}")
            return False

        print(f"\n🔄 正在切换模型...")
        old_model = self.current_model_info["name"]

        self.model_choice = model_choice
        self.current_model_info = AVAILABLE_MODELS[model_choice]
        self.llm = self._init_llm()
        self.llm_with_tools = prompt | self.llm.bind_tools(tools)
        self.graph = self._build_graph()

        # 切换模型后清空历史
        self.reset()

        print(f"✅ 模型切换成功!")
        print(f"   旧模型: {old_model}")
        print(f"   新模型: {self.current_model_info['name']}")
        print(f"   (对话历史已清空)\n")
        return True

    def _build_graph(self):
        """构建 LangGraph 流程图"""
        graph = StateGraph(AgentState)
        graph.add_node("llm", self._call_llm)
        graph.add_node("tools", self._process_tool_response)
        graph.set_entry_point("llm")
        graph.add_conditional_edges(
            "llm", self._should_continue, {"tools": "tools", END: END}
        )
        graph.add_edge("tools", "llm")
        return graph.compile()

    def _should_continue(self, state: AgentState) -> str:
        """判断是否继续执行 (复制原 should_continue 逻辑)"""
        # 1. 迭代次数上限
        if state["iterations"] >= state["max_iterations"]:
            state["thoughts"].append(
                f"Iteration {state['iterations']} (max reached), terminate"
            )
            return END

        # 2. 检查工具返回
        last_tool_msg = None
        for msg in reversed(state["memory"]):
            if isinstance(msg, ToolMessage) and getattr(msg, "tool_call_id", None):
                last_tool_msg = msg
                break

        if last_tool_msg:
            try:
                tool_result_wrapper = json.loads(last_tool_msg.content)
                if (
                    isinstance(tool_result_wrapper, dict)
                    and "toolResult" in tool_result_wrapper
                ):
                    tool_data = json.loads(tool_result_wrapper["toolResult"]["content"])
                else:
                    tool_data = tool_result_wrapper
                # 工具错误：允许重试
                if tool_data.get("status") == "error":
                    if state["iterations"] < state["max_iterations"] - 1:
                        state["thoughts"].append(
                            f"Tool error: {tool_data['msg'][:30]}, retry"
                        )
                        return "tools"
                    else:
                        state["thoughts"].append(f"Tool error (retried), terminate")
                        return END
                # 空数据：让LLM生成友好回复
                if not tool_data.get("raw_data"):
                    state["thoughts"].append(
                        "No raw data returned, but let LLM generate friendly response"
                    )
            except Exception as e:
                if state["iterations"] < state["max_iterations"] - 1:
                    state["thoughts"].append("Tool response format error, retry")
                    return "tools"
                else:
                    state["thoughts"].append("Format error (retried), terminate")
                    return END

        # 3. 已有最终回复
        last_msg = state["memory"][-1] if state["memory"] else None
        if isinstance(last_msg, AIMessage) and not getattr(
            last_msg, "tool_calls", None
        ):
            state["thoughts"].append("Final response generated, terminate")
            return END

        return "tools"

    def _call_llm(self, state: AgentState) -> AgentState:
        """调用 LLM (复制原 call_llm 逻辑)"""
        chat_history = state["memory"].copy()
        thoughts = state["thoughts"].copy()
        iterations = state["iterations"] + 1

        # 调用LLM
        response = self.llm_with_tools.invoke({"chat_history": chat_history})
        state["memory"].append(response)

        # 📝 捕获 LLM 的推理内容（从 <thinking> 标签中提取）
        import re

        llm_reasoning = ""
        full_content = ""

        if response.content:
            if isinstance(response.content, str):
                full_content = response.content.strip()
            elif isinstance(response.content, list):
                # 某些模型返回列表格式
                text_parts = []
                for item in response.content:
                    if isinstance(item, dict) and item.get("type") == "text":
                        text_parts.append(str(item.get("text", "")))
                    elif isinstance(item, str):
                        text_parts.append(item)
                full_content = " ".join(text_parts).strip()

        # 提取 <thinking> 标签内的推理内容
        if full_content:
            thinking_match = re.search(
                r"<thinking>(.*?)</thinking>", full_content, re.DOTALL | re.IGNORECASE
            )
            if thinking_match:
                llm_reasoning = thinking_match.group(1).strip()
            else:
                # 如果没有 <thinking> 标签，尝试提取"推理过程："之后、"最终答案："之前的内容
                reasoning_match = re.search(
                    r"推理过程：(.*?)(?:最终答案：|$)", full_content, re.DOTALL
                )
                if reasoning_match:
                    llm_reasoning = reasoning_match.group(1).strip()
                else:
                    # 兜底：如果有 tool_calls，说明这是推理阶段，整个内容都是推理
                    if getattr(response, "tool_calls", None):
                        llm_reasoning = full_content

        new_tool_calls = getattr(response, "tool_calls", [])
        valid_calls = []
        validation_warnings = []

        for call in new_tool_calls:
            params = call.get("args") or call.get("parameters") or {}
            tool_name = call["name"]

            # 🔍 参数自检 - 检测常见错误
            if tool_name == "tmdb_discover_movies" and "genre_id" in params:
                genre_val = str(params["genre_id"])
                # 检测 HTML 转义
                if "&quot;" in genre_val or "&#34;" in genre_val or "\\" in genre_val:
                    validation_warnings.append(
                        f"⚠️ 参数警告: genre_id 包含 HTML 转义或特殊字符 '{genre_val}' - 已自动清理为纯数字"
                    )

            valid_calls.append(call)

        state["current_tool_calls"] = valid_calls

        # 记录迭代信息和推理内容
        thoughts.append(
            f"Iteration {iterations}: Tool calls → {[call['name'] for call in valid_calls]}"
        )

        # 📝 记录 LLM 的推理文本（如果有）
        if llm_reasoning:
            thoughts.append(f"LLM reasoning → {llm_reasoning}")

        # 记录验证警告
        if validation_warnings:
            for warning in validation_warnings:
                thoughts.append(warning)

        return {
            "memory": state["memory"],
            "thoughts": thoughts,
            "iterations": iterations,
            "max_iterations": state["max_iterations"],
            "current_tool_calls": state["current_tool_calls"],
            "current_turn_id": state["current_turn_id"],
        }

    def _process_tool_response(self, state: AgentState) -> AgentState:
        """处理工具响应 (复制原 process_tool_response 逻辑)"""
        thoughts = state["thoughts"].copy()
        iterations = state["iterations"]

        if not state.get("current_tool_calls", []):
            thoughts.append("No valid tool calls, skip execution")
            return state

        # 参数清洗函数
        def clean_params(params: dict) -> dict:
            import html

            cleaned = {}
            for k, v in params.items():
                if isinstance(v, str):
                    v = html.unescape(v)
                    if v.startswith('"') and v.endswith('"') and len(v) > 2:
                        v = v[1:-1]
                    if v.startswith("'") and v.endswith("'") and len(v) > 2:
                        v = v[1:-1]
                cleaned[k] = v
            return cleaned

        for tool_call in state.get("current_tool_calls", []):
            tool_name = tool_call["name"]
            tool_input_raw = tool_call.get("args") or tool_call.get("parameters") or {}
            tool_call_id = tool_call["id"]

            tool_input = clean_params(tool_input_raw)
            # 添加 current_turn_id 用于后续识别
            tool_input_with_id = tool_input.copy()
            tool_input_with_id["current_turn_id"] = state["current_turn_id"]

            tool_found = False
            for tool in tools:
                if tool.name == tool_name:
                    tool_found = True
                    try:
                        result = tool.invoke(tool_input)
                        thoughts.append(
                            f"Tool {tool_name} success → Params: {tool_input}"
                        )

                        try:
                            result_data = (
                                json.loads(result)
                                if isinstance(result, str)
                                else result
                            )
                            if isinstance(result_data, dict) and not result_data.get(
                                "raw_data"
                            ):
                                thoughts.append(
                                    "Tool returned empty data, guidance for LLM will be handled in prompt"
                                )
                        except:
                            pass

                        formatted_result = {
                            "toolResult": {"content": result, "toolUseId": tool_call_id}
                        }
                    except Exception as e:
                        error_msg = f"Execution error: {str(e)}"
                        formatted_result = {
                            "toolResult": {
                                "content": json.dumps(
                                    {"status": "error", "msg": error_msg},
                                    ensure_ascii=False,
                                ),
                                "toolUseId": tool_call_id,
                                "error": error_msg,
                            }
                        }
                        thoughts.append(f"Tool {tool_name} failed → {str(e)}")
                    state["memory"].append(
                        ToolMessage(
                            content=json.dumps(formatted_result, ensure_ascii=False),
                            tool_call_id=tool_call_id,
                            name=tool_name,
                            tool_input=tool_input_with_id,
                        )
                    )
                    break
            if not tool_found:
                error_msg = f"工具名错误：{tool_name} 不是有效工具"
                formatted_result = {
                    "toolResult": {
                        "content": json.dumps(
                            {"status": "error", "msg": error_msg}, ensure_ascii=False
                        ),
                        "toolUseId": tool_call_id,
                        "error": error_msg,
                    }
                }
                state["memory"].append(
                    ToolMessage(
                        content=json.dumps(formatted_result, ensure_ascii=False),
                        tool_call_id=tool_call_id,
                        name=tool_name,
                        tool_input=tool_input_with_id,
                    )
                )

        state["current_tool_calls"] = []
        return {
            "memory": state["memory"],
            "thoughts": thoughts,
            "iterations": iterations,
            "max_iterations": state["max_iterations"],
            "current_tool_calls": [],
            "current_turn_id": state["current_turn_id"],
        }

    def _trim_history(self):
        """修剪历史消息,保持在限制范围内，保证Bedrock格式"""
        if len(self.memory) > self.max_history_messages:
            # 只保留最后max_history_messages条
            self.memory = self.memory[-self.max_history_messages :]
        # 必须以HumanMessage开头
        if self.memory and not isinstance(self.memory[0], HumanMessage):
            # 找到第一个HumanMessage
            for i, msg in enumerate(self.memory):
                if isinstance(msg, HumanMessage):
                    self.memory = self.memory[i:]
                    break
        # AIMessage(tool_calls)后必须紧跟ToolMessage
        trimmed = []
        i = 0
        while i < len(self.memory):
            msg = self.memory[i]
            trimmed.append(msg)
            if isinstance(msg, AIMessage) and getattr(msg, "tool_calls", None):
                # 下一个必须是ToolMessage
                if i + 1 < len(self.memory) and not isinstance(
                    self.memory[i + 1], ToolMessage
                ):
                    # 跳过非ToolMessage直到遇到ToolMessage
                    j = i + 1
                    while j < len(self.memory) and not isinstance(
                        self.memory[j], ToolMessage
                    ):
                        j += 1
                    if j < len(self.memory):
                        trimmed.append(self.memory[j])
                        i = j
            i += 1
        self.memory = trimmed

    def reset(self):
        self.memory = []
        self.state = {
            "memory": self.memory,
            "thoughts": [],
            "iterations": 0,
            "max_iterations": 5,  # 增加到5轮，支持复杂查询
            "current_tool_calls": [],
            "current_turn_id": "",
        }

    def chat(self, user_input: str) -> Dict[str, Any]:
        self.state["thoughts"] = []  # 每轮重置思考过程
        current_turn_id = str(uuid.uuid4())[:8]
        self.state["current_turn_id"] = current_turn_id

        # 添加用户消息
        self.memory.append(HumanMessage(content=user_input))

        # 修剪历史消息（在添加用户消息之后）
        self._trim_history()

        # 同步state和memory
        self.state["memory"] = self.memory
        self.state["iterations"] = 0
        self.state["current_tool_calls"] = []

        # 执行 LLM 调用,捕获可能的内容过滤错误
        try:
            final_state = self.graph.invoke(self.state)
            self.state = final_state
            self.memory = final_state["memory"]  # 同步回来
        except Exception as e:
            error_msg = str(e)
            # 检查是否是内容过滤错误
            if (
                "content_filter" in error_msg
                or "content management policy" in error_msg.lower()
            ):
                return {
                    "answer": "抱歉，您的请求触发了 AI 内容审核策略。\n\n💡 建议：\n1. 尝试使用更中性的描述词，比如：\n   - '动作片' 代替敏感题材\n   - '悬疑片' 代替犯罪题材\n   - '剧情片' 等更宽泛的类型\n\n2. 直接搜索具体的电影名称（如'无间道'）\n\n3. 切换到其他 AI 模型试试",
                    "thoughts": [f"❌ 内容过滤: {error_msg[:200]}"],
                }
            # 检查是否是速率限制错误
            elif "rate_limit" in error_msg.lower() or "429" in error_msg:
                return {
                    "answer": "抱歉,请求过于频繁,请稍后再试。",
                    "thoughts": [f"❌ 速率限制: {error_msg[:200]}"],
                }
            # 其他错误
            else:
                return {
                    "answer": f"抱歉,处理您的请求时出现错误。请稍后重试或换个说法试试。\n\n技术信息: {error_msg[:100]}",
                    "thoughts": [f"❌ 系统错误: {error_msg[:200]}"],
                }

        # 展示思考过程和最终回复
        ai_messages = [
            msg for msg in final_state["memory"] if isinstance(msg, AIMessage)
        ]
        final_answer = ""
        if ai_messages:
            last_ai_msg = ai_messages[-1]
            content = last_ai_msg.content
            # 如果最后一条AI消息还有tool_calls,说明没有生成最终回复
            if getattr(last_ai_msg, "tool_calls", None):
                final_answer = ""  # 不使用带工具调用的消息
            else:
                # 解析纯文本回复
                import re

                if isinstance(content, list):
                    texts = []
                    for x in content:
                        if isinstance(x, dict) and x.get("type") == "text":
                            text = str(x.get("text", ""))
                            texts.append(text)
                        # 忽略 tool_use 类型的内容
                    final_answer = "\n".join(texts)
                elif isinstance(content, dict) and "text" in content:
                    final_answer = str(content["text"])
                else:
                    final_answer = str(content)

                # ✂️ 清理推理标签，只保留最终答案
                # 1. 移除 <thinking> 标签及其内容
                final_answer = re.sub(
                    r"<thinking>.*?</thinking>",
                    "",
                    final_answer,
                    flags=re.DOTALL | re.IGNORECASE,
                )

                # 2. 提取"最终答案："之后的内容（针对 GPT-4.1 格式）
                answer_match = re.search(r"最终答案：(.*)$", final_answer, re.DOTALL)
                if answer_match:
                    final_answer = answer_match.group(1).strip()

                final_answer = final_answer.strip()
            # 清理 Markdown 链接格式为纯链接
            # 例如: [https://xxx](https://xxx) => https://xxx
            final_answer = re.sub(
                r"\[([^\]]+)\]\((https?://[^)]+)\)", r"\2", final_answer
            )

        # ========== 格式增强器：确保预告片链接被正确输出 ==========
        def enhance_movie_format(answer: str, state: AgentState) -> str:
            """
            检查 LLM 的回复中是否包含预告片链接
            如果没有,则作为兜底,从 raw_data 中提取链接并添加

            注意: 理想情况下,LLM 应该直接从 raw_data.trailer_link 字段读取链接并输出
            此函数仅作为兜底措施
            """
            # 提取本轮的工具调用结果
            tool_msgs = [
                msg
                for msg in state["memory"]
                if isinstance(msg, ToolMessage)
                and msg.tool_input.get("current_turn_id") == current_turn_id
            ]
            if not tool_msgs:
                return answer

            try:
                last_tool_msg = tool_msgs[-1]
                tool_result = json.loads(last_tool_msg.content)
                if isinstance(tool_result, dict) and "toolResult" in tool_result:
                    tool_data = json.loads(tool_result["toolResult"]["content"])
                else:
                    tool_data = tool_result
                if tool_data.get("status") != "success" or not tool_data.get(
                    "raw_data"
                ):
                    return answer

                movies = tool_data["raw_data"]

                # 检查回复中是否已包含预告片链接
                if "🎬 预告片:" in answer or "themoviedb.org/movie/" in answer:
                    return answer  # LLM 已正确输出链接

                # 🔧 兜底逻辑: LLM 忘记输出链接,手动添加
                import re

                enhanced_answer = answer
                insertions = []

                for m in movies:
                    trailer_link = m.get("trailer_link", "")

                    title = m.get("title", "")
                    if not title:
                        continue

                    title_escaped = re.escape(title)
                    # 精确匹配标题(带年份或不带)
                    pattern = f"((?:\\*\\*{title_escaped}(?:\\s*\\([^)]+\\))?\\*\\*|《{title_escaped}》).*?(?:评分|热度|简介):.*?)(?=\\n\\n|\\n\\d+\\.|$)"
                    matches = list(re.finditer(pattern, enhanced_answer, re.DOTALL))

                    if matches:
                        last_match = matches[-1]
                        insert_pos = last_match.end()
                        # 如果有链接则显示链接，否则显示"暂无预告片"
                        if trailer_link:
                            link_text = f"\n   🎬 预告片: {trailer_link}"
                        else:
                            link_text = f"\n   🎬 预告片: 暂无预告片"
                        insertions.append((insert_pos, link_text))

                # 从后往前插入避免位置偏移
                insertions.sort(key=lambda x: x[0], reverse=True)
                for position, link in insertions:
                    enhanced_answer = (
                        enhanced_answer[:position] + link + enhanced_answer[position:]
                    )

                return enhanced_answer

                # 4. 如果 LLM 回复不完整，使用格式增强器重新生成
                if not answer or ("� 评分:" not in answer and "评分" not in answer):
                    movie_titles_in_answer = []
                    for m in movies:
                        title = m.get("title", "")
                        if title:  # 不需要检查title是否在answer中
                            movie_titles_in_answer.append((title, m))
                if movie_titles_in_answer:
                    enhanced_lines = []
                    enhanced_lines.append("以下是推荐的电影:\n")
                    for i, (title, m) in enumerate(movie_titles_in_answer, 1):
                        movie_id = m.get("id", "")
                        year = (
                            m.get("release_date", "")[:4]
                            if m.get("release_date")
                            else "未知"
                        )
                        vote_avg = m.get("vote_average", 0)
                        vote_cnt = m.get("vote_count", 0)
                        popularity = m.get("popularity", 0)
                        overview = m.get("overview", "") or "暂无简介"

                        enhanced_lines.append(f"{i}. 《{title}》({year})")
                        if vote_cnt < 100:
                            enhanced_lines.append(
                                f"   📊 评分: {vote_avg}/10 ({vote_cnt:,}人评分) ⚠️ 冷门电影,参考价值低"
                            )
                        else:
                            enhanced_lines.append(
                                f"   📊 评分: {vote_avg}/10 ({vote_cnt:,}人评分) | 🔥 热度: {popularity}"
                            )
                        if popularity > 1000:
                            enhanced_lines.append(f"   🔥 热门推荐!")
                        enhanced_lines.append(
                            f"   📝 简介: {overview[:100]}{'...' if len(overview) > 100 else ''}"
                        )

                        # 添加 TMDB 预告片链接
                        if movie_id:
                            enhanced_lines.append(
                                f"   🎬 预告片: https://www.themoviedb.org/movie/{movie_id}/videos"
                            )

                        enhanced_lines.append("")
                    return "\n".join(enhanced_lines)
            except Exception as e:
                print(f"⚠️ 格式增强失败: {e}")
                pass
            return answer

        # 应用格式增强
        final_answer = enhance_movie_format(final_answer, final_state)
        # 兜底：只取本轮(current_turn_id)的ToolMessage
        if not final_answer.strip():
            tool_msgs = [
                msg
                for msg in self.state["memory"]
                if isinstance(msg, ToolMessage)
                and msg.tool_input.get("current_turn_id") == current_turn_id
            ]
            if tool_msgs:
                last_tool_msg = tool_msgs[-1]
                try:
                    tool_result = json.loads(last_tool_msg.content)
                    if isinstance(tool_result, dict) and "toolResult" in tool_result:
                        tool_data = json.loads(tool_result["toolResult"]["content"])
                    else:
                        tool_data = tool_result
                    if tool_data.get("status") == "success" and tool_data.get(
                        "raw_data"
                    ):
                        movies = tool_data["raw_data"]
                        lines = []
                        for m in movies:
                            title = m.get("title", "未知")
                            year = (
                                m.get("release_date", "")[:4]
                                if m.get("release_date")
                                else "未知"
                            )
                            overview = m.get("overview", "")
                            lines.append(f"《{title}》({year})\n简介：{overview}")
                        final_answer = "\n".join(lines)
                    elif tool_data.get("status") == "error":
                        final_answer = f"查询失败：{tool_data.get('msg','')}"
                    else:
                        final_answer = "未找到相关电影，建议补充更详细的片名或年份。"
                except Exception as e:
                    final_answer = f"结果解析失败：{str(e)[:30]}"
        return {"answer": final_answer.strip(), "thoughts": final_state["thoughts"]}


# ====== CLI测试入口 ======
if __name__ == "__main__":
    print("🎬 电影推荐AI助手")
    print(
        "支持中英文搜索/推荐，输入'exit'退出，输入'reset'清空历史，输入'switch'切换模型\n"
    )

    # 显示可用模型
    print("📋 可用模型:")
    for key, info in AVAILABLE_MODELS.items():
        print(f"   {key}. {info['name']}")

    # 直接使用 GPT-4.1，不再询问
    print(f"\n🤖 默认使用: GPT-4.1 (输入 'switch' 可切换模型)\n")
    agent = MovieAgent(model_choice="2")  # 直接使用 GPT-4.1

    try:
        while True:
            try:
                user_input = input("你: ").strip()
            except KeyboardInterrupt:
                print("\n\n👋 检测到 Ctrl+C，正在退出...")
                print("对话历史已保存～")
                break

            if user_input.lower() in {"exit", "quit", "q"}:
                print("再见！对话历史已保存～")
                break

            if user_input.lower() == "reset":
                agent.reset()
                print("已清空对话历史～")
                continue

            if user_input.lower() == "switch":
                print("\n📋 可用模型:")
                for key, info in AVAILABLE_MODELS.items():
                    current = " (当前)" if key == agent.model_choice else ""
                    print(f"   {key}. {info['name']}{current}")

                new_choice = input(
                    f"\n请选择模型 (1-{len(AVAILABLE_MODELS)}): "
                ).strip()
                agent.switch_model(new_choice)
                continue

            if not user_input:
                print("请输入有效的电影需求～")
                continue

            result = agent.chat(user_input)

            # 提取 LLM 原生推理内容
            import re

            llm_reasoning_list = []
            for thought in result["thoughts"]:
                if thought.startswith("LLM reasoning →"):
                    reasoning_text = thought.replace("LLM reasoning →", "").strip()
                    # 清理 <thinking> 标签（如果存在）
                    reasoning_text = re.sub(
                        r"<thinking>(.*?)</thinking>",
                        r"\1",
                        reasoning_text,
                        flags=re.DOTALL | re.IGNORECASE,
                    )
                    reasoning_text = reasoning_text.strip()
                    if reasoning_text:  # 只添加非空的推理内容
                        llm_reasoning_list.append(reasoning_text)

            # 格式化输出
            print("\n" + "=" * 80)
            print("【用户输入】\n" + "-" * 40)
            print(user_input)
            print("-" * 40)

            print("\n【LLM推理过程】\n" + "-" * 40)
            if llm_reasoning_list:
                for i, reasoning in enumerate(llm_reasoning_list, 1):
                    print(reasoning)
                    if i < len(llm_reasoning_list):
                        print()  # 多个推理之间添加空行
            else:
                print("本轮无LLM推理输出")
            print("-" * 40)

            print("\n【最终回复】\n" + "-" * 40)
            print(result["answer"])
            print("-" * 40)
    except Exception as e:
        import traceback

        print(f"\n❌ 程序异常: {e}")
        print("异常类型:", type(e))
        print("\n完整追踪:")
        traceback.print_exc()
        print("对话历史已保存～")
