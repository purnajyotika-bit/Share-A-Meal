import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './button';
import { Input } from './input';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { Mail, Lock, User, Loader2, Users } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

export default function SignUp() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'donor'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleLoaded, setGoogleLoaded] = useState(false);

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGoogleLoaded(true);
      initializeGoogleSignIn();
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
        callback: handleGoogleSignUp,
      });

      // Render the Google Sign-In button
      const googleButtonContainer = document.getElementById('google-signup-button');
      if (googleButtonContainer) {
        window.google.accounts.id.renderButton(
          googleButtonContainer,
          {
            type: 'standard',
            size: 'large',
            text: 'signup_with',
            locale: 'en',
            width: '100%',
          }
        );
      }
    }
  };

  const handleGoogleSignUp = async (response) => {
    try {
      setError('');
      setIsLoading(true);

      // Decode JWT response from Google
      const credential = response.credential;
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const googleUser = JSON.parse(jsonPayload);

      // Extract data from Google response
      const email = googleUser.email;
      const fullName = googleUser.name;

      // Auto-register user with Google credentials
      try {
        await register(email, credential, fullName, formData.role);
        navigate('/dashboard');
      } catch (regErr) {
        if (regErr.message?.includes('already exists')) {
          setError(t('email_already_exists') || 'Email already registered');
        } else {
          setError(regErr.message || t('registration_failed') || 'Registration failed');
        }
      }
    } catch (err) {
      console.error('Google sign-up error:', err);
      setError(t('google_signin_failed') || 'Google sign-up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (value) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(t('profile_passwords_no_match') || 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError(t('profile_password_min_length') || 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Use the register method from AuthContext
      await register(formData.email, formData.password, formData.fullName, formData.role);
      
      // Redirect to dashboard on successful registration
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      
      if (err.message?.includes('already exists')) {
        setError(t('email_already_exists') || 'Email already registered');
      } else {
        setError(err.message || t('registration_failed') || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">{t('sign_up') || 'Create Account'}</h1>
            <p className="text-muted-foreground">{t('join_description') || 'Join FoodBridge today'}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Google Sign-Up Button */}
          {googleLoaded && (
            <div id="google-signup-button" className="flex justify-center"></div>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-muted-foreground">{t('or') || 'or'}</span>
            </div>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Full Name Input */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-foreground">
                {t('full_name') || 'Full Name'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  id="fullName"
                  name="fullName"
                  data-testid="signup-full-name"
                  type="text"
                  placeholder={t('full_name_placeholder') || 'John Doe'}
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                {t('email') || 'Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  data-testid="signup-email"
                  type="email"
                  placeholder={t('email_placeholder') || 'you@example.com'}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm font-medium text-foreground">
                {t('i_am_a') || 'I am a...'}
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-5 h-5 text-muted-foreground z-10" />
                <Select value={formData.role} onValueChange={handleRoleChange} disabled={isLoading}>
                  <SelectTrigger className="pl-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="donor">{t('i_have_food_to_give') || 'Donor'}</SelectItem>
                    <SelectItem value="receiver">{t('i_need_food_for_community') || 'NGO / Receiver'}</SelectItem>
                    <SelectItem value="volunteer">{t('i_can_pick_up_deliver') || 'Volunteer'}</SelectItem>
                  </SelectContent>
                </Select>
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
                  name="password"
                  data-testid="signup-password"
                  type="password"
                  placeholder={t('password_placeholder') || 'Min 6 characters'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                {t('confirm_password') || 'Confirm Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  data-testid="signup-confirm-password"
                  type="password"
                  placeholder={t('confirm_password_placeholder') || 'Repeat password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              id="submit"
              type="submit"
              data-testid="signup-submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('creating_account') || 'Creating account...'}
                </>
              ) : (
                t('sign_up') || 'Create Account'
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t('already_have_account') || 'Already have an account?'}{' '}
              <button
                onClick={() => navigate('/signin')}
                className="text-primary hover:underline font-medium"
              >
                {t('sign_in') || 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
