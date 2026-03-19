import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../../services/api/authApi";
import styles from "../../../components/Auth.module.css";

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
      let message = "No account found with this email";
      if (err && typeof err === 'object' && 'response' in err) {
        const responseData = (err as any).response?.data;
        message = responseData?.message || message;
      }
      setError(message);
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
      let message = "Incorrect answer or failed to reset";
      if (err && typeof err === 'object' && 'response' in err) {
        const responseData = (err as any).response?.data;
        message = responseData?.message || message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <h1>Forgot Password</h1>
        {step === 1 ? (
          <form onSubmit={handleStep1} className={styles.form}>
            {error && <p className={styles.error}>{error}</p>}
            <p className={styles.textCenter} style={{ color: "#4a5568" }}>
              Enter your email to reset your password.
            </p>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={styles.input} />
            </label>
            <button type="submit" disabled={isLoading} className={styles.button}>{isLoading ? "Checking..." : "Continue"}</button>
          </form>
        ) : (
          <form onSubmit={handleStep2} className={styles.form}>
            {error && <p className={styles.error}>{error}</p>}
            <label>
              Secret question
              <input type="text" value={secretQuestion ?? ""} readOnly className={styles.input} style={{ opacity: 0.8, cursor: "not-allowed" }} />
            </label>
            <label>
              Your answer
              <input type="text" value={secretAnswer} onChange={(e) => setSecretAnswer(e.target.value)} required placeholder="Enter the answer you set" className={styles.input} />
            </label>
            <label>
              New password (min 8 characters)
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} className={styles.input} />
            </label>
            <label>
              Confirm new password
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} className={styles.input} />
            </label>
            <button type="submit" disabled={isLoading} className={styles.button}>{isLoading ? "Resetting..." : "Reset password"}</button>
            <button type="button" onClick={() => { setStep(1); setSecretQuestion(null); setSecretAnswer(""); setError(null); }} style={{ background: "transparent", color: "#4a5568", border: "none", cursor: "pointer" }}>
              Use a different email
            </button>
          </form>
        )}
        <p className={styles.textCenter} style={{ marginTop: "1rem" }}>
          Remember your password? <Link to="/login" className={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  );
}
