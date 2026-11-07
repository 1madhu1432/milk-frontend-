import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// --------------------------------
// Types and Enums
// --------------------------------

enum AuthView {
  SIGN_IN = "sign-in",
  SIGN_UP = "sign-up",
  FORGOT_PASSWORD = "forgot-password",
  RESET_SUCCESS = "reset-success",
}

interface AuthState {
  view: AuthView;
}

interface FormState {
  isLoading: boolean;
  error: string | null;
  showPassword: boolean;
}

// --------------------------------
// Schemas
// --------------------------------

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms",
  }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type SignInFormValues = z.infer<typeof signInSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export interface AuthProps extends React.ComponentProps<"div"> {
  onSignInSuccess?: (email: string, password: string) => Promise<void> | void;
  onGoogleClick?: () => void;
  title?: string;
  subtitle?: string;
  defaultEmail?: string;
  defaultPassword?: string;
}

// --------------------------------
// Main Auth Component
// --------------------------------

function Auth({
  className,
  onSignInSuccess,
  onGoogleClick,
  title,
  subtitle,
  defaultEmail = "",
  defaultPassword = "",
  ...props
}: AuthProps) {
  const [state, setState] = React.useState<AuthState>({ view: AuthView.SIGN_IN });

  const setView = React.useCallback((view: AuthView) => {
    setState((prev) => ({ ...prev, view }));
  }, []);

  return (
    <div
      data-slot="auth"
      className={cn("mx-auto w-full max-w-md", className)}
      {...props}
    >
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#121417]/95 shadow-2xl backdrop-blur-md text-slate-100">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none" />
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {state.view === AuthView.SIGN_IN && (
              <AuthSignIn
                key="sign-in"
                title={title}
                subtitle={subtitle}
                defaultEmail={defaultEmail}
                defaultPassword={defaultPassword}
                onSignInSuccess={onSignInSuccess}
                onGoogleClick={onGoogleClick}
                onForgotPassword={() => setView(AuthView.FORGOT_PASSWORD)}
                onSignUp={() => setView(AuthView.SIGN_UP)}
              />
            )}
            {state.view === AuthView.SIGN_UP && (
              <AuthSignUp
                key="sign-up"
                onSignIn={() => setView(AuthView.SIGN_IN)}
              />
            )}
            {state.view === AuthView.FORGOT_PASSWORD && (
              <AuthForgotPassword
                key="forgot-password"
                onSignIn={() => setView(AuthView.SIGN_IN)}
                onSuccess={() => setView(AuthView.RESET_SUCCESS)}
              />
            )}
            {state.view === AuthView.RESET_SUCCESS && (
              <AuthResetSuccess
                key="reset-success"
                onSignIn={() => setView(AuthView.SIGN_IN)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// --------------------------------
// Shared Components
// --------------------------------

interface AuthFormProps {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  children: React.ReactNode;
  className?: string;
}

function AuthForm({ onSubmit, children, className }: AuthFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      data-slot="auth-form"
      className={cn("space-y-6", className)}
    >
      {children}
    </form>
  );
}

interface AuthErrorProps {
  message: string | null;
}

function AuthError({ message }: AuthErrorProps) {
  if (!message) return null;
  return (
    <div
      data-slot="auth-error"
      className="mb-6 animate-in rounded-lg border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-400 font-medium"
    >
      {message}
    </div>
  );
}

interface AuthSocialButtonsProps {
  isLoading: boolean;
  onGoogleClick?: () => void;
}

function AuthSocialButtons({ isLoading, onGoogleClick }: AuthSocialButtonsProps) {
  return (
    <div data-slot="auth-social-buttons" className="w-full mt-6">
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 bg-slate-900/60 hover:bg-slate-800 text-slate-200 border-slate-700/80 rounded-xl font-medium text-xs cursor-pointer"
        disabled={isLoading}
        onClick={onGoogleClick}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
          <path d="M1 1h22v22H1z" fill="none" />
        </svg>
        Google
      </Button>
    </div>
  );
}

interface AuthSeparatorProps {
  text?: string;
}

function AuthSeparator({ text = "OR CONTINUE WITH" }: AuthSeparatorProps) {
  return (
    <div data-slot="auth-separator" className="relative mt-6">
      <div className="absolute inset-0 flex items-center">
        <Separator className="bg-slate-800" />
      </div>
      <div className="relative flex justify-center text-[10px] tracking-wider uppercase font-bold">
        <span className="bg-[#121417] px-3 text-slate-400">{text}</span>
      </div>
    </div>
  );
}

// --------------------------------
// Sign In Component
// --------------------------------

interface AuthSignInProps {
  onForgotPassword: () => void;
  onSignUp: () => void;
  title?: string;
  subtitle?: string;
  defaultEmail?: string;
  defaultPassword?: string;
  onSignInSuccess?: (email: string, password: string) => Promise<void> | void;
  onGoogleClick?: () => void;
}

function AuthSignIn({
  onForgotPassword,
  onSignUp,
  title = "Welcome back",
  subtitle = "Sign in to your account",
  defaultEmail = "",
  defaultPassword = "",
  onSignInSuccess,
  onGoogleClick,
}: AuthSignInProps) {
  const [formState, setFormState] = React.useState<FormState>({
    isLoading: false,
    error: null,
    showPassword: false,
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: defaultEmail, password: defaultPassword },
  });

  React.useEffect(() => {
    if (defaultEmail) setValue("email", defaultEmail);
    if (defaultPassword) setValue("password", defaultPassword);
  }, [defaultEmail, defaultPassword, setValue]);

  const onSubmit = async (data: SignInFormValues) => {
    setFormState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      if (onSignInSuccess) {
        await onSignInSuccess(data.email, data.password);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (err: any) {
      setFormState((prev) => ({ ...prev, error: err?.message || "Invalid email or password" }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <motion.div
      data-slot="auth-sign-in"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="p-8"
    >
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
        <p className="mt-1.5 text-xs text-slate-400">{subtitle}</p>
      </div>

      <AuthError message={formState.error} />

      <AuthForm onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1.5 text-left">
          <Label htmlFor="email" className="text-xs font-semibold text-slate-300">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={formState.isLoading}
            className={cn(
              "bg-slate-900/90 border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus-visible:ring-emerald-500",
              errors.email && "border-red-500"
            )}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold text-slate-300">Password</Label>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs text-slate-400 hover:text-white"
              onClick={onForgotPassword}
              disabled={formState.isLoading}
            >
              Forgot password?
            </Button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={formState.showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={formState.isLoading}
              className={cn(
                "bg-slate-900/90 border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus-visible:ring-emerald-500 pr-10",
                errors.password && "border-red-500"
              )}
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full text-slate-400 hover:text-white hover:bg-transparent"
              onClick={() =>
                setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }))
              }
              disabled={formState.isLoading}
            >
              {formState.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all"
          disabled={formState.isLoading}
        >
          {formState.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-slate-950" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </AuthForm>

      <AuthSeparator />
      <AuthSocialButtons isLoading={formState.isLoading} onGoogleClick={onGoogleClick} />

      <p className="mt-8 text-center text-xs text-slate-400">
        No account?{" "}
        <Button
          variant="link"
          className="h-auto p-0 text-xs font-bold text-white hover:underline cursor-pointer"
          onClick={onSignUp}
          disabled={formState.isLoading}
        >
          Create one
        </Button>
      </p>
    </motion.div>
  );
}

// --------------------------------
// Sign Up Component
// --------------------------------

interface AuthSignUpProps {
  onSignIn: () => void;
}

function AuthSignUp({ onSignIn }: AuthSignUpProps) {
  const [formState, setFormState] = React.useState<FormState>({
    isLoading: false,
    error: null,
    showPassword: false,
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", terms: false },
  });

  const terms = watch("terms");

  const onSubmit = async () => {
    setFormState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setFormState((prev) => ({ ...prev, error: "Registrations are managed by your dairy admin." }));
    } catch {
      setFormState((prev) => ({ ...prev, error: "An unexpected error occurred" }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <motion.div
      data-slot="auth-sign-up"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="p-8"
    >
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">Create account</h1>
        <p className="mt-1.5 text-xs text-slate-400">Get started with your milk account</p>
      </div>

      <AuthError message={formState.error} />

      <AuthForm onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1.5 text-left">
          <Label htmlFor="name" className="text-xs font-semibold text-slate-300">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            disabled={formState.isLoading}
            className={cn(
              "bg-slate-900/90 border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus-visible:ring-emerald-500",
              errors.name && "border-red-500"
            )}
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5 text-left">
          <Label htmlFor="email" className="text-xs font-semibold text-slate-300">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={formState.isLoading}
            className={cn(
              "bg-slate-900/90 border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus-visible:ring-emerald-500",
              errors.email && "border-red-500"
            )}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5 text-left">
          <Label htmlFor="password" className="text-xs font-semibold text-slate-300">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={formState.showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={formState.isLoading}
              className={cn(
                "bg-slate-900/90 border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus-visible:ring-emerald-500 pr-10",
                errors.password && "border-red-500"
              )}
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full text-slate-400 hover:text-white hover:bg-transparent"
              onClick={() =>
                setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }))
              }
              disabled={formState.isLoading}
            >
              {formState.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
        </div>

        <div className="flex items-center space-x-2 text-left">
          <Checkbox
            id="terms"
            checked={terms}
            onCheckedChange={(checked) => setValue("terms", checked === true)}
            disabled={formState.isLoading}
          />
          <div className="space-y-1">
            <Label htmlFor="terms" className="text-xs text-slate-300">
              I agree to the terms
            </Label>
          </div>
        </div>
        {errors.terms && <p className="text-xs text-red-400">{errors.terms.message}</p>}

        <Button
          type="submit"
          className="w-full h-11 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs rounded-xl shadow-lg cursor-pointer"
          disabled={formState.isLoading}
        >
          {formState.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-slate-950" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </AuthForm>

      <AuthSeparator />
      <AuthSocialButtons isLoading={formState.isLoading} />

      <p className="mt-8 text-center text-xs text-slate-400">
        Have an account?{" "}
        <Button
          variant="link"
          className="h-auto p-0 text-xs font-bold text-white hover:underline cursor-pointer"
          onClick={onSignIn}
          disabled={formState.isLoading}
        >
          Sign in
        </Button>
      </p>
    </motion.div>
  );
}

// --------------------------------
// Forgot Password Component
// --------------------------------

interface AuthForgotPasswordProps {
  onSignIn: () => void;
  onSuccess: () => void;
}

function AuthForgotPassword({ onSignIn, onSuccess }: AuthForgotPasswordProps) {
  const [formState, setFormState] = React.useState<FormState>({
    isLoading: false,
    error: null,
    showPassword: false,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async () => {
    setFormState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onSuccess();
    } catch {
      setFormState((prev) => ({ ...prev, error: "An unexpected error occurred" }));
    } finally {
      setFormState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <motion.div
      data-slot="auth-forgot-password"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="p-8 relative"
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-4 text-slate-400 hover:text-white"
        onClick={onSignIn}
        disabled={formState.isLoading}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Back</span>
      </Button>

      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">Reset password</h1>
        <p className="mt-1.5 text-xs text-slate-400">
          Enter your email to receive a reset link
        </p>
      </div>

      <AuthError message={formState.error} />

      <AuthForm onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1.5 text-left">
          <Label htmlFor="email" className="text-xs font-semibold text-slate-300">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={formState.isLoading}
            className={cn(
              "bg-slate-900/90 border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus-visible:ring-emerald-500",
              errors.email && "border-red-500"
            )}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs rounded-xl shadow-lg cursor-pointer"
          disabled={formState.isLoading}
        >
          {formState.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-slate-950" />
              Sending...
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </AuthForm>

      <p className="mt-8 text-center text-xs text-slate-400">
        Remember your password?{" "}
        <Button
          variant="link"
          className="h-auto p-0 text-xs font-bold text-white hover:underline cursor-pointer"
          onClick={onSignIn}
          disabled={formState.isLoading}
        >
          Sign in
        </Button>
      </p>
    </motion.div>
  );
}

// --------------------------------
// Reset Success Component
// --------------------------------

interface AuthResetSuccessProps {
  onSignIn: () => void;
}

function AuthResetSuccess({ onSignIn }: AuthResetSuccessProps) {
  return (
    <motion.div
      data-slot="auth-reset-success"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col items-center p-8 text-center"
    >
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
        <MailCheck className="h-7 w-7 text-emerald-400" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-white">Check your email</h1>
      <p className="mt-1.5 text-xs text-slate-400">
        We sent a password reset link to your email.
      </p>

      <Button
        variant="outline"
        className="mt-6 w-full max-w-xs h-11 bg-slate-900/60 hover:bg-slate-800 text-white border-slate-700/80 rounded-xl font-bold text-xs cursor-pointer"
        onClick={onSignIn}
      >
        Back to sign in
      </Button>

      <p className="mt-6 text-[11px] text-slate-500">
        No email? Check spam or{" "}
        <Button variant="link" className="h-auto p-0 text-[11px] text-slate-300 hover:text-white">
          try another email
        </Button>
      </p>
    </motion.div>
  );
}

// --------------------------------
// Exports
// --------------------------------

export {
  Auth,
  AuthSignIn,
  AuthSignUp,
  AuthForgotPassword,
  AuthResetSuccess,
  AuthForm,
  AuthError,
  AuthSocialButtons,
  AuthSeparator,
};

