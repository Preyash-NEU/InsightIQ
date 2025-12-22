import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * OAuth Callback Page
 * 
 * Receives redirect from backend after OAuth authentication.
 * Extracts tokens from URL and stores them.
 */

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUserFromOAuth } = useAuth();  // ← Use auth context
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error in URL
        const urlError = searchParams.get('error');
        if (urlError) {
          throw new Error(urlError.replace(/_/g, ' '));
        }

        // Get tokens from URL parameters
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const provider = searchParams.get('provider');

        if (!accessToken || !refreshToken) {
          throw new Error('No tokens received from authentication');
        }

        // Store tokens in localStorage
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);

        // Update auth context with user info ← KEY FIX
        await setUserFromOAuth();

        setStatus('success');
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);

      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setError(err.message || 'Authentication failed. Please try again.');
        
        // Redirect to login after delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUserFromOAuth]);

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center p-6">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="bg-slate-900/70 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-12 max-w-md mx-auto">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Completing sign in...</h2>
              <p className="text-slate-400 text-center">Please wait while we set up your account</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Success!</h2>
              <p className="text-slate-400 text-center">Redirecting to your dashboard...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Authentication Failed</h2>
              <p className="text-slate-400 mb-4 text-center">{error}</p>
              <p className="text-sm text-slate-500 text-center">Redirecting to login...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
