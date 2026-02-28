import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle, isLoading, isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Initialize Google Sign-In once the GSI script is ready
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google Client ID is not configured. Set VITE_GOOGLE_CLIENT_ID in your .env file.');
      return;
    }

    const initGoogle = () => {
      if (!window.google?.accounts?.id || !googleBtnRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          setError('');
          try {
            await loginWithGoogle(response.credential);
            navigate(from, { replace: true });
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Sign-in failed. Please try again.');
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: googleBtnRef.current.offsetWidth || 400,
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      });
    };

    // If the script already loaded, initialize immediately; otherwise wait for it
    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const script = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (script) {
        script.addEventListener('load', initGoogle);
        return () => script.removeEventListener('load', initGoogle);
      }
    }
  }, [loginWithGoogle, navigate, from]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mb-4">
            <span className="text-3xl font-bold text-primary-foreground">W</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Westcliff University</h1>
          <p className="text-muted-foreground mt-1">Student Services Portal</p>
        </div>

        <Card className="shadow-lg border-border">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Sign in with your Google account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading && !error && (
              <p className="text-center text-sm text-muted-foreground">Signing in…</p>
            )}

            {/* Google renders its button into this div */}
            <div ref={googleBtnRef} className="w-full flex justify-center" />

            <p className="text-center text-xs text-muted-foreground">
              Students can sign in with any Google account. Staff use their <strong>@westcliff.edu</strong> account.
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Westcliff University Student Services Portal
        </p>
      </div>
    </div>
  );
}
