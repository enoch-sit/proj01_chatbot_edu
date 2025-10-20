FROM python:3.10-slim

RUN pip install --no-cache-dir fastmcp mcp requests

WORKDIR /app
COPY mcp_server.py .

EXPOSE 8080

CMD ["python", "mcp_server.py"]