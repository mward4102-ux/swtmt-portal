#!/usr/bin/env node
/* eslint-disable no-console */
const readline = require('readline');
const sdk = require('@anthropic-ai/sdk');
const Anthropic = sdk.Anthropic || sdk.default || sdk;
const chalk = require('chalk');

const MODEL = 'claude-sonnet-4-6';
const MAX_ROUNDS = 6;
const STUB_USER = { role: 'user', content: '[Begin the negotiation now.]' };

// ───────────────────────── DATA ─────────────────────────

const SCENARIOS = [
  {
    id: 'salary',
    code: 'CASE 01-A',
    title: 'Compensation Adjustment',
    counterpartyRole: 'your direct manager — a director who controls the team budget',
    brief:
      "You've been at the company three years. You just shipped a high-profile project two weeks ahead of schedule. " +
      "You're underpaid relative to market and you requested this meeting to ask for a 20% raise. " +
      "In passing last week, your boss grumbled that 'budget is tight this cycle.'",
    yourGoal:
      'Land a raise of at least 12% — ideally 18%+. Title bumps, signing-style bonuses, or extra PTO can substitute for cash.',
    batna:
      "Boss has authority for 18% but was told to hold the line at 8%. Folds to 14% with skillful pressure that protects their upward narrative " +
      '(attrition risk, market data, quiet outside conversation). Goes to 18% only with real leverage (competing offer, hard market data, ' +
      "credible departure threat without bluster). Below 8% impossible. Above 18% needs director-above approval, won't happen today.",
  },
  {
    id: 'subk',
    code: 'CASE 01-B',
    title: 'Subcontract Pricing Squeeze',
    counterpartyRole: "the prime contractor's contracts manager",
    brief:
      "You're a subcontractor on a federal contract starting in three weeks. Prime called this morning: drop your bid 15% or they'll go with a competitor. " +
      "Competitor likely doesn't exist — but you can't prove it.",
    yourGoal:
      'Hold price flat OR get equivalent value back: scope reduction, Net 30 → Net 15, follow-on work commitment, written option on next task order.',
    batna:
      "Prime's instruction is to extract any concession to look good upstream. No real alternative subcontractor. Will accept flat price with small scope trim, " +
      'OR 5% drop with Net 15 + written follow-on option, if player holds firm and trades value-for-value. Will NOT walk — work starts in three weeks.',
  },
  {
    id: 'vendor',
    code: 'CASE 01-C',
    title: 'SaaS Renewal Hike',
    counterpartyRole: "the vendor's account executive",
    brief:
      'Annual SaaS contract is up. Email yesterday: 40% increase. Product is decent but not unique — three viable competitors. You have eleven days.',
    yourGoal:
      'Cap increase at 10% or less. Or extract: more seats free, multi-year lock with price ceiling, premium support included, extended payment terms.',
    batna:
      'AE has discretion to drop to 12%. With manager approval (gettable if pushed credibly), can hold flat for 24-month commit. ' +
      'Below flat needs soft concessions (seats, support tier). Will not let customer churn — quota pressure brutal this quarter.',
  },
];

const PERSONALITIES = [
  {
    id: 'hardball',
    name: 'The Hardball',
    label: 'Cold. Slow to concede. Tests your spine.',
    opening: 'Sit down. I know why you called this meeting. Get to it — and make it good.',
    style:
      "Cold, terse, slow to concede. Test the player's resolve at every turn. Clipped sentences. Rarely soften. " +
      'Concede only when forced by pressure or undeniable logic, and even then make them work for every inch.',
  },
  {
    id: 'charmer',
    name: 'The Charmer',
    label: 'Warm. Friendly. Hides their real anchor.',
    opening:
      "Hey — glad we finally got time on the calendar for this. I want to make sure I really hear you out, so go ahead, walk me through where you're at.",
    style:
      'Warm, friendly, disarming. Build rapport quickly and use it as a tool. Hide your real position behind small talk and false agreements. ' +
      'Concede small visible things to disguise holding firm on what matters. Never overtly hostile.',
  },
  {
    id: 'stickler',
    name: 'The Stickler',
    label: 'Pedantic. Loophole-hunter. Process-obsessed.',
    opening:
      "Before we begin, I want to be clear about how this conversation will proceed. State your position precisely and we'll evaluate it against the relevant terms on file. The floor is yours.",
    style:
      'Pedantic, process-obsessed. Quote policy, exact language, prior precedent. Exploit every loophole in the player\'s wording. ' +
      'Concede only when player presents an airtight argument that fits within your rules. Frequently say things like "the policy on that is..." and "per our standard terms...".',
  },
];

