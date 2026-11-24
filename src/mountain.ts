import pulagPanorama from './assets/pulag-summit.jpg';

export type TerrainPosition = { x: number; y: number };
export type MountainView = TerrainPosition & { zoom: number };

const sourceWidth = 960;
const sourceHeight = 542;
// The skyline positions are sampled across the original dawn photograph.
const horizon = [0.573, 0.563, 0.534, 0.505, 0.477, 0.430, 0.410, 0.404, 0.397, 0.390, 0.408, 0.423, 0.416, 0.434, 0.458, 0.475, 0.502];
const glyphs = ['.', ':', ';', '+', '=', 'x', '*', 'o', '#', '%', '@'];
const grassDark = ['#344438', '#49583e', '#68704a', '#90905e', '#b4a775', '#d2ba86', '#ead1a4', '#ffebcb'];
const skyDark = ['#293d43', '#3d515b', '#4e6374', '#627689', '#7e8295', '#9b93a8', '#b7aaba', '#d2c4c9'];
const grassLight = ['#b9b09c', '#a79a7f', '#998660', '#826f4a', '#6a583a', '#5c4830', '#493622', '#3b2d21'];
const skyLight = ['#bdc9c7', '#a6b3b5', '#94a5aa', '#82939f', '#707f91', '#647184', '#546070', '#455461'];

export const pulagSummit = { latitude: 16.597722, longitude: 120.898750 };

const clamp = (number: number, min: number, max: number) => Math.min(max, Math.max(min, number));
const unit = (number: number) => clamp(number, 0, 1);

function imageOffset(frame: number, image: number, desired: number, first: number, last: number) {
  const min = Math.max(first, Math.min(0, frame - image));
  const max = Math.min(last, Math.max(0, frame - image));
  return min <= max ? clamp(desired, min, max) : clamp(desired, first, last);
}

export function createMountainRenderer(
  canvas: HTMLCanvasElement,
  light: boolean,
  positions: readonly TerrainPosition[],
  onReady: () => void,
) {
  const context = canvas.getContext('2d');
  const sample = document.createElement('canvas');
  const sampler = sample.getContext('2d', { willReadFrequently: true });
  if (!context || !sampler) return;
  const ctx = context;
  const raster = sampler;
  const photo = new Image();
  photo.addEventListener('load', onReady);
  photo.src = pulagPanorama;

  const leftmost = Math.min(...positions.map(({ x }) => x));
  const rightmost = Math.max(...positions.map(({ x }) => x));
  const highest = Math.min(...positions.map(({ y }) => y));
  const lowest = Math.max(...positions.map(({ y }) => y));
  let width = 0;
  let height = 0;

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const compact = width < 530;
    sample.width = Math.max(1, Math.round(width / (compact ? 4.2 : 5.8)));
    sample.height = Math.max(1, Math.round(height / (compact ? 6.05 : 8.25)));
  }

  function draw(view: MountainView, selected: number) {
    if (!width || !height) return [];

    const leftInset = Math.min(width * 0.1, 29);
    const rightInset = Math.min(width * 0.35, 136);
    const topInset = Math.min(height * 0.26, 65);
    const bottomInset = Math.min(height * 0.13, 33);
    const scale = Math.min(
      Math.max(width / sourceWidth, height / sourceHeight) * view.zoom,
      (width - leftInset - rightInset) / ((rightmost - leftmost) * sourceWidth),
      (height - topInset - bottomInset) / ((lowest - highest) * sourceHeight),
    );
    const columns = sample.width;
    const rows = sample.height;
    const glyphWidth = width / columns;
    const glyphHeight = height / rows;
    const photoWidth = sourceWidth * scale;
    const photoHeight = sourceHeight * scale;
    const x = imageOffset(width, photoWidth, width * 0.5 - view.x * photoWidth,
      leftInset - leftmost * photoWidth, width - rightInset - rightmost * photoWidth);
    const y = imageOffset(height, photoHeight, height * 0.5 - view.y * photoHeight,
      topInset - highest * photoHeight, height - bottomInset - lowest * photoHeight);
    const markers = positions.map((point) => ({ x: x + point.x * photoWidth, y: y + point.y * photoHeight }));

    ctx.clearRect(0, 0, width, height);
    if (photo.naturalWidth) {
      raster.clearRect(0, 0, columns, rows);
      raster.drawImage(photo, x / glyphWidth, y / glyphHeight, photoWidth / glyphWidth, photoHeight / glyphHeight);
      const pixels = raster.getImageData(0, 0, columns, rows).data;
      ctx.globalAlpha = light ? 0.24 : 0.48;
      ctx.drawImage(photo, x, y, photoWidth, photoHeight);
      ctx.globalAlpha = 1;
      ctx.font = Math.round(glyphHeight * 105) / 100 + 'px "Cascadia Mono", "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const skyline = Array.from({ length: columns }, (_, column) => {
        const photoColumn = unit(((column + 0.5) * glyphWidth - x) / photoWidth) * (horizon.length - 1);
        const index = Math.min(Math.floor(photoColumn), horizon.length - 2);
        return horizon[index] + (horizon[index + 1] - horizon[index]) * (photoColumn - index);
      });

      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const index = (row * columns + column) * 4;
          if (pixels[index + 3] < 128) continue;
          const red = pixels[index];
          const green = pixels[index + 1];
          const blue = pixels[index + 2];
          const luminance = (red * 0.24 + green * 0.65 + blue * 0.11) / 255;
          const photoRow = ((row + 0.5) * glyphHeight - y) / photoHeight;
          const sky = unit((skyline[column] - photoRow + 0.023) / 0.046);
          const grain = (column * 43 + row * 31 + column * row * 7) % 97 / 97 - 0.5;
          const tone = unit((luminance - 0.10) * (1.40 - sky * 0.62) + grain * 0.21);
          const palette = sky > 0.5 ? (light ? skyLight : skyDark) : (light ? grassLight : grassDark);
          if (tone < 0.12 && grain < 0) continue;
          ctx.fillStyle = palette[Math.round(tone * (palette.length - 1))];
          ctx.fillText(glyphs[Math.round(tone * (glyphs.length - 1))], (column + 0.5) * glyphWidth, (row + 0.5) * glyphHeight);
        }
      }

      const vignette = ctx.createRadialGradient(width * 0.54, height * 0.55, Math.min(width, height) * 0.21,
        width * 0.54, height * 0.55, Math.hypot(width, height) * 0.67);
      vignette.addColorStop(0, '#000');
      vignette.addColorStop(0.76, '#000b');
      vignette.addColorStop(1, '#0000');
      ctx.globalCompositeOperation = 'destination-in';
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 1; i < markers.length; i++) {
      const start = markers[i - 1];
      const end = markers[i];
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.lineWidth = 3.8;
      ctx.strokeStyle = light ? '#edeadd' : '#151913';
      ctx.stroke();
      ctx.lineWidth = 1.35;
      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = i <= selected ? (light ? '#32502f' : '#e0ee93') : (light ? '#657957' : '#aebc8f');
      ctx.stroke();
      ctx.setLineDash([]);
    }

    return markers;
  }

  function dispose() {
    photo.removeEventListener('load', onReady);
  }

  return { resize, draw, dispose };
}
