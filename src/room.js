import * as THREE from 'three';

const W = 3.35;
const D = 3.7;
const H = 2.85;

function posesFor(anchor, mobile) {
  const back = mobile ? 0.4 : 0;
  const local = {
    door: { x: 0.15, y: 1.25, z: 2.7, lx: -0.3, ly: 1.05, lz: -0.4 },
    about: { x: -0.35, y: 0.9, z: 3.15 + back, lx: -0.05, ly: 0.78, lz: -2.2 },
    skills: { x: 0.85, y: 1.48, z: 0.15 + back, lx: -3.1, ly: 1.42, lz: -0.35 },
    study: { x: -0.55, y: 1.05, z: 1.35 + back, lx: -0.05, ly: 0.88, lz: 0.12 },
    career: { x: 0.35, y: 1.15, z: 1.15 + back, lx: -0.7, ly: 1.05, lz: 0.15 },
    vision: { x: -0.2, y: 1.15, z: 1.6 + back, lx: 0.05, ly: 1.4, lz: -3.5 },
    health: { x: 1.35, y: 1.2, z: 1.25 + back, lx: 0.15, ly: 0.85, lz: 0.12 },
    hackathon: { x: 0.55, y: 1.55, z: 2.35 + back, lx: -0.4, ly: 0.95, lz: -0.4 },
    education: { x: 0.2, y: 2.35, z: 1.7, lx: -0.7, ly: 0.02, lz: 0.15 },
    contact: { x: 0.1, y: 1.28, z: 1.85, lx: 0.15, ly: 1.45, lz: -3.6 },
  };
  const out = {};
  for (const [key, value] of Object.entries(local)) {
    out[key] = {
      x: anchor.x + value.x,
      y: anchor.y + value.y,
      z: anchor.z + value.z,
      lx: anchor.x + value.lx,
      ly: anchor.y + value.ly,
      lz: anchor.z + value.lz,
    };
  }
  return out;
}

function canvasTex(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function paintEarth() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const g = canvas.getContext('2d');
  const ocean = g.createLinearGradient(0, 0, 0, 512);
  ocean.addColorStop(0, '#12386e');
  ocean.addColorStop(0.45, '#1d5ea8');
  ocean.addColorStop(1, '#3c8fd4');
  g.fillStyle = ocean;
  g.fillRect(0, 0, 1024, 512);
  const lands = [
    ['#2f8a52', 160, 200, 120, 54], ['#3e9a5c', 310, 170, 80, 42],
    ['#247848', 430, 250, 140, 60], ['#4aaa68', 610, 190, 90, 38],
    ['#2d8650', 760, 240, 150, 70], ['#57b070', 900, 180, 70, 36],
    ['#1f6e44', 200, 330, 90, 28], ['#3a9458', 520, 340, 110, 26],
  ];
  for (const [color, x, y, rx, ry] of lands) {
    g.fillStyle = color;
    g.beginPath();
    g.ellipse(x, y, rx, ry, 0.4, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = 'rgba(255,255,255,0.72)';
  for (const [x, y, rx] of [[200, 120, 70], [380, 90, 48], [560, 140, 90], [800, 110, 44], [300, 260, 54], [700, 300, 50], [140, 280, 36]]) {
    g.beginPath();
    g.ellipse(x, y, rx, rx * 0.28, 0.25, 0, Math.PI * 2);
    g.fill();
  }
  const shade = g.createLinearGradient(0, 0, 1024, 0);
  shade.addColorStop(0, 'rgba(2, 8, 20, 0.55)');
  shade.addColorStop(0.35, 'rgba(2, 8, 20, 0)');
  shade.addColorStop(1, 'rgba(180, 220, 255, 0.18)');
  g.fillStyle = shade;
  g.fillRect(0, 0, 1024, 512);
  return canvasTex(canvas);
}

function paintStars() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const g = canvas.getContext('2d');
  g.fillStyle = '#04060c';
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 220; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const bright = Math.random();
    g.fillStyle = bright > 0.92 ? '#d7e6ff' : '#f4f7ff';
    g.globalAlpha = 0.35 + bright * 0.65;
    g.beginPath();
    g.arc(x, y, bright > 0.9 ? 1.7 : 0.7, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;
  return canvasTex(canvas);
}

function paintFloor() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const g = canvas.getContext('2d');
  g.fillStyle = '#4a5260';
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = 'rgba(20, 24, 30, 0.45)';
  g.lineWidth = 3;
  for (let x = 0; x <= 512; x += 64) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, 512);
    g.stroke();
  }
  g.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  g.lineWidth = 1;
  for (let y = 32; y < 512; y += 64) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(512, y);
    g.stroke();
  }
  return canvasTex(canvas);
}

