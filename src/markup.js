import { person, resumeHref, RESUME_FILE } from './content.js';

function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

function skillBlock() {
  return person.skills.map((group) => `
    <div class="skill">
      <h3>${esc(group.label)}</h3>
      <p>${esc(group.items.join(' · '))}</p>
    </div>
  `).join('');
}

function projectBlock(compact) {
  const projects = person.projects.map((project) => `
    <article class="project">
      <h3>${esc(project.title)}</h3>
      <ul>
        ${(compact ? project.bullets.slice(0, 2) : project.bullets).map((item) => `<li>${esc(item)}</li>`).join('')}
      </ul>
    </article>
  `).join('');
  const hack = person.hackathon;
  return `
    ${projects}
    <article class="project hack">
      <h3>${esc(hack.title)}</h3>
      <p class="meta">${esc(hack.meta)}</p>
      <ul>
        ${(compact ? hack.bullets.slice(0, 2) : hack.bullets).map((item) => `<li>${esc(item)}</li>`).join('')}
      </ul>
      <p class="awards">${esc(hack.awards.join(' · '))}</p>
    </article>
  `;
}

function educationBlock() {
  return person.education.map((item) => `
    <li>
      <strong>${esc(item.title)}</strong>
      <span>${esc(item.when)}</span>
    </li>
  `).join('');
}

const download = () => `<a class="btn" href="${esc(resumeHref())}" download="${esc(RESUME_FILE)}">Download resume</a>`;

export function cinematicPanels() {
  return `
    <article class="panel" id="panel-about" data-side="right">
      <p class="kicker">01 — About</p>
      <h2>${esc(person.name)}</h2>
      <p class="role">${esc(person.role)} · ${esc(person.focus)}</p>
      <p class="where">${esc(person.location)}</p>
      ${person.summary.map((line) => `<p>${esc(line)}</p>`).join('')}
      <p class="note">Click the figure at the desk to download the resume.</p>
    </article>
    <article class="panel" id="panel-skills" data-side="right">
      <p class="kicker">02 — Skills</p>
      <h2>Technical skills</h2>
      ${skillBlock()}
      <div class="chips">${person.strengths.map((item) => `<span>${esc(item)}</span>`).join('')}</div>
    </article>
    <article class="panel" id="panel-projects" data-side="left">
      <p class="kicker">03 — Projects</p>
      <h2>Selected work</h2>
      ${projectBlock(true)}
    </article>
    <article class="panel" id="panel-education" data-side="bottom">
      <p class="kicker">04 — Education</p>
      <h2>Degrees</h2>
      <ul class="degrees">${educationBlock()}</ul>
    </article>
    <article class="panel" id="panel-contact" data-side="right">
      <p class="kicker">05 — Contact</p>
      <h2>${esc(person.city)}</h2>
      <p class="where">${esc(person.location)}</p>
      ${download()}
    </article>
  `;
}

export function staticDocument() {
  return `
    <header class="static-head block" data-section="about">
      <p class="kicker">Portfolio</p>
      <h1>${esc(person.name)}</h1>
      <p class="role">${esc(person.role)} · ${esc(person.focus)}</p>
      <p class="where">${esc(person.location)}</p>
      ${download()}
    </header>
    <section class="block" id="about" data-section="about">
      <p class="kicker">About</p>
      <h2>About me</h2>
      ${person.summary.map((line) => `<p>${esc(line)}</p>`).join('')}
    </section>
    <section class="block" id="skills" data-section="skills">
      <p class="kicker">Skills</p>
      <h2>Technical skills</h2>
      ${skillBlock()}
      <div class="chips">${person.strengths.map((item) => `<span>${esc(item)}</span>`).join('')}</div>
    </section>
    <section class="block" id="projects" data-section="projects">
      <p class="kicker">Projects</p>
      <h2>Selected work</h2>
      ${projectBlock(false)}
    </section>
    <section class="block" id="education" data-section="education">
      <p class="kicker">Education</p>
      <h2>Degrees</h2>
      <ul class="degrees">${educationBlock()}</ul>
    </section>
    <section class="block" id="contact" data-section="contact">
      <p class="kicker">Contact</p>
      <h2>${esc(person.city)}</h2>
      <p class="where">${esc(person.location)}</p>
      ${download()}
    </section>
  `;
}
