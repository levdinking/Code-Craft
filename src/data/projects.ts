export interface Project {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'websites' | 'apps' | 'landing';
  image: string;
  technologies: string[];
}

export const projects: Project[] = [
  {
    id: 'fithilf',
    title: 'FitHilf',
    description: 'Fitness and health platform with personal training programs',
    url: 'https://fithilf.ru/',
    category: 'websites',
    image: '/images/projects/fithilf.png',
    technologies: ['React', 'Node.js', 'MongoDB']
  },
  {
    id: 'peristeen',
    title: 'Peristeen Plus System',
    description: 'Medical product website for Coloplast',
    url: 'https://peristeenplussystem.delimes.ru/',
    category: 'landing',
    image: '/images/projects/peristeen.png',
    technologies: ['HTML5', 'CSS3', 'JavaScript']
  },
  {
    id: 'delimes',
    title: 'Delimes',
    description: 'Corporate website for digital agency',
    url: 'https://delimes.ru/',
    category: 'websites',
    image: '/images/projects/delimes.png',
    technologies: ['Next.js', 'TypeScript', 'Tailwind']
  },
  {
    id: 'mpinnovativ',
    title: 'MP Innovativ Bau',
    description: 'Construction company website in Germany',
    url: 'https://mp-innovativbau.de/de/',
    category: 'websites',
    image: '/images/projects/mpinnovativ.png',
    technologies: ['WordPress', 'PHP', 'MySQL']
  },
  {
    id: 'manipulator',
    title: 'Anapa Manipulator',
    description: 'Service website for crane rental',
    url: 'https://anapa-manipulyator.ru/',
    category: 'landing',
    image: '/images/projects/manipulator.png',
    technologies: ['HTML5', 'CSS3', 'jQuery']
  },
  {
    id: 'domusman',
    title: 'Domusman',
    description: 'Real estate and property management platform',
    url: 'https://domusman.ru/',
    category: 'websites',
    image: '/images/projects/domusman.png',
    technologies: ['React', 'Django', 'PostgreSQL']
  },
  {
    id: 'socialhub',
    title: 'Social Hub',
    description: 'Social media management platform',
    url: 'https://socialhub.delimes.ru/',
    category: 'apps',
    image: '/images/projects/socialhub.png',
    technologies: ['Vue.js', 'Laravel', 'MySQL']
  }
];

export const getProjectsByCategory = (category: string) => {
  if (category === 'all') return projects;
  return projects.filter(project => project.category === category);
};