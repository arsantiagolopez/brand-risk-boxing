import { useState } from "react";
import { z } from "zod";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useRouter } from "next/router";
import { useToast } from "./ui/use-toast";
import { Separator } from "./ui/separator";
import Link from "next/link";
import { socialProviders } from "@/lib/constants";
import { capitalize } from "@/lib/utils/string-helpers";
import config from "@/config";
import { useFetch } from "@/lib/hooks/use-fetch";

// Define the form schema using Zod
const signupSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // This tells Zod which field to attach the error to
  });

type SignupFormData = z.infer<typeof signupSchema>;

const SignupForm = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    name: "Admin",
    username: "admin",
    email: "admin@admin.com",
    password: "password",
    confirmPassword: "password",
  });
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form data
    try {
      signupSchema.parse(formData);
      setError(null);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.issues[0].message);
      } else {
        setError("An unexpected error occurred.");
      }
      return;
    }

    const { error } = await useFetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
      redirect: "follow",
    });

    if (error) {
      return;
    }

    // Successful signup
    toast({
      title: `You're all set, ${formData.name}!`,
    });

    router.push(config.auth.successRedirectUrl);
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div>
          <Input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>
        <div>
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div>
          <Input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}

        <Button type="submit" className="justify-start">
          Sign Up
        </Button>
      </form>

      <Separator />

      <div className="flex gap-4">
        {socialProviders.map((provider) => (
          <Link key={provider} href={`/api/auth/${provider}`}>
            <Button>Sign up with {capitalize(provider)}</Button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export { SignupForm };
