export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
  rating: number;
}

export const testimonials: Record<string, Testimonial[]> = {
  ru: [
    {
      id: '1',
      name: 'Александр Петров',
      role: 'CEO',
      company: 'TechStart',
      content: 'Павел создал для нас отличный сайт. Работа выполнена в срок, качество на высоте. Рекомендую!',
      avatar: '/images/avatars/avatar1.jpg',
      rating: 5
    },
    {
      id: '2',
      name: 'Мария Иванова',
      role: 'Маркетинг директор',
      company: 'Digital Agency',
      content: 'Профессиональный подход к работе. Сайт работает быстро, отличная оптимизация под поисковики.',
      avatar: '/images/avatars/avatar2.jpg',
      rating: 5
    },
    {
      id: '3',
      name: 'Дмитрий Сидоров',
      role: 'Основатель',
      company: 'E-Commerce Pro',
      content: 'Разработал сложное веб-приложение для нашего магазина. Всё работает идеально, спасибо!',
      avatar: '/images/avatars/avatar3.jpg',
      rating: 5
    }
  ],
  en: [
    {
      id: '1',
      name: 'Alexander Petrov',
      role: 'CEO',
      company: 'TechStart',
      content: 'Pavel created an excellent website for us. Work completed on time, quality is top notch. Highly recommend!',
      avatar: '/images/avatars/avatar1.jpg',
      rating: 5
    },
    {
      id: '2',
      name: 'Maria Ivanova',
      role: 'Marketing Director',
      company: 'Digital Agency',
      content: 'Professional approach to work. The site works fast, excellent SEO optimization.',
      avatar: '/images/avatars/avatar2.jpg',
      rating: 5
    },
    {
      id: '3',
      name: 'Dmitry Sidorov',
      role: 'Founder',
      company: 'E-Commerce Pro',
      content: 'Developed a complex web application for our store. Everything works perfectly, thanks!',
      avatar: '/images/avatars/avatar3.jpg',
      rating: 5
    }
  ],
  de: [
    {
      id: '1',
      name: 'Alexander Petrov',
      role: 'CEO',
      company: 'TechStart',
      content: 'Pavel hat eine ausgezeichnete Website für uns erstellt. Arbeit pünktlich fertiggestellt, Qualität erstklassig. Sehr empfehlenswert!',
      avatar: '/images/avatars/avatar1.jpg',
      rating: 5
    },
    {
      id: '2',
      name: 'Maria Ivanova',
      role: 'Marketing Director',
      company: 'Digital Agency',
      content: 'Professioneller Arbeitsansatz. Die Website funktioniert schnell, ausgezeichnete SEO-Optimierung.',
      avatar: '/images/avatars/avatar2.jpg',
      rating: 5
    },
    {
      id: '3',
      name: 'Dmitry Sidorov',
      role: 'Gründer',
      company: 'E-Commerce Pro',
      content: 'Habe eine komplexe Webanwendung für unseren Shop entwickelt. Alles funktioniert perfekt, danke!',
      avatar: '/images/avatars/avatar3.jpg',
      rating: 5
    }
  ]
};