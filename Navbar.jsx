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
          
          {/* Left side Brand Logo Header Block */}
          <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105">
            <div className={`relative h-12 w-12 overflow-hidden rounded-full border-2 ${logoBorderColor} bg-orange-500 flex items-center justify-center shadow-lg hover:border-orange-300`}>
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-[75%] w-[75%] drop-shadow-md"
              >
                {/* Clear Left Hand - Giving From Bottom Left */}
                <path d="M2 14h4l2.5-2.5c.3-.3.8-.3 1.1 0l1.4 1.4" />
                
                {/* Clear Right Hand - Receiving At Bottom Right */}
                <path d="M22 14h-4l-2.5 2.5c-.3.3-.8.3-1.1 0l-1.4-1.4" />
                
                {/* Center Solid Premium Bowl with Perfect Clarity */}
                <path d="M8 10h8c0 2.2-1.8 4-4 4s-4-1.8-4-4z" fill="white" fillOpacity="0.25" />
                <path d="M10.5 14h3" />
                
                {/* Crisp Steam Heart Line above the bowl */}
                <path d="M12 4c.6-1 1.5-.5 1.5.5 0 .8-.8 1.3-1.5 2-.7-.7-1.5-1.2-1.5-2 0-1 .9-1.5 1.5-.5z" />
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
                  <Button variant="ghost" size="sm" className="hidden md:flex">
                    Hi, {user?.full_name || user?.name || localStorage.getItem("userName") || 'User'}! 👋
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => { localStorage.clear(); window.location.href = "/"; }} className="ml-2 text-xs text-destructive hover:bg-destructive/10">
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/signin">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                  {t('nav_get_started')}
                </Button>
              </Link>
            )}
            
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden"><Menu className="w-5 h-5" /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-2 mt-8">
                  <Link to="/leaderboard" onClick={() => setOpen(false)}><Button variant="ghost" className="w-full justify-start">{t('nav_leaderboard')}</Button></Link>
                  <Link to="/fundraising" onClick={() => setOpen(false)}><Button variant="ghost" className="w-full justify-start">{t('nav_fundraising')}</Button></Link>
                  <Link to="/analytics" onClick={() => setOpen(false)}><Button variant="ghost" className="w-full justify-start">{t('nav_analytics')}</Button></Link>
                  {user && <>
                    <Link to="/dashboard" onClick={() => setOpen(false)}><Button variant="ghost" className="w-full justify-start">{t('nav_dashboard')}</Button></Link>
                    <Link to="/nearby" onClick={() => setOpen(false)}><Button variant="ghost" className="w-full justify-start">{t('nav_nearby')}</Button></Link>
                    <Link to="/profile" onClick={() => setOpen(false)}><Button variant="ghost" className="w-full justify-start">{t('nav_profile')}</Button></Link>
                  </>}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
