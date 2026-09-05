import { redirect } from "next/navigation";

/**
 * Root page — immediately redirects to /login.
 * Role-based routing after login is handled by the auth middleware.
 */
export default function RootPage() {
  redirect("/login");
}
