import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ExternalLink, FolderGit2, Globe, AppWindow, Layout } from 'lucide-react';
import { projects } from '@/data/projects';
import { Button } from '@/components/ui/button';

const categories = [
  { key: 'all', icon: FolderGit2 },
  { key: 'websites', icon: Globe },
  { key: 'apps', icon: AppWindow },
  { key: 'landing', icon: Layout }
];

export function PortfolioPage() {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const filteredProjects = activeCategory === 'all' 
    ? projects 
    : projects.filter(project => project.category === activeCategory);

  const titles = {
    en: 'Portfolio | Pavel Levdin',
    ru: 'Портфолио | Павел Левдин',
    de: 'Portfolio | Pavel Levdin'
  };

  const descriptions = {
    en: 'My recent projects - websites, web applications and landing pages.',
    ru: 'Мои последние проекты - сайты, веб-приложения и лендинги.',
    de: 'Meine neuesten Projekte - Websites, Webanwendungen und Landing Pages.'
  };

  return (
    <>
      <Helmet>
        <title>{titles[i18n.language as keyof typeof titles] || titles.en}</title>
        <meta name="description" content={descriptions[i18n.language as keyof typeof descriptions] || descriptions.en} />
        <link rel="canonical" href="https://pavellevdin.dev/portfolio" />
      </Helmet>
      
      <div className="pt-24 md:pt-32 pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <FolderGit2 className="w-4 h-4" />
                {t('portfolio.title')}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                {t('portfolio.subtitle')}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('portfolio.description')}
              </p>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-wrap justify-center gap-2 mb-12"
            >
              {categories.map((category) => (
                <Button
                  key={category.key}
                  variant={activeCategory === category.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(category.key)}
                  className="gap-2"
                >
                  <category.icon className="w-4 h-4" />
                  {t(`portfolio.categories.${category.key}`)}
                </Button>
              ))}
            </motion.div>

            {/* Projects Grid */}
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-muted border border-border/50 hover:border-primary/30 transition-all duration-300 h-full">
                    {/* Image Container */}
                    <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                      {project.image ? (
                        <img 
                          src={project.image} 
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center p-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                              <FolderGit2 className="w-8 h-8 text-primary/60" />
                            </div>
                            <p className="text-sm text-muted-foreground">{project.title}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Overlay */}
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
                          className="flex items-center gap-2 text-white font-medium px-6 py-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                          {t('portfolio.viewProject')}
                        </a>
                      </motion.div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary capitalize">
                          {project.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {project.description}
                      </p>
                      
                      {/* Technologies */}
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Empty State */}
            {filteredProjects.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <p className="text-muted-foreground">No projects found in this category</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}