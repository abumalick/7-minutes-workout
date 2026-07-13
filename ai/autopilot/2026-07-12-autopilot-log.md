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

## Session 2 (22:05) — build a "workout-from-youtube" skill that replicates the back-pain pipeline

- [22:05] Skill shape — options: generalize scripts + playbook / pure playbook / mega-script — chose: generalize scripts + SKILL.md playbook — why: DRY + deterministic, keeps load-bearing prompt style stable; reversible.
- [22:05] Pose metadata location — options: extend instruction entry with optional `image?:{accent,view,pose}` / sibling `<id>-poses.ts` — chose: extend instruction entry — why: one source of truth per exercise, fewer files, YAGNI; voice script ignores the field.
- [22:05] Non-French voice handling — options: default male voice `onwK4e9ZLuTAKqWW03F9` + eleven_multilingual_v2 with env override / per-language picker — chose: default + env override documented in SKILL — why: multilingual model covers many langs; simplest, reversible.
- [22:05] Skill name — options: workout-from-youtube / youtube-workout / add-workout — chose: workout-from-youtube — why: describes input→output clearly; matches project-skill naming.
- [22:08] Generic instructions loading — options: dynamic import(`../src/lib/${id}-instructions.ts`) / static id→module registry — chose: dynamic import — why: empirically verified working under Node 24 (needs .ts ext); no registry to maintain.
- [22:08] Shared type home — options: new src/lib/exercise.ts / keep type in back-pain-instructions.ts — chose: new src/lib/exercise.ts — why: neutral home for the generic ExerciseInstruction type shared by all workouts + scripts.
- [22:08] Script file-write API — options: keep Bun.write / node:fs writeFile — chose: node:fs/promises writeFile — why: makes the CLAUDE.md-documented `node scripts/*.ts` invocation actually work (Bun global is undefined under node); runtime-agnostic.
- [22:08] Execution approach — options: inline / subagent-driven — chose: inline — why: cohesive single-codebase refactor, full context held (mirrors session-1 choice).
- [22:20] Skill built (7 tasks), tests/lint/build green; merged to main --no-ff (user choice) → post-merge auto-deployed.

## Session 2b (2026-07-13) — live skill run on youtu.be/b6O-XzAGbVo

- [11:29] New workout id/name — options: office-back "Mal de dos au bureau" / dos-bureau — chose: office-back — why: clear English kebab id, French display name matches app.
- [11:29] Rotation exercise — options: single bilateral step / split L/R — chose: split into 02-rotation-gauche + 03-rotation-droite — why: coach does "d'un côté puis de l'autre"; matches app's L/R-split convention + per-side image.
- [11:29] Durations — options: chapter gaps / deliberate holds — chose: deliberate 25–40s holds — why: chapter gaps are pacing, not hold times.
- [11:43] Pictogram framing — options: match video's seated+standing demos / all seated — chose: all seated on a plain chair — why: coherent set for a "position assise" office routine; validation image confirmed chair renders despite "no equipment" style line.
- [11:48] All 7 voice+images generated, gallery published (artifact 053f72e9), full gate green, committed on feat/workout-from-youtube-run. Merge/deploy of the new workout escalated to user.
- [11:50] Skill hardened from run: yt-dlp needs --no-update --js-runtimes bun; box has ImageMagick v6 (convert/montage, not magick); don't cd into .tmp; image batch exceeds 2-min timeout (re-run, skips existing).
