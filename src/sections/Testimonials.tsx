import { useTranslation } from 'react-i18next';
import { Star, Quote } from 'lucide-react';
import { testimonials, type Testimonial } from '@/data/testimonials';

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-card border rounded-2xl p-6 md:p-8 relative">
      <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
      
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`}
          />
        ))}
      </div>
      
      <p className="text-foreground/90 mb-6 leading-relaxed">
        "{testimonial.content}"
      </p>
      
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
          {testimonial.name.charAt(0)}
        </div>
        <div>
          <h4 className="font-semibold">{testimonial.name}</h4>
          <p className="text-sm text-muted-foreground">
            {testimonial.role}, {testimonial.company}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const { t, i18n } = useTranslation();
  const currentTestimonials = testimonials[i18n.language as keyof typeof testimonials] || testimonials.en;

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('testimonials.title', 'Отзывы клиентов')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('testimonials.subtitle', 'Что говорят клиенты о работе со мной')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {currentTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}