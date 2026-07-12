import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const config = defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    allowedHosts: [".dev.sageplex.com", ".localhost"],
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});

// `vp staged` reads this `staged` key to know what to run on staged files.
// Attached via Object.assign because vite's defineConfig doesn't type it.
export default Object.assign(config, { staged: { "*": "vp check --fix" } });
