import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature from Memberstack
    const signature = request.headers.get("x-memberstack-signature")
    const webhookSecret = process.env.MEMBERSTACK_WEBHOOK_SECRET

    // TODO: Implement signature verification
    // if (!verifyWebhookSignature(signature, webhookSecret, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    const payload = await request.json()
    const { type, data } = payload

    switch (type) {
      case "member.created":
      case "member.updated":
        await syncMemberToSupabase(data)
        break
      case "member.deleted":
        await deleteMemberFromSupabase(data.id)
        break
      default:
        console.log("Unhandled webhook type:", type)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function syncMemberToSupabase(memberData: any) {
  const { error } = await supabase.from("users").upsert({
    memberstack_id: memberData.id,
    email: memberData.email,
    name: memberData.customFields?.name || memberData.email,
    role: "teacher",
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Error syncing member to Supabase:", error)
    throw error
  }
}

async function deleteMemberFromSupabase(memberstackId: string) {
  const { error } = await supabase.from("users").delete().eq("memberstack_id", memberstackId)

  if (error) {
    console.error("Error deleting member from Supabase:", error)
    throw error
  }
}
