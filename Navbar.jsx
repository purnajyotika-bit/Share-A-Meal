import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Sun, Moon } from 'lucide-react';
import { Button } from './button';
import { Sheet, SheetContent, SheetTrigger } from './sheet';
import NotificationBell from './NotificationBell';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

export default function Navbar() {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const isActive = (p) => location.pathname === p;

  const [theme, setTheme] = useState(localStorage.getItem('appTheme') || 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('appTheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const logoBorderColor = theme === 'dark' ? 'border-orange-200' : 'border-orange-500';

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105">
            {/* Logo Container with Sketch-Style SVG */}
            <div className={`relative h-12 w-12 overflow-hidden rounded-full border-2 ${logoBorderColor} bg-white flex items-center justify-center shadow-lg hover:border-orange-300`}>
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#f97316" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-[80%] w-[80%]"
              >
                {/* Offering Hand (Solid Silhouette from 1000051607.png) */}
                <path d="M2 13l4-2 3 2 1-1" strokeWidth="1" />
                <path d="M4 14l2 3h4l2-2" />
                
                {/* Receiving Hand (Outline Silhouette from 1000051607.png) */}
                <path d="M14 16l4-2 3 2 1-1" strokeWidth="1" />
                <path d="M16 17l2 3h4l2-2" />
                
                {/* Bowl and Food Sketch */}
                <path d="M8 11h8a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1z" />
                <path d="M9 12a3 3 0 0 0 6 0" />
                <path d="M12 8c0-1 1-1 1-2s-1-1-1-2" />
              </svg>
            </div>
            
            <div className="leading-tight">
              <span className="font-bold text-foreground text-[15px] tracking-tight block">
                {t('nav_brand_title')}
              </span>
              <span className="block text-[9px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                {t('nav_brand_subtitle')}
              </span>
            </div>
          </Link>

          {/* ... (Rest of your original navigation buttons) */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/leaderboard"><Button variant={isActive('/leaderboard') ? 'secondary' : 'ghost'} size="sm">{t('nav_leaderboard')}</Button></Link>
            <Link to="/fundraising"><Button variant={isActive('/fundraising') ? 'secondary' : 'ghost'} size="sm">{t('nav_fundraising')}</Button></Link>
            <Link to="/analytics"><Button variant={isActive('/analytics') ? 'secondary' : 'ghost'} size="sm">{t('nav_analytics')}</Button></Link>
            {user && <>
              <Link to="/dashboard"><Button variant={isActive('/dashboard') ? 'secondary' : 'ghost'} size="sm">{t('nav_dashboard')}</Button></Link>
              <Link to="/nearby"><Button variant={isActive('/nearby') ? 'secondary' : 'ghost'} size="sm">{t('nav_nearby')}</Button></Link>
            </>}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-8 h-8 rounded-full">
              {theme === 'light' ? <Moon className="w-4 h-4 text-orange-600" /> : <Sun className="w-4 h-4 text-amber-300" />}
            </Button>
            <LanguageSwitcher />
            {user || localStorage.getItem("userName") ? (
              <>
                <NotificationBell />
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="hidden md:flex">Hi, {user?.full_name || user?.name || localStorage.getItem("userName") || 'User'}! 👋</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => { localStorage.clear(); window.location.href = "/"; }} className="ml-2 text-xs text-destructive hover:bg-destructive/10">Logout</Button>
              </>
            ) : (
              <Link to="/signin"><Button size="sm" className="bg-primary hover:bg-primary/90 text-white">{t('nav_get_started')}</Button></Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