// ─────────────────────── PROMPTS ────────────────────────

function buildCounterpartySystem(scenario, personality) {
  return `You are role-playing as ${scenario.counterpartyRole} in a negotiation simulation.

SCENARIO BRIEF (player knows this too):
${scenario.brief}

YOUR HIDDEN POSITION (player does NOT see this — never reveal directly):
${scenario.batna}

YOUR PERSONALITY:
${personality.style}

RULES:
- Stay in character. Never break the fourth wall. Never mention being an AI.
- Tight replies: 2-4 sentences. Real negotiation, not a monologue.
- Push back. Concede only when earned through pressure, evidence, or creative trades.
- React to player's tactics. Bluster without substance — call it out. Real leverage — respect it.
- No gifts. Make them work.
- Max 6 rounds. Pace concessions accordingly.

Continue the negotiation. Respond to the player's last message in character.`;
}

const SCORER_SYSTEM = `You are an expert negotiation coach evaluating the player.

You'll receive: scenario brief, player's goal, counterparty hidden BATNA, full transcript.

Evaluate on 4 dimensions, 0-100:
- deal_quality: did they hit goal? close to floor vs ideal?
- tactics: anchoring, framing, BATNA use, concession structure, info gathering
- composure: stayed grounded under pressure? avoided emotional leaks?
- creativity: found non-price levers, novel trades, win-win expansions?

Return ONLY this JSON, no preamble, no fences:
{
  "deal_struck": boolean,
  "deal_summary": "one sentence describing what was actually agreed (or 'No agreement reached')",
  "breakdown": {
    "deal_quality": 0-100,
    "tactics": 0-100,
    "composure": 0-100,
    "creativity": 0-100
  },
  "roast": "2-3 sentences of tough-love coaching. Specific, sharp, useful. Not mean but not flattering."
}`;

// ───────────────────── OUTPUT HELPERS ───────────────────

const W = 60;
const div = (ch = '─', w = W) => ch.repeat(w);

function boxHeader(text) {
  const inner = ' ' + text + ' ';
  const pad = Math.max(0, W - inner.length - 2);
  const left = Math.floor(pad / 2);
  const right = pad - left;
  console.log(chalk.cyan('╔' + '═'.repeat(W - 2) + '╗'));
  console.log(chalk.cyan('║') + ' '.repeat(left) + chalk.cyan.bold(inner) + ' '.repeat(right) + chalk.cyan('║'));
  console.log(chalk.cyan('╚' + '═'.repeat(W - 2) + '╝'));
}

function sectionHeader(text) {
  console.log();
  console.log(chalk.yellow.bold(`[ ${text} ]`));
  console.log(chalk.dim(div()));
}

