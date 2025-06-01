import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const openaiKey = process.env.OPENAI_API_KEY
    const memberstackKey = process.env.MEMBERSTACK_WEBHOOK_SECRET

    // In preview environment, we don't actually test connections
    // to avoid network errors
    return NextResponse.json({
      supabase: false, // Always show as not configured in preview
      openai: !!openaiKey,
      memberstack: false, // Always show as not configured in preview
      environment: {
        supabase_url: !!supabaseUrl,
        supabase_key: !!supabaseKey,
        openai_key: !!openaiKey,
        memberstack_key: !!memberstackKey,
      },
      preview: true,
      message: "Using mock data in preview environment. Network connections disabled for stability.",
    })
  } catch (error) {
    console.error("Error checking environment status:", error)
    return NextResponse.json(
      {
        supabase: false,
        openai: false,
        memberstack: false,
        error: "Failed to check environment status",
        preview: true,
      },
      { status: 500 },
    )
  }
}
