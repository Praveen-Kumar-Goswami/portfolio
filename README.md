# Praveen Kumar Goswami — cinematic portfolio

A single-page portfolio that plays as one sequence: a sky seals shut, you draw it back open, the view punches into a starfield, and the camera lands inside a satellite cabin. The cabin is the portfolio.

The copy is taken from `Praveen_Kumar_Goswami_AI_ML.pdf` (also served for download). Location is Pune. Phone, email, LinkedIn, and GitHub are not on that resume, so the site does not invent them.

## Run

```powershell
npm install
npm run dev
```

Production build:

```powershell
npm run build
npm run preview
```

Shape-matcher check (no browser):

```powershell
npm run test:shapes
```

## Sequence

1. **Sky seal** — stars are visible, a craft laps a ring, and clouds close over the glass. About five seconds, then it hands off.
2. **Draw gate** — each load picks one of circle, triangle, or rectangle. Dragging erases the cloud mask (`destination-out` on a canvas texture) and reveals the starfield. A closed stroke is matched with a lightweight template distance, not a model.
3. **Wipe** — a matched shape rushes outward and clears the sky. Star streaks ramp up with it.
4. **Transit** — the camera banks through the field, then brakes on the satellite and pushes through the hull.
5. **Cabin** — scroll is pinned with GSAP ScrollTrigger. The camera dollies between About, Skills, Projects, Education, and Contact. Mouse position eases the view on its own animation frame, separate from that timeline.
6. **Resume** — click the figure at the desk (a raycast on that mesh) or use the download link. The file is the real PDF in `public/resume/`.

**Skip intro** is on screen from the first paint and drops you in the cabin. Escape does the same.

Sound is off until you press **Sound off**. The score is generated in the browser (no music file) and shifts pitch between sections.

## Reduced motion

`prefers-reduced-motion: reduce` skips the gate, the flight, and the WebGL scene. The same resume sections render as a document with a short fade. The PDF link is still there.

## Layout

```
index.html          page shell, skip, sound, noscript fallback
src/main.js         boots the 3D path or the reduced-motion page
src/experience.js   loader, gate, flight, cabin, scroll
src/clouds.js       cloud mask and accelerating wipe
src/recognize.js    stroke matcher
src/stars.js        starfield and speed streaks
src/satellite.js    exterior hull
src/room.js         cabin, figure, camera beats
src/content.js      resume fields used by the panels
src/audio.js        muted-by-default score
public/resume/      downloadable PDF
```

The cabin and satellite are built from a few dozen primitives when the flight starts, not at first paint, so the opening stays light on a phone. Star count and pixel ratio drop on narrow screens.
