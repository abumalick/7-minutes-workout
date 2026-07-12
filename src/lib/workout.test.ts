import { describe, expect, it } from 'vitest'
import { isRest, next, prev, start, tick, type WorkoutState } from './workout'
import { sevenMinuteWorkout } from './workouts'

const S = sevenMinuteWorkout.steps

const at = (
  currentIndex: number,
  timeLeft: number,
  isRunning = true,
): WorkoutState => ({
  currentIndex,
  timeLeft,
  isRunning,
})

describe('sequence', () => {
  it('has 25 steps starting with a non-Rest exercise and 10s Rests', () => {
    expect(S).toHaveLength(25)
    expect(isRest(S[0])).toBe(false)
    expect(isRest(S[1])).toBe(true)
    expect(isRest(S[24])).toBe(false)
  })
})

describe('tick', () => {
  it('counts down without cues above the last 5 seconds', () => {
    expect(tick(S, at(0, 30))).toEqual({ state: at(0, 29), cues: [] })
    expect(tick(S, at(0, 6))).toEqual({ state: at(0, 5), cues: [] })
  })

  it('emits a tick cue for each of the last 5 seconds', () => {
    expect(tick(S, at(0, 5))).toEqual({ state: at(0, 4), cues: ['tick'] })
    expect(tick(S, at(0, 1))).toEqual({ state: at(0, 0), cues: ['tick'] })
  })

  it('advances exercise -> rest with a success cue only', () => {
    expect(tick(S, at(0, 0))).toEqual({ state: at(1, 10), cues: ['success'] })
  })

  it('advances rest -> exercise with a start cue only', () => {
    expect(tick(S, at(1, 0))).toEqual({ state: at(2, 30), cues: ['start'] })
  })

  it('wraps after the last step, stops running, emits success then start', () => {
    expect(tick(S, at(24, 0))).toEqual({
      state: at(0, 30, false),
      cues: ['success', 'start'],
    })
  })
})

describe('start', () => {
  it('starts running and cues start at the beginning of an exercise', () => {
    expect(start(S, at(0, 30, false))).toEqual({
      state: at(0, 30, true),
      cues: ['start'],
    })
  })

  it('starts running with no cue mid-exercise', () => {
    expect(start(S, at(0, 20, false))).toEqual({
      state: at(0, 20, true),
      cues: [],
    })
  })

  it('starts running with no cue on a Rest step', () => {
    expect(start(S, at(1, 10, false))).toEqual({
      state: at(1, 10, true),
      cues: [],
    })
  })
})

describe('next', () => {
  it('leaves an active exercise with success, enters Rest with no start', () => {
    expect(next(S, at(0, 30))).toEqual({ state: at(1, 10), cues: ['success'] })
  })

  it('leaves Rest with no success, enters exercise with start', () => {
    expect(next(S, at(1, 10))).toEqual({ state: at(2, 30), cues: ['start'] })
  })

  it('wraps to the first step and preserves isRunning', () => {
    expect(next(S, at(24, 30, false))).toEqual({
      state: at(0, 30, false),
      cues: ['success', 'start'],
    })
  })
})

describe('prev', () => {
  it('wraps backward from the first step, success then start', () => {
    expect(prev(S, at(0, 30))).toEqual({
      state: at(24, 30),
      cues: ['success', 'start'],
    })
  })

  it('leaves an active exercise with success, enters Rest with no start', () => {
    expect(prev(S, at(2, 30))).toEqual({ state: at(1, 10), cues: ['success'] })
  })
})
