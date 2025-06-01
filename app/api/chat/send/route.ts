import type { NextRequest } from "next/server"

// Simple streaming response helper
function streamResponse(callback: (write: (chunk: string) => void) => Promise<void>) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const write = (chunk: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
      }

      try {
        await callback(write)
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
      } catch (error) {
        console.error("Stream error:", error)
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" })}\n\n`,
          ),
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.log("OpenAI API key not configured, using mock responses")
    }

    const body = await request.json()
    console.log("Received request body:", body)

    const { thread_id, message, student_context, teacher_id } = body

    // Detailed validation with specific error messages
    if (!message) {
      console.error("Missing field: message")
      return new Response(JSON.stringify({ success: false, error: "Missing required field: message" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!student_context) {
      console.error("Missing field: student_context")
      return new Response(JSON.stringify({ success: false, error: "Missing required field: student_context" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!teacher_id) {
      console.error("Missing field: teacher_id")
      return new Response(JSON.stringify({ success: false, error: "Missing required field: teacher_id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!thread_id) {
      console.error("Missing field: thread_id")
      return new Response(JSON.stringify({ success: false, error: "Missing required field: thread_id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Validate student_context structure
    if (!student_context.name || !student_context.grade || !student_context.tags) {
      console.error("Invalid student_context structure:", student_context)
      return new Response(
        JSON.stringify({ success: false, error: "Invalid student_context: missing name, grade, or tags" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    console.log("All required fields present, processing chat request for thread:", thread_id)

    // Get curriculum context
    const curriculumContext = await getCurriculumContext(message, student_context)

    // Return streaming response
    return streamResponse(async (write) => {
      // Try to use OpenAI API if configured
      if (process.env.OPENAI_API_KEY) {
        try {
          const systemPrompt = `You are an expert AI teaching assistant helping teachers create personalized lesson plans and educational content.

Student Profile:
- Name: ${student_context.name}
- Grade: ${student_context.grade}
- Learning characteristics: ${student_context.tags.join(", ")}

${curriculumContext ? `Relevant Curriculum Resources:\n${curriculumContext}\n` : ""}

Guidelines:
- Create engaging, age-appropriate content for ${student_context.grade} level
- Consider the student's learning style and interests: ${student_context.tags.join(", ")}
- Provide practical, actionable lesson plans and activities
- Include learning objectives and assessment suggestions when relevant
- Use clear formatting with headers, bullet points, and step-by-step instructions
- Be encouraging and supportive in your tone`

          console.log("Calling OpenAI API with streaming...")

          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: "gpt-4o",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message },
              ],
              max_tokens: 1500,
              temperature: 0.7,
              stream: true,
            }),
          })

          if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`)
          }

          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error("Failed to get response reader")
          }

          const decoder = new TextDecoder()
          let buffer = ""

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split("\n")
            buffer = lines.pop() || ""

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                if (data === "[DONE]") {
                  return
                }

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content
                  if (content) {
                    write(content)
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error("OpenAI API error:", error)
          // Fall back to mock streaming response
          await streamMockResponse(write, message, student_context)
        }
      } else {
        // Use mock streaming response if OpenAI is not configured
        await streamMockResponse(write, message, student_context)
      }
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error. Please try again.",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

// Stream a mock response for development/testing
async function streamMockResponse(write: (chunk: string) => void, message: string, studentContext: any) {
  const { name, grade, tags } = studentContext

  let mockResponse = ""

  if (message.toLowerCase().includes("science") || message.toLowerCase().includes("experiment")) {
    mockResponse = `**Science Lesson Plan for ${name} (${grade})**

Based on ${name}'s learning characteristics (${tags.join(", ")}) here's a hands-on science activity:

**Volcano Eruption Experiment**

**Materials:**
- Baking soda (2 tablespoons)
- White vinegar (1/4 cup)
- Red food coloring
- Small plastic bottle
- Clay or playdough

**Instructions:**
1. Build a volcano shape around the bottle using clay
2. Mix baking soda with red food coloring in the bottle
3. Pour vinegar and watch the eruption!

**Learning Objectives:**
- Understanding chemical reactions
- Observation and prediction skills
- Scientific method application

This activity is perfect for ${name}'s learning style and will engage their curiosity about science!

*Note: This is a sample response. Configure your OpenAI API key for AI-generated content.*`
  } else if (message.toLowerCase().includes("math")) {
    mockResponse = `**Math Activity for ${name} (${grade})**

Considering ${name}'s learning characteristics (${tags.join(", ")}) here's an engaging math lesson:

**Interactive Multiplication Games**

**Activity 1: Multiplication Arrays**
- Use physical objects (blocks, beans) to create arrays
- Visual representation helps understanding
- Start with 2x2, progress to larger arrays

**Activity 2: Skip Counting Songs**
- Create rhythmic patterns for times tables
- Use movement and music for memorization
- Perfect for kinesthetic learners

**Assessment:**
- Quick verbal quizzes
- Array drawing exercises
- Real-world problem solving

This approach matches ${name}'s learning style and makes math fun and accessible!

*Note: This is a sample response. Configure your OpenAI API key for AI-generated content.*`
  } else {
    mockResponse = `**Personalized Learning Plan for ${name} (${grade})**

Based on ${name}'s learning characteristics (${tags.join(", ")}) here are some tailored recommendations:

**Teaching Strategies:**
- Use hands-on activities and manipulatives
- Incorporate visual aids and demonstrations
- Break complex concepts into smaller steps
- Provide plenty of practice opportunities

**Activity Ideas:**
- Interactive games and puzzles
- Group work and peer collaboration
- Real-world applications
- Creative projects and presentations

**Assessment Methods:**
- Portfolio-based assessment
- Verbal explanations
- Practical demonstrations
- Self-reflection activities

This approach will help ${name} succeed by matching their unique learning style!

*Note: This is a sample response. Configure your OpenAI API key for AI-generated content.*`
  }

  // Stream the response character by character for a more natural effect
  const characters = mockResponse.split("")
  for (let i = 0; i < characters.length; i++) {
    write(characters[i])
    // Add a small delay to simulate typing
    // Use a smaller delay for a faster response
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
}

// Mock function for curriculum context
async function getCurriculumContext(message: string, studentContext: any): Promise<string> {
  try {
    if (message.toLowerCase().includes("science") || message.toLowerCase().includes("experiment")) {
      return `Relevant Science Curriculum:
- Hands-on experiments promote better understanding in elementary students
- Visual demonstrations are effective for kinesthetic learners
- Safety protocols should always be emphasized in science activities
- Connect experiments to real-world applications to increase engagement`
    }

    if (message.toLowerCase().includes("math")) {
      return `Relevant Math Curriculum:
- Use manipulatives and visual aids for concrete understanding
- Break complex problems into smaller, manageable steps
- Incorporate games and interactive activities to make math fun
- Connect math concepts to everyday situations and student interests`
    }

    return ""
  } catch (error) {
    console.error("Error getting curriculum context:", error)
    return ""
  }
}
