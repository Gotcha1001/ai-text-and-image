"use client";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

interface RegisterValues {
  name: string;
  email: string;
  password: string;
}

type RegisterErrors = Partial<Record<keyof RegisterValues, string>>;

export default function RegisterPage() {
  const [values, setValues] = useState<RegisterValues>({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<RegisterErrors>({});
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
    const newErrors: RegisterErrors = {};

    // Validate the name field
    if (!values.name.trim()) {
      newErrors.name = "Name is required!";
    } else if (values.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters!";
    }

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

      const { error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error(error.message as string);
        return;
      }
      toast.success("Registration successful");
      setValues({ name: "", email: "", password: "" });
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
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-zinc-400">Sign up to get started</p>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="name" className="text-sm font-medium text-zinc-300">
              Full Name
            </label>
            <input
              value={values.name}
              onChange={handleChange}
              name="name"
              type="text"
              id="name"
              placeholder="John Doe"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-violet-500 mt-2"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
            <p>{values.name}</p>
          </div>
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
            {loading ? "Registering..." : "Register"}
          </button>
          <p className="mt-6 text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-violet-400 hover:text-violet-300"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
