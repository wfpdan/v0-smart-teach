export interface MemberstackUser {
  id: string
  email: string
  customFields?: {
    name?: string
    [key: string]: any
  }
  planConnections?: Array<{
    planId: string
    status: string
  }>
}

export interface TeacherProfile {
  id: string
  memberstack_id: string
  email: string
  name: string
  role: string
  created_at: string
  updated_at: string
}

// Initialize Memberstack (this would normally be done with their SDK)
export const initMemberstack = () => {
  // In a real implementation, you would initialize Memberstack here
  // For now, we'll simulate the authentication flow
  console.log("Memberstack initialized")
}

// Get current user from Memberstack
export const getCurrentMemberstackUser = async (): Promise<MemberstackUser | null> => {
  try {
    // In a real implementation, this would call Memberstack's API
    // For demo purposes, we'll simulate a logged-in user
    const mockUser: MemberstackUser = {
      id: "ms_user_123",
      email: "teacher@example.com",
      customFields: {
        name: "Sarah Johnson",
      },
      planConnections: [
        {
          planId: "teacher_plan",
          status: "ACTIVE",
        },
      ],
    }
    return mockUser
  } catch (error) {
    console.error("Error getting Memberstack user:", error)
    return null
  }
}

// Create a mock teacher profile for fallback
const createMockTeacherProfile = (memberstackUser: MemberstackUser): TeacherProfile => {
  return {
    id: "teacher_123",
    memberstack_id: memberstackUser.id,
    email: memberstackUser.email,
    name: memberstackUser.customFields?.name || memberstackUser.email,
    role: "teacher",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

// Sync Memberstack user to Supabase
export const syncUserToSupabase = async (memberstackUser: MemberstackUser): Promise<TeacherProfile> => {
  // Always return mock data in preview environment to avoid network errors
  // In a real production environment, you would use the Supabase client
  console.log("Using mock teacher profile for preview environment")
  return createMockTeacherProfile(memberstackUser)

  // The following code is commented out to prevent network errors in preview
  // In a production environment, you would uncomment this code
  /*
  try {
    const supabase = createSupabaseClient()

    // If Supabase is not configured, return mock data
    if (!supabase) {
      console.log("Supabase not configured, using mock teacher profile")
      return createMockTeacherProfile(memberstackUser)
    }

    const { data, error } = await supabase
      .from("users")
      .upsert({
        memberstack_id: memberstackUser.id,
        email: memberstackUser.email,
        name: memberstackUser.customFields?.name || memberstackUser.email,
        role: "teacher",
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error syncing user to Supabase:", error)
      return createMockTeacherProfile(memberstackUser)
    }

    return data
  } catch (error) {
    console.error("Error in syncUserToSupabase:", error)
    return createMockTeacherProfile(memberstackUser)
  }
  */
}

// Check if user has active teacher subscription
export const hasActiveTeacherSubscription = (user: MemberstackUser): boolean => {
  return user.planConnections?.some((plan) => plan.planId === "teacher_plan" && plan.status === "ACTIVE") || false
}

// Get teacher profile from Supabase
export const getTeacherProfile = async (memberstackId: string): Promise<TeacherProfile> => {
  // Always return mock data in preview environment to avoid network errors
  return {
    id: "teacher_123",
    memberstack_id: memberstackId,
    email: "teacher@example.com",
    name: "Sarah Johnson",
    role: "teacher",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // The following code is commented out to prevent network errors in preview
  // In a production environment, you would uncomment this code
  /*
  try {
    const supabase = createSupabaseClient()

    // If Supabase is not configured, return mock data
    if (!supabase) {
      console.log("Supabase not configured, using mock teacher profile")
      return {
        id: "teacher_123",
        memberstack_id: memberstackId,
        email: "teacher@example.com",
        name: "Sarah Johnson",
        role: "teacher",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    const { data, error } = await supabase.from("users").select("*").eq("memberstack_id", memberstackId).single()

    if (error) {
      console.error("Error getting teacher profile:", error)
      return {
        id: "teacher_123",
        memberstack_id: memberstackId,
        email: "teacher@example.com",
        name: "Sarah Johnson",
        role: "teacher",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    return data
  } catch (error) {
    console.error("Error in getTeacherProfile:", error)
    return {
      id: "teacher_123",
      memberstack_id: memberstackId,
      email: "teacher@example.com",
      name: "Sarah Johnson",
      role: "teacher",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
  */
}
