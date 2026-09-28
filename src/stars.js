import * as THREE from 'three';

const VERT = `
attribute float aSize;
attribute vec3 aColor;
uniform float uSpeed;
uniform float uPixelRatio;
varying vec3 vColor;
varying vec2 vRadial;
varying float vMag;
varying float vFade;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec4 clip = projectionMatrix * mv;
  vRadial = clip.xy;
  float depth = max(0.4, -mv.z);
  vMag = uSpeed * (12.0 / depth);
  vColor = aColor;
  vFade = clamp(1.2 - depth / 170.0, 0.18, 1.0);
  float stretch = clamp(vMag * 2.4, 0.0, 4.0);
  gl_PointSize = clamp(aSize * uPixelRatio * (78.0 / depth) * (1.0 + stretch * 0.9), 1.15, 70.0);
  gl_Position = clip;
}
`;

const FRAG = `
varying vec3 vColor;
varying vec2 vRadial;
varying float vMag;
varying float vFade;

void main() {
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float streak = clamp(vMag * 1.7, 0.0, 1.0);
  vec2 dir = normalize(vRadial + vec2(0.001, 0.0004));
  float along = dot(uv, dir);
  float side = dot(uv, vec2(-dir.y, dir.x));
  float halfW = mix(0.78, 0.12, streak);
  float tail = mix(0.78, 1.2, streak);
  float nose = mix(0.78, 0.26, streak);
  float dSide = abs(side) / halfW;
  float dAlong = along >= 0.0 ? along / nose : -along / tail;
  if (dSide > 1.0 || dAlong > 1.0) discard;
  float alpha = (1.0 - smoothstep(0.15, 1.0, dSide)) * (1.0 - smoothstep(0.05, 1.0, dAlong));
  alpha *= vFade;
  if (alpha < 0.025) discard;
  gl_FragColor = vec4(vColor, alpha);
}
`;

function pushStar(positions, colors, sizes, x, y, z, scale) {
  positions.push(x, y, z);
  const roll = Math.random();
  if (roll > 0.9) colors.push(1.0, 0.86, 0.72);
  else if (roll > 0.72) colors.push(0.75, 0.86, 1.0);
  else colors.push(0.9, 0.93, 1.0);
  sizes.push(scale * (0.7 + Math.random() * 1.1));
}

export function createStars({ farCount, nearCount, pixelRatio }) {
  const positions = [];
  const colors = [];
  const sizes = [];

  const reject = (x, y, z) => {
    const dx = x;
    const dy = y - 0.45;
    const dz = z - 26;
    if (dx * dx + dy * dy + dz * dz < 100) return true;
    if (Math.abs(x) < 5.2 && y > -1 && y < 4.4 && z < -94.5 && z > -106.5) return true;
    return false;
  };

  let guard = 0;
  while (positions.length / 3 < farCount && guard < farCount * 8) {
    guard += 1;
    const x = THREE.MathUtils.randFloatSpread(100);
    const y = THREE.MathUtils.randFloatSpread(70);
    const z = THREE.MathUtils.randFloat(-155, 42);
    if (reject(x, y, z)) continue;
    pushStar(positions, colors, sizes, x, y, z, 1);
  }
  guard = 0;
  while (positions.length / 3 < farCount + nearCount && guard < nearCount * 8) {
    guard += 1;
    const x = THREE.MathUtils.randFloatSpread(36);
    const y = THREE.MathUtils.randFloatSpread(24);
    const z = THREE.MathUtils.randFloat(-120, 30);
    if (reject(x, y, z)) continue;
    pushStar(positions, colors, sizes, x, y, z, 1.45);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uSpeed: { value: 0 },
      uPixelRatio: { value: pixelRatio },
    },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  const group = new THREE.Group();
  group.add(points);

  return {
    group,
    setSpeed(value) {
      material.uniforms.uSpeed.value = value;
    },
    setPixelRatio(value) {
      material.uniforms.uPixelRatio.value = value;
    },
  };
}
