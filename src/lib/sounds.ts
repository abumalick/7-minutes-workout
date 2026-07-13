import { browser } from "$app/environment";
import startUrl from "./assets/sounds/start.mp3";
import successUrl from "./assets/sounds/success.mp3";
import tickUrl from "./assets/sounds/tick.mp3";

// The cues backed by a bundled sound file; spoken clips go through playVoice.
type SoundCue = "start" | "tick" | "success";

const urls: Record<SoundCue, string> = {
  start: startUrl,
  tick: tickUrl,
  success: successUrl,
};
const cache: Partial<Record<SoundCue, HTMLAudioElement>> = {};

// Spoken clips (rest-previewed instructions + the countdown numbers) play through
// the Web Audio API rather than a reused <audio> element. iOS Safari blocks a
// timer-driven play() after an <audio> src swap outside a user gesture, so the
// single reused element only ever spoke the first, in-gesture instruction and
// went silent for every later preview and countdown. An AudioContext resumed
// inside the Start gesture can play any decoded buffer from a timer, which is
// exactly what those cues need.
let ctx: AudioContext | null = null;
const buffers = new Map<string, AudioBuffer>();
const pending = new Map<string, Promise<AudioBuffer>>();
let voiceSource: AudioBufferSourceNode | null = null;

function getCtx(): AudioContext | null {
  if (!browser) return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctor) ctx = new Ctor();
  }
  return ctx;
}

function load(url: string): Promise<AudioBuffer> {
  const cached = buffers.get(url);
  if (cached) return Promise.resolve(cached);
  const inflight = pending.get(url);
  if (inflight) return inflight;
  const c = getCtx();
  if (!c) return Promise.reject(new Error("no AudioContext"));
  const p = fetch(url)
    .then((r) => r.arrayBuffer())
    .then((b) => c.decodeAudioData(b))
    .then((buf) => {
      buffers.set(url, buf);
      pending.delete(url);
      return buf;
    });
  pending.set(url, p);
  return p;
}

// Decode clips ahead of time so the first timer-driven play is instant.
export function preload(list: string[]): void {
  if (!browser) return;
  for (const url of list) load(url).catch(() => {});
}

// Must run inside the Start-button gesture: unlocks the file cues (played then
// paused) and resumes the AudioContext, playing a one-sample silent buffer so
// iOS allows later timer-driven buffer playback.
export function unlockAudio(): void {
  if (!browser) return;
  for (const cue of Object.keys(urls) as SoundCue[]) {
    const el = (cache[cue] ??= new Audio(urls[cue]));
    el.play()
      .then(() => {
        el.pause();
        el.currentTime = 0;
      })
      .catch(() => {});
  }
  const c = getCtx();
  if (c) {
    c.resume().catch(() => {});
    const src = c.createBufferSource();
    src.buffer = c.createBuffer(1, 1, 22050);
    src.connect(c.destination);
    src.start();
  }
}

export function play(cue: SoundCue): void {
  if (!browser) return;
  const audio = (cache[cue] ??= new Audio(urls[cue]));
  audio.currentTime = 0;
  audio.play().catch((error) => console.error(`Error playing ${cue} sound:`, error));
}

export function playVoice(url: string): void {
  if (!browser) return;
  const c = getCtx();
  if (!c) return;
  const startClip = (buf: AudioBuffer): void => {
    try {
      voiceSource?.stop();
    } catch {
      // The previous clip already finished; nothing to stop.
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    src.connect(c.destination);
    src.start();
    voiceSource = src;
  };
  const cached = buffers.get(url);
  if (cached) startClip(cached);
  else
    load(url)
      .then(startClip)
      .catch((error) => console.error("Error playing voice:", error));
}