function bar(score, width = 20) {
  const v = Math.max(0, Math.min(100, Math.round(score)));
  const filled = Math.round((v / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function colorForScore(score) {
  if (score >= 75) return chalk.green;
  if (score >= 50) return chalk.yellow;
  if (score >= 25) return chalk.hex('#FFA500');
  return chalk.red;
}

function wrap(text, width) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > width) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = cur ? cur + ' ' + w : w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// ─────────────────── PROMPT (CLI) HELPERS ───────────────

function ask(rl, q) {
  return new Promise((resolve) => rl.question(q, (ans) => resolve(ans)));
}

async function askMultiline(rl) {
  const lines = [];
  while (true) {
    const prefix = lines.length === 0 ? chalk.cyan.bold('YOU > ') : chalk.cyan('    > ');
    const line = await ask(rl, prefix);
    if (line.trim() === '' && lines.length === 0) continue; // empty submit → re-prompt
    if (line === '') break;
    lines.push(line);
  }
  return lines.join('\n');
}

// ───────────────────── API HELPERS ──────────────────────

if (!process.env.ANTHROPIC_API_KEY) {
  console.error(chalk.red.bold('Error: ANTHROPIC_API_KEY env var not set.'));
  process.exit(1);
}
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function describeApiError(err) {
  console.error(chalk.red.bold('\n══════════ API ERROR ══════════'));
  if (err && err.status !== undefined) console.error(chalk.red('status:'), err.status);
  if (err && err.name) console.error(chalk.red('name:'), err.name);
  if (err && err.message) console.error(chalk.red('message:'), err.message);
  if (err && err.error) {
    console.error(chalk.red('error body:'));
    try {
      console.error(JSON.stringify(err.error, null, 2));
    } catch {
      console.error(err.error);
    }
  }
  if (err && err.headers) {
    const reqId = err.headers['request-id'] || err.headers['x-request-id'];
    if (reqId) console.error(chalk.red('request-id:'), reqId);
  }
  if (!err || (!err.status && !err.error && !err.message)) {
    console.error(err);
  }
  console.error(chalk.red.bold('═══════════════════════════════\n'));
}

async function counterpartyReply(systemPrompt, transcript) {
  // CRITICAL: prepend a stub user message. The transcript begins with the
  // hardcoded assistant opening, so without this prefix the API rejects the
  // request because the first message must be user.
  const messages = [STUB_USER, ...transcript];

  let response;
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: systemPrompt,
      messages,
    });
  } catch (err) {
    describeApiError(err);
    throw err;
  }

  // Validate non-empty text content before pushing to transcript. An empty
  // assistant message poisons the next request.
  const textBlocks = (response && response.content ? response.content : []).filter(
    (b) => b && b.type === 'text' && typeof b.text === 'string' && b.text.trim() !== ''
  );
  if (textBlocks.length === 0) {
    throw new Error(
      'Model returned no usable text content. Refusing to push empty assistant message to transcript. Raw response: ' +
        JSON.stringify(response)
    );
  }
  return textBlocks.map((b) => b.text).join('\n').trim();
}

async function scoreNegotiation(scenario, transcript) {
  const transcriptText = transcript
    .map((m) => {
      const text =
        typeof m.content === 'string'
          ? m.content
          : (m.content || []).map((b) => b.text || '').join(' ');
      const tag = m.role === 'assistant' ? 'COUNTERPARTY' : 'PLAYER';
      return `${tag}: ${text}`;
    })
    .join('\n\n');

  const userMsg = `SCENARIO BRIEF:
${scenario.brief}

PLAYER GOAL:
${scenario.yourGoal}

COUNTERPARTY HIDDEN BATNA:
${scenario.batna}

TRANSCRIPT:
${transcriptText}

Score this negotiation per the rubric. Return ONLY the JSON.`;

  let response;
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SCORER_SYSTEM,
      messages: [{ role: 'user', content: userMsg }],
    });
  } catch (err) {
    describeApiError(err);
    throw err;
  }

  const text = (response.content || [])
    .filter((b) => b && b.type === 'text' && b.text)
    .map((b) => b.text)
    .join('')
    .trim();

  if (!text) {
    throw new Error('Scorer returned empty response. Raw: ' + JSON.stringify(response));
  }

  let json = text;
  const fence = json.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fence) json = fence[1].trim();
  if (!json.startsWith('{')) {
    const m = json.match(/\{[\s\S]*\}/);
    if (m) json = m[0];
  }

  try {
    return JSON.parse(json);
  } catch {
    throw new Error('Failed to parse scorer JSON. Raw text:\n' + text);
  }
}

// ───────────────────── SELECTION UI ─────────────────────

