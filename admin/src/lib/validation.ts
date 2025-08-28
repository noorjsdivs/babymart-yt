import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "You have to enter a password" }),
});

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["admin", "user", "deliveryman"], {
    message: "Please select a valid role",
  }),
});

export const userSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .optional(),
  role: z.enum(["admin", "user", "deliveryman"], {
    message: "Please select a valid role",
  }),
  avatar: z.string().optional(),
});

export const brandSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  image: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.string().optional(),
  categoryType: z.enum(["Featured", "Hot Categories", "Top Categories"], {
    message: "Category type is required",
  }),
});

export const productSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  price: z.number().min(0, { message: "Price must be a positive number" }),
  discountPercentage: z.number().min(0).max(100).default(0),
  stock: z.number().min(0).default(0),
  category: z.string().min(1, { message: "Please select a category" }),
  brand: z.string().min(1, { message: "Please select a brand" }),
  image: z.string().min(1, { message: "Please upload an image" }),
});

export const bannerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  startFrom: z.number().min(0, "StartFrom must be a positive number"),
  image: z.string().min(1, "Image is required"),
  bannerType: z.string().min(1, "Type is required"),
});
