import * as THREE from 'three';

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAG = `
uniform sampler2D uMask;
uniform float uTime;
varying vec2 vUv;

void main() {
  float mask = texture2D(uMask, vUv).a;
  if (mask < 0.004) discard;
  vec2 uv = vUv;
  float n1 = sin(uv.x * 8.0 + uTime * 0.06) * sin(uv.y * 5.5 - uTime * 0.04);
  float n2 = sin((uv.x * 1.7 + uv.y) * 12.0 + n1);
  float h = uv.y + n1 * 0.035;
  vec3 dusk = mix(vec3(0.16, 0.26, 0.40), vec3(0.80, 0.86, 0.92), smoothstep(0.0, 0.78, h));
  vec3 cloud = mix(dusk, vec3(0.97, 0.98, 0.99), 0.42 + 0.18 * n2);
  gl_FragColor = vec4(cloud, clamp(mask, 0.0, 1.0));
}
`;

export function createClouds() {
  const mobile = window.matchMedia('(max-width: 760px)').matches;
  const canvas = document.createElement('canvas');
  const w = mobile ? 768 : 1152;
  const h = Math.max(480, Math.round(w * (window.innerHeight / Math.max(window.innerWidth, 1))));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uMask: { value: texture },
      uTime: { value: 0 },
    },
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  scene.add(mesh);

  let sealProgress = 0;
  let wipeId = 0;

  function erase(x, y, radius) {
    const g = ctx.createRadialGradient(x, y, radius * 0.12, x, y, radius);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.65, 'rgba(0,0,0,0.45)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    texture.needsUpdate = true;
  }

  function puff(t) {
    const edge = t < 0.7;
    let x;
    let y;
    const side = Math.floor(Math.random() * 4);
    if (edge) {
      if (side === 0) {
        x = Math.random() * w;
        y = Math.random() * h * 0.3;
      } else if (side === 1) {
        x = Math.random() * w;
        y = h - Math.random() * h * 0.3;
      } else if (side === 2) {
        x = Math.random() * w * 0.24;
        y = Math.random() * h;
      } else {
        x = w - Math.random() * w * 0.24;
        y = Math.random() * h;
      }
    } else {
      x = w * (0.12 + Math.random() * 0.76);
      y = h * (0.12 + Math.random() * 0.76);
    }
    const r = (edge ? 80 : 100) + Math.random() * 130;
    ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.5)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  return {
    scene,
    camera,
    width: w,
    height: h,
    setTime(value) {
      material.uniforms.uTime.value = value;
    },
    toLocal(clientX, clientY, rect) {
      return {
        x: ((clientX - rect.left) / rect.width) * w,
        y: ((clientY - rect.top) / rect.height) * h,
      };
    },
    seal(target) {
      const steps = Math.max(0, Math.round((target - sealProgress) * 110));
      for (let i = 0; i < steps; i++) {
        const t = sealProgress + ((i + 1) / Math.max(1, steps)) * (target - sealProgress);
        puff(t);
      }
      sealProgress = Math.max(sealProgress, target);
      if (target >= 0.999) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
      }
      texture.needsUpdate = true;
    },
    erase,
    wipe(x, y, hooks) {
      const id = ++wipeId;
      const start = performance.now();
      const duration = 1680;
      const maxR = Math.hypot(w, h) * 0.78;
      const step = (now) => {
        if (id !== wipeId) return;
        const t = Math.min(1, (now - start) / duration);
        const eased = t * t * t;
        erase(x, y, 18 + eased * maxR);
        if (t > 0.32) {
          const gusts = 3 + Math.floor(eased * 4);
          for (let i = 0; i < gusts; i++) {
            const a = Math.random() * Math.PI * 2;
            const rr = eased * maxR * Math.random();
            erase(x + Math.cos(a) * rr, y + Math.sin(a) * rr, 28 + eased * 140);
          }
        }
        hooks.onProgress?.(eased);
        if (t < 1) requestAnimationFrame(step);
        else {
          ctx.clearRect(0, 0, w, h);
          texture.needsUpdate = true;
          hooks.onDone?.();
        }
      };
      requestAnimationFrame(step);
    },
    cancel() {
      wipeId += 1;
    },
  };
}
