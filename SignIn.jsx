import React from 'react';
import { Button } from './button';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

export default function SignIn() {
  const { navigateToLogin } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-medium text-slate-800">{t('nav_get_started')}</h2>
          <p className="text-slate-600">{t('sign_in_instruction') || 'Sign in to continue.'}</p>
          <div className="pt-6">
            <Button onClick={() => navigateToLogin()} className="bg-primary text-white">
              {t('sign_in') || 'Sign in'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
