import React, { useState } from "react";
import { LogIn, Mail, Lock, Loader2, UserPlus, Globe } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      setLoading(false);
      if (signUpError) {
        setError(signUpError.message);
      } else {
        setMessage("Check your email for the confirmation link!");
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (signInError) {
        setError(signInError.message);
      } else {
        navigate("/");
      }
    }
  };

  return (
    <main className="flex h-screen w-full overflow-hidden bg-background font-body">
      {/* Left Side: Visual Anchor (Hidden on mobile) */}
      <section className="hidden md:flex relative w-1/2 h-full overflow-hidden">
        <img 
          alt="Thai sunrise beach" 
          className="absolute inset-0 w-full h-full object-cover" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCorM7CpykSX61uLt5I7PdAvcBS5jXoOQrpWjSbl2KtBtcDIoj_ayELQFIo3pV-YDwaho1zlEeS7i1JgcaTe40W0gHFh3N6_rM8PJgmOZrane0STuG169bGRHGJMWzWVOOnLL8D6Hmgq1kb3t3-QkJOuEulTDg9P-sjoTEZ1inXvDohQ2Ptkv8V9_c8UulcI1aLdkXSjn5tpANU6pPWvmN9drQGeNXUEG5EIWheWC61T2ApjflDCIWsw0UHS_wKEnZIOVxzn98WMkvU" 
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
        
        {/* Glassmorphism Card */}
        <div className="absolute bottom-16 left-16 right-16 p-12 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-white text-5xl font-black tracking-tighter mb-4 leading-tight">
            Curating your <br/>next escape.
          </h2>
          <p className="text-white/80 text-lg max-w-md font-medium leading-relaxed">
            Welcome to NeoTrava. Experience the serene beauty of the islands through our digital concierge.
          </p>
          <div className="mt-8 flex gap-2">
            <span className="h-1 w-12 bg-primary-fixed rounded-full"></span>
            <span className="h-1 w-2 bg-white/30 rounded-full"></span>
            <span className="h-1 w-2 bg-white/30 rounded-full"></span>
          </div>
        </div>

        {/* Branding Anchor */}
        <div className="absolute top-12 left-12">
          <span className="text-white text-2xl font-black tracking-tighter">NeoTrava</span>
        </div>
      </section>

      {/* Right Side: Interaction Shell */}
      <section className="w-full md:w-1/2 h-full flex items-center justify-center p-8 bg-surface overflow-y-auto">
        <div className="w-full max-w-md space-y-10 animate-in fade-in zoom-in-95 duration-500">
          {/* Mobile Branding */}
          <div className="md:hidden flex justify-center mb-8">
            <span className="text-emerald-900 text-2xl font-black tracking-tighter">NeoTrava</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-on-surface text-4xl font-extrabold tracking-tight">
              {isSignUp ? "Create Account" : "Sign In"}
            </h1>
            <p className="text-on-surface-variant font-medium">
              {isSignUp ? "Join the journey with the Digital Curator." : "Continue your journey with the Digital Curator."}
            </p>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-4 rounded-xl bg-error-container text-on-error-container text-sm font-semibold border border-error/10 animate-in slide-in-from-top-2">
              {error}
            </div>
          )}
          {message && (
            <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-100 animate-in slide-in-from-top-2">
              {message}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2 px-1 transition-colors group-focus-within:text-primary">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline-variant transition-all font-medium" 
                    placeholder="curator@neotrava.com" 
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-xs font-bold uppercase tracking-widest text-secondary mb-2 px-1 transition-colors group-focus-within:text-primary">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline-variant transition-all font-medium" 
                    placeholder="••••••••••••" 
                  />
                </div>
                {!isSignUp && (
                  <div className="flex justify-end mt-2">
                    <a className="text-sm font-semibold text-primary hover:text-primary-container transition-colors" href="#">Forgot Password?</a>
                  </div>
                )}
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-lg rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all duration-300 flex items-center justify-center gap-3" 
              type="submit"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  {isSignUp ? "Create My Account" : "Sign In to Dashboard"}
                  {isSignUp ? <UserPlus size={22} /> : <LogIn size={22} />}
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-outline-variant/30"></div>
            <span className="flex-shrink mx-4 text-secondary text-xs font-bold uppercase tracking-widest">Or continue with</span>
            <div className="flex-grow border-t border-outline-variant/30"></div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 px-6 py-4 bg-surface-container-lowest border border-outline-variant/10 rounded-xl hover:bg-surface-container-high transition-all group active:scale-95">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              <span className="text-on-surface text-sm font-bold">Google</span>
            </button>
            <button className="flex items-center justify-center gap-3 px-6 py-4 bg-surface-container-lowest border border-outline-variant/10 rounded-xl hover:bg-surface-container-high transition-all group active:scale-95">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C4.83 17.52 4.1 13.03 5.92 10.12c.9-1.45 2.37-2.35 3.97-2.39 1.22-.03 2.12.56 2.87.56.74 0 2.05-.75 3.51-.6 1.6.17 2.76.77 3.42 1.74-3.3 1.93-2.78 6.06.49 7.4-.64 1.58-1.5 3.03-3.03 4.45zM12.03 7.25c-.02-2.23 1.84-4.14 4.04-4.25.24 2.63-2.6 4.67-4.04 4.25z"></path>
              </svg>
              <span className="text-on-surface text-sm font-bold">Apple</span>
            </button>
          </div>

          {/* Footer Link */}
          <p className="text-center text-on-surface-variant font-medium pt-4">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button 
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary font-bold hover:underline underline-offset-4 decoration-2 transition-all"
            >
              {isSignUp ? "Sign In instead" : "Create Account"}
            </button>
          </p>
        </div>
      </section>

      {/* Subtle Decorative Element */}
      <div className="fixed top-0 right-0 p-8 hidden sm:block">
        <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-high/50 backdrop-blur-md rounded-full border border-outline-variant/10 cursor-pointer hover:bg-surface-container-high transition-colors">
          <Globe className="text-primary" size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">English (US)</span>
        </div>
      </div>
    </main>
  );
}
