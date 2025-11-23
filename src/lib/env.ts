// Environment variable validation
const requiredEnvVars = [
  'DATABASE_URL',
  'OPENROUTER_API_KEY',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
] as const

const optionalEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
] as const

export function validateEnv() {
  const missing = requiredEnvVars.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    )
  }

  // Validate URL format
  try {
    new URL(process.env.NEXTAUTH_URL!)
  } catch {
    throw new Error('NEXTAUTH_URL must be a valid URL')
  }

  // Log warnings for optional vars
  const missingOptional = optionalEnvVars.filter(key => !process.env[key])
  if (missingOptional.length > 0) {
    console.warn(`Warning: Missing optional environment variables: ${missingOptional.join(', ')}`)
  }
}

// Export types for better TypeScript support
export type EnvVar = typeof requiredEnvVars[number] | typeof optionalEnvVars[number]
