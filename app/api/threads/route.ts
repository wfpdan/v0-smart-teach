import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get("teacher_id")

    if (!teacherId) {
      return NextResponse.json({ success: false, error: "Teacher ID required" }, { status: 400 })
    }

    // Always return mock data in preview environment
    console.log("Using mock threads for preview environment")
    const mockThreads = [
      {
        id: "1",
        teacher_id: teacherId,
        student_name: "Alex Johnson",
        grade: "5th Grade",
        tags: ["Science", "Curious", "Visual Learner"],
        created_at: new Date().toISOString(),
        last_message: "Can you create a fun science experiment about volcanoes?",
      },
      {
        id: "2",
        teacher_id: teacherId,
        student_name: "Emma Davis",
        grade: "3rd Grade",
        tags: ["Math", "Struggling", "Hands-on"],
        created_at: new Date().toISOString(),
        last_message: "I need help with multiplication tables",
      },
    ]

    return NextResponse.json({
      success: true,
      threads: mockThreads,
    })

    // The following code is commented out to prevent network errors in preview
    // In a production environment, you would uncomment this code
    /*
    const supabase = createSupabaseServiceClient()

    // If Supabase is not configured, return mock data
    if (!supabase) {
      console.log("Supabase not configured, returning mock threads")
      const mockThreads = [
        {
          id: "1",
          teacher_id: teacherId,
          student_name: "Alex Johnson",
          grade: "5th Grade",
          tags: ["Science", "Curious", "Visual Learner"],
          created_at: new Date().toISOString(),
          last_message: "Can you create a fun science experiment about volcanoes?",
        },
        {
          id: "2",
          teacher_id: teacherId,
          student_name: "Emma Davis",
          grade: "3rd Grade",
          tags: ["Math", "Struggling", "Hands-on"],
          created_at: new Date().toISOString(),
          last_message: "I need help with multiplication tables",
        },
      ]

      return NextResponse.json({
        success: true,
        threads: mockThreads,
      })
    }

    // TODO: Verify teacher authentication

    const { data, error } = await supabase
      .from("threads")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching threads:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch threads" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      threads: data,
    })
    */
  } catch (error) {
    console.error("Error in threads API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
