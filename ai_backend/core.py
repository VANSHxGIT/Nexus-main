import os
import psycopg2
from agentfield import Agent, AIConfig
from pydantic import BaseModel
from typing import Optional
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '')
NEON_DSN = os.environ.get('NEON_DSN', '')
GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')

def _get_neon_conn():
    return psycopg2.connect(NEON_DSN)

def emit_thought(node_name: str, user_id: str, status: str, detail: Optional[str]=None) -> None:
    step = node_name.lower()
    try:
        conn = _get_neon_conn()
        cur = conn.cursor()
        cur.execute('INSERT INTO thought_logs (user_id, step, agent, status, detail) VALUES (%s, %s, %s, %s, %s)', (user_id, step, node_name, status, detail))
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f'[{node_name}] Warning: Failed to emit thought log: {e}')
agent = Agent(node_id='nexus-backend', agentfield_server='http://localhost:8080', ai_config=AIConfig(model='groq/llama-3.3-70b-versatile'), api_key=GROQ_API_KEY)