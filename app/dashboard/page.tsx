import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "#fafafa",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "900px",
          margin: "0 auto 2rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", margin: 0, color: "#111" }}>
          Dashboard
        </h1>
        <Link
          href="/auth/logout"
          style={{
            padding: "0.5rem 1rem",
            fontSize: "0.9rem",
            color: "#666",
            textDecoration: "none",
          }}
        >
          Sign out
        </Link>
      </header>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <p style={{ color: "#333" }}>
          Signed in as{" "}
          <strong>{session.user.email ?? session.user.id}</strong>.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            marginTop: "1rem",
            color: "#333",
            textDecoration: "underline",
          }}
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
