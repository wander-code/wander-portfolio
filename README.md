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

## Mount Pulag panorama

The homepage renders an ASCII adaptation of a dawn photograph of Mount Pulag’s summit grasslands. The camera pans and zooms across the photograph as visitors select checkpoints. The overlaid route illustrates academic milestones.

Photograph by Bien Orellana Bacarra Jr (Bien02). The site crops, tints, and renders the photograph in text characters. [Wikimedia Commons source](https://commons.wikimedia.org/wiki/File:Panoramic_Shot_of_Mt._Pulag_Summit_and_Grassland.jpg) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
