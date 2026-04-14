// Netlify Background Function — research agent
// Named with -background suffix so Netlify treats it as async (up to 15 min).
// Invoked from the Next.js route handler; returns 202 immediately on Netlify.

import { runResearchAgent } from '../../src/lib/agents/research-agent';

interface NetlifyEvent {
  body: string | null;
  headers: Record<string, string | undefined>;
  httpMethod: string;
}

interface NetlifyResponse {
  statusCode: number;
  body: string;
}

type Handler = (event: NetlifyEvent) => Promise<NetlifyResponse>;

const handler: Handler = async (event) => {
  const body = JSON.parse(event.body || '{}');
  const { bidId } = body;

  if (!bidId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'bidId required' }) };
  }

  try {
    await runResearchAgent(bidId);
  } catch (err: any) {
    console.error('[research-agent-background] failed:', err.message);
    // Error is already logged to bid_agent_runs by the agent's finally block
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};

export { handler };
