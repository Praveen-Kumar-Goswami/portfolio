import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createStars } from './stars.js';
import { createClouds } from './clouds.js';
import { createSatellite } from './satellite.js';
import { createRoom } from './room.js';
import { cinematicPanels } from './markup.js';
import { cabinBeats, person } from './content.js';
import { matchShape, SHAPE_LABEL } from './recognize.js';
import { downloadResume } from './download.js';
import { showStaticPage } from './staticPage.js';

gsap.registerPlugin(ScrollTrigger);

const ANCHOR = new THREE.Vector3(0, 0, -100);
const SHAPES = ['circle', 'triangle', 'rectangle'];
const BEATS = cabinBeats.map((beat) => beat.id);
const ICONS = {
  circle: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="14"/></svg>',
  triangle: '<svg viewBox="0 0 48 48" aria-hidden="true"><polygon points="24,8 40,38 8,38"/></svg>',
  rectangle: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="10" y="14" width="28" height="20"/></svg>',
};

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
}

function statusFor(result, target) {
  const name = SHAPE_LABEL[target];
  if (result.reason === 'small') return 'Draw it larger. One full stroke.';
  if (result.reason === 'flat') return 'Give the shape more body.';
  if (result.reason === 'open') return 'Close the stroke.';
  if (result.best && result.best !== target && result.scores?.[result.best] < 0.2) {
    return `That reads as a ${SHAPE_LABEL[result.best]}. Draw a ${name}.`;
  }
  return `Not a ${name} yet. One closed stroke.`;
}

