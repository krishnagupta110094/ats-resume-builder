import React, { useState } from 'react';
import { X, CheckCircle, Copy } from 'lucide-react';
import './PaymentModal.css';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentConfirm: () => void;
  amount: number;
}

export default function PaymentModal({ isOpen, onClose, onPaymentConfirm, amount }: PaymentModalProps) {
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);

  const upiId = '9241527429@okbizaxis';
  const recipientName = 'NAMMAWEBLLP';
  const phoneNumber = '+91 92415 27429';

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setUpiCopied(true);
    setTimeout(() => setUpiCopied(false), 2000);
  };

  const handleConfirmPayment = () => {
    setPaymentConfirmed(true);
    setTimeout(() => {
      onPaymentConfirm();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <button className="payment-modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        {!paymentConfirmed ? (
          <>
            <div className="payment-header">
              <div className="google-pay-logo">
                <svg viewBox="0 0 48 48" width="40" height="40">
                  <path fill="#4285F4" d="M24,9.5c-5.8,0-10.5,4.7-10.5,10.5S18.2,30.5,24,30.5S34.5,25.8,34.5,20S29.8,9.5,24,9.5z"/>
                  <path fill="#34A853" d="M24,30.5c5.8,0,10.5-4.7,10.5-10.5S29.8,9.5,24,9.5"/>
                  <path fill="#FBBC04" d="M24,9.5v21c5.8,0,10.5-4.7,10.5-10.5S29.8,9.5,24,9.5"/>
                  <path fill="#EA4335" d="M24,9.5C18.2,9.5,13.5,14.2,13.5,20S18.2,30.5,24,30.5"/>
                </svg>
                <h2>Google Pay</h2>
              </div>
              <p className="payment-amount">₹{amount}</p>
            </div>

            <div className="payment-body">
              <div className="recipient-info">
                <h3>{recipientName}</h3>
                <p>{phoneNumber}</p>
              </div>

              <div className="qr-code-section">
                <h4>Scan & Pay</h4>
                <div className="qr-code-container">
                  <img 
                    src="/QR_code.jpg"
                    alt="QR Code for Payment"
                    className="qr-code-image"
                  />
                  <p className="qr-instruction">Use any UPI app to scan and pay ₹{amount}</p>
                </div>
              </div>

              <div className="upi-details">
                <div className="upi-id-row">
                  <span className="upi-label">UPI ID:</span>
                  <span className="upi-value">{upiId}</span>
                  <button className="copy-btn" onClick={handleCopyUPI}>
                    {upiCopied ? <CheckCircle size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              <div className="payment-methods">
                <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSIzMCI+PHRleHQgeD0iMTAiIHk9IjIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM0Mjg1RjQiPkdQYXk8L3RleHQ+PC9zdmc+" alt="Google Pay" />
                <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSIzMCI+PHRleHQgeD0iNSIgeT0iMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzAwQjlGRiI+UGF5dG08L3RleHQ+PC9zdmc+" alt="Paytm" />
                <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5MCIgaGVpZ2h0PSIzMCI+PHRleHQgeD0iMCIgeT0iMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzVGMjU5RiI+UGhvbmVQZTwvdGV4dD48L3N2Zz4=" alt="PhonePe" />
              </div>

              <div className="payment-actions">
                <button className="payment-confirm-btn" onClick={handleConfirmPayment}>
                  <CheckCircle size={20} />
                  I have completed the payment
                </button>
                <p className="payment-note">
                  After payment, you'll be redirected to submit your details
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="payment-success">
            <div className="success-icon">
              <CheckCircle size={64} />
            </div>
            <h3>Payment Confirmed!</h3>
            <p>Redirecting to form...</p>
          </div>
        )}
      </div>
    </div>
  );
}
