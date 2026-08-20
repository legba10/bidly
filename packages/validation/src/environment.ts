import { z } from 'zod';

const nodeEnvironmentSchema = z.enum(['development', 'test', 'production']).default('development');
const logLevelSchema = z
  .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
  .default('info');

export const apiEnvironmentSchema = z.object({
  API_HOST: z.string().min(1).default('127.0.0.1'),
  API_PORT: z.coerce.number().int().min(1).max(65_535).default(3001),
  LOG_LEVEL: logLevelSchema,
  NODE_ENV: nodeEnvironmentSchema,
});

export const webEnvironmentSchema = z.object({
  NEXT_PUBLIC_API_ORIGIN: z.url().default('http://127.0.0.1:3001'),
  NODE_ENV: nodeEnvironmentSchema,
});

export type ApiEnvironment = z.infer<typeof apiEnvironmentSchema>;
export type WebEnvironment = z.infer<typeof webEnvironmentSchema>;

export function parseApiEnvironment(input: NodeJS.ProcessEnv): ApiEnvironment {
  return apiEnvironmentSchema.parse(input);
}

export function parseWebEnvironment(input: NodeJS.ProcessEnv): WebEnvironment {
  return webEnvironmentSchema.parse(input);
}
