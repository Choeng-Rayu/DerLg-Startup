# Bakong Payment - Frontend Integration Guide

## Quick Start

This guide shows how to integrate Bakong (KHQR) payments in the frontend application.

## Overview

Bakong payment uses a **polling-based approach** for payment verification:
1. Generate QR code
2. Display to user
3. Monitor payment status automatically
4. Confirm booking when paid

## Implementation

### Method 1: Automatic Monitoring (Recommended)

This is the simplest and most reliable method. The backend handles all polling automatically.

```typescript
import { useState } from 'react';

const BakongPayment = ({ bookingId, token }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle');

  const initiatePayment = async () => {
    setLoading(true);
    setStatus('generating');

    try {
      // Step 1: Generate QR code
      const createResponse = await fetch('/api/payments/bakong/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ booking_id: bookingId }),
      });

      const createData = await createResponse.json();
      
      if (!createData.success) {
        throw new Error(createData.error.message);
      }

      setQrData(createData.data);
      setStatus('waiting');

      // Step 2: Start automatic monitoring
      // This will wait up to 5 minutes for payment
      const monitorResponse = await fetch('/api/payments/bakong/monitor', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: bookingId,
          md5_hash: createData.data.md5_hash,
          timeout: 300000,  // 5 minutes
          interval: 5000    // check every 5 seconds
        }),
      });

      const monitorData = await monitorResponse.json();

      if (monitorData.success && monitorData.data.payment_status === 'PAID') {
        setStatus('success');
        // Redirect to confirmation page
        window.location.href = `/booking/confirmation/${bookingId}`;
      } else {
        setStatus('timeout');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bakong-payment">
      {status === 'idle' && (
        <button onClick={initiatePayment} disabled={loading}>
          Pay with Bakong
        </button>
      )}

      {status === 'generating' && (
        <div>Generating QR code...</div>
      )}

      {status === 'waiting' && qrData && (
        <div className="qr-display">
          <h3>Scan to Pay</h3>
          <img src={qrData.qr_image} alt="Bakong QR Code" />
          <p>Amount: ${qrData.amount} {qrData.currency}</p>
          <a href={qrData.deep_link} className="btn-mobile">
            Open in Bakong App
          </a>
          <div className="loading-indicator">
            Waiting for payment...
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="success-message">
          Payment successful! Redirecting...
        </div>
      )}

      {status === 'timeout' && (
        <div className="error-message">
          Payment timeout. Please try again or contact support.
        </div>
      )}

      {status === 'error' && (
        <div className="error-message">
          Payment failed. Please try again.
        </div>
      )}
    </div>
  );
};

export default BakongPayment;
```

### Method 2: Frontend Polling with Real-time Updates

This method gives you more control over the UI and allows showing real-time status updates.

```typescript
import { useState, useEffect, useRef } from 'react';

const BakongPaymentWithPolling = ({ bookingId, token }) => {
  const [qrData, setQrData] = useState(null);
  const [status, setStatus] = useState('idle');
  const [attempts, setAttempts] = useState(0);
  const pollingRef = useRef(null);

  const createPayment = async () => {
    setStatus('generating');

    try {
      const response = await fetch('/api/payments/bakong/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ booking_id: bookingId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setQrData(data.data);
        setStatus('waiting');
        startPolling(data.data.md5_hash);
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      setStatus('error');
    }
  };

  const startPolling = (md5Hash) => {
    const maxAttempts = 60; // 5 minutes
    let currentAttempt = 0;

    pollingRef.current = setInterval(async () => {
      currentAttempt++;
      setAttempts(currentAttempt);

      try {
        const response = await fetch(
          `/api/payments/bakong/status/${md5Hash}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (data.data.status === 'PAID') {
          stopPolling();
          await verifyPayment(md5Hash);
        } else if (currentAttempt >= maxAttempts) {
          stopPolling();
          setStatus('timeout');
        }
      } catch (error) {
        console.error('Status check error:', error);
        if (currentAttempt >= maxAttempts) {
          stopPolling();
          setStatus('error');
        }
      }
    }, 5000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const verifyPayment = async (md5Hash) => {
    try {
      const response = await fetch('/api/payments/bakong/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: bookingId,
          md5_hash: md5Hash,
        }),
      });

      const data = await response.json();

      if (data.data.payment_status === 'completed') {
        setStatus('success');
        setTimeout(() => {
          window.location.href = `/booking/confirmation/${bookingId}`;
        }, 2000);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
    }
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  return (
    <div className="bakong-payment">
      {status === 'idle' && (
        <button onClick={createPayment}>Pay with Bakong</button>
      )}

      {status === 'waiting' && qrData && (
        <div className="qr-display">
          <h3>Scan to Pay</h3>
          <img src={qrData.qr_image} alt="Bakong QR Code" />
          <p>Amount: ${qrData.amount} {qrData.currency}</p>
          <a href={qrData.deep_link}>Open in Bakong App</a>
          <div className="status-indicator">
            Checking payment status... (Attempt {attempts}/60)
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="success">Payment successful!</div>
      )}
    </div>
  );
};