function paintWood() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const g = canvas.getContext('2d');
  const grain = g.createLinearGradient(0, 0, 0, 256);
  grain.addColorStop(0, '#c48a42');
  grain.addColorStop(0.5, '#a56b30');
  grain.addColorStop(1, '#8a5524');
  g.fillStyle = grain;
  g.fillRect(0, 0, 512, 256);
  g.strokeStyle = 'rgba(92, 48, 16, 0.28)';
  g.lineWidth = 2;
  for (let i = 0; i < 26; i++) {
    g.beginPath();
    const y = 6 + i * 10;
    g.moveTo(0, y);
    g.bezierCurveTo(140, y - 6, 320, y + 8, 512, y - 2);
    g.stroke();
  }
  return canvasTex(canvas);
}

function paintArt(kind) {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 220;
  const g = canvas.getContext('2d');
  g.fillStyle = '#10161e';
  g.fillRect(0, 0, 160, 220);
  if (kind === 'earth') {
    g.fillStyle = '#1d5fa8';
    g.beginPath();
    g.arc(80, 110, 54, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#3e9a62';
    g.beginPath();
    g.ellipse(64, 98, 24, 16, 0.4, 0, Math.PI * 2);
    g.ellipse(98, 124, 16, 10, -0.2, 0, Math.PI * 2);
    g.fill();
  } else if (kind === 'mountains') {
    g.fillStyle = '#9aabbd';
    g.beginPath();
    g.moveTo(16, 176);
    g.lineTo(58, 72);
    g.lineTo(96, 176);
    g.fill();
    g.fillStyle = '#d5dee8';
    g.beginPath();
    g.moveTo(68, 176);
    g.lineTo(114, 58);
    g.lineTo(150, 176);
    g.fill();
  } else if (kind === 'moon') {
    g.fillStyle = '#e4e7ee';
    g.beginPath();
    g.arc(80, 108, 50, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#b7bec8';
    g.beginPath();
    g.arc(64, 94, 11, 0, Math.PI * 2);
    g.arc(100, 122, 8, 0, Math.PI * 2);
    g.fill();
  } else {
    g.strokeStyle = '#f0e2b0';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(80, 42);
    g.lineTo(80, 178);
    g.moveTo(24, 110);
    g.lineTo(136, 110);
    g.moveTo(40, 70);
    g.lineTo(120, 150);
    g.moveTo(120, 70);
    g.lineTo(40, 150);
    g.stroke();
  }
  return canvasTex(canvas);
}

function paintScreen() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 160;
  const g = canvas.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, 160);
  sky.addColorStop(0, '#e7f7ff');
  sky.addColorStop(1, '#7ec4f0');
  g.fillStyle = sky;
  g.fillRect(0, 0, 256, 160);
  g.fillStyle = 'rgba(16, 42, 68, 0.45)';
  for (let i = 0; i < 8; i++) g.fillRect(18, 16 + i * 17, 60 + ((i * 41) % 120), 3);
  return canvasTex(canvas);
}

