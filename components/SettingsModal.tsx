import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GLOBAL_KEYS = ['brand', 'domain', 'city', 'address', 'phone', 'primary_category', 'stack', 'url'];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, setSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [settings, isOpen]);

  const handleSave = () => {
    setSettings(localSettings);
    onClose();
  };

  const handleChange = (key: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-md bg-white/[.15] backdrop-blur-2xl border border-white/[.20] rounded-2xl p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Globálne premenné</h2>
        <p className="text-sm text-white/80 mb-6">Tieto hodnoty sa automaticky vyplnia do všetkých relevantných promptov.</p>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {GLOBAL_KEYS.map(key => (
            <div key={key}>
              <label htmlFor={`settings-${key}`} className="text-xs font-medium text-white/80 block mb-1 capitalize">
                {key.replace(/_/g, ' ')}
              </label>
              <input
                id={`settings-${key}`}
                type="text"
                value={localSettings[key] || ''}
                onChange={e => handleChange(key, e.target.value)}
                placeholder={`Zadajte ${key.replace(/_/g, ' ')}...`}
                className="w-full bg-black/20 border border-white/20 rounded-md px-3 py-1.5 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-semibold transition-colors"
          >
            Zrušiť
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-blue-500/80 hover:bg-blue-500 border border-blue-400/50 text-sm font-semibold transition-colors"
          >
            Uložiť
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
