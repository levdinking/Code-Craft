import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { 
  Mail, 
  Send,
  Phone,
  ArrowRight, 
  User, 
  Check, 
  Loader2, 
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const FORM_ENDPOINT = "https://formspree.io/f/xbdprboe";

type ContactMethod = 'telegram' | 'whatsapp' | 'email';
type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

interface FormData {
  name: string;
  contactValue: string;
}

// Функция для получения номера WhatsApp по языку
const getWhatsAppNumber = (language: string): string => {
  return language === 'ru' ? '79060100341' : '4917643141306';
};

// Функция для отображения номера с форматированием
const formatWhatsAppDisplay = (number: string): string => {
  return number === '79060100341' 
    ? '+7 906 010-03-41' 
    : '+49 176 43141306';
};

const validateContact = (method: ContactMethod, value: string): string | null => {
  const val = value.trim();
  if (!val) return 'Required field';
  
  switch (method) {
    case 'email': {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? null : 'Invalid email format';
    }
    case 'telegram': {
      const username = val.replace('@', '');
      return /^[a-zA-Z0-9_]{5,32}$/.test(username) ? null : 'Username: 5-32 chars (a-z, 0-9, _)';
    }
    case 'whatsapp': {
      const digits = val.replace(/\D/g, '');
      return digits.length >= 10 ? null : 'Min 10 digits';
    }
    default:
      return null;
  }
};

const getInputType = (method: ContactMethod): string => {
  return method === 'email' ? 'email' : 'text';
};

export function ContactPage() {
  const { t, i18n } = useTranslation();
  const [method, setMethod] = useState<ContactMethod>('telegram');
  const [formData, setFormData] = useState<FormData>({ name: '', contactValue: '' });
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [touched, setTouched] = useState({ contactValue: false, name: false });

  // Получаем текущий номер WhatsApp по языку
  const whatsappNumber = getWhatsAppNumber(i18n.language);
  const whatsappDisplay = formatWhatsAppDisplay(whatsappNumber);

  // Динамический плейсхолдер для WhatsApp
  const getPlaceholder = (method: ContactMethod, t: (key: string) => string): string => {
    switch (method) {
      case 'telegram': return '@username';
      case 'whatsapp': return whatsappDisplay;
      case 'email': return t('contact.form.namePlaceholder').replace('Max Mustermann', 'email@example.com');
      default: return '';
    }
  };

  // SEO данные динамические по языку
  const seoData = {
    de: {
      title: 'Kontakt | Pavel Levdin - Web Entwickler Bremen',
      desc: 'Kontaktieren Sie mich für Ihr Webprojekt. Erreichbar via Telegram, WhatsApp oder E-Mail. Antwort innerhalb von 2 Stunden.',
    },
    en: {
      title: 'Contact | Pavel Levdin - Full Stack Developer',
      desc: 'Get in touch to discuss your project. Available via Telegram, WhatsApp and Email. Usually respond within 2 hours.',
    },
    ru: {
      title: 'Контакты | Павел Левдин - Full-Stack Разработчик',
      desc: 'Свяжитесь для обсуждения проекта. Доступен в Telegram, WhatsApp и по email. Обычно отвечаю в течение 2 часов.',
    }
  };

  const seo = seoData[i18n.language as keyof typeof seoData] || seoData.en;

  const handleMethodChange = (newMethod: ContactMethod) => {
    setMethod(newMethod);
    setFormData(prev => ({ ...prev, contactValue: '' }));
    setTouched({ contactValue: false, name: touched.name });
    setErrorMsg('');
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setTouched(prev => ({ ...prev, name: true }));
      return;
    }
    
    const validationError = validateContact(method, formData.contactValue);
    if (validationError) {
      setErrorMsg(validationError);
      setTouched(prev => ({ ...prev, contactValue: true }));
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    const data = new FormData();
    data.append('name', formData.name.trim());
    data.append('contactMethod', method);
    data.append('contactValue', formData.contactValue.trim());
    data.append('language', i18n.language);
    data.append('_subject', `New contact form - ${formData.name} (${method})`);
    data.append('_gotcha', '');

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', contactValue: '' });
        setTouched({ contactValue: false, name: false });
      } else {
        throw new Error('Server error');
      }
    } catch {
      setStatus('error');
      setErrorMsg(t('contact.error'));
    }
  }, [formData, method, i18n.language, t]);

  const isNameError = touched.name && !formData.name.trim();
  const isContactError = touched.contactValue && errorMsg;

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.desc} />
        <link rel="canonical" href={`https://pavellevdin.dev/${i18n.language}/contact`} />
        <html lang={i18n.language} />
      </Helmet>

      <div className="min-h-screen pt-24 md:pt-32 pb-20 bg-gradient-to-b from-background via-background to-muted/20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl mx-auto">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16"
          >
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Mail className="w-4 h-4" />
              {t('contact.subtitle')}
            </motion.span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {t('contact.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('contact.description')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-7 xl:col-span-8"
            >
              <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-10 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <AnimatePresence mode="wait">
                  {status === 'success' ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative text-center py-16"
                    >
                      <div className="relative inline-flex items-center justify-center mb-8">
                        <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse" />
                        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-xl">
                          <Check className="w-12 h-12 text-white" strokeWidth={3} />
                        </div>
                      </div>
                      
                      <h3 className="text-2xl md:text-3xl font-bold mb-3">
                        {t('contact.success.title')}
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
                        {t('contact.success.desc')}
                      </p>
                      
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => setStatus('idle')}
                        className="rounded-full px-8 hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        {t('contact.success.new')}
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="relative space-y-8"
                    >
                      {/* Name Input */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold">
                          {t('contact.form.name')}
                        </Label>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, name: e.target.value }));
                              if (isNameError) setTouched(prev => ({ ...prev, name: true }));
                            }}
                            onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                            placeholder={t('contact.form.namePlaceholder')}
                            className={`
                              pl-11 h-14 rounded-xl text-base transition-all
                              ${isNameError ? 'border-red-500 focus:border-red-500' : 'border-border/50 focus:border-primary'}
                            `}
                            required
                          />
                        </div>
                        {isNameError && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {i18n.language === 'de' ? 'Name ist erforderlich' : 
                             i18n.language === 'en' ? 'Name is required' : 'Укажите ваше имя'}
                          </p>
                        )}
                      </div>

                      {/* Contact Method Selection */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">
                          {t('contact.form.contactMethod')}
                        </Label>
                        <RadioGroup
                          value={method}
                          onValueChange={(val) => handleMethodChange(val as ContactMethod)}
                          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                        >
                          {[
                            { id: 'telegram', label: 'Telegram', color: 'bg-[#0088cc]', icon: Send },
                            { id: 'whatsapp', label: 'WhatsApp', color: 'bg-[#25D366]', icon: Phone },
                            { id: 'email', label: t('contact.form.email'), color: 'bg-primary', icon: Mail },
                          ].map((item) => (
                            <div key={item.id}>
                              <RadioGroupItem
                                value={item.id}
                                id={item.id}
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor={item.id}
                                className={`
                                  flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 
                                  bg-background/50 cursor-pointer transition-all duration-300
                                  hover:border-primary/30 hover:bg-primary/5
                                  peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10
                                  peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:shadow-primary/10
                                `}
                              >
                               <div className={`w-10 h-10 rounded-lg ${item.color} bg-opacity-15 flex items-center justify-center`}>
                                  <item.icon className={`w-5 h-5 ${item.id === 'email' ? 'text-primary-foreground' : item.color.replace('bg-', 'text-')}`} />
                                </div>
                                <span className="font-medium text-sm">{item.label}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      {/* Contact Value Input */}
                      <div className="space-y-2">
                        <Label htmlFor="contactValue" className="text-sm font-semibold">
                          {method === 'telegram' && 'Telegram'}
                          {method === 'whatsapp' && 'WhatsApp'}
                          {method === 'email' && t('contact.form.email')}
                        </Label>
                        <div className="relative">
                          <Input
                            id="contactValue"
                            name="contactValue"
                            type={getInputType(method)}
                            value={formData.contactValue}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, contactValue: e.target.value }));
                              if (errorMsg) setErrorMsg('');
                            }}
                            onBlur={() => setTouched(prev => ({ ...prev, contactValue: true }))}
                            placeholder={getPlaceholder(method, t)}
                            className={`
                              h-14 rounded-xl text-base transition-all
                              ${isContactError ? 'border-red-500 focus:border-red-500' : 'border-border/50 focus:border-primary'}
                            `}
                            required
                          />
                        </div>
                        <AnimatePresence>
                          {isContactError && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="text-sm text-red-500 flex items-center gap-1"
                            >
                              <AlertCircle className="w-3 h-3" />
                              {errorMsg}
                            </motion.p>
                          )}
                        </AnimatePresence>
                        <p className="text-xs text-muted-foreground">
                          {method === 'telegram' && (i18n.language === 'de' ? '@username oder username ohne @' : i18n.language === 'en' ? '@username or username without @' : 'Введите @username или username без @')}
                          {method === 'whatsapp' && (i18n.language === 'de' ? 'Nummer mit Ländervorwahl (+49...)' : i18n.language === 'en' ? 'Number with country code (+49...)' : 'Введите номер с кодом страны (+7...)')}
                          {method === 'email' && (i18n.language === 'de' ? 'Bestätigung wird an diese Adresse gesendet' : i18n.language === 'en' ? 'Confirmation will be sent to this address' : 'На этот адрес придёт подтверждение')}
                        </p>
                      </div>

                      {/* Error Alert */}
                      {status === 'error' && (
                        <Alert variant="destructive" className="rounded-xl">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{errorMsg || t('contact.error')}</AlertDescription>
                        </Alert>
                      )}

                      {/* Submit Button */}
                      <div className="pt-4">
                        <Button
                          type="submit"
                          size="lg"
                          className="w-full h-14 rounded-xl text-base font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                          disabled={status === 'submitting'}
                        >
                          {status === 'submitting' ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              {t('contact.form.sending')}
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              {t('contact.form.send')}
                              <ArrowRight className="w-5 h-5" />
                            </span>
                          )}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground mt-4">
                          {i18n.language === 'de' ? 'Mit dem Klicken stimmen Sie der Datenverarbeitung zu' :
                           i18n.language === 'en' ? 'By clicking, you agree to data processing' :
                           'Нажимая кнопку, вы соглашаетесь с обработкой персональных данных'}
                        </p>
                      </div>

                      {/* Honeypot */}
                      <input 
                        type="text" 
                        name="_gotcha" 
                        className="absolute opacity-0 -z-10" 
                        tabIndex={-1} 
                        autoComplete="off" 
                        aria-hidden="true"
                      />
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Info Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-5 xl:col-span-4 space-y-6"
            >
              {/* Quick Contact Card */}
              <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-background border border-primary/20 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                
                <h3 className="text-xl font-bold mb-6 relative z-10">
                  {t('contact.info.title')}
                </h3>
                
                <div className="space-y-5 relative z-10">
                  {/* Telegram */}
                  <a 
                    href="https://t.me/PavelLevdin" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 group p-3 -m-3 rounded-xl transition-all hover:bg-white/5"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#0088cc]/10 text-[#0088cc] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Send className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Telegram</p>
                      <p className="font-semibold group-hover:text-[#0088cc] transition-colors">@PavelLevdin</p>
                    </div>
                  </a>

                  {/* Email */}
                  <a 
                    href="mailto:levdin.pavel@yandex.ru"
                    className="flex items-center gap-4 group p-3 -m-3 rounded-xl transition-all hover:bg-white/5"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t('contact.form.email')}</p>
                      <p className="font-semibold group-hover:text-primary transition-colors break-all">levdin.pavel@yandex.ru</p>
                    </div>
                  </a>

                  {/* WhatsApp — ДИНАМИЧЕСКИЙ НОМЕР ПО ЯЗЫКУ */}
                  <a 
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 group p-3 -m-3 rounded-xl transition-all hover:bg-white/5"
                  >
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">WhatsApp</p>
                      <p className="font-semibold group-hover:text-green-600 transition-colors">{whatsappDisplay}</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Availability Status */}
              <div className="bg-card/60 backdrop-blur border border-border/50 rounded-3xl p-6">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 flex items-center gap-2">
                      {t('contact.info.availability')}
                      <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-medium border border-green-500/20">
                        Active
                      </span>
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t('contact.info.response')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="bg-muted/50 rounded-3xl p-6 border border-border/30">
                <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
                  {t('contact.info.workingHours')}
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('contact.info.weekdays')}</span>
                    <span className="font-medium tabular-nums">{t('contact.info.weekdaysTime')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t('contact.info.weekend')}</span>
                    <span className="font-medium text-muted-foreground">{t('contact.info.weekendTime')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}