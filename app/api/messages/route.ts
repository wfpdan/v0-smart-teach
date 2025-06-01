import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const threadId = searchParams.get("thread_id")

    if (!threadId) {
      return NextResponse.json({ success: false, error: "Thread ID required" }, { status: 400 })
    }

    // Always return mock data in preview environment
    console.log("Using mock messages for preview environment")
    const mockMessages = [
      {
        id: "1",
        thread_id: threadId,
        sender: "teacher",
        content: "Can you create a fun science experiment about volcanoes?",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "2",
        thread_id: threadId,
        sender: "ai",
        content: `Here's a perfect volcano experiment! 

**Baking Soda Volcano Experiment**

**Materials needed:**
- Baking soda (2 tablespoons)
- White vinegar (1/4 cup)
- Red food coloring
- Dish soap (few drops)
- Small plastic bottle
- Clay or playdough

**Instructions:**
1. Build a volcano shape around the bottle using clay
2. Mix baking soda with red food coloring in the bottle
3. Add a few drops of dish soap
4. Pour vinegar into the bottle and watch it erupt!

**Learning objectives:**
- Chemical reactions (acid + base)
- Volcanic formation
- Scientific observation skills

This hands-on experiment is perfect for visual learners and curious students!`,
        timestamp: new Date(Date.now() - 3000000).toISOString(),
      },
    ]

    return NextResponse.json({
      success: true,
      messages: mockMessages,
    })

    // The following code is commented out to prevent network errors in preview
    // In a production environment, you would uncomment this code
    /*
    const supabase = createSupabaseServiceClient()

    // If Supabase is not configured, return mock data
    if (!supabase) {
      console.log("Supabase not configured, returning mock messages")
      const mockMessages = [
        {
          id: "1",
          thread_id: threadId,
          sender: "teacher",
          content: "Can you create a fun science experiment about volcanoes?",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "2",
          thread_id: threadId,
          sender: "ai",
          content: `Here's a perfect volcano experiment! 

**Baking Soda Volcano Experiment**

**Materials needed:**
- Baking soda (2 tablespoons)
- White vinegar (1/4 cup)
- Red food coloring
- Dish soap (few drops)
- Small plastic bottle
- Clay or playdough

**Instructions:**
1. Build a volcano shape around the bottle using clay
2. Mix baking soda with red food coloring in the bottle
3. Add a few drops of dish soap
4. Pour vinegar into the bottle and watch it erupt!

**Learning objectives:**
- Chemical reactions (acid + base)
- Volcanic formation
- Scientific observation skills

This hands-on experiment is perfect for visual learners and curious students!`,
          timestamp: new Date(Date.now() - 3000000).toISOString(),
        },
      ]

      return NextResponse.json({
        success: true,
        messages: mockMessages,
      })
    }

    // TODO: Verify teacher has access to this thread

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("timestamp", { ascending: true })

    if (error) {
      console.error("Error fetching messages:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch messages" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      messages: data,
    })
    */
  } catch (error) {
    console.error("Error in messages API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
