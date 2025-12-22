import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, Check, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import OAuthService from '../services/oauthService';

const SignUp = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (error) setError('');
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (password.length === 0) return 0;
    if (password.length < 8) return 1;
    if (password.length < 12) return 2;
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const varietyCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecial].filter(Boolean).length;
    
    if (password.length >= 12 && varietyCount >= 3) return 4;
    if (password.length >= 8 && varietyCount >= 2) return 3;
    return 2;
  };

  const passwordStrength = getPasswordStrength();
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const isFormValid = 
    formData.fullName.length >= 2 &&
    formData.email &&
    formData.password.length >= 8 &&
    passwordsMatch &&
    formData.agreeToTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await register(formData.fullName, formData.email, formData.password);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (err: any) {
      console.error('Registration error:', err);
      
      if (err.response) {
        const errorMessage = err.response.data?.detail || 'Registration failed. Please try again.';
        setError(errorMessage);
      } else if (err.request) {
        setError('Cannot connect to server. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setIsLoading(false);
    }
  };

  // Handle OAuth signup
  const handleOAuthSignup = async (provider: 'google' | 'github') => {
    try {
      setError('');
      if (provider === 'google') {
        await OAuthService.initiateGoogleLogin();
      } else {
        await OAuthService.initiateGitHubLogin();
      }
      // User will be redirected to OAuth provider
    } catch (err: any) {
      console.error('OAuth error:', err);
      setError(`Failed to start ${provider} signup. Please try again.`);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-6 overflow-hidden bg-slate-950">
      {/* Clean Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute rounded-full top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 blur-3xl animate-float" />
        <div className="absolute rounded-full bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 left-1/2 w-96 h-96 bg-purple-500/15 blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8 space-x-3">
          <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-cyan-500/50">
            <Sparkles className="text-white w-7 h-7" />
          </div>
          <span className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
            InsightIQ
          </span>
        </div>

        {/* Glass Card */}
        <div className="relative group">
          <div className="absolute transition-opacity -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl opacity-20 group-hover:opacity-30 blur-xl" />
          
          <div className="relative p-8 border shadow-2xl bg-slate-900/70 backdrop-blur-2xl border-slate-700/50 rounded-3xl">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-3xl font-bold text-white">Create your account</h2>
              <p className="text-slate-400">Start your free trial, no credit card required</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start p-4 mb-6 space-x-3 border bg-red-500/10 border-red-500/20 rounded-xl animate-slide-down">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm leading-relaxed text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-start p-4 mb-6 space-x-3 border bg-emerald-500/10 border-emerald-500/20 rounded-xl animate-slide-down">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm leading-relaxed text-emerald-400">
                    Account created successfully! Redirecting to dashboard...
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">Full name</label>
                <div className="relative">
                  <User className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="John Doe"
                    required
                    autoComplete="name"
                    minLength={2}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">Email</label>
                <div className="relative">
                  <Mail className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Create a strong password"
                    required
                    autoComplete="new-password"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute -translate-y-1/2 right-4 top-1/2 text-slate-400 hover:text-slate-300 disabled:opacity-50"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {formData.password && (
                  <div className="flex gap-1 mt-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i < passwordStrength
                            ? passwordStrength >= 4
                              ? 'bg-emerald-500'
                              : passwordStrength >= 3
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                            : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                )}
                
                <p className="mt-1 text-xs text-slate-500">
                  Use 8+ characters with a mix of letters, numbers & symbols
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Confirm your password"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    className="absolute -translate-y-1/2 right-4 top-1/2 text-slate-400 hover:text-slate-300 disabled:opacity-50"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {formData.confirmPassword && (
                  formData.password === formData.confirmPassword ? (
                    <p className="flex items-center mt-1 text-xs text-emerald-400">
                      <Check className="w-3 h-3 mr-1" />
                      Passwords match
                    </p>
                  ) : (
                    <p className="flex items-center mt-1 text-xs text-red-400">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Passwords do not match
                    </p>
                  )
                )}
              </div>

              {/* Terms & Conditions */}
              <label className="flex items-start cursor-pointer group">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-4 h-4 mt-0.5 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500/20 disabled:opacity-50"
                  required
                />
                <span className="ml-2 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300">
                  I agree to the{' '}
                  <a href="/terms" className="transition-colors text-cyan-400 hover:text-cyan-300">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="transition-colors text-cyan-400 hover:text-cyan-300">
                    Privacy Policy
                  </a>
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-xl hover:shadow-cyan-500/50 transition-all hover:scale-[1.02] flex items-center justify-center group mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    <span>Success! Redirecting...</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-900/70 text-slate-400">Or sign up with email</span>
              </div>
            </div>

            {/* Social signup - AT TOP */}
            <div className="mb-6 space-y-3">
              <button
                type="button"
                onClick={() => handleOAuthSignup('google')}
                disabled={isLoading}
                className="flex items-center justify-center w-full px-4 py-3 font-medium transition-all bg-white border hover:bg-gray-50 border-slate-300 rounded-xl text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => handleOAuthSignup('github')}
                disabled={isLoading}
                className="flex items-center justify-center w-full px-4 py-3 font-medium text-white transition-all border bg-slate-800 hover:bg-slate-700 border-slate-700/50 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Continue with GitHub
              </button>
            </div>

            {/* Sign in link */}
            <p className="mt-6 text-sm text-center text-slate-400">
              Already have an account?{' '}
              <a 
                href="/login" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  if (!isLoading) navigate('/login'); 
                }} 
                className="font-medium transition-colors text-cyan-400 hover:text-cyan-300"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex items-center justify-center mt-6 space-x-6 text-xs text-slate-500">
          <div className="flex items-center">
            <Check className="w-4 h-4 mr-1 text-emerald-400" />
            <span>Free forever</span>
          </div>
          <div className="flex items-center">
            <Check className="w-4 h-4 mr-1 text-emerald-400" />
            <span>No credit card</span>
          </div>
          <div className="flex items-center">
            <Check className="w-4 h-4 mr-1 text-emerald-400" />
            <span>Setup in 60s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
