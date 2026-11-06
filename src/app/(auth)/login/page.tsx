"use client";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useState } from "react";
import toast from "react-hot-toast";

interface LoginValues {
  email: string;
  password: string;
}

type LoginErrors = Partial<Record<keyof LoginValues, string>>;

export default function LoginPage() {
  const [values, setValues] = useState<LoginValues>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;

    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const validate = () => {
    const newErrors: LoginErrors = {};

    // Validate the email field
    if (!values.email.trim()) {
      newErrors.email = "Email is required!";
    } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      newErrors.email = "Enter a valid email address";
    }

    // Validate the password field
    if (!values.password.trim()) {
      newErrors.password = "Password is required";
    } else if (values.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters!";
    }
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error(error.message as string);
        return;
      }
      toast.success("Login successful");
      setValues({ email: "", password: "" });
      router.replace("/chat");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm bg-card border border-border p-6 rounded-2xl">
        <div className="mb-8 space-y-2 text-center">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-zinc-400">Sign into your account</p>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-zinc-300"
            >
              Email
            </label>
            <input
              value={values.email}
              onChange={handleChange}
              name="email"
              type="email"
              id="email"
              placeholder="john.doe@example.com"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-violet-500 mt-2"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-zinc-300"
            >
              Password
            </label>
            <input
              value={values.password}
              onChange={handleChange}
              name="password"
              type="text"
              id="password"
              placeholder="********"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-violet-500 mt-2"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>
          <button
            disabled={loading}
            type="submit"
            className="w-full rounded-lg bg-violet-600 py-3 font-medium text-white transition hover:bg-violet-500 cursor-ponter"
          >
            {loading ? "Logging In..." : "Login"}
          </button>
          <p className="mt-6 text-center text-sm text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-violet-400 hover:text-violet-300"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
