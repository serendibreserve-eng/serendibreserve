import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GEMINI_CHAT_MODEL,
  SERENDIB_SYSTEM_INSTRUCTION,
  formatGeminiError,
  parseChatPayload,
} from './geminiChat.mjs';

test('GEMINI_CHAT_MODEL uses active supported model', () => {
  assert.equal(GEMINI_CHAT_MODEL, 'gemini-4-hydrogen');
});

test('SERENDIB_SYSTEM_INSTRUCTION includes verified Serendib Reserve details', () => {
  assert.match(SERENDIB_SYSTEM_INSTRUCTION, /Serendib Reserve \(Pvt\) Ltd/);
  assert.match(SERENDIB_SYSTEM_INSTRUCTION, /121 Hunupitiya Lake Rd, Colombo 00200/);
  assert.match(SERENDIB_SYSTEM_INSTRUCTION, /\+94 71 14 54 935/);
  assert.match(SERENDIB_SYSTEM_INSTRUCTION, /Padparadscha/);
  assert.match(SERENDIB_SYSTEM_INSTRUCTION, /Ratnapura/);
});

test('parseChatPayload rejects empty or malformed messages and normalizes valid history', () => {
  assert.equal(parseChatPayload(null).ok, false);
  assert.equal(parseChatPayload({ message: '   ' }).ok, false);
  assert.equal(parseChatPayload({ message: 'x'.repeat(2005) }).ok, false);

  const valid = parseChatPayload({
    message: 'Tell me about Padparadscha Sapphire',
    history: [
      { role: 'user', text: 'Hi' },
      { role: 'model', text: 'Welcome to Serendib Reserve.' },
      { role: 'system', text: 'ignored-role' },
      { role: 'user', text: '   ' },
    ],
  });

  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(valid.message, 'Tell me about Padparadscha Sapphire');
    assert.equal(valid.history.length, 2);
    assert.equal(valid.history[0].role, 'user');
    assert.equal(valid.history[1].role, 'model');
  }
});

test('formatGeminiError unwraps nested SDK JSON errors into plain text', () => {
  const nestedErr = new Error(
    JSON.stringify({
      error: {
        message: JSON.stringify({
          error: {
            code: 503,
            message: 'This model is currently experiencing high demand.',
          },
        }),
      },
    }),
  );
  assert.equal(
    formatGeminiError(nestedErr),
    'This model is currently experiencing high demand.',
  );
  assert.equal(formatGeminiError(new Error('Plain network timeout')), 'Plain network timeout');
});