function bone(from, to, thickness, material) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const len = Math.max(dir.length(), 0.04);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(thickness, len, thickness * 0.85), material);
  mesh.position.copy(from).add(to).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return mesh;
}

function octagonHole(x0, y0, x1, y1, c) {
  const hole = new THREE.Path();
  hole.moveTo(x1 - c, y0);
  hole.lineTo(x0 + c, y0);
  hole.lineTo(x0, y0 + c);
  hole.lineTo(x0, y1 - c);
  hole.lineTo(x0 + c, y1);
  hole.lineTo(x1 - c, y1);
  hole.lineTo(x1, y1 - c);
  hole.lineTo(x1, y0 + c);
  hole.closePath();
  return hole;
}

export function createRoom(anchor, mobile) {
  const group = new THREE.Group();
  group.position.copy(anchor);

  const floorMat = new THREE.MeshStandardMaterial({ map: paintFloor(), color: 0xffffff, roughness: 0.78, metalness: 0.06 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x66717f, roughness: 0.74, metalness: 0.06 });
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x7c8796, roughness: 0.68, metalness: 0.07 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x2c333c, roughness: 0.74 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xf0c56a, metalness: 0.9, roughness: 0.18 });
  const cloth = new THREE.MeshStandardMaterial({ color: 0x2e5288, roughness: 0.72, flatShading: true });
  const pants = new THREE.MeshStandardMaterial({ color: 0x2a3140, roughness: 0.8, flatShading: true });
  const skin = new THREE.MeshStandardMaterial({ color: 0xe8b48c, roughness: 0.58, flatShading: true });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x241810, roughness: 0.78, flatShading: true });
  const shirt = new THREE.MeshStandardMaterial({ color: 0xf6f3ee, roughness: 0.9, flatShading: true });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.5, flatShading: true });
  const soleMat = new THREE.MeshStandardMaterial({ color: 0xbab7af, roughness: 0.72, flatShading: true });
  const strapMat = new THREE.MeshStandardMaterial({ color: 0xd5d2ca, roughness: 0.55, flatShading: true });
  const lipMat = new THREE.MeshStandardMaterial({ color: 0xc48478, roughness: 0.55, flatShading: true });
  const dark = new THREE.MeshStandardMaterial({ color: 0x232830, roughness: 0.62, metalness: 0.18 });
  const cushion = new THREE.MeshStandardMaterial({ color: 0x323842, roughness: 0.7, metalness: 0.08 });
  const woodMap = paintWood();
  const wood = new THREE.MeshStandardMaterial({ map: woodMap, color: 0xffffff, roughness: 0.48, metalness: 0.04 });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, D * 2), floorMat);
  floor.rotation.x = -Math.PI / 2;
  group.add(floor);
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(W * 2, D * 2), wallMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = H;
  group.add(ceiling);
  const hatch = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.45), trimMat);
  hatch.position.set(0, H - 0.02, -0.4);
  group.add(hatch);

  const left = new THREE.Mesh(new THREE.PlaneGeometry(D * 2, H), wallMat);
  left.position.set(-W, H / 2, 0);
  left.rotation.y = Math.PI / 2;
  const right = new THREE.Mesh(new THREE.PlaneGeometry(D * 2, H), wallMat);
  right.position.set(W, H / 2, 0);
  right.rotation.y = -Math.PI / 2;
  group.add(left, right);

  const wallShape = new THREE.Shape();
  wallShape.moveTo(-W, 0);
  wallShape.lineTo(W, 0);
  wallShape.lineTo(W, H);
  wallShape.lineTo(-W, H);
  wallShape.closePath();
  wallShape.holes.push(octagonHole(-1.5, 0.55, 1.5, 2.42, 0.42));
  const back = new THREE.Mesh(new THREE.ShapeGeometry(wallShape), wallMat);
  back.position.z = -D;
  group.add(back);

  const frameShape = new THREE.Shape();
  frameShape.moveTo(-1.22, 0.28);
  frameShape.lineTo(1.22, 0.28);
  frameShape.lineTo(1.78, 0.84);
  frameShape.lineTo(1.78, 2.12);
  frameShape.lineTo(1.22, 2.68);
  frameShape.lineTo(-1.22, 2.68);
  frameShape.lineTo(-1.78, 2.12);
  frameShape.lineTo(-1.78, 0.84);
  frameShape.closePath();
  frameShape.holes.push(octagonHole(-1.38, 0.68, 1.38, 2.28, 0.32));
  const frame = new THREE.Mesh(
    new THREE.ExtrudeGeometry(frameShape, { depth: 0.1, bevelEnabled: false }),
    brass,
  );
  frame.position.z = -D + 0.02;
  group.add(frame);

  for (const y of [0.06, 1.35, 2.55]) {
    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.035, D * 1.7), trimMat);
      rail.position.set(side * (W - 0.02), y, -0.15);
      group.add(rail);
    }
  }
  const sill = new THREE.Mesh(new THREE.BoxGeometry(3.35, 0.07, 0.16), brass);
  sill.position.set(0, 0.4, -D + 0.1);
  group.add(sill);
  for (const z of [-2.15, -0.35, 1.45]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(W * 1.92, 0.05, 0.07), trimMat);
    beam.position.set(0, H - 0.03, z);
    group.add(beam);
  }
  for (const side of [-1, 1]) {
    for (const [z, y, h] of [[-1.9, 1.55, 1.45], [-0.4, 1.65, 1.55], [1.15, 1.4, 1.25]]) {
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.04, h, 0.95), panelMat);
      plate.position.set(side * (W - 0.04), y, z);
      group.add(plate);
    }
  }
  const stars = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 9),
    new THREE.MeshBasicMaterial({ map: paintStars() }),
  );
  stars.position.set(0, 1.6, -D - 12);
  group.add(stars);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.02, 8, 72), brass);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(-0.62, 0.012, 0.18);
  group.add(ring);

  function hang(side, y, z, kind) {
    const x = side * (W - 0.07);
    const outer = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.92, 0.6), brass);
    outer.position.set(x, y, z);
    const art = new THREE.Mesh(
      new THREE.PlaneGeometry(0.46, 0.76),
      new THREE.MeshBasicMaterial({ map: paintArt(kind) }),
    );
    art.position.set(x - side * 0.03, y, z);
    art.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
    group.add(outer, art);
  }
  hang(-1, 1.95, -0.45, 'earth');
  hang(-1, 0.92, 0.75, 'mountains');
  hang(1, 1.95, -0.15, 'moon');
  hang(1, 0.92, 1.05, 'star');

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(5.4, 32, 20),
    new THREE.MeshStandardMaterial({
      map: paintEarth(),
      roughness: 0.72,
      metalness: 0,
      emissive: 0x12325c,
      emissiveIntensity: 0.35,
    }),
  );
  earth.position.set(0.05, -3.2, -D - 5.85);
  group.add(earth);
  const air = new THREE.Mesh(
    new THREE.SphereGeometry(5.62, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0xb7e4ff, transparent: true, opacity: 0.22, side: THREE.BackSide }),
  );
  air.position.copy(earth.position);
  group.add(air);

  const top = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.07, 0.78), wood);
  top.position.set(0.28, 0.76, 0.16);
  const apron = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.16, 0.06), wood);
  apron.position.set(0.28, 0.64, 0.52);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.04, 0.03), wood);
  edge.position.set(0.28, 0.74, -0.22);
  group.add(top, apron, edge);
  for (const [x, z] of [[-0.38, -0.12], [0.92, -0.12], [-0.38, 0.42], [0.92, 0.42]]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.68, 0.06), wood);
    leg.position.set(x, 0.34, z);
    group.add(leg);
  }

  const laptop = new THREE.Group();
  laptop.position.set(-0.08, 0.8, 0.16);
  laptop.rotation.y = -Math.PI / 2 + 0.42;
  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.018, 0.3), dark);
  const keys = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.008, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x12161c, roughness: 0.5 }),
  );
  keys.position.y = 0.014;
  const screenMap = paintScreen();
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: screenMap,
    emissive: 0xb7e6ff,
    emissiveMap: screenMap,
    emissiveIntensity: 1.1,
    roughness: 0.28,
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.27), screenMat);
  screen.position.set(0, 0.16, -0.13);
  screen.rotation.x = -0.38;
  const lid = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.29, 0.012), dark);
  lid.position.set(0, 0.16, -0.14);
  lid.rotation.x = -0.38;
  laptop.add(deck, keys, lid, screen);
  group.add(laptop);

  const lampRig = new THREE.Group();
  lampRig.position.set(0.95, 0.8, 0.12);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.02, 12), brass);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.32, 6), brass);
  stem.position.y = 0.17;
  const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.28, 6), brass);
  lampArm.position.set(-0.1, 0.36, 0);
  lampArm.rotation.z = 1.05;
  const shadeMat = new THREE.MeshStandardMaterial({
    color: 0xf6d48a,
    emissive: 0xffb15a,
    emissiveIntensity: 1.15,
    metalness: 0.55,
    roughness: 0.32,
    side: THREE.DoubleSide,
  });
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.13, 10, 1, true), shadeMat);
  shade.position.set(-0.22, 0.46, 0);
  shade.rotation.z = Math.PI * 0.62;
  lampRig.add(foot, stem, lampArm, shade);
  group.add(lampRig);

  const chair = new THREE.Group();
  chair.position.set(-0.78, 0, 0.18);
  chair.rotation.y = Math.PI / 2;
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.07, 0.5), cushion);
  seat.position.set(0, 0.48, 0.04);
  const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.72, 0.055), dark);
  backrest.position.set(0, 0.92, -0.2);
  backrest.rotation.x = -0.06;
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.4, 8), dark);
  post.position.y = 0.26;
  chair.add(seat, backrest, post);
  for (let i = 0; i < 5; i++) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.025, 0.05), dark);
    leg.position.y = 0.05;
    leg.rotation.y = (i / 5) * Math.PI * 2;
    leg.translateX(0.16);
    chair.add(leg);
  }
  group.add(chair);

  const crew = new THREE.Group();
  crew.position.set(-0.78, 0, 0.18);
  crew.rotation.y = Math.PI / 2;
  crew.name = 'crew';

  const hips = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.22), pants);
  hips.position.set(0, 0.52, 0.08);
  const jacket = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.22), cloth);
  jacket.position.set(0, 0.82, 0.08);
  jacket.rotation.x = 0.1;
  const tee = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.025), shirt);
  tee.position.set(0, 0.96, 0.19);
  const placket = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, 0.02), shirt);
  placket.position.set(0, 1.04, 0.155);
  function collarFlap(side) {
    const flap = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.075, 0.016), cloth);
    flap.position.set(side * 0.04, 1.09, 0.13);
    flap.rotation.y = side * -0.5;
    flap.rotation.z = side * 0.45;
    flap.rotation.x = 0.15;
    return flap;
  }
  function shoulderCap(side) {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.16), cloth);
    cap.position.set(side * 0.2, 1.02, 0.07);
    return cap;
  }
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.062, 0.07, 6), skin);
  neck.position.set(0, 1.1, 0.08);
  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.055, 0.08), cloth);
  collar.position.set(0, 1.08, 0.06);

  const head = new THREE.Group();
  head.position.set(0, 1.26, 0.07);
  head.rotation.x = 0.06;

  const skullGeo = new THREE.IcosahedronGeometry(0.11, 1);
  {
    const pos = skullGeo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const y = v.y / 0.11;
      const x = v.x / 0.11;
      const z = v.z / 0.11;
      v.y *= 1.14;
      if (y < -0.05) {
        const t = Math.min(1, (-0.05 - y) / 0.95);
        v.x *= 1 - t * 0.38;
      }
      const nose = Math.exp(-(x * x) / 0.045) * Math.exp(-((y - 0.02) ** 2) / 0.06);
      if (z > 0) v.z += nose * 0.05;
      if (y < -0.4 && z > 0) v.z += 0.015 * (1 - Math.min(1, Math.abs(x)));
      for (const sx of [-0.36, 0.36]) {
        const socket = Math.exp(-((x - sx) ** 2) / 0.035) * Math.exp(-((y - 0.15) ** 2) / 0.04);
        if (z > 0) v.z -= socket * 0.018;
      }
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    skullGeo.computeVertexNormals();
  }
  const skull = new THREE.Mesh(skullGeo, skin);
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.128, 7, 5, 0, Math.PI * 2, 0, Math.PI * 0.42),
    hairMat,
  );
  hair.position.set(0, 0.03, -0.012);
  const bangs = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.04, 0.06), hairMat);
  bangs.position.set(0, 0.07, 0.078);
  bangs.rotation.x = 0.15;
  function sideHair(side) {
    const lock = new THREE.Mesh(new THREE.SphereGeometry(0.055, 5, 4), hairMat);
    lock.scale.set(0.55, 1.15, 0.9);
    lock.position.set(side * 0.09, 0.0, -0.01);
    return lock;
  }
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.05, 4), skin);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 0.0, 0.145);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.009, 0.012), lipMat);
  mouth.position.set(0, -0.048, 0.118);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a120e });
  const eyeWhite = new THREE.MeshBasicMaterial({ color: 0xf4f1eb });
  const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  function eye(side) {
    const socket = new THREE.Group();
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 5), eyeWhite);
    white.scale.set(1.15, 0.72, 0.4);
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.011, 5, 4), eyeMat);
    iris.scale.set(1.1, 1.25, 0.5);
    iris.position.set(0, -0.002, 0.008);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.004, 4, 4), glintMat);
    glint.position.set(-0.005, 0.005, 0.012);
    socket.add(white, iris, glint);
    socket.position.set(side * 0.04, 0.012, 0.112);
    return socket;
  }
  function ear(side) {
    const shell = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.04, 0.024), skin);
    shell.position.set(side * 0.112, -0.005, -0.01);
    return shell;
  }
  head.add(skull, hair, bangs, sideHair(-1), sideHair(1), nose, mouth, eye(-1), eye(1), ear(-1), ear(1));

  function makeHand(side) {
    const g = new THREE.Group();
    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.032, 0.055), skin);
    palm.position.set(0, 0, 0.02);
    g.add(palm);
    for (let i = 0; i < 4; i++) {
      const finger = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.018, 0.048), skin);
      finger.geometry.translate(0, 0, 0.02);
      finger.position.set((i - 1.5) * 0.02, -0.006 - i * 0.003, 0.04);
      finger.rotation.x = 0.42 + i * 0.16;
      g.add(finger);
    }
    const thumb = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.016, 0.036), skin);
    thumb.geometry.translate(0, 0, 0.016);
    thumb.position.set(side * 0.048, -0.004, 0.02);
    thumb.rotation.y = side * 0.85;
    thumb.rotation.x = 0.4;
    g.add(thumb);
    return g;
  }

  function reach(side) {
    const shoulder = new THREE.Vector3(side * 0.17, 1.02, 0.06);
    const elbow = new THREE.Vector3(side * 0.12, 0.78, 0.26);
    const wrist = new THREE.Vector3(side * 0.045, 0.855, 0.48);
    const upper = bone(shoulder, elbow, 0.09, cloth);
    const pivot = new THREE.Group();
    pivot.position.copy(elbow);
    const localWrist = wrist.clone().sub(elbow);
    const fore = bone(new THREE.Vector3(), localWrist, 0.072, cloth);
    const hand = makeHand(side);
    hand.position.copy(localWrist);
    pivot.add(fore, hand);
    return { upper, pivot };
  }
  const armNear = reach(-1);
  const armFar = reach(1);

  function makeShoe(x, z) {
    const g = new THREE.Group();
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.24), soleMat);
    sole.position.set(x, 0.016, z);
    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.088, 0.048, 0.15), shoeMat);
    upper.position.set(x, 0.048, z - 0.03);
    const toe = new THREE.Mesh(new THREE.BoxGeometry(0.084, 0.036, 0.08), shoeMat);
    toe.position.set(x, 0.04, z + 0.08);
    const heel = new THREE.Mesh(new THREE.BoxGeometry(0.084, 0.04, 0.055), shoeMat);
    heel.position.set(x, 0.046, z - 0.1);
    const strapA = new THREE.Mesh(new THREE.BoxGeometry(0.092, 0.012, 0.028), strapMat);
    strapA.position.set(x, 0.074, z - 0.06);
    const strapB = new THREE.Mesh(new THREE.BoxGeometry(0.092, 0.012, 0.028), strapMat);
    strapB.position.set(x, 0.074, z + 0.01);
    g.add(sole, upper, toe, heel, strapA, strapB);
    return g;
  }

  function leg(side) {
    const forward = side < 0 ? 0 : 0.07;
    const hip = new THREE.Vector3(side * 0.09, 0.5, 0.08);
    const knee = new THREE.Vector3(side * 0.1, 0.26, 0.34 + forward);
    const ankle = new THREE.Vector3(side * 0.1, 0.08, 0.36 + forward);
    return [bone(hip, knee, 0.125, pants), bone(knee, ankle, 0.095, pants), makeShoe(side * 0.1, 0.46 + forward)];
  }

  crew.add(
    hips, jacket, tee, placket, collarFlap(-1), collarFlap(1), shoulderCap(-1), shoulderCap(1),
    neck, collar, head,
    armNear.upper, armNear.pivot, armFar.upper, armFar.pivot,
    ...leg(-1), ...leg(1),
  );
  crew.traverse((obj) => {
    if (obj.isMesh) obj.layers.set(1);
  });
  group.add(crew);

  const lamp = new THREE.PointLight(0xffc27a, 11, 6.5, 2);
  lamp.position.set(anchor.x + 0.72, anchor.y + 1.22, anchor.z + 0.12);
  const screenLight = new THREE.PointLight(0x9fd4ff, 1.8, 2.6, 2);
  screenLight.position.set(anchor.x - 0.05, anchor.y + 0.95, anchor.z + 0.28);
  const sun = new THREE.DirectionalLight(0xfff2e2, 0.72);
  sun.position.set(anchor.x + 2.2, anchor.y + 4.2, anchor.z + 1.4);
  const hemi = new THREE.HemisphereLight(0xc5d4e8, 0x3a3328, 1.05);
  const moon = new THREE.DirectionalLight(0x9ec8ff, 1.25);
  moon.position.set(anchor.x + 0.2, anchor.y + 2.2, anchor.z - 8);

  let pulse = 0;
  return {
    group,
    character: crew,
    poses: posesFor(anchor, mobile),
    lights: [sun, hemi, moon, lamp, screenLight],
    update(time) {
      const a = Math.sin(time * 6.4);
      const b = Math.sin(time * 6.4 + Math.PI);
      armNear.pivot.rotation.x = a * 0.045;
      armFar.pivot.rotation.x = b * 0.045;
      earth.rotation.y = time * 0.03;
      pulse = Math.max(0, pulse - 0.02);
      screenMat.emissiveIntensity = 1.05 + (a > 0.92 ? 0.3 : 0) + pulse;
    },
    pulseScreen() {
      pulse = 0.8;
    },
  };
}
