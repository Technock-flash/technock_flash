import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../../services/api/authApi";
import { PageContainer } from "../../../shared/ui/PageContainer";

const inputStyle = {
  display: "block",
  width: "100%",
  marginTop: "0.25rem",
  padding: "0.5rem 0.75rem",
  background: "#2a2a2a",
  border: "1px solid #444",
  borderRadius: 4,
  color: "#fff",
} as const;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [secretQuestion, setSecretQuestion] = useState<string | null>(null);
  const [secretAnswer, setSecretAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const { secretQuestion: q } = await authApi.forgotPassword(email);
      setSecretQuestion(q);
      setStep(2);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error ??
            "No account found with this email"
          : "No account found with this email";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setIsLoading(true);
    try {
      await authApi.resetPassword(email, secretAnswer, newPassword);
      navigate("/login", { replace: true, state: { message: "Password reset. You can now sign in." } });
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error ??
            "Incorrect answer or failed to reset"
          : "Incorrect answer or failed to reset";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer title="Forgot password">
      {step === 1 ? (
        <form onSubmit={handleStep1} style={{ maxWidth: 400, display: "flex", flexDirection: "column", gap: "1rem" }}>
          {error && <p style={{ color: "#e74c3c", margin: 0 }}>{error}</p>}
          <p style={{ color: "#888", margin: 0 }}>
            Enter your email. We will show your secret question so you can reset your password.
          </p>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          </label>
          <button type="submit" disabled={isLoading}>{isLoading ? "Checking..." : "Continue"}</button>
        </form>
      ) : (
        <form onSubmit={handleStep2} style={{ maxWidth: 400, display: "flex", flexDirection: "column", gap: "1rem" }}>
          {error && <p style={{ color: "#e74c3c", margin: 0 }}>{error}</p>}
          <label>
            Secret question
            <input type="text" value={secretQuestion ?? ""} readOnly style={{ ...inputStyle, opacity: 0.8, cursor: "not-allowed" }} />
          </label>
          <label>
            Your answer
            <input type="text" value={secretAnswer} onChange={(e) => setSecretAnswer(e.target.value)} required placeholder="Enter the answer you set during registration" style={inputStyle} />
          </label>
          <label>
            New password (min 8 characters)
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} style={inputStyle} />
          </label>
          <label>
            Confirm new password
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} style={inputStyle} />
          </label>
          <button type="submit" disabled={isLoading}>{isLoading ? "Resetting..." : "Reset password"}</button>
          <button type="button" onClick={() => { setStep(1); setSecretQuestion(null); setSecretAnswer(""); setError(null); }} style={{ background: "transparent", color: "#888" }}>
            Use a different email
          </button>
        </form>
      )}
      <p style={{ marginTop: "1rem", color: "#888" }}>Remember your password? <Link to="/login">Login</Link></p>
    </PageContainer>
  );
}