export function bootExperience(score) {
  const targetShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const mobile = window.matchMedia('(max-width: 760px)').matches;
  const baseFov = mobile ? 58 : 50;
  const roomFov = mobile ? 52 : 46;

  const stage = document.getElementById('stage');
  const canvas = document.getElementById('webgl');
  const loaderHud = document.getElementById('loader-hud');
  const gateHud = document.getElementById('gate-hud');
  const transit = document.getElementById('transit');
  const arrival = document.getElementById('arrival');
  const arrivalLine = document.getElementById('arrival-line');
  const airlock = document.getElementById('airlock');
  const shapeLabel = document.getElementById('shape-label');
  const shapeIcon = document.getElementById('shape-icon');
  const shapeStatus = document.getElementById('shape-status');
  const loaderLine = document.getElementById('loader-line');
  const panels = document.getElementById('panels');
  const skipBtn = document.getElementById('skip');
  panels.innerHTML = cinematicPanels();
  gsap.set('.panel-body', { autoAlpha: 0, y: 6 });
  document.getElementById('beats').innerHTML = cabinBeats
    .map((beat) => `<button type="button" data-beat="${beat.id}">${beat.nav}</button>`)
    .join('');

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !mobile,
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
    });
  } catch (error) {
    showStaticPage(score);
    return;
  }
  if (!renderer.getContext()) {
    showStaticPage(score);
    return;
  }

  renderer.setClearColor(0x05070c, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.autoClear = false;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.25);
  renderer.setPixelRatio(pixelRatio);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(baseFov, 1, 0.08, 420);
  camera.layers.enable(1);

  const stars = createStars({
    farCount: mobile ? 700 : 2200,
    nearCount: mobile ? 260 : 900,
    pixelRatio,
  });
  scene.add(stars.group);
  const clouds = createClouds();

  const pose = { x: 0, y: 0.45, z: 26, lx: 0, ly: 0.2, lz: -30 };
  const view = { x: pose.x, y: pose.y, z: pose.z, lx: pose.lx, ly: pose.ly, lz: pose.lz };
  const pointer = { x: 0, y: 0 };
  const smooth = { x: 0, y: 0 };
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const ahead = new THREE.Vector3();
  const look = new THREE.Vector3();
  const satLook = new THREE.Vector3(ANCHOR.x, ANCHOR.y + 0.2, ANCHOR.z + 1.35);
  const camPrev = new THREE.Vector3();

  let mode = 'loading';
  let showClouds = true;
  let alive = true;
  let sectionsOn = false;
  let world = null;
  let curve = null;
  let flightT = 0;
  let boardT = 0;
  let boardPhase = 'push';
  let arrivalStep = 0;
  const boardFrom = new THREE.Vector3();
  const boardTo = new THREE.Vector3();
  let manualBoost = 0;
  let clock = 0;
  let last = performance.now();
  let rafId = 0;
  let loaderTl = null;
  let scrollTl = null;
  let fails = 0;
  let drawing = false;
  let activePointer = null;
  let lastErase = null;
  let stroke = [];
  let downAt = null;

  function resize() {
    const w = stage.clientWidth || window.innerWidth;
    const h = stage.clientHeight || window.innerHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.6));
    renderer.setSize(w, h, false);
    stars.setPixelRatio(renderer.getPixelRatio());
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function setPose(next) {
    pose.x = next.x;
    pose.y = next.y;
    pose.z = next.z;
    pose.lx = next.lx;
    pose.ly = next.ly;
    pose.lz = next.lz;
  }

  function applyGateCamera() {
    camera.position.set(0, 0.45, 26);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0.15, -40);
  }

  function snapView() {
    view.x = pose.x;
    view.y = pose.y;
    view.z = pose.z;
    view.lx = pose.lx;
    view.ly = pose.ly;
    view.lz = pose.lz;
  }

  function applyRoomCamera(dt) {
    const k = 1 - Math.exp(-3.6 * dt);
    smooth.x += (pointer.x - smooth.x) * k;
    smooth.y += (pointer.y - smooth.y) * k;
    view.x = pose.x;
    view.y = pose.y;
    view.z = pose.z;
    view.lx = pose.lx;
    view.ly = pose.ly;
    view.lz = pose.lz;
    camera.position.set(
      view.x + smooth.x * 0.14,
      view.y + smooth.y * 0.07,
      view.z,
    );
    camera.up.set(0, 1, 0);
    camera.lookAt(
      view.lx + smooth.x * 0.46,
      view.ly + smooth.y * 0.24,
      view.lz,
    );
  }

  function ensureWorld() {
    if (world) return world;
    world = {
      sat: createSatellite(),
      room: createRoom(ANCHOR, mobile),
    };
    world.sat.position.copy(ANCHOR);
    scene.add(world.sat);
    scene.add(world.room.group);
    world.room.group.visible = false;
    for (const light of world.room.lights) scene.add(light);
    renderer.compile(scene, camera);
    return world;
  }

  function showTransit(text) {
    transit.hidden = false;
    transit.textContent = text;
  }

  function setBeat(name) {
    document.querySelectorAll('#beats button').forEach((btn) => {
      const on = btn.dataset.beat === name;
      btn.classList.toggle('is-on', on);
      if (on) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    });
  }

  let lastBeat = '';
  let keyGate = false;

  function noteBeat(id, instant) {
    setBeat(id);
    score.setSection(id);
    world?.room?.setScreen(id);
    const body = document.querySelector(`#panel-${id} .panel-body`);
    if (id !== lastBeat) {
      if (lastBeat) gsap.set(`#panel-${lastBeat} .panel-body`, { autoAlpha: 0, y: 6 });
      lastBeat = id;
      if (body && !instant) {
        gsap.fromTo(body, { autoAlpha: 0, y: 6 }, {
          autoAlpha: 1, y: 0, duration: 0.5, delay: 0.32, ease: 'power2.out', overwrite: true,
        });
      }
    }
    if (instant && body) {
      gsap.killTweensOf(body);
      gsap.set(body, { autoAlpha: 1, y: 0 });
    }
  }

  function clearArrival() {
    gsap.killTweensOf([arrival, arrivalLine]);
    gsap.set(arrival, { autoAlpha: 0 });
    arrival.setAttribute('aria-hidden', 'true');
  }

  let ride = 0;
  let beatIndex = 0;
  let beatProgress = 0;
  let rideHold = false;

  function beatScrollY(time) {
    const st = scrollTl.scrollTrigger;
    return st.start + (time / scrollTl.duration()) * (st.end - st.start);
  }

  function placeRide() {
    if (!scrollTl) return;
    const from = beatScrollY(scrollTl.labels[BEATS[beatIndex]]);
    const dir = Math.sign(beatProgress);
    let y = from;
    if (dir) {
      const neighbor = Math.min(BEATS.length - 1, Math.max(0, beatIndex + dir));
      const to = beatScrollY(scrollTl.labels[BEATS[neighbor]]);
      y = from + (to - from) * Math.abs(beatProgress);
    }
    if (Math.abs(window.scrollY - y) < 0.5) return;
    rideHold = true;
    window.scrollTo(0, y);
  }

  function sectionSpan() {
    if (!scrollTl || BEATS.length < 2) return window.innerHeight;
    return Math.abs(
      beatScrollY(scrollTl.labels[BEATS[1]]) - beatScrollY(scrollTl.labels[BEATS[0]]),
    ) || window.innerHeight;
  }

  function syncRide() {
    const max = BEATS.length - 1;
    ride = Math.min(max, Math.max(0, ride));
    beatIndex = Math.min(max, Math.floor(ride + 1e-4));
    beatProgress = beatIndex >= max ? 0 : ride - beatIndex;
  }

  function pushRide(delta) {
    if (!scrollTl || !delta) return;
    const span = sectionSpan();
    const step = Math.max(-span, Math.min(span, delta * 0.084));
    ride += step / span;
    syncRide();
    placeRide();
  }

  function enableSections(instant) {
    if (sectionsOn) return;
    sectionsOn = true;
    document.documentElement.classList.remove('intro');
    document.documentElement.classList.add('room');
    skipBtn.hidden = true;
    document.getElementById('beats').hidden = false;
    document.getElementById('resume-hint').hidden = false;
    transit.hidden = true;
    gateHud.hidden = true;
    loaderHud.hidden = true;
    gsap.set('#panel-about', { autoAlpha: 1 });
    window.scrollTo(0, 0);
    const poses = world.room.poses;
    scrollTl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '#stage',
        start: 'top top',
        end: `+=${(BEATS.length - 1) * 62}%`,
        pin: true,
        scrub: true,
        onUpdate: (self) => {
          const time = self.progress * scrollTl.duration();
          let current = 'about';
          for (const id of BEATS) {
            if ((scrollTl.labels[id] ?? 0) <= time + 0.001) current = id;
          }
          noteBeat(current, false);
        },
      },
    });
    BEATS.forEach((id, index) => {
      if (index === 0) {
        scrollTl.addLabel('about', 0);
        scrollTl.set('#panel-about', { autoAlpha: 1 }, 0);
        return;
      }
      const prev = BEATS[index - 1];
      scrollTl.to(pose, { ...poses[id], duration: 1, ease: 'none' }, index - 1);
      scrollTl.to(`#panel-${prev}`, { autoAlpha: 0, duration: 0.22, ease: 'power1.inOut' }, index - 0.28);
      scrollTl.to(`#panel-${id}`, { autoAlpha: 1, duration: 0.28, ease: 'power1.inOut' }, index - 0.22);
      scrollTl.addLabel(id, index);
    });
    const last = BEATS.length - 1;
    scrollTl.to(`#panel-${BEATS[last]}`, { autoAlpha: 1, duration: 0.55 }, last);
    ScrollTrigger.refresh();
    noteBeat('about', !!instant);
  }

  function enterNow() {
    showClouds = false;
    ensureWorld();
    world.sat.visible = false;
    world.room.group.visible = true;
    setPose(world.room.poses.about);
    snapView();
    stars.group.visible = false;
    smooth.x = 0;
    smooth.y = 0;
    camera.up.set(0, 1, 0);
    camera.fov = roomFov;
    camera.updateProjectionMatrix();
    airlock.style.opacity = '0';
    clearArrival();
    mode = 'room';
    enableSections(true);
  }

  function skipIntro() {
    if (sectionsOn) return;
    alive = false;
    loaderTl?.kill();
    clouds.cancel();
    enterNow();
  }

  function beginGate() {
    if (!alive || mode !== 'loading') return;
    clouds.seal(1);
    mode = 'gate';
    loaderHud.hidden = true;
    gateHud.hidden = false;
    shapeLabel.textContent = `Draw a ${SHAPE_LABEL[targetShape]}`;
    shapeIcon.innerHTML = ICONS[targetShape];
    shapeStatus.textContent = '';
  }

  function startFlight() {
    if (mode !== 'wipe') return;
    ensureWorld();
    showClouds = false;
    gateHud.hidden = true;
    showTransit('Transit');
    score.setSection('flight');
    gsap.to(stars.group.rotation, { x: 0, y: 0, z: 0, duration: 0.55, ease: 'power2.out' });
    curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.45, 26),
      new THREE.Vector3(12, 5.5, 14),
      new THREE.Vector3(18, -2.2, 0),
      new THREE.Vector3(2, 6.8, -14),
      new THREE.Vector3(-14, 1.4, -28),
      new THREE.Vector3(-8, -3.6, -46),
      new THREE.Vector3(11, 3.2, -60),
      new THREE.Vector3(5, 0.8, -76),
      new THREE.Vector3(-0.6, 0.7, -88),
      new THREE.Vector3(0.1, 0.4, -90),
    ], false, 'centripetal', 0.4);
    flightT = 0;
    mode = 'flight';
  }

  function startBoarding() {
    if (mode !== 'flight') return;
    mode = 'board';
    boardT = 0;
    boardPhase = 'push';
    arrivalStep = 0;
    boardFrom.copy(camera.position);
    camera.up.set(0, 1, 0);
    camera.lookAt(satLook);
    gsap.to(world.sat.rotation, { x: 0, y: 0, z: 0, duration: 0.45, ease: 'power2.out' });
    showTransit('Airlock');
    score.whoosh();
  }

  function updateFlight(dt) {
    flightT += dt;
    const t = Math.min(1, flightT / 8.4);
    const p = easeInOut(t);
    camera.position.copy(curve.getPointAt(p));
    const env = Math.sin(p * Math.PI);
    const roll = env * Math.sin(p * Math.PI * 2.15) * 0.58;
    camera.up.set(Math.sin(roll), Math.cos(roll), 0);
    ahead.copy(curve.getPointAt(Math.min(1, p + 0.02)));
    if (p > 0.84) {
      look.copy(ahead).lerp(satLook, (p - 0.84) / 0.16);
      camera.lookAt(look);
    } else {
      camera.lookAt(ahead);
    }
    if (t >= 1) startBoarding();
  }

  function updateBoard(dt) {
    boardT += dt;
    const fovBlend = 1 - Math.exp(-dt * 1.6);
    camera.fov += (roomFov - camera.fov) * fovBlend;
    camera.updateProjectionMatrix();

    if (boardPhase === 'push') {
      const hold = 0.85;
      if (boardT < hold) {
        camera.position.copy(boardFrom);
        camera.up.set(0, 1, 0);
        camera.lookAt(satLook);
        airlock.style.opacity = '0';
        return;
      }
      const u = Math.min(1, (boardT - hold) / 1.35);
      const e = u * u;
      boardTo.set(ANCHOR.x, ANCHOR.y + 0.2, ANCHOR.z + 1.05);
      camera.position.lerpVectors(boardFrom, boardTo, e);
      camera.up.set(0, 1, 0);
      camera.lookAt(satLook);
      const flashIn = Math.min(1, Math.max(0, (boardT - hold - 1.02) / 0.28));
      airlock.style.opacity = String(flashIn);
      if (boardT >= hold + 1.32) {
        world.sat.visible = false;
        world.room.group.visible = true;
        stars.group.visible = false;
        setPose(world.room.poses.door);
        boardPhase = 'settle';
        boardT = 0;
        score.setSection('about');
      }
      return;
    }

    const u = Math.min(1, boardT / 2.15);
    const e = 1 - (1 - u) ** 3;
    const from = world.room.poses.door;
    const to = world.room.poses.about;
    pose.x = from.x + (to.x - from.x) * e;
    pose.y = from.y + (to.y - from.y) * e;
    pose.z = from.z + (to.z - from.z) * e;
    pose.lx = from.lx + (to.lx - from.lx) * e;
    pose.ly = from.ly + (to.ly - from.ly) * e;
    pose.lz = from.lz + (to.lz - from.lz) * e;
    applyRoomCamera(dt);
    airlock.style.opacity = String(1 - Math.min(1, boardT / 1.05));
    if (boardT > 1.2 && arrivalStep === 0) {
      arrivalStep = 1;
      transit.hidden = true;
      arrivalLine.textContent = person.name;
      arrival.setAttribute('aria-hidden', 'false');
      gsap.fromTo(arrival, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.55, overwrite: true });
    }
    if (boardT > 2.6 && arrivalStep === 1) {
      arrivalStep = 2;
      gsap.to(arrivalLine, {
        autoAlpha: 0,
        duration: 0.28,
        onComplete: () => {
          arrivalLine.textContent = person.city;
          gsap.to(arrivalLine, { autoAlpha: 1, duration: 0.4 });
        },
      });
    }
    if (boardT > 3.85 && arrivalStep === 2) {
      arrivalStep = 3;
      gsap.to(arrival, {
        autoAlpha: 0,
        duration: 0.4,
        onComplete: () => arrival.setAttribute('aria-hidden', 'true'),
      });
      gsap.to('#panel-about', { autoAlpha: 1, duration: 0.7, ease: 'power2.out' });
    }
    if (boardT > 4.2 && arrivalStep === 3) {
      arrivalStep = 4;
      mode = 'room';
      setPose(to);
      airlock.style.opacity = '0';
      enableSections(false);
    }
  }

  function extendStroke(event) {
    const rect = canvas.getBoundingClientRect();
    const point = clouds.toLocal(event.clientX, event.clientY, rect);
    const radius = (window.matchMedia('(pointer: coarse)').matches ? 48 : 32) * (clouds.width / rect.width);
    if (!lastErase) clouds.erase(point.x, point.y, radius);
    else {
      const distance = Math.hypot(point.x - lastErase.x, point.y - lastErase.y);
      const steps = Math.max(1, Math.ceil(distance / (radius * 0.34)));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        clouds.erase(
          lastErase.x + (point.x - lastErase.x) * t,
          lastErase.y + (point.y - lastErase.y) * t,
          radius,
        );
      }
    }
    lastErase = point;
    const prev = stroke[stroke.length - 1];
    if (!prev || Math.hypot(event.clientX - prev.x, event.clientY - prev.y) > 2) {
      stroke.push({ x: event.clientX, y: event.clientY });
    }
  }

  function onPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) return;
    if (mode === 'room') {
      downAt = { x: event.clientX, y: event.clientY };
      return;
    }
    if (mode !== 'gate') return;
    if (event.target.closest('button, a, nav, .panel')) return;
    if (drawing) return;
    drawing = true;
    activePointer = event.pointerId;
    lastErase = null;
    stroke = [];
    extendStroke(event);
  }

  function onPointerMove(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    if (drawing && event.pointerId === activePointer) extendStroke(event);
    if (mode === 'room' && world) {
      if (event.target.closest('button, a, nav, .panel')) {
        canvas.style.cursor = '';
        return;
      }
      ndc.copy(pointer);
      raycaster.setFromCamera(ndc, camera);
      raycaster.layers.set(1);
      const hit = raycaster.intersectObject(world.room.character, true);
      canvas.style.cursor = hit.length ? 'pointer' : '';
    }
  }

  function onPointerUp(event) {
    if (mode === 'room' && downAt && world) {
      const moved = Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y);
      downAt = null;
      if (moved < 8 && !event.target.closest('button, a, nav, .panel')) {
        ndc.set(pointer.x, pointer.y);
        raycaster.setFromCamera(ndc, camera);
        raycaster.layers.set(1);
        const hit = raycaster.intersectObject(world.room.character, true);
        if (hit.length) {
          downloadResume();
          world.room.pulseScreen();
        }
      }
    }
    if (!drawing || event.pointerId !== activePointer) return;
    drawing = false;
    activePointer = null;
    const drawn = stroke.slice();
    stroke = [];
    lastErase = null;
    const result = matchShape(drawn, targetShape);
    if (!result.ok) {
      fails += 1;
      const extra = fails >= 3 ? ' Skip intro is up top if you want the cabin.' : '';
      shapeStatus.textContent = `${statusFor(result, targetShape)}${extra}`;
      return;
    }
    mode = 'wipe';
    shapeStatus.textContent = 'Opening.';
    showTransit('Sky opening');
    score.whoosh();
    let x = 0;
    let y = 0;
    for (const point of drawn) {
      x += point.x;
      y += point.y;
    }
    x /= drawn.length;
    y /= drawn.length;
    const local = clouds.toLocal(x, y, canvas.getBoundingClientRect());
    clouds.wipe(local.x, local.y, {
      onProgress: (eased) => {
        manualBoost = Math.max(manualBoost, eased * 1.15);
      },
      onDone: () => {
        if (alive && mode === 'wipe') startFlight();
      },
    });
  }

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    if (document.hidden) return;
    clock += dt;
    camPrev.copy(camera.position);

    if (mode === 'flight') updateFlight(dt);
    else if (mode === 'board') updateBoard(dt);
    else if (mode === 'room') applyRoomCamera(dt);
    else applyGateCamera();

    const speed = camPrev.distanceTo(camera.position) / Math.max(dt, 0.001);
    manualBoost *= Math.exp(-2.4 * dt);
    const uSpeed = Math.max(Math.min(1.45, speed / 24), manualBoost);
    stars.setSpeed(uSpeed);

    if (mode === 'loading' || mode === 'gate' || mode === 'wipe') {
      const follow = 1 - Math.exp(-2.1 * dt);
      stars.group.rotation.y += (pointer.x * 0.08 - stars.group.rotation.y) * follow;
      stars.group.rotation.x += (pointer.y * -0.04 - stars.group.rotation.x) * follow;
    }

    if (mode === 'flight' || mode === 'wipe') {
      const target = baseFov + uSpeed * 15;
      camera.fov += (target - camera.fov) * (1 - Math.exp(-3 * dt));
      camera.updateProjectionMatrix();
    }

    if (world?.room?.group.visible) {
      world.room.update(clock);
      if (mode === 'room') {
        const strike = Math.sin(clock * 6.4);
        if (strike > 0.96 && !keyGate) {
          score.key();
          keyGate = true;
        }
        if (strike < 0.2) keyGate = false;
      }
    }
    if (world?.sat?.visible) {
      const beacon = world.sat.userData.beacon;
      if (beacon) beacon.material.color.setRGB(1, 0.28 + Math.sin(clock * 4.6) * 0.22, 0.12);
      if (mode === 'flight') world.sat.rotation.y = Math.sin(clock * 0.32) * 0.2;
    }
    clouds.setTime(clock);

    renderer.setRenderTarget(null);
    renderer.clear(true, true, true);
    renderer.render(scene, camera);
    if (showClouds) {
      renderer.clearDepth();
      renderer.render(clouds.scene, clouds.camera);
    }
  }

  resize();
  window.addEventListener('resize', () => {
    resize();
    scrollTl?.scrollTrigger?.refresh();
  });
  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
  stage.addEventListener('contextmenu', (event) => {
    if (mode === 'gate' || mode === 'wipe') event.preventDefault();
  });
  let touchY = null;
  window.addEventListener('touchstart', (event) => {
    if (!sectionsOn) return;
    touchY = event.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchmove', (event) => {
    if (mode === 'gate' || mode === 'wipe') {
      event.preventDefault();
      return;
    }
    if (!sectionsOn || touchY == null) return;
    const y = event.touches[0].clientY;
    const delta = touchY - y;
    touchY = y;
    event.preventDefault();
    pushRide(delta);
  }, { passive: false });
  window.addEventListener('touchend', () => {
    touchY = null;
  });
  window.addEventListener('wheel', (event) => {
    if (!sectionsOn || mode !== 'room') return;
    let delta = event.deltaY;
    if (event.deltaMode === 1) delta *= 16;
    else if (event.deltaMode === 2) delta *= window.innerHeight;
    event.preventDefault();
    pushRide(delta);
  }, { passive: false });
  window.addEventListener('scroll', () => {
    if (!sectionsOn || rideHold) {
      rideHold = false;
      return;
    }
    placeRide();
  }, { passive: true });
  skipBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    skipIntro();
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') skipIntro();
    if (!sectionsOn || mode !== 'room') return;
    const down = event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ';
    const up = event.key === 'ArrowUp' || event.key === 'PageUp';
    if (!down && !up) return;
    event.preventDefault();
    const step = (event.key === 'PageDown' || event.key === 'PageUp' || event.key === ' ')
      ? window.innerHeight * 0.42
      : window.innerHeight * 0.14;
    pushRide((down ? 1 : -1) * step);
  });
  document.getElementById('beats').addEventListener('click', (event) => {
    const btn = event.target.closest('[data-beat]');
    if (!btn || !scrollTl) return;
    const next = BEATS.indexOf(btn.dataset.beat);
    if (next < 0) return;
    ride = next;
    syncRide();
    placeRide();
  });

  gsap.set('#craft', { xPercent: -50, yPercent: -50 });
  const orbit = { a: -Math.PI / 2 };
  const seal = { t: 0 };
  loaderTl = gsap.timeline({ defaults: { ease: 'power1.inOut' } });
  loaderTl.fromTo('#ring-circle', { strokeDashoffset: 340 }, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut' }, 0.15);
  loaderTl.to(orbit, {
    a: Math.PI * 1.5,
    duration: 2.7,
    ease: 'power1.inOut',
    onUpdate: () => {
      gsap.set('#craft', { x: Math.cos(orbit.a) * 54, y: Math.sin(orbit.a) * 54 });
    },
  }, 0.35);
  loaderTl.to(seal, {
    t: 1,
    duration: 3.35,
    ease: 'power1.in',
    onUpdate: () => clouds.seal(seal.t),
  }, 0.7);
  loaderTl.call(() => {
    loaderLine.textContent = 'The cabin waits underneath.';
  }, null, 2.35);
  loaderTl.to('#loader-hud', { autoAlpha: 0, duration: 0.4 }, 4.25);
  loaderTl.add(() => beginGate(), 4.55);

  rafId = requestAnimationFrame(frame);
}
