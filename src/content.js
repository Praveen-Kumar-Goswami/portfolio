/** Structured from Praveen_Kumar_Goswami_AI_ML.pdf. Contact lines on the PDF are bracket placeholders. */

export const RESUME_FILE = 'Praveen_Kumar_Goswami_AI_ML.pdf';

export const cabinBeats = [
  { id: 'about', nav: 'About' },
  { id: 'skills', nav: 'Skills' },
  { id: 'study', nav: 'Study' },
  { id: 'career', nav: 'Career' },
  { id: 'vision', nav: 'Vision' },
  { id: 'health', nav: 'Health' },
  { id: 'hackathon', nav: 'Hackathon' },
  { id: 'education', nav: 'Education' },
  { id: 'contact', nav: 'Contact' },
];

export function resumeHref() {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}resume/${RESUME_FILE}`;
}

export const person = {
  name: 'Praveen Kumar Goswami',
  role: 'Software Engineer',
  focus: 'AI/ML Engineer',
  city: 'Pune',
  location: 'Pune, India',
  summary: [
    'Software Engineer and AI/ML enthusiast with a strong foundation in Python, machine learning, software development, data structures, and full-stack application development.',
    'Experienced in building AI-powered applications integrating machine learning models, APIs, databases, computer vision, speech technologies, and web/mobile interfaces.',
    'Passionate about practical AI, healthcare technology, research, and innovation.',
  ],
  skills: [
    { label: 'Programming', items: ['Python', 'JavaScript', 'Kotlin', 'HTML', 'CSS'] },
    { label: 'AI / Machine Learning', items: ['Machine Learning', 'AI Model Development', 'Computer Vision', 'AI-powered Applications'] },
    { label: 'Software Engineering', items: ['Data Structures & Algorithms', 'REST APIs', 'Application Development', 'Full-Stack Development'] },
    { label: 'Web', items: ['Flask', 'HTML', 'CSS', 'JavaScript'] },
    { label: 'Mobile', items: ['Android / Kotlin', 'Mobile Application Development'] },
    { label: 'Databases', items: ['MySQL', 'MongoDB', 'Firebase'] },
    { label: 'Cloud', items: ['AWS', 'Azure', 'Cloud Services'] },
    { label: 'Other', items: ['Git/GitHub', 'API Integration', 'Problem Solving'] },
  ],
  strengths: [
    'Python & AI/ML Development',
    'Software Engineering',
    'Machine Learning Applications',
    'Problem Solving & DSA',
    'Full-Stack Application Development',
    'Computer Vision',
    'API & Database Integration',
    'AWS, Azure & Cloud Services',
    'Healthcare Technology',
    'Rapid Prototyping',
    'Research & Innovation',
  ],
  projects: [
    {
      id: 'study',
      title: 'AI-Powered Study Companion',
      bullets: [
        'Developed an AI-powered study assistant integrating conversational AI with a web-based interface.',
        'Implemented Python components for AI input/output, speech recognition, text-to-speech, and camera-based interaction.',
        'Integrated Flask with HTML, CSS, and JavaScript to create an interactive application.',
        'Explored computer-vision-based interaction including facial detection, blinking, and smiling detection.',
      ],
    },
    {
      id: 'career',
      title: 'Career Path Predictor with Industry Alignment',
      bullets: [
        'Developed an AI-powered career guidance platform designed to analyse academic performance, personal interests, and industry requirements.',
        'Built a Flask-based application with authentication, AI chat functionality, personalised recommendations, and career-professional meeting scheduling.',
        'Integrated Firebase and API-based services to support application functionality.',
        'Designed the system around AI-assisted career recommendations and industry-aligned upskilling pathways.',
      ],
    },
    {
      id: 'vision',
      title: 'Device Control Through Eye Movement',
      bullets: [
        'Developed a computer-vision-based assistive technology concept for controlling devices through eye movement.',
        'Explored camera-based detection and human-computer interaction techniques.',
        'Focused on accessibility and hands-free device control for users with mobility limitations.',
      ],
    },
    {
      id: 'health',
      title: 'Healthcare Mobile App',
      bullets: [
        'Developed a healthcare-focused mobile application concept using modern application-development technologies.',
        'Designed the application around accessible healthcare interaction and digital health services.',
        'Worked with mobile development, APIs, databases, and user-facing application functionality.',
      ],
    },
  ],
  hackathon: {
    id: 'hackathon',
    title: 'TECH4LIFE 2026',
    meta: 'Medical Devices Hackathon · Team CODE MARROW',
    bullets: [
      'Participated in a healthcare innovation hackathon focused on medical devices, diagnostics, patient access, health data, assistive technology, and public health.',
      'Worked on technology-driven healthcare solutions combining software, AI/ML, embedded systems, and assistive technology.',
      'Explored smart wound monitoring and connected medical-device concepts.',
    ],
    awards: ['Best Innovation', 'Best Presentation'],
  },
  education: [
    { title: 'Bachelor of Computer Applications (BCA)', when: '2023–2026' },
    { title: 'Master of Computer Applications (MCA)', when: '2026–2028 · Pursuing' },
  ],
};
