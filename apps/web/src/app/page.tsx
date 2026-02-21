import { redirect } from "next/navigation";

// Redirect root URL directly to the Congress Directory.
export default function HomePage() {
  redirect("/congresses");
}