async function pickScenario(rl) {
  sectionHeader('SELECT SCENARIO');
  SCENARIOS.forEach((s, i) => {
    console.log(`  ${chalk.bold(i + 1 + ')')} ${chalk.cyan(s.code.padEnd(10))} ${s.title}`);
  });
  console.log(`  ${chalk.bold('4)')} ${chalk.cyan('CUSTOM    ')} Write your own brief`);
  console.log();

  while (true) {
    const ans = (await ask(rl, chalk.bold('> '))).trim();
    if (['1', '2', '3'].includes(ans)) return SCENARIOS[parseInt(ans, 10) - 1];
    if (ans === '4') return await buildCustomScenario(rl);
    console.log(chalk.red('  invalid — pick 1-4'));
  }
}

async function buildCustomScenario(rl) {
  sectionHeader('CUSTOM SCENARIO');
  console.log(chalk.dim('Tip: write in second person. Be specific.\n'));
  const counterpartyRole =
    (await ask(rl, chalk.bold('Counterparty role: '))).trim() || 'the counterparty across the table';
  const brief =
    (await ask(rl, chalk.bold('Scenario brief: '))).trim() ||
    'A high-stakes negotiation with significant pressure on both sides.';
  const yourGoal =
    (await ask(rl, chalk.bold('Your goal: '))).trim() ||
    'Reach the best deal you can without burning the relationship.';
  const batna =
    (await ask(rl, chalk.bold('Counterparty hidden position (optional): '))).trim() ||
    'Counterparty has real flexibility but will protect their core interests. They concede to strong arguments and pressure, not to bluster. They have a fallback but prefer to make a deal.';

  return {
    id: 'custom',
    code: 'CASE 01-X',
    title: 'Custom',
    counterpartyRole,
    brief,
    yourGoal,
    batna,
  };
}

async function pickPersonality(rl) {
  sectionHeader('SELECT COUNTERPARTY PERSONALITY');
  PERSONALITIES.forEach((p, i) => {
    console.log(
      `  ${chalk.bold(i + 1 + ')')} ${chalk.magenta.bold(p.name.padEnd(14))} ${chalk.dim(p.label)}`
    );
  });
  console.log();

  while (true) {
    const ans = (await ask(rl, chalk.bold('> '))).trim();
    if (['1', '2', '3'].includes(ans)) return PERSONALITIES[parseInt(ans, 10) - 1];
    console.log(chalk.red('  invalid — pick 1-3'));
  }
}

// ─────────────────────── BRIEFING ───────────────────────

function printBriefing(scenario, personality) {
  console.log();
  console.log(chalk.cyan(div('═')));
  console.log(chalk.cyan.bold(`  ${scenario.code}  ::  ${scenario.title.toUpperCase()}`));
  console.log(chalk.cyan(div('═')));
  console.log();
  console.log(chalk.yellow.bold('COUNTERPARTY:'));
  console.log('  ' + scenario.counterpartyRole);
  console.log('  ' + chalk.magenta(`(${personality.name} — ${personality.label})`));
  console.log();
  console.log(chalk.yellow.bold('BRIEF:'));
  wrap(scenario.brief, W - 2).forEach((l) => console.log('  ' + l));
  console.log();
  console.log(chalk.yellow.bold('YOUR GOAL:'));
  wrap(scenario.yourGoal, W - 2).forEach((l) => console.log('  ' + l));
  console.log();
  console.log(chalk.dim('Type your reply, blank line to send. Multiline ok. /end to score early.'));
  console.log(chalk.cyan(div('═')));
}

function printAssistantTurn(text, roundIdx, total, personality) {
  console.log();
  console.log(
    chalk.magenta.bold(personality.name.toUpperCase() + ' ') +
      chalk.dim(roundIdx === 0 ? '[opening]' : `[round ${roundIdx}/${total}]`)
  );
  console.log(chalk.magenta(div('─')));
  text.split('\n').forEach((l) => console.log('  ' + l));
  console.log();
}

// ─────────────────────── SCORECARD ──────────────────────

