import { browser } from "$app/environment";
import startUrl from "./assets/sounds/start.mp3";
import successUrl from "./assets/sounds/success.mp3";
import tickUrl from "./assets/sounds/tick.mp3";

// The cues backed by a bundled sound file; the `instruct` cue is spoken via playVoice.
type SoundCue = "start" | "tick" | "success";

const urls: Record<SoundCue, string> = {
  start: startUrl,
  tick: tickUrl,
  success: successUrl,
};
const cache: Partial<Record<SoundCue, HTMLAudioElement>> = {};

// One reused element for spoken instructions. Mobile browsers only let a media
// element play from a timer if that same element was first started during a
// user gesture — so we keep a single element (unlocked on the Start tap) rather
// than creating a fresh, blocked `Audio` per instruction.
let voiceEl: HTMLAudioElement | null = null;
const getVoiceEl = (): HTMLAudioElement => (voiceEl ??= new Audio());

// Must run inside the Start-button gesture: briefly plays then pauses every
// audio element so the later timer-driven cues (tick/success/voice) are allowed
// to play on mobile, where audio is otherwise locked until a user interaction.
export function unlockAudio(): void {
  if (!browser) return;
  const elements: HTMLAudioElement[] = [
    ...(Object.keys(urls) as SoundCue[]).map((cue) => (cache[cue] ??= new Audio(urls[cue]))),
    getVoiceEl(),
  ];
  for (const el of elements) {
    el.play()
      .then(() => {
        el.pause();
        el.currentTime = 0;
      })
      .catch(() => {});
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
  const audio = getVoiceEl();
  audio.pause();
  audio.src = url;
  audio.currentTime = 0;
  audio.play().catch((error) => console.error("Error playing voice:", error));
}
