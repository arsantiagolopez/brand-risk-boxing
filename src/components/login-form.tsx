import { useState } from "react";
import { z } from "zod";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useRouter } from "next/router";
import config from "@/config";
import { useFetch } from "@/lib/hooks/use-fetch";

// Define the form schema using Zod
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form data
    try {
      loginSchema.parse(formData);
      setError(null);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.issues[0].message);
      } else {
        setError("An unexpected error occurred.");
      }
      return;
    }

    const { error } = await useFetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (error) {
      return;
    }

    // Successful login
    router.push(config.auth.successRedirectUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <Button type="submit">Login</Button>
    </form>
  );
};

export { LoginForm };
