# Autopilot decision log — 2026-07-12

- [06:51] Plan execution mode — options: subagent-driven / inline — chose: inline — why: small fully-specified 4-task plan; inline is lower-overhead and keeps TDD/verify gates
- [06:51] Lucide icon package — options: lucide-svelte@1.0.1 / @lucide/svelte — chose: @lucide/svelte — why: maintained Svelte 5 package (peer ^5); lucide-svelte name is stale/transitional
- [06:57] Lucide import style — options: barrel `@lucide/svelte` / per-icon `@lucide/svelte/icons/x` — chose: per-icon — why: barrel makes Vite prebundle all icons as .svelte (esbuild "no loader" error); deep imports fix it + tree-shake
- [06:59] Control icons — options: @lucide/svelte dep / lucide-svelte dep / inline SVG — chose: inline SVG (lucide paths) — why: both lucide packages break Vite esbuild prebundle ("no .svelte loader"); 4 static icons are trivial to inline, zero deps, identical look
