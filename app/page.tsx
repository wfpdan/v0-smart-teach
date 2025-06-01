import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect to the main chat application
  redirect("/chat")
}
