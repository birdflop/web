import { z } from '@builder.io/qwik-city';

export const serverSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name must be at most 20 characters'),
  description: z.string().min(3, 'Description must be at least 3 characters').max(1000, 'Description must be at most 1000 characters'),
  ip: z.string().max(100, 'IP must be at most 100 characters'),
  port: z.number().min(1, 'Port must be at least 1').max(65535, 'Port must be at most 65535'),
  votifierIp: z.string().max(100, 'Votifier IP must be at most 100 characters'),
  votifierPort: z.number().min(1, 'Votifier Port must be at least 1').max(65535, 'Votifier Port must be at most 65535'),
  website: z.string().max(100, 'Website must be at most 100 characters'),
  banner: z.string().max(100, 'Banner must be at most 100 characters'),
  version: z.string().max(100, 'Version must be at most 100 characters'),
  tags: z.string().max(100, 'Tags must be at most 100 characters'),
});