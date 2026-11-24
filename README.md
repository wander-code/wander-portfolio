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

Project summaries, categories, and case study content live in `src/projects.ts`. The boop logo and gameplay screenshots are in `src/assets/boop/`. Qualifications are in `src/QualificationsPage.tsx`.

## Mount Pulag terrain

The fullscreen 3D map uses a 97 × 97 grid sampled from Mapzen Terrarium tiles at zoom 13, covering an 11.2 km square centered at 16.597722° N, 120.898750° E. The site exaggerates elevation for readability and fades out the edges of the map. The checkpoint path illustrates academic milestones. Selecting a checkpoint shifts the perspective of the 3D camera.

SRTM data courtesy of the U.S. Geological Survey. Terrain Tiles accessed November 24, 2026. [AWS Open Data Registry](https://registry.opendata.aws/terrain-tiles/) · [Mapzen attribution](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)
