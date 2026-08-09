import { describe, expect, it } from 'vitest';
import {
  MESSAGE_CONTRACT_VERSION,
  describeRejectedMessage,
  parseMessage,
} from '../../src/domain/messages';
import { STALE_WORKER_MESSAGE } from '../../src/domain/errors';

describe('parseMessage validation', () => {
  it('parses valid SAVE_CALIBRATION message', () => {
    const msg = parseMessage({
      type: 'SAVE_CALIBRATION',
      delfLevel: 'B1',
      correctAnswers: 6,
      method: 'diagnostic',
    });
    expect(msg).toEqual({
      type: 'SAVE_CALIBRATION',
      delfLevel: 'B1',
      correctAnswers: 6,
      method: 'diagnostic',
    });
  });

  it('applies defaults for missing optional SAVE_CALIBRATION fields', () => {
    const msg = parseMessage({
      type: 'SAVE_CALIBRATION',
      delfLevel: 'B2',
    });
    expect(msg).toEqual({
      type: 'SAVE_CALIBRATION',
      delfLevel: 'B2',
      correctAnswers: 0,
      method: 'self_selected',
    });
  });

  it('parses valid GET_STATUS message', () => {
    const msg = parseMessage({ type: 'GET_STATUS' });
    expect(msg).toEqual({ type: 'GET_STATUS' });
  });

  it('parses valid RESET_PROFILE message', () => {
    const msg = parseMessage({ type: 'RESET_PROFILE' });
    expect(msg).toEqual({ type: 'RESET_PROFILE', confirmed: true });
  });

  it('parses a complete answer-write message', () => {
    const msg = parseMessage({
      type: 'RECORD_ANSWER',
      interactionId: 'int_1',
      conceptId: 'fr:attendre:wait',
      difficulty: 0.4,
      correct: true,
      assisted: false,
      mode: 'typed-meaning',
      contextFingerprint: 'ctx_1',
      display: {
        targetSurface: 'attendre',
        englishMeaning: 'wait',
        kind: 'word',
      },
    });
    expect(msg).toMatchObject({
      type: 'RECORD_ANSWER',
      assisted: false,
      mode: 'typed-meaning',
      contextFingerprint: 'ctx_1',
    });
  });

  it('rejects an ambiguous answer that omits the assistance mode', () => {
    expect(
      parseMessage({
        type: 'RECORD_ANSWER',
        interactionId: 'int_1',
        conceptId: 'fr:attendre:wait',
        difficulty: 0.4,
        correct: true,
        display: {
          targetSurface: 'attendre',
          englishMeaning: 'wait',
          kind: 'word',
        },
      }),
    ).toBeNull();
  });

  it('returns null for unknown message type', () => {
    const msg = parseMessage({ type: 'UNKNOWN_TYPE_123' });
    expect(msg).toBeNull();
  });

  it('returns null for invalid inputs', () => {
    expect(parseMessage(null)).toBeNull();
    expect(parseMessage(undefined)).toBeNull();
    expect(parseMessage(123)).toBeNull();
    expect(parseMessage('hello')).toBeNull();
  });

  it('rejects the pre-v2 SAVE_CALIBRATION shape an older popup would send', () => {
    expect(
      parseMessage({
        type: 'SAVE_CALIBRATION',
        globalAbility: 0.5,
        correctAnswers: 2,
        skipped: false,
      }),
    ).toBeNull();
  });
});

describe('describeRejectedMessage', () => {
  it('leads with the recovery step for an unrecognised type', () => {
    const detail = describeRejectedMessage({ type: 'NOT_A_REAL_TYPE' });
    expect(detail).toContain(STALE_WORKER_MESSAGE);
    expect(detail).toContain('NOT_A_REAL_TYPE');
  });

  it('names the offending field for a known type with a moved payload', () => {
    const detail = describeRejectedMessage({
      type: 'SAVE_CALIBRATION',
      globalAbility: 0.5,
      correctAnswers: 2,
      skipped: false,
    });
    expect(detail).toContain(STALE_WORKER_MESSAGE);
    expect(detail).toContain('SAVE_CALIBRATION');
    expect(detail).toContain('delfLevel');
  });

  it('handles values that are not objects at all', () => {
    for (const value of [null, undefined, 42, 'hello', []]) {
      expect(describeRejectedMessage(value)).toContain(STALE_WORKER_MESSAGE);
    }
  });

  it('never returns the bare, unactionable copy the old worker used', () => {
    expect(describeRejectedMessage({ type: 'nope' })).not.toBe('Unrecognised message.');
  });
});

describe('MESSAGE_CONTRACT_VERSION', () => {
  it('is a positive integer both halves of the extension can compare', () => {
    expect(Number.isInteger(MESSAGE_CONTRACT_VERSION)).toBe(true);
    expect(MESSAGE_CONTRACT_VERSION).toBeGreaterThan(0);
  });
});
