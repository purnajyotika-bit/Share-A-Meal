import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './button';
import { Input } from './input';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { base44 } from './base44Client';

export default function SignIn() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Use the login method from AuthContext
      await login(email, password);
      
      // Redirect to dashboard on successful login
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle specific error messages
      if (err.message?.includes('Invalid credentials')) {
        setError(t('invalid_credentials') || 'Invalid email or password');
      } else if (err.message?.includes('not found')) {
        setError(t('user_not_found') || 'User not found. Please sign up first.');
      } else {
        setError(err.message || t('login_error') || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    // Redirect to signup page or Base44 signup
    navigate('/signup');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">{t('sign_in') || 'Sign In'}</h1>
            <p className="text-muted-foreground">{t('sign_in_instruction') || 'Sign in to your account'}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                {t('email') || 'Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('email_placeholder') || 'you@example.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                {t('password') || 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder={t('password_placeholder') || 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('logging_in') || 'Signing in...'}
                </>
              ) : (
                t('sign_in') || 'Sign In'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-muted-foreground">{t('or') || 'or'}</span>
            </div>
          </div>

          {/* Alternative Login */}
          <Button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            variant="outline"
            className="w-full"
          >
            {t('login_with_base44') || 'Login with Base44'}
          </Button>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t('no_account') || "Don't have an account?"}{' '}
              <button
                onClick={handleSignUp}
                className="text-primary hover:underline font-medium"
              >
                {t('sign_up') || 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
