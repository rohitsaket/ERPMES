"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Gem, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  identifier: z.string().min(2, "Identifier is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get("redirect_url") || searchParams?.get("callbackUrl") || "/dashboard";
  const authError = searchParams?.get("error");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const form = useForm<LoginFormValues>({
    resolver: (zodResolver as any)(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: data.identifier.trim().toLowerCase(),
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setServerError("Invalid credentials or account access denied.");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push(redirectUrl);
        router.refresh();
      }, 800);
    } catch {
      setServerError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  const staggerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#071412] p-4 font-sans text-[#F6F5F2] selection:bg-[#82E7D8]/30">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex w-full max-w-[1400px] flex-col overflow-hidden rounded-[28px] border border-white/5 bg-[#0C1715] shadow-2xl shadow-black/50 lg:h-[800px] lg:flex-row"
      >
        {/* Left Panel: Brand Storytelling */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#052F2C] via-[#0A4742] to-[#0E5A54] p-8 lg:w-1/2 lg:p-16">
          {/* Decorative Grid / Lines */}
          <div className="pointer-events-none absolute inset-0 opacity-20">
            <svg className="absolute h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-[#82E7D8]" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            <div className="absolute right-0 top-1/2 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/3 rotate-45 border border-[#D6A34A]/20" />
            <div className="absolute right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 translate-x-1/4 rotate-45 border border-[#D6A34A]/10" />
            <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#82E7D8] opacity-5 blur-[120px]" />
            <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-[#0B5A52] opacity-20 blur-[100px]" />
          </div>

          <motion.div variants={itemVariants} className="relative z-10 flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm">
              <Gem className="h-5 w-5 text-[#D6A34A]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white">DIAMONDFLOW</span>
              <span className="mt-0.5 rounded-full border border-[#D6A34A]/30 bg-[#D6A34A]/10 px-2 py-0.5 text-[9px] font-bold tracking-widest text-[#D6A34A] w-fit">
                MANUFACTURING OS
              </span>
            </div>
          </motion.div>

          <motion.div variants={staggerVariants} initial="hidden" animate="visible" className="relative z-10 mt-16 lg:mt-0">
            <motion.h1 variants={itemVariants} className="text-[3.5rem] font-bold leading-[1.05] tracking-tight text-white lg:text-[4.5rem]">
              Every<br />stone.<br />Every<br />movement.
            </motion.h1>
            <motion.h2 variants={itemVariants} className="mt-2 text-[3.5rem] font-bold leading-[1.05] tracking-tight text-[#D6A34A] lg:text-[4.5rem]">
              One<br />source of<br />truth.
            </motion.h2>
            <motion.p variants={itemVariants} className="mt-8 max-w-md text-base leading-relaxed text-[#AEB7B2]">
              Protected enterprise workspace &bull; Live factory intelligence
            </motion.p>
          </motion.div>
        </div>

        {/* Right Panel: Authentication Form */}
        <div className="flex flex-col justify-center bg-[#0C1715] p-8 lg:w-1/2 lg:p-16 xl:px-24">
          <motion.div variants={staggerVariants} initial="hidden" animate="visible" className="w-full max-w-[420px] mx-auto">
            <motion.div variants={itemVariants} className="mb-10">
              <span className="text-xs font-bold tracking-[0.2em] text-[#D6A34A] uppercase">Secure Access</span>
              <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white font-serif">Welcome back</h2>
              <p className="mt-2 text-sm text-[#AEB7B2]">
                Sign in to continue to your factory and business workspace.
              </p>
            </motion.div>

            {(authError || serverError) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 p-4 text-sm text-[#EF4444]"
              >
                {serverError || "Authentication failed. Please check your credentials."}
              </motion.div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <motion.div variants={itemVariants} className="space-y-4">
                {/* Identifier Input */}
                <div className="relative">
                  <div className="relative group">
                    <input
                      {...form.register("identifier")}
                      id="identifier"
                      type="text"
                      className="peer w-full h-[60px] rounded-xl border border-[#AEB7B2]/20 bg-[#071412] px-4 pt-5 pb-1 text-[#F6F5F2] placeholder-transparent outline-none transition-all focus:border-[#82E7D8]/50 focus:bg-[#0E1A17] focus:ring-1 focus:ring-[#82E7D8]/50 disabled:opacity-50"
                      placeholder="Email, username, mobile, or employee code"
                      disabled={isLoading || isSuccess}
                      autoFocus
                    />
                    <label
                      htmlFor="identifier"
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#AEB7B2] transition-all peer-focus:top-[14px] peer-focus:text-[11px] peer-focus:text-[#82E7D8] peer-focus:-translate-y-0 peer-[:not(:placeholder-shown)]:top-[14px] peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:-translate-y-0"
                    >
                      Email, username, mobile, or employee code
                    </label>
                  </div>
                  {form.formState.errors.identifier && (
                    <p className="mt-1.5 text-xs text-[#EF4444]">{form.formState.errors.identifier.message}</p>
                  )}
                </div>

                {/* Password Input */}
                <div className="relative">
                  <div className="relative group">
                    <input
                      {...form.register("password")}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="peer w-full h-[60px] rounded-xl border border-[#AEB7B2]/20 bg-[#071412] px-4 pt-5 pb-1 pr-12 text-[#F6F5F2] placeholder-transparent outline-none transition-all focus:border-[#82E7D8]/50 focus:bg-[#0E1A17] focus:ring-1 focus:ring-[#82E7D8]/50 disabled:opacity-50"
                      placeholder="Password"
                      disabled={isLoading || isSuccess}
                    />
                    <label
                      htmlFor="password"
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#AEB7B2] transition-all peer-focus:top-[14px] peer-focus:text-[11px] peer-focus:text-[#82E7D8] peer-focus:-translate-y-0 peer-[:not(:placeholder-shown)]:top-[14px] peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:-translate-y-0"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#AEB7B2] transition-colors hover:text-white"
                      tabIndex={-1}
                      disabled={isLoading || isSuccess}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="mt-1.5 text-xs text-[#EF4444]">{form.formState.errors.password.message}</p>
                  )}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center justify-between mt-6">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border border-[#AEB7B2]/30 bg-[#071412] transition-colors group-hover:border-[#82E7D8]/50">
                    <input
                      {...form.register("rememberMe")}
                      type="checkbox"
                      className="peer absolute h-full w-full cursor-pointer opacity-0"
                      disabled={isLoading || isSuccess}
                    />
                    <svg
                      className="pointer-events-none h-3 w-3 text-[#0C1715] opacity-0 transition-opacity peer-checked:opacity-100 z-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <div className="absolute inset-0 rounded-[3px] bg-[#82E7D8] opacity-0 transition-opacity peer-checked:opacity-100" />
                  </div>
                  <span className="text-sm font-medium text-[#AEB7B2] transition-colors group-hover:text-white">
                    Remember this device
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-[#82E7D8] underline-offset-4 transition-all hover:underline"
                >
                  Forgot password?
                </Link>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: (isLoading || isSuccess) ? 1 : 1.015 }}
                  whileTap={{ scale: (isLoading || isSuccess) ? 1 : 0.985 }}
                  disabled={isLoading || isSuccess}
                  className="relative flex h-14 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#82E7D8] to-[#60D3C1] text-[15px] font-semibold text-[#052F2C] shadow-[0_4px_20px_-4px_rgba(130,231,216,0.3)] transition-all hover:shadow-[0_8px_25px_-5px_rgba(130,231,216,0.4)] disabled:opacity-80"
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center"
                      >
                        <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#052F2C]" />
                        Authenticating...
                      </motion.div>
                    ) : isSuccess ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center text-[#052F2C]"
                      >
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Success
                      </motion.div>
                    ) : (
                      <motion.span
                        key="default"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        Enter workspace
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            </form>

            <motion.div variants={itemVariants} className="mt-8 text-center">
              <Link
                href="/sign-up"
                className="text-sm font-medium text-[#AEB7B2] transition-colors hover:text-white"
              >
                Request a new workspace account
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
