import * as THREE from 'three';

function solarTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const g = canvas.getContext('2d');
  g.fillStyle = '#16345a';
  g.fillRect(0, 0, 256, 96);
  g.strokeStyle = 'rgba(186, 208, 230, 0.55)';
  g.lineWidth = 2;
  for (let x = 16; x < 256; x += 40) {
    g.beginPath();
    g.moveTo(x, 6);
    g.lineTo(x, 90);
    g.stroke();
  }
  for (let y = 16; y < 96; y += 20) {
    g.beginPath();
    g.moveTo(6, y);
    g.lineTo(250, y);
    g.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createSatellite() {
  const group = new THREE.Group();
  const craft = new THREE.Group();
  craft.rotation.y = 0.7;
  group.add(craft);
  const hull = new THREE.MeshStandardMaterial({
    color: 0x2c333c,
    metalness: 0.62,
    roughness: 0.38,
    flatShading: true,
  });
  const gold = new THREE.MeshStandardMaterial({
    color: 0xd4a84b,
    metalness: 0.78,
    roughness: 0.26,
    flatShading: true,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x14181e,
    metalness: 0.5,
    roughness: 0.45,
    flatShading: true,
  });
  const dishMat = new THREE.MeshStandardMaterial({
    color: 0xb7bec6,
    metalness: 0.35,
    roughness: 0.48,
    flatShading: true,
    side: THREE.DoubleSide,
  });
  const cells = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: solarTexture(),
    roughness: 0.55,
    metalness: 0.25,
    emissive: 0x0c2244,
    emissiveIntensity: 0.35,
  });

  const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.78, 1), hull);
  body.scale.set(1.05, 0.92, 1.22);
  craft.add(body);

  const tail = new THREE.Mesh(new THREE.IcosahedronGeometry(0.46, 1), hull);
  tail.position.z = -0.62;
  tail.scale.set(1.05, 0.95, 0.85);
  craft.add(tail);

  const band = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.11, 5, 18), gold);
  band.position.z = 0.02;
  craft.add(band);

  const nose = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 1), hull);
  nose.position.z = 0.86;
  nose.scale.set(1, 0.92, 1.15);
  craft.add(nose);

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.045, 5, 14), gold);
  collar.position.z = 0.58;
  craft.add(collar);

  const port = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.08, 7), dark);
  port.rotation.x = Math.PI / 2;
  port.position.z = 1.22;
  craft.add(port);
  const portRing = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.02, 4, 10), gold);
  portRing.position.z = 1.18;
  craft.add(portRing);

  for (let i = 0; i < 4; i++) {
    const arm = new THREE.Group();
    arm.rotation.z = Math.PI / 4 + i * (Math.PI / 2);

    const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.48, 6), dark);
    boom.rotation.z = Math.PI / 2;
    boom.position.x = 0.98;
    const joint = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 7), gold);
    joint.rotation.z = Math.PI / 2;
    joint.position.x = 1.22;

    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.62, 0.045), gold);
    frame.position.set(2.18, 0, 0);
    const cell = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.46, 0.02), cells);
    cell.position.set(2.18, 0, 0.03);

    arm.add(boom, joint, frame, cell);
    craft.add(arm);
  }

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.42, 6), dark);
  mast.position.set(0.02, 0.95, -0.08);
  craft.add(mast);

  const dish = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.16, 7, 1, true), dishMat);
  dish.position.set(0.02, 1.22, -0.08);
  dish.rotation.x = Math.PI;
  craft.add(dish);

  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), gold);
  hub.position.set(0.02, 1.34, -0.08);
  craft.add(hub);
  for (let i = 0; i < 3; i++) {
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.34, 4), gold);
    const a = (i / 3) * Math.PI * 2;
    strut.position.set(0.02 + Math.cos(a) * 0.1, 1.28, -0.08 + Math.sin(a) * 0.1);
    strut.rotation.z = Math.cos(a) * 0.55;
    strut.rotation.x = Math.sin(a) * 0.55;
    craft.add(strut);
  }

  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.08, 6), dark);
  lamp.position.set(0.28, 0.72, 0.22);
  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xff2a2a }),
  );
  beacon.position.set(0.28, 0.8, 0.22);
  craft.add(lamp, beacon);
  group.userData.beacon = beacon;

  return group;
}
