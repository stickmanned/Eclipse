/**
 * Speaks French text aloud via the Web Speech API.
 *
 * Left to its defaults, `speechSynthesis` will read French text with
 * whatever voice the browser considers "default" — often an English voice
 * reading French phonetically. This picks an actual fr-FR voice when one is
 * installed, and prefers a local (on-device) voice over a remote one since
 * local voices keep working offline and start speaking with no network lag.
 */

let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) cachedVoices = voices;
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  // Chrome loads voices asynchronously; this fires once they are ready.
  window.speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();
}

function pickFrenchVoice(): SpeechSynthesisVoice | undefined {
  const french = loadVoices().filter((voice) => voice.lang.toLocaleLowerCase().startsWith('fr'));
  if (french.length === 0) return undefined;

  const france = french.filter((voice) => voice.lang.toLocaleLowerCase() === 'fr-fr');
  const pool = france.length > 0 ? france : french;
  return pool.find((voice) => voice.localService) ?? pool[0];
}

export function speakFrench(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  // Do not stack utterances when the learner presses Listen repeatedly.
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'fr-FR';
  utterance.rate = 0.95;
  const voice = pickFrenchVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}
