import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("mode") !== "signup";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  const { login, signup, loading, error, setError } = useAuth();
  
  const validate = () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return false;
    }
    if (!isLogin && !fullName) {
      setError("Full Name is required for signup.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    if (isLogin) {
      await login({ email, password });
    } else {
      const success = await signup({ name: fullName, email, password });
      if (success) {
        setIsLogin(true); // Switch to login after successful signup
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-7xl font-raleway font-semibold tracking-tighter text-foreground mb-4">
            RepoMind
          </h1>
          <p className="text-base text-muted-foreground">
            Understand any repo in minutes.
          </p>
        </div>
        <p className="text-base text-muted-foreground mb-8">
          {isLogin ? "Sign in to your account" : "Create a new account"}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-md p-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-card border border-border rounded-md px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-card border border-border rounded-md px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-card border border-border rounded-md px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground border border-primary/20 rounded-md py-4 text-base font-semibold hover:bg-primary/90 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 mt-4"
          >
            {loading ? "Processing..." : (isLogin ? "Sign in" : "Create account")}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-foreground font-semibold hover:underline underline-offset-2"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
