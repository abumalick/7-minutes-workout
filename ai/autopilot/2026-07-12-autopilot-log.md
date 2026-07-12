# Autopilot decision log — 2026-07-12

- [07:59] Session start — back-pain workout feature — posture: decide craft, escalate intent/one-way-doors/security
- [08:03] Execution approach — options: inline / subagent-driven — chose: inline — why: cohesive single-codebase feature, full context held, avoids handoff loss
- [08:03] Test topology — options: unit-only pure logic / add Svelte component tests — chose: unit pure logic + run-app verification for UI — why: repo has no component-test infra; follow existing pattern
- [08:03] Voice asset import — options: 18 static imports / import.meta.glob — chose: import.meta.glob — why: DRY, avoids 18 hand-maintained import lines
- [08:03] Voice playback trigger — options: new cue type / piggyback 'start' cue in shell — chose: piggyback 'start' — why: fewer type changes, start cue already fires exactly on exercise entry
- [08:03] Picker routing — options: dynamic [id] route / in-page selectedId state — chose: in-page state — why: keeps single prerendered route, simpler
- [08:03] Instruction text home — options: inline in workouts.ts / shared back-pain-instructions.ts — chose: shared module — why: single source of truth for both generator script and workout definition
