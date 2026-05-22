/**
 * Zod validation schemas — single source of truth for all form inputs.
 */
import { z } from 'zod';

// ── Auth ─────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-().]{7,20}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['farmer', 'manager', 'vet', 'staff']),
});

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const phoneSchema = z.object({
  phone: z.string().regex(/^\+?[\d\s\-().]{7,20}$/, 'Enter a valid phone number'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PhoneInput = z.infer<typeof phoneSchema>;

// ── Farm ─────────────────────────────────────────────────────────────────────

export const newFarmSchema = z.object({
  name: z.string().min(2, 'Farm name must be at least 2 characters').max(80, 'Name too long'),
  location: z.string().min(2, 'Location is required').max(120, 'Location too long'),
  capacity: z
    .string()
    .min(1, 'Capacity is required')
    .refine((v) => Number(v) > 0, 'Capacity must be a positive number'),
  livestockType: z.enum([
    'broiler',
    'layer',
    'breeder',
    'poultry_mixed',
    'cattle_beef',
    'cattle_dairy',
    'sheep',
    'goat',
    'pig',
    'horse',
    'fish',
    'mixed',
    'other',
  ]),
});

export type NewFarmInput = z.infer<typeof newFarmSchema>;

// ── House ────────────────────────────────────────────────────────────────────

export const newHouseSchema = z.object({
  farmId: z.string().min(1, 'Select a farm'),
  name: z.string().min(1, 'House name is required').max(60, 'Name too long'),
  capacity: z
    .string()
    .min(1, 'Capacity is required')
    .refine((v) => Number(v) > 0, 'Capacity must be a positive number'),
});

export type NewHouseInput = z.infer<typeof newHouseSchema>;
