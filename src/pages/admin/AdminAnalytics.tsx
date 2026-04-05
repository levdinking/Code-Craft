import { useState } from 'react';
import { BarChart3, ExternalLink } from 'lucide-react';

type Tab = 'google' | 'yandex';

export function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState<Tab>('yandex');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Аналитика</h1>
        <p className="text-muted-foreground text-sm mt-1">Трафик и данные посетителей</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('yandex')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'yandex'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Яндекс.Метрика
        </button>
        <button
          onClick={() => setActiveTab('google')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'google'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Google Analytics
        </button>
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {activeTab === 'yandex' && (
          <div>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h2 className="font-semibold">Яндекс.Метрика</h2>
                <p className="text-sm text-muted-foreground">ID счётчика: 108284704</p>
              </div>
              <a
                href="https://metrika.yandex.ru/dashboard?id=108284704"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Открыть полный дашборд <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="w-full" style={{ height: 'calc(100vh - 320px)', minHeight: '500px' }}>
              <iframe
                src="https://metrika.yandex.ru/dashboard?id=108284704"
                className="w-full h-full border-0"
                title="Яндекс.Метрика"
              />
            </div>
          </div>
        )}

        {activeTab === 'google' && (
          <div>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h2 className="font-semibold">Google Analytics</h2>
                <p className="text-sm text-muted-foreground">Свойство: G-PFRYET1M4T</p>
              </div>
              <a
                href="https://analytics.google.com/analytics/web/#/p/G-PFRYET1M4T"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Открыть полный дашборд <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="p-8 text-center text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <h3 className="font-medium mb-2">Дашборд Google Analytics</h3>
              <p className="text-sm max-w-md mx-auto mb-4">
                Для встраивания Google Analytics создайте отчёт Looker Studio, связанный с вашим свойством GA,
                и вставьте URL встраивания ниже.
              </p>
              <a
                href="https://analytics.google.com/analytics/web/#/p/G-PFRYET1M4T"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
              >
                Открыть Google Analytics <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
