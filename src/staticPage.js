import { staticDocument } from './markup.js';

let shown = false;

export function showStaticPage(score) {
  if (shown) return;
  shown = true;
  document.documentElement.classList.remove('intro');
  document.documentElement.classList.add('reduced');
  const experience = document.getElementById('experience');
  const skip = document.getElementById('skip');
  const endcap = document.getElementById('endcap');
  const root = document.getElementById('static');
  if (experience) experience.hidden = true;
  if (skip) skip.hidden = true;
  if (endcap) endcap.hidden = true;
  root.hidden = false;
  root.innerHTML = staticDocument();
  score?.setSection('about');

  const blocks = [...root.querySelectorAll('[data-section]')];
  if (!blocks.length || !score) return;
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) score.setSection(visible.target.dataset.section);
  }, { threshold: [0.45] });
  blocks.forEach((block) => observer.observe(block));
}
