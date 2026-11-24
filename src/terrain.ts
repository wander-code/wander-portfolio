const peaks = [
  { x: 0.59, y: 0.36, height: 1.12, spreadX: 0.19, spreadY: 0.23 },
  { x: 0.75, y: 0.58, height: 0.76, spreadX: 0.17, spreadY: 0.23 },
  { x: 0.29, y: 0.67, height: 0.65, spreadX: 0.18, spreadY: 0.17 },
  { x: 0.23, y: 0.19, height: 0.46, spreadX: 0.17, spreadY: 0.16 },
  { x: 0.94, y: 0.16, height: 0.5, spreadX: 0.15, spreadY: 0.18 },
];

function elevation(x: number, y: number) {
  const ridges = 0.057 * Math.sin(20 * x + 8 * y) * Math.sin(17 * y - 7 * x);
  const detail = 0.025 * Math.sin(48 * x - 13 * y) * Math.cos(37 * y + 9 * x);

  return peaks.reduce((height, peak) => {
    const dx = (x - peak.x) / peak.spreadX;
    const dy = (y - peak.y) / peak.spreadY;
    return height + peak.height * Math.exp(-0.8 * (dx * dx + dy * dy - 0.55 * dx * dy));
  }, ridges + detail);
}

export function drawTerrain(canvas: HTMLCanvasElement, light: boolean) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const context = canvas.getContext('2d');
  if (!context || !width || !height) return;

  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  context.scale(ratio, ratio);

  const columns = 104;
  const rows = 78;
  const values = Array.from({ length: rows + 1 }, (_, row) =>
    Array.from({ length: columns + 1 }, (_, col) => elevation(col / columns, row / rows)),
  );
  const deltaX = width / columns;
  const deltaY = height / rows;

  for (let level = 1; level <= 34; level++) {
    const threshold = level * 0.037;
    const major = level % 5 === 0;
    context.beginPath();

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const corners = [
          [col, row, values[row][col]],
          [col + 1, row, values[row][col + 1]],
          [col + 1, row + 1, values[row + 1][col + 1]],
          [col, row + 1, values[row + 1][col]],
        ];
        const crossings: [number, number][] = [];
        for (let edge = 0; edge < 4; edge++) {
          const [x1, y1, z1] = corners[edge];
          const [x2, y2, z2] = corners[(edge + 1) % 4];
          if ((z1 < threshold) === (z2 < threshold)) continue;

          const fraction = (threshold - z1) / (z2 - z1);
          crossings.push([(x1 + fraction * (x2 - x1)) * deltaX, (y1 + fraction * (y2 - y1)) * deltaY]);
        }
        if (crossings.length === 4) {
          const center = corners.reduce((sum, corner) => sum + corner[2], 0) / 4;
          if ((center < threshold) === (corners[0][2] < threshold)) crossings.push(crossings.shift()!);
        }
        for (let pair = 0; pair + 1 < crossings.length; pair += 2) {
          context.moveTo(...crossings[pair]);
          context.lineTo(...crossings[pair + 1]);
        }
      }
    }

    context.lineWidth = major ? 1.15 : 0.72;
    context.strokeStyle = light
      ? (major ? 'rgba(46, 81, 49, 0.53)' : 'rgba(67, 100, 57, 0.29)')
      : (major ? 'rgba(196, 228, 116, 0.58)' : 'rgba(155, 185, 95, 0.30)');
    context.stroke();
  }
}
