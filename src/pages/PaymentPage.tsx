import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const PaymentPage: React.FC = () => {
  const [phone, setPhone] = useState("2547");
  const [amount, setAmount] = useState("");
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPOD, setIsPOD] = useState(false);
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<{
    name: string;
    paymentNumber?: string;
    paymentMethod?: string;
  } | null>(null);

  const token = localStorage.getItem("token") || "";
  const location = useLocation();

  // ✅ Autofill order ID and amount from query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idFromUrl = params.get("orderId");
    if (idFromUrl) {
      setOrderId(idFromUrl);
      fetchOrderDetails(idFromUrl);
    }
  }, [location.search]);

  const fetchOrderDetails = async (id: string) => {
    try {
      setStatus("🔄 Loading order details...");
      const res = await axios.get(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const order = res.data;

      const derivedAmount =
        order?.product?.price || order?.service?.price || "";

      if (derivedAmount) {
        setAmount(String(derivedAmount));
        setStatus("");
      } else {
        setStatus("⚠️ Could not determine amount from order item.");
      }

      if (
        order?.paymentMethod === "POD" &&
        order?.paymentStatus?.toLowerCase() === "recorded"
      ) {
        setAlreadyPaid(true);
        setStatus("ℹ️ POD already recorded for this order.");
      } else {
        setAlreadyPaid(false);
      }

      if (order?.orderBusiness) {
        setBusinessInfo({
          name: order.orderBusiness.name,
          paymentNumber: order.orderBusiness.paymentNumber,
          paymentMethod: order.orderBusiness.paymentMethod,
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatus("❌ Failed to fetch order details.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");

    if (!amount || !orderId) {
      return setStatus("⚠️ Enter both Order ID and amount.");
    }

    const amountNumber = Number(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      return setStatus("⚠️ Enter a valid amount greater than 0.");
    }

    if (isPOD) {
      if (alreadyPaid) return setStatus("⚠️ POD already recorded for this order.");
      try {
        setLoading(true);
        setStatus("⏳ Recording Pay on Delivery...");

        await axios.post(
          "/api/payments/pod",
          { orderId, amount: amountNumber },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setStatus("✅ POD recorded successfully.");
        setAlreadyPaid(true);
      } catch (err: any) {
        console.error(err);
        setStatus(
          err?.response?.data?.error || "❌ Failed to record POD. Try again later."
        );
      } finally {
        setLoading(false);
      }
    } else {
      if (!/^2547\d{8}$/.test(phone.trim())) {
        return setStatus("⚠️ Use valid phone format: 2547XXXXXXXX");
      }

      try {
        setLoading(true);
        setStatus("⏳ Sending STK Push...");

        const { data } = await axios.post(
          "/api/payments/stk-push",
          { phone: phone.trim(), amount: amountNumber, orderId: orderId.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data?.data?.ResponseCode === "0") {
          setStatus("✅ Prompt sent! Enter your M-Pesa PIN.");
        } else {
          setStatus("⚠️ STK Push rejected. Try again.");
        }
      } catch (err: any) {
        console.error(err);
        setStatus(
          err?.response?.data?.error || "❌ STK Push failed. Try again later."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <h2 className="text-center mb-4 fw-bold text-success">Make Payment</h2>

      {businessInfo && (
        <div className="alert alert-secondary text-center mb-4">
          <strong>Business:</strong> {businessInfo.name}
          {businessInfo.paymentNumber && (
            <div className="mt-1 small">
              Pay to: <span className="badge bg-success">{businessInfo.paymentMethod?.toUpperCase()}</span>{" "}
              <strong>{businessInfo.paymentNumber}</strong>
            </div>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-dark text-light p-4 rounded shadow-sm"
      >
        <div className="form-check form-switch mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="podSwitch"
            checked={isPOD}
            onChange={() => setIsPOD(!isPOD)}
          />
          <label className="form-check-label" htmlFor="podSwitch">
            Pay on Delivery?
          </label>
        </div>

        {!isPOD && (
          <div className="mb-3">
            <label htmlFor="phone" className="form-label">
              Phone Number (e.g. 254712345678)
            </label>
            <input
              type="text"
              className="form-control"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              maxLength={12}
              pattern="^2547\d{8}$"
              placeholder="2547XXXXXXXX"
            />
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="orderId" className="form-label">
            Order ID
          </label>
          <input
            type="text"
            className="form-control"
            id="orderId"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
            readOnly
          />
        </div>

        <div className="mb-3">
          <label htmlFor="amount" className="form-label">
            Amount (KES)
          </label>
          <input
            type="number"
            className="form-control"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min={1}
            readOnly
          />
        </div>

        <button
          type="submit"
          className="btn btn-success w-100"
          disabled={loading || alreadyPaid}
        >
          {loading
            ? isPOD
              ? "Recording..."
              : "Sending STK Push..."
            : isPOD
            ? "Confirm POD"
            : "Pay Now"}
        </button>
      </form>

      {status && (
        <div className="alert alert-info mt-4 text-center fw-semibold">
          {status}
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
