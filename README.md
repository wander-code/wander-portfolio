# Wander Portfolio

Tomas Capili’s software engineering portfolio. Follow five academic milestones across a character-rendered model of Mount Pulag, or browse four software projects and their case studies.

[Open the live portfolio](https://wander-code.github.io/wander-portfolio/)

## Development

Use Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

`npm run build` type-checks the source and writes `dist/`. `npm run preview` serves the production build locally. The build uses relative assets and hash-based case study routes, so it can be served from a static host at any path.

Project summaries, categories, map positions, and case study content live in `src/projects.ts`. The terrain and project illustrations are drawn by the site. The tap challenge on the boop page is a browser demo of the spawning mechanic.

## Mount Pulag terrain

The model samples a 73 × 73 grid from zoom-13 Mapzen Terrarium tiles in a 5.6 km square centered at 16.597722° N, 120.898750° E. The renderer tapers the outer edge and exaggerates the vertical scale. The checkpoint path illustrates academic milestones.

SRTM data courtesy of the U.S. Geological Survey. Terrain Tiles accessed November 24, 2026. [AWS Open Data Registry](https://registry.opendata.aws/terrain-tiles/) · [Mapzen attribution](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)
