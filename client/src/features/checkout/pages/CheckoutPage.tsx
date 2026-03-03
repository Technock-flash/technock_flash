import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppSelector } from "../../../core/hooks/useAppSelector";
import { selectCartItems, selectCartTotals } from "../../cart/cartSlice";
import { formatPrice } from "../../../shared/utils/format";
import { PageContainer } from "../../../shared/ui/PageContainer";
import styles from "./CheckoutPage.module.css";

type Step = 0 | 1 | 2;

export function CheckoutPage() {
  const [step, setStep] = useState<Step>(0);
  const [shipping, setShipping] = useState({ address: "", city: "", zip: "" });
  const items = useAppSelector(selectCartItems);
  const { subtotalCents, itemCount } = useAppSelector(selectCartTotals);
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <PageContainer title="Checkout">
        <p>Your cart is empty.</p>
        <Link to="/cart">Back to cart</Link>
      </PageContainer>
    );
  }

  const steps = [{ label: "Shipping" }, { label: "Payment" }, { label: "Confirm" }];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) setStep((s) => (s + 1) as Step);
    else {
      alert("Order placement is not yet implemented.");
      navigate("/orders");
    }
  };

  return (
    <PageContainer title="Checkout">
      <div className={styles.steps}>
        {steps.map((s, i) => (
          <span key={s.label} className={i <= step ? styles.active : ""}>
            {i + 1}. {s.label}
          </span>
        ))}
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        {step === 0 && (
          <div className={styles.section}>
            <h3>Shipping address</h3>
            <input
              placeholder="Address"
              value={shipping.address}
              onChange={(e) => setShipping((p) => ({ ...p, address: e.target.value }))}
              required
            />
            <input
              placeholder="City"
              value={shipping.city}
              onChange={(e) => setShipping((p) => ({ ...p, city: e.target.value }))}
              required
            />
            <input
              placeholder="ZIP"
              value={shipping.zip}
              onChange={(e) => setShipping((p) => ({ ...p, zip: e.target.value }))}
              required
            />
          </div>
        )}
        {step === 1 && (
          <div className={styles.section}>
            <h3>Payment</h3>
            <p style={{ color: "#888" }}>Payment integration coming soon.</p>
          </div>
        )}
        {step === 2 && (
          <div className={styles.section}>
            <h3>Order summary</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1rem" }}>
              {items.map((i) => (
                <li key={i.productId}>
                  {i.name} x {i.quantity} - {formatPrice(i.priceCents * i.quantity)}
                </li>
              ))}
            </ul>
            <p>Subtotal: {formatPrice(subtotalCents)} ({itemCount} items)</p>
          </div>
        )}
        <div className={styles.actions}>
          {step > 0 && (
            <button type="button" onClick={() => setStep((s) => (s - 1) as Step)}>
              Back
            </button>
          )}
          <button type="submit">{step < 2 ? "Next" : "Place order"}</button>
        </div>
      </form>
    </PageContainer>
  );
}