export default BakongPaymentWithPolling;
```

### Method 3: Manual Verification

Simplest implementation - user clicks "I've paid" button.

```typescript
const BakongPaymentManual = ({ bookingId, token }) => {
  const [qrData, setQrData] = useState(null);
  const [status, setStatus] = useState('idle');

  const createPayment = async () => {
    const response = await fetch('/api/payments/bakong/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ booking_id: bookingId }),
    });

    const data = await response.json();
    if (data.success) {
      setQrData(data.data);
      setStatus('waiting');
    }
  };

  const verifyPayment = async () => {
    setStatus('verifying');

    const response = await fetch('/api/payments/bakong/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        booking_id: bookingId,
        md5_hash: qrData.md5_hash,
      }),
    });

    const data = await response.json();

    if (data.data.payment_status === 'completed') {
      setStatus('success');
      window.location.href = `/booking/confirmation/${bookingId}`;
    } else {
      alert('Payment not yet received. Please wait and try again.');
      setStatus('waiting');
    }
  };

  return (
    <div>
      {status === 'idle' && (
        <button onClick={createPayment}>Pay with Bakong</button>
      )}

      {status === 'waiting' && qrData && (
        <div>
          <img src={qrData.qr_image} alt="QR Code" />
          <button onClick={verifyPayment}>I've Paid - Verify</button>
        </div>
      )}
    </div>
  );
};
```

## API Endpoints Reference

### Create Payment
```
POST /api/payments/bakong/create
Authorization: Bearer {token}
Body: { booking_id: string }

Response: {
  qr_code: string,
  qr_image: string (base64),
  md5_hash: string,
  deep_link: string,
  amount: number,
  currency: string
}
```

### Monitor Payment (Automatic)
```
POST /api/payments/bakong/monitor
Authorization: Bearer {token}
Body: {
  booking_id: string,
  md5_hash: string,
  timeout: number (optional, default: 300000),
  interval: number (optional, default: 5000)
}

Response: {
  payment_status: 'PAID' | 'TIMEOUT',
  transaction_id: string,
  booking_status: string
}
```

### Check Status (Manual Polling)
```
GET /api/payments/bakong/status/:md5Hash
Authorization: Bearer {token}

Response: {
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED',
  transaction_id: string,
  amount: number,
  paid_at: string
}
```

### Verify Payment
```
POST /api/payments/bakong/verify
Authorization: Bearer {token}
Body: {
  booking_id: string,
  md5_hash: string
}

Response: {
  payment_status: 'completed' | 'pending',
  booking_status: string,
  transaction_id: string
}
```

## UI/UX Best Practices

1. **Show QR Code Clearly**
   - Large, centered QR code image
   - High contrast for easy scanning
   - Include amount and currency

2. **Provide Deep Link**
   - Button to open Bakong app directly
   - Especially important for mobile users

3. **Show Progress**
   - Loading indicator while generating QR
   - "Waiting for payment..." message
   - Attempt counter (optional)

4. **Handle Timeouts**
   - Clear message if payment times out
   - Option to try again
   - Contact support link

5. **Mobile Optimization**
   - Responsive QR code size
   - Easy-to-tap deep link button
   - Clear instructions

## Error Handling

```typescript
const handlePaymentError = (error) => {
  if (error.code === 'PAY_5001') {
    // Wrong payment method
    alert('This booking is not set up for Bakong payment');
  } else if (error.code === 'PAY_5003') {
    // Bakong service error
    alert('Payment service temporarily unavailable');
  } else if (error.code === 'PAY_5005') {
    // Timeout
    alert('Payment timeout. Please verify manually or try again.');
  } else {
    alert('Payment failed. Please try again.');
  }
};
```

## Testing

1. Create a test booking with Bakong payment method
2. Generate QR code
3. Use Bakong mobile app to scan and pay
4. Verify payment is detected and booking confirmed

## Notes

- Bakong API requires Cambodia IP for status checks
- In development, payments may remain PENDING
- Use Method 1 (Automatic Monitoring) for best UX
- Timeout is 5 minutes by default
- Polling interval is 5 seconds by default

## Support

For issues or questions:
- Backend API: See `backend/docs/BAKONG_PAYMENT_INTEGRATION.md`
- Task Summary: See `backend/TASK_21_SUMMARY.md`
