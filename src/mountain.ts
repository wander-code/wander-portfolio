type Ridge = { x: number; z: number; height: number; width: number; depth: number };

const ridges: Ridge[] = [
  { x: -0.21, z: -0.23, height: 1.48, width: 0.83, depth: 0.76 },
  { x: 0.48, z: -0.38, height: 1.08, width: 0.92, depth: 0.71 },
  { x: -0.79, z: 0.07, height: 0.82, width: 0.69, depth: 0.80 },
  { x: 0.95, z: -0.12, height: 0.65, width: 0.63, depth: 0.83 },
  { x: 0.17, z: 0.55, height: 0.47, width: 0.79, depth: 0.72 },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function noise(x: number, z: number) {
  return Math.sin(11.7 * x + 4.8 * z) * Math.cos(9.1 * z - 3.4 * x) * 0.57
    + Math.sin(27.1 * x - 6.6 * z) * Math.cos(19.2 * z + 7.1 * x) * 0.29
    + Math.sin(63.3 * x + 31.9 * z) * Math.cos(48.1 * z - 19.1 * x) * 0.14;
}

function elevation(x: number, z: number) {
  const warp = noise(x * 0.76, z * 0.76);
  const height = ridges.reduce((maximum, ridge) => {
    const dx = (x - ridge.x + warp * 0.09) / ridge.width;
    const dz = (z - ridge.z - warp * 0.06) / ridge.depth;
    const distance = Math.sqrt(dx * dx + dz * dz + dx * dz * 0.44);
    return Math.max(maximum, ridge.height * Math.max(0, 1 - distance * 0.79) ** 1.17);
  }, 0);

  const detail = 0.20 * noise(x, z) + 0.08 * noise(x * 2, z * 2);
  const face = 0.13 * Math.abs(Math.sin(x * 8.5 + z * 3.3)) * (0.5 + Math.sin(z * 6) * 0.5);
  return Math.max(0, height + (detail - face) * Math.min(1, height * 3));
}

type Cell = { a: number; b: number; c: number; d: number; height: number; light: number; grain: number; id: number };

function makeMesh(segments: number) {
  const vertices: { x: number; y: number; z: number }[] = [];
  const cells: Cell[] = [];
  const stride = segments + 1;
  const dx = 3.5 / segments;
  const dz = 2.75 / segments;

  for (let row = 0; row <= segments; row++) {
    for (let col = 0; col <= segments; col++) {
      const x = col * dx - 1.75;
      const z = row * dz - 1.375;
      const y = elevation(x, z);
      vertices.push({ x, y: Math.round(y * 90) / 90, z });
    }
  }

  for (let row = 0; row < segments; row++) {
    for (let col = 0; col < segments; col++) {
      const a = row * stride + col;
      const b = a + 1;
      const c = b + stride;
      const d = a + stride;
      const height = (vertices[a].y + vertices[b].y + vertices[c].y + vertices[d].y) / 4;
      if (height < 0.033) continue;

      const slopeX = (vertices[b].y + vertices[c].y - vertices[a].y - vertices[d].y) / (2 * dx);
      const slopeZ = (vertices[d].y + vertices[c].y - vertices[a].y - vertices[b].y) / (2 * dz);
      const normalLength = Math.hypot(slopeX, 1, slopeZ);
      const light = (-0.62 * slopeX + 0.67 - 0.41 * slopeZ) / normalLength;
      const grain = (Math.sin((row * 14.33 + col * 79.17) * 12.9898) + 1) * 0.5;
      cells.push({ a, b, c, d, height, light, grain, id: cells.length });
    }
  }
  return { vertices, cells };
}

const desktopMesh = makeMesh(75);
const compactMesh = makeMesh(59);

type RGB = [number, number, number];

function mix(from: RGB, to: RGB, amount: number): RGB {
  return [
    from[0] + (to[0] - from[0]) * amount,
    from[1] + (to[1] - from[1]) * amount,
    from[2] + (to[2] - from[2]) * amount,
  ];
}

function colorFor(cell: Cell, lightTheme: boolean) {
  const brightness = clamp((cell.light + 0.36) * 0.77 + (cell.grain - 0.5) * 0.27, 0, 1);
  const altitude = clamp((cell.height - 0.12) / 1.18, 0, 1);
  const shadow: RGB = lightTheme ? [42, 69, 67] : [12, 28, 33];
  const grass: RGB = lightTheme ? [123, 145, 88] : [126, 153, 106];
  const summit: RGB = lightTheme ? [235, 235, 187] : [233, 247, 193];
  const lit = mix(grass, summit, Math.max(0, (altitude - 0.24) / 0.76) ** 0.88);
  const color = mix(shadow, lit, clamp(brightness * 0.80 + altitude * 0.29, 0, 1));
  return 'rgba(' + color.map(Math.round).join(',') + ',' + clamp(cell.height * 3.5 + 0.32, 0, 1) + ')';
}

export type MountainView = { yaw: number; pitch: number };

export function createMountainRenderer(canvas: HTMLCanvasElement, lightTheme: boolean) {
  const context = canvas.getContext('2d');
  if (!context) return;

  let width = 0;
  let height = 0;
  let scale = 0;
  let centerX = 0;
  let centerY = 0;
  let mesh = desktopMesh;
  let colors = mesh.cells.map((cell) => colorFor(cell, lightTheme));
  let screenX = new Float32Array(mesh.vertices.length);
  let screenY = new Float32Array(mesh.vertices.length);
  let depth = new Float32Array(mesh.vertices.length);
  let ordered = [...mesh.cells];

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.7);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context!.setTransform(ratio, 0, 0, ratio, 0, 0);
    const compact = width < 550;
    scale = Math.min(width / (compact ? 3.59 : 3.76), height / 2.58);
    centerX = width * 0.51;
    centerY = height * (compact ? 0.64 : 0.655);

    const nextMesh = compact ? compactMesh : desktopMesh;
    if (mesh !== nextMesh) {
      mesh = nextMesh;
      colors = mesh.cells.map((cell) => colorFor(cell, lightTheme));
      screenX = new Float32Array(mesh.vertices.length);
      screenY = new Float32Array(mesh.vertices.length);
      depth = new Float32Array(mesh.vertices.length);
      ordered = [...mesh.cells];
    }
  }

  function draw({ yaw, pitch }: MountainView) {
    const ctx = context!;
    if (!width || !height) return;

    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    function project(x: number, y: number, z: number) {
      const sideways = x * cosYaw + z * sinYaw;
      const forward = z * cosYaw - x * sinYaw;
      const distance = forward * cosPitch + y * sinPitch;
      const perspective = 1 / (1 - distance * 0.14);
      return [
        centerX + sideways * scale * perspective,
        centerY + (forward * sinPitch - y * cosPitch) * scale * perspective,
        distance,
      ];
    }

    ctx.clearRect(0, 0, width, height);
    for (let z = -1.65; z <= 1.65; z += 0.15) {
      for (let x = -2; x <= 2; x += 0.15) {
        const [px, py] = project(x, 0, z);
        const opacity = clamp(1 - Math.hypot(x * 0.39, z * 0.44), 0, 1) * (lightTheme ? 0.32 : 0.38);
        ctx.fillStyle = lightTheme ? 'rgba(48,81,69,' + opacity + ')' : 'rgba(145,178,151,' + opacity + ')';
        ctx.fillRect(Math.round(px), Math.round(py), 1.3, 1.3);
      }
    }

    for (let i = 0; i < mesh.vertices.length; i++) {
      const { x, y, z } = mesh.vertices[i];
      const [px, py, distance] = project(x, y, z);
      screenX[i] = px;
      screenY[i] = py;
      depth[i] = distance;
    }

    ordered.sort((first, second) => (depth[first.a] + depth[first.c]) - (depth[second.a] + depth[second.c]));
    for (const cell of ordered) {
      const { a, b, c, d } = cell;
      ctx.beginPath();
      ctx.moveTo(screenX[a], screenY[a]);
      ctx.lineTo(screenX[b], screenY[b]);
      ctx.lineTo(screenX[c], screenY[c]);
      ctx.lineTo(screenX[d], screenY[d]);
      ctx.closePath();
      ctx.fillStyle = colors[cell.id];
      ctx.fill();

      if (cell.grain > 0.79 && cell.height > 0.09) {
        ctx.fillStyle = lightTheme ? 'rgba(225,235,183,0.48)' : 'rgba(228,248,198,0.51)';
        const size = width < 550 ? 1.0 : 1.6;
        ctx.fillRect(Math.round((screenX[a] + screenX[c]) / 2), Math.round((screenY[a] + screenY[c]) / 2), size, size);
      }
    }
  }

  return { resize, draw };
}
