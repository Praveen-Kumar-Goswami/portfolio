import './style.css';
import { createScore } from './audio.js';
import { showStaticPage } from './staticPage.js';

const score = createScore();
const soundBtn = document.getElementById('sound');

soundBtn.addEventListener('click', async () => {
  const on = await score.toggle();
  soundBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  soundBtn.textContent = on ? 'Sound on' : 'Sound off';
});

if (document.documentElement.classList.contains('reduced')) {
  showStaticPage(score);
} else {
  import('./experience.js')
    .then((mod) => mod.bootExperience(score))
    .catch(() => showStaticPage(score));
}
