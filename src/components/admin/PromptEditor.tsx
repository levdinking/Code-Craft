import { useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';

interface PromptEditorProps {
  promptKey: string;
  label: string;
  value: string;
  onSave: (key: string, value: string) => void;
  onReset?: (key: string) => void;
}

export function PromptEditor({ promptKey, label, value, onSave, onReset }: PromptEditorProps) {
  const [text, setText] = useState(value);
  const [modified, setModified] = useState(false);

  const handleChange = (newText: string) => {
    setText(newText);
    setModified(newText !== value);
  };

  const handleSave = () => {
    onSave(promptKey, text);
    setModified(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-medium">{label}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Ключ: {promptKey}</p>
        </div>
        <div className="flex items-center gap-2">
          {onReset && (
            <button
              onClick={() => onReset(promptKey)}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-border hover:bg-muted transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Сброс
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!modified}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-3 h-3" />
            Сохранить
          </button>
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        rows={4}
        className="w-full bg-background border border-border rounded-lg p-3 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
        placeholder="Введите промпт..."
      />
      {modified && (
        <p className="text-xs text-amber-500 mt-1">Есть несохранённые изменения</p>
      )}
    </div>
  );
}
