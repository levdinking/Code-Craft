import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { ExternalLink, FolderGit2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { projects } from '@/data/projects';

export function Portfolio() {
  const { t, i18n } = useTranslation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Получаем текущий язык для мультиязычных ссылок
  const lang = i18n.language as 'de' | 'en' | 'ru';

  // Show only first 6 projects on homepage
  const featuredProjects = projects.slice(0, 6);

  return (
    <section id="portfolio" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16"
          >
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <FolderGit2 className="w-4 h-4" />
                {t('portfolio.title')}
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                {t('portfolio.subtitle')}
              </h2>
            </div>
            {/* ← ИСПРАВЛЕНО: добавлен язык к пути */}
            <Link to={`/${lang}/portfolio`}>
              <Button variant="outline" className="group">
                {t('portfolio.viewAll')}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative"
              >
                <div className="relative overflow-hidden rounded-2xl bg-muted border border-border/50 hover:border-primary/30 transition-all duration-300">
                  {/* Image Container */}
                  <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                    {project.image ? (
                      <img 
                        src={project.image} 
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          // Если картинка не загрузилась — показываем placeholder
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const placeholder = target.nextElementSibling as HTMLElement;
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    {/* Placeholder (показывается если нет image или при ошибке загрузки) */}
                    <div 
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ display: project.image ? 'none' : 'flex' }}
                    >
                      <div className="text-center p-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                          <FolderGit2 className="w-8 h-8 text-primary/60" />
                        </div>
                        <p className="text-sm text-muted-foreground">{project.title}</p>
                      </div>
                    </div>
                    
                    {/* Overlay on Hover */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-primary/90 flex items-center justify-center"
                    >
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-white font-medium"
                      >
                        <ExternalLink className="w-5 h-5" />
                        {t('portfolio.viewProject')}
                      </a>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t(`portfolio.projects.${project.id}.description`)}
                    </p>
                    
                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 3).map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}