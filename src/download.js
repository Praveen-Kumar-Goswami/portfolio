import { RESUME_FILE, resumeHref } from './content.js';

export function downloadResume() {
  const a = document.createElement('a');
  a.href = resumeHref();
  a.download = RESUME_FILE;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
