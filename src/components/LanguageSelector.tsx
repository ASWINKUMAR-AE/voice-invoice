import React from 'react';
import { Languages } from 'lucide-react';

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-4">
        <Languages className="w-5 h-5 text-orange-600" />
        <span className="font-medium text-gray-700">Select Language</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`p-3 rounded-lg border text-center transition-all ${
              currentLanguage === lang.code
                ? 'bg-orange-600 text-white border-orange-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
            }`}
          >
            <div className="font-medium">{lang.native}</div>
            <div className="text-sm opacity-75">{lang.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
};