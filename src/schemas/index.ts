import { ethers } from "ethers";
import { z } from "zod";

export const addOwnerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.email("Invalid email address"),
  address: z
    .string()
    .min(1, "Wallet address is required")
    .refine((val) => ethers.isAddress(val), {
      message: "Invalid wallet address",
    }),
});

export const submitTransSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().positive("Amount must be greater than zero"),
  address: z
    .string()
    .min(1, "Wallet address is required")
    .refine((val) => ethers.isAddress(val), {
      message: "Invalid wallet address",
    }),
});

