# Autopilot decision log — 2026-07-12

- [07:59] Session start — back-pain workout feature — posture: decide craft, escalate intent/one-way-doors/security
- [08:03] Execution approach — options: inline / subagent-driven — chose: inline — why: cohesive single-codebase feature, full context held, avoids handoff loss
- [08:03] Test topology — options: unit-only pure logic / add Svelte component tests — chose: unit pure logic + run-app verification for UI — why: repo has no component-test infra; follow existing pattern
- [08:03] Voice asset import — options: 18 static imports / import.meta.glob — chose: import.meta.glob — why: DRY, avoids 18 hand-maintained import lines
- [08:03] Voice playback trigger — options: new cue type / piggyback 'start' cue in shell — chose: piggyback 'start' — why: fewer type changes, start cue already fires exactly on exercise entry
- [08:03] Picker routing — options: dynamic [id] route / in-page selectedId state — chose: in-page state — why: keeps single prerendered route, simpler
- [08:03] Instruction text home — options: inline in workouts.ts / shared back-pain-instructions.ts — chose: shared module — why: single source of truth for both generator script and workout definition
- [08:07] BLOCKER (escalated) — ElevenLabs key lacks text_to_speech/voices_read/user_read scopes — cannot generate audio; Tasks 4 (wiring) blocked pending a properly-scoped key. Not a craft decision: external credential.
- [08:20] Voice selection — options: native French library voice (Enrick) / English-accented premade — chose: premade 'Daniel - Steady Broadcaster' (onwK4e9ZLuTAKqWW03F9) — why: free plan blocks library voices via API; premade works now, swappable via ELEVENLABS_VOICE_ID re-run if user upgrades
- [08:26] Feature complete — all 5 tasks committed; tests/lint/build green; browser-verified voice playback. Integration (merge/PR) left to user.
- [08:33] Dev URL serving — mirror h2/ad3iya portless pattern — added scripts/dev-server.sh (env-strip + IPv4 bind + PORTLESS_STATE_DIR=~/.portless-dev), portless base name 'my-workout' (package.json), Vite allowedHosts '.dev.sageplex.com' (Vite 6 host check; ad3iya on Vite 8 didn't need it) — live at https://my-workout.dev.sageplex.com
- [08:40] Voice UX — prepend movement name before explanation; strip parentheses for natural speech; regenerated 18 clips; STT-verified name is announced.
