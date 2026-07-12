import { browser } from '$app/environment'
import startUrl from './assets/sounds/start.mp3'
import successUrl from './assets/sounds/success.mp3'
import tickUrl from './assets/sounds/tick.mp3'
import type { Cue } from './workout'

const urls: Record<Cue, string> = {
  start: startUrl,
  tick: tickUrl,
  success: successUrl,
}
const cache: Partial<Record<Cue, HTMLAudioElement>> = {}

export function play(cue: Cue): void {
  if (!browser) return
  const audio = (cache[cue] ??= new Audio(urls[cue]))
  audio.currentTime = 0
  audio
    .play()
    .catch((error) => console.error(`Error playing ${cue} sound:`, error))
}
