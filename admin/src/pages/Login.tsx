import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useAuthStore from "@/store/useAuthStore";
import { loginSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type FormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const form = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      await login(data);
      toast("Welcome to the dashboard");
      navigate("/dashboard");
    } catch (error) {
      console.log("Failed to login", error);
      toast("Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md px-4"
      >
        <Card className="w-full bg-white/95 backdrop-blur-sm shadow-xl rounded-xl border border-gray-200">
          <CardHeader className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CardTitle className="text-3xl font-bold text-gray-800">
                Admin Dashboard
              </CardTitle>
              <CardDescription className="text-gray-500">
                Enter your credentials to sign in
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Email
                      </FormLabel>
                      <FormControl>
                        <motion.div
                          whileFocus={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Input
                            placeholder="you@example.com"
                            type="email"
                            disabled={isLoading}
                            className="border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            {...field}
                          />
                        </motion.div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Password
                      </FormLabel>
                      <FormControl>
                        <motion.div
                          whileFocus={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Input
                            placeholder="••••••••"
                            type="password"
                            disabled={isLoading}
                            className="border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            {...field}
                          />
                        </motion.div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <LogIn size={16} />
                        Sign In
                      </span>
                    )}
                  </Button>
                </motion.div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-indigo-600 hover:text-indigo-800 hover:underline transition-all duration-200"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
