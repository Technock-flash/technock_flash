import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppSelector } from "../../../core/hooks/useAppSelector";
import { useAppDispatch } from "../../../core/hooks/useAppDispatch";
import { register } from "../../../core/auth/authSlice";
import { authApi, type SecretQuestion } from "../../../services/api/authApi";
import { categoryApi, type Category } from "../../../services/api/categoryApi";
import styles from "../../../components/Auth.module.css";

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((s) => s.auth);

  const [secretQuestions, setSecretQuestions] = useState<SecretQuestion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    firstName: "",
    surname: "",
    nationalId: "",
    phoneNumber: "",
    email: "",
    password: "",
    vendorName: "",
    vendorDescription: "",
    preferredCategoryIds: [] as string[],
    secretQuestionId: "",
    secretAnswer: "",
  });

  useEffect(() => {
    authApi.getSecretQuestions().then(setSecretQuestions);
    categoryApi.list().then(setCategories);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(register({
      ...form,
      vendorDescription: form.vendorDescription || undefined,
      preferredCategoryIds:
        form.preferredCategoryIds.length > 0 ? form.preferredCategoryIds : undefined,
    }));
    if (register.fulfilled.match(result)) {
      navigate("/");
    }
  };

  const toggleCategory = (id: string) => {
    setForm((prev) => ({
      ...prev,
      preferredCategoryIds: prev.preferredCategoryIds.includes(id)
        ? prev.preferredCategoryIds.filter((c) => c !== id)
        : [...prev.preferredCategoryIds, id],
    }));
  };

  const flatCategories = categories.flatMap((c) =>
    c.children ? [c, ...c.children] : [c]
  );

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <h1>Register as Vendor</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <p className={styles.error}>{String(error)}</p>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <label>
            First name
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              required
              className={styles.input}
            />
          </label>
          <label>
            Surname
            <input
              type="text"
              value={form.surname}
              onChange={(e) => setForm((p) => ({ ...p, surname: e.target.value }))}
              required
              className={styles.input}
            />
          </label>
        </div>
        <label>
          National ID
          <input
            type="text"
            inputMode="numeric"
            value={form.nationalId}
            onChange={(e) => setForm((p) => ({ ...p, nationalId: e.target.value }))}
            required
            className={styles.input}
          />
        </label>
        <label>
          Phone number
          <input
            type="tel"
            value={form.phoneNumber}
            onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
            required
            className={styles.input}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            required
            className={styles.input}
          />
        </label>
        <label>
          Password (min 8 characters)
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            required
            minLength={8}
            className={styles.input}
          />
        </label>

        <hr style={{ borderColor: "#cbd5e0" }} />
        <h3 style={{ margin: 0, fontSize: "1rem" }}>Vendor details</h3>
        <label>
          Business name
          <input
            type="text"
            value={form.vendorName}
            onChange={(e) => setForm((p) => ({ ...p, vendorName: e.target.value }))}
            required
            className={styles.input}
          />
        </label>
        <label>
          Business description (optional)
          <textarea
            value={form.vendorDescription}
            onChange={(e) => setForm((p) => ({ ...p, vendorDescription: e.target.value }))}
            rows={3}
            className={styles.input}
          />
        </label>
        <label>
          Product categories you want to sell (optional, can be changed later)
          <div
            style={{
              marginTop: "0.25rem",
              maxHeight: 120,
              overflowY: "auto",
              padding: "0.5rem",
              background: "rgba(255, 255, 255, 0.5)",
              borderRadius: 4,
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            {flatCategories.map((c) => (
              <label
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.preferredCategoryIds.includes(c.id)}
                  onChange={() => toggleCategory(c.id)}
                />
                {c.name}
              </label>
            ))}
          </div>
        </label>

        <hr style={{ borderColor: "#cbd5e0" }} />
        <h3 style={{ margin: 0, fontSize: "1rem" }}>Security (for password recovery)</h3>
        <label>
          Secret question
          <select
            value={form.secretQuestionId}
            onChange={(e) =>
              setForm((p) => ({ ...p, secretQuestionId: e.target.value }))
            }
            required
            className={styles.select}
          >
            <option value="">Select a question</option>
            {secretQuestions.map((q) => (
              <option key={q.id} value={q.id}>
                {q.question}
              </option>
            ))}
          </select>
        </label>
        <label>
          Secret answer
          <input
            type="text"
            value={form.secretAnswer}
            onChange={(e) => setForm((p) => ({ ...p, secretAnswer: e.target.value }))}
            required
            placeholder="Used to recover your password if forgotten"
            className={styles.input}
          />
        </label>

          <button type="submit" disabled={isLoading} className={styles.button}>
            {isLoading ? "Creating account..." : "Register"}
          </button>
          <p className={styles.textCenter}>
            Already have an account? <Link to="/login" className={styles.link}>Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
