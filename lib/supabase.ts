import { createClient } from "@supabase/supabase-js"

// Helper function to ensure URL has proper protocol
const normalizeSupabaseUrl = (url: string): string => {
  if (!url) return ""

  // If URL doesn't start with http:// or https://, add https://
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`
  }

  return url
}

// Create Supabase client with proper error handling
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase environment variables not configured")
    console.warn("Expected: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)")
    return null
  }

  try {
    const normalizedUrl = normalizeSupabaseUrl(supabaseUrl)

    // Validate URL format
    try {
      new URL(normalizedUrl)
    } catch (urlError) {
      console.error("Invalid Supabase URL format:", normalizedUrl)
      console.error("Expected format: https://your-project-id.supabase.co")
      return null
    }

    console.log("Initializing Supabase client with URL:", normalizedUrl)
    return createClient(normalizedUrl, supabaseKey)
  } catch (error) {
    console.error("Failed to create Supabase client:", error)
    return null
  }
}

// Create service role client for server-side operations
export const createSupabaseServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn("Supabase service role environment variables not configured")
    console.warn("Expected: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
    return null
  }

  try {
    const normalizedUrl = normalizeSupabaseUrl(supabaseUrl)

    // Validate URL format
    try {
      new URL(normalizedUrl)
    } catch (urlError) {
      console.error("Invalid Supabase URL format:", normalizedUrl)
      console.error("Expected format: https://your-project-id.supabase.co")
      return null
    }

    console.log("Initializing Supabase service client with URL:", normalizedUrl)
    return createClient(normalizedUrl, serviceRoleKey)
  } catch (error) {
    console.error("Failed to create Supabase service client:", error)
    return null
  }
}

// Export a default client instance
export const supabase = createSupabaseClient()
