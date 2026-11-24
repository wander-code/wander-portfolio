# Wander Portfolio

Tomas Capili’s software engineering portfolio. Explore four projects through an interactive topographic map and dedicated case studies.

[Open the live portfolio](https://wander-code.github.io/wander-portfolio/)

## Development

Use Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

`npm run build` type-checks the source and writes `dist/`. `npm run preview` serves the production build locally. The build uses relative assets and hash-based case study routes, so it can be served from a static host at any path.

Project summaries, categories, map positions, and case study content live in `src/projects.ts`. The terrain and project illustrations are drawn by the site. The tap challenge on the boop page is a browser demo of the spawning mechanic.
