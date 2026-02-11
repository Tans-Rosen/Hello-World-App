import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  oauth_failed: "Could not start sign-in. Please try again.",
  oauth_no_url: "Sign-in could not be started. Please try again.",
  missing_code: "Login flow invalid or expired. Please try again.",
  exchange_failed: "Sign-in failed. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = error ? ERROR_MESSAGES[error] ?? "Something went wrong." : null;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "#fafafa",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "360px",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#111" }}>
          Sign in
        </h1>
        {message && (
          <p
            style={{
              color: "#c00",
              fontSize: "0.9rem",
              marginBottom: "1rem",
            }}
          >
            {message}
          </p>
        )}
        <Link
          href="/auth/google"
          style={{
            display: "inline-block",
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            fontWeight: 600,
            color: "#fff",
            backgroundColor: "#333",
            borderRadius: "8px",
            textDecoration: "none",
          }}
        >
          Continue with Google
        </Link>
      </div>
    </main>
  );
}