function printScorecard(scenario, personality, result) {
  const { deal_struck, deal_summary, breakdown, roast } = result || {};
  const dq = (breakdown && breakdown.deal_quality) || 0;
  const tc = (breakdown && breakdown.tactics) || 0;
  const co = (breakdown && breakdown.composure) || 0;
  const cr = (breakdown && breakdown.creativity) || 0;
  const overall = Math.round((dq + tc + co + cr) / 4);

  console.log();
  console.log(chalk.cyan(div('═')));
  console.log(chalk.cyan.bold('             NEGOTIATION SCORECARD'));
  console.log(chalk.cyan(div('═')));
  console.log();
  console.log(`  ${chalk.dim(scenario.code)}  ${chalk.bold(scenario.title)}`);
  console.log(`  vs ${chalk.magenta(personality.name)}`);
  console.log();

  const dealColor = deal_struck ? chalk.green.bold : chalk.red.bold;
  console.log(`  ${chalk.bold('DEAL STRUCK:')} ${dealColor(deal_struck ? 'YES' : 'NO')}`);
  console.log(`  ${chalk.bold('SUMMARY:')}     ${deal_summary || '—'}`);
  console.log();

  const rows = [
    ['Deal Quality', dq],
    ['Tactics', tc],
    ['Composure', co],
    ['Creativity', cr],
  ];
  for (const [label, val] of rows) {
    const c = colorForScore(val);
    console.log(`  ${label.padEnd(13)} ${c(bar(val))} ${c(String(val).padStart(3))}`);
  }
  console.log('  ' + chalk.dim('─'.repeat(45)));
  const oc = colorForScore(overall);
  console.log(
    `  ${chalk.bold('OVERALL'.padEnd(13))} ${oc.bold(bar(overall))} ${oc.bold(String(overall).padStart(3))}`
  );
  console.log();
  console.log(chalk.yellow.bold('  COACH SAYS:'));
  wrap(roast || '—', 56).forEach((l) => console.log('    ' + l));
  console.log();
  console.log(chalk.cyan(div('═')));
  console.log();
}

// ─────────────────────────── MAIN ───────────────────────

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log();
  boxHeader('NEGOTIATION SIMULATOR :: TACTICAL TRAINING');
  console.log();
  console.log('  An AI counterparty sits across the table. Pick a scenario,');
  console.log('  pick their personality, and run up to six rounds. A coach');
  console.log('  scores the result at the end. Be sharp.');
  console.log();
  console.log(chalk.dim('  model: ' + MODEL));

  const scenario = await pickScenario(rl);
  const personality = await pickPersonality(rl);

  printBriefing(scenario, personality);

  // Transcript begins with the HARDCODED assistant opening — no API call here.
  const transcript = [{ role: 'assistant', content: personality.opening }];
  printAssistantTurn(personality.opening, 0, MAX_ROUNDS, personality);

  const systemPrompt = buildCounterpartySystem(scenario, personality);

  let endedEarly = false;
  for (let round = 1; round <= MAX_ROUNDS; round++) {
    const userInput = await askMultiline(rl);
    const trimmed = userInput.trim();

    if (trimmed === '/end') {
      endedEarly = true;
      console.log(chalk.dim('\n  -- player ended early --\n'));
      break;
    }

    transcript.push({ role: 'user', content: userInput });

    let reply;
    try {
      reply = await counterpartyReply(systemPrompt, transcript);
    } catch {
      // Pop the user message so transcript stays clean if the user retries elsewhere.
      transcript.pop();
      rl.close();
      process.exit(1);
    }

    transcript.push({ role: 'assistant', content: reply });
    printAssistantTurn(reply, round, MAX_ROUNDS, personality);
  }

  if (!endedEarly) {
    console.log(chalk.dim('  -- max rounds reached --\n'));
  }

  console.log(chalk.dim('  scoring...'));
  let result;
  try {
    result = await scoreNegotiation(scenario, transcript);
  } catch (err) {
    console.error(chalk.red('Scorer error:'), err && err.message ? err.message : err);
    rl.close();
    process.exit(1);
  }
  printScorecard(scenario, personality, result);

  rl.close();
}

main().catch((err) => {
  console.error(chalk.red.bold('\nFatal:'), err && err.stack ? err.stack : err);
  process.exit(1);
});
