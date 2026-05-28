import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { Globe } from 'lucide-react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export default function LanguageSwitcher() {
  const { lang, setLang, LANGUAGES, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 px-2 text-muted-foreground hover:text-foreground">
          <Globe className="w-4 h-4" />
          <span className="text-sm">{current.flag}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-52 p-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-2">{t('select_language')}</p>
        <div className="space-y-0.5">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left
                ${lang === l.code ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'}`}
            >
              <span className="text-base">{l.flag}</span>
              <span>{l.label}</span>
              {l.dir === 'rtl' && <span className="ml-auto text-[10px] text-muted-foreground">RTL</span>}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
