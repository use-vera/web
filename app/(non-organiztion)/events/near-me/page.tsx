import { redirect } from "next/navigation";

// "Near me" is now a section on the main events page instead of a
// standalone route — this keeps old bookmarks/links working rather than
// 404ing.
export default function NearMePage() {
  redirect("/events");
}
