import { useState, useEffect } from 'react';
import { ExternalLink, Eye, EyeOff, Loader2, CheckCircle2, XCircle, AlertCircle, Key } from 'lucide-react';
import { useAdminApi } from '@/hooks/useAdminApi';
import type { ApiKeyInfo, ApiKeyTestResult } from '@/types/admin';

export function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, ApiKeyTestResult>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newValue, setNewValue] = useState('');
  const [showValue, setShowValue] = useState(false);
  const [saving, setSaving] = useState(false);
  const { get, put, post } = useAdminApi();

  const loadKeys = async () => {
    setLoading(true);
    try {
      const data = await get<ApiKeyInfo[]>('/api/settings/api-keys');
      setKeys(data);
    } catch (err) {
      console.error('Ошибка загрузки API ключей:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadKeys(); }, []);

  const handleTest = async (keyId: string) => {
    setTesting(keyId);
    try {
      const result = await post<ApiKeyTestResult>(`/api/settings/api-keys/${keyId}/test`);
      setTestResults(prev => ({ ...prev, [keyId]: result }));
    } catch (err) {
      setTestResults(prev => ({ ...prev, [keyId]: { status: 'error', message: 'Ошибка соединения' } }));
    } finally {
      setTesting(null);
    }
  };

  const handleSave = async () => {
    if (!editingKey || !newValue.trim()) return;
    setSaving(true);
    try {
      await put(`/api/settings/api-keys/${editingKey}`, { value: newValue.trim() });
      setEditingKey(null);
      setNewValue('');
      setShowValue(false);
      // Очищаем результат теста для этого ключа
      setTestResults(prev => {
        const next = { ...prev };
        delete next[editingKey];
        return next;
      });
      await loadKeys();
    } catch (err) {
      console.error('Ошибка сохранения:', err);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (keyInfo: ApiKeyInfo) => {
    const testResult = testResults[keyInfo.id];
    if (testResult) {
      if (testResult.status === 'ok') {
        return (
          <span className="flex items-center gap-1 text-xs text-green-500">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {testResult.message}
          </span>
        );
      }
      return (
        <span className="flex items-center gap-1 text-xs text-red-500">
          <XCircle className="w-3.5 h-3.5" />
          {testResult.message}
        </span>
      );
    }
    if (keyInfo.status === 'configured') {
      return (
        <span className="flex items-center gap-1 text-xs text-green-500">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Подключён
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-xs text-amber-500">
        <AlertCircle className="w-3.5 h-3.5" />
        Не настроен
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {keys.map((keyInfo) => (
        <div
          key={keyInfo.id}
          className="bg-card border border-border rounded-xl p-4 space-y-3"
        >
          {/* Заголовок + статус */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{keyInfo.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{keyInfo.description}</p>
              </div>
            </div>
            {getStatusBadge(keyInfo)}
          </div>

          {/* Маскированное значение */}
          {keyInfo.maskedValue && (
            <p className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
              {keyInfo.maskedValue}
            </p>
          )}

          {/* Доп. переменные */}
          {keyInfo.extraVars && keyInfo.extraVars.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {keyInfo.extraVars.map(ev => (
                <span key={ev.key} className={`text-xs px-1.5 py-0.5 rounded ${
                  ev.configured ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {ev.key}: {ev.maskedValue || 'не задан'}
                </span>
              ))}
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => { setEditingKey(keyInfo.id); setNewValue(''); setShowValue(false); }}
              className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted transition-colors"
            >
              Изменить
            </button>
            <button
              onClick={() => handleTest(keyInfo.id)}
              disabled={testing === keyInfo.id || keyInfo.status === 'not_configured'}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
            >
              {testing === keyInfo.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Проверить
            </button>
            <a
              href={keyInfo.docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg text-primary hover:bg-primary/5 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              {keyInfo.docLabel}
            </a>
          </div>
        </div>
      ))}

      {/* Модальное окно редактирования */}
      {editingKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md mx-4 space-y-4">
            <h3 className="text-lg font-semibold">
              Изменить ключ: {keys.find(k => k.id === editingKey)?.name}
            </h3>
            <div className="relative">
              <input
                type={showValue ? 'text' : 'password'}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Введите новый API ключ"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 pr-10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                autoFocus
              />
              <button
                onClick={() => setShowValue(!showValue)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              >
                {showValue ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setEditingKey(null); setNewValue(''); setShowValue(false); }}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !newValue.trim()}
                className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
