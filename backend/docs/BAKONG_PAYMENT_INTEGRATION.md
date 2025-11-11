# Bakong (KHQR) Payment Integration

## Overview

This document describes the Bakong (KHQR) payment integration for the DerLg Tourism Platform. Bakong is Cambodia's national payment system operated by the National Bank of Cambodia (NBC).

## Features

- ✅ KHQR QR code generation (EMV-compliant)
- ✅ Support for USD and KHR currencies
- ✅ Real-time payment status checking via Bakong API
- ✅ Automatic payment monitoring with polling
- ✅ Deep link generation for mobile app integration
- ✅ QR code image generation (Base64, PNG, Buffer)
- ✅ Transaction tracking with MD5 hash
- ✅ Escrow payment protection
- ✅ Deposit, milestone, and full payment support

## Architecture

### Payment Flow

```
1. User selects Bakong payment method
2. Backend generates KHQR QR code
3. User scans QR code with Bakong mobile app
4. User completes payment in Bakong app
5. Backend polls Bakong API for payment status
6. Payment confirmed → Booking confirmed
```

### Polling vs Webhooks

**Important:** This integration uses **polling** instead of webhooks because:
- Bakong API requires Cambodia IP address for webhook callbacks
- Polling provides more reliable payment verification
- Automatic monitoring with configurable intervals (default: 5 seconds)
- Timeout protection (default: 5 minutes)

## API Endpoints

### 1. Create Bakong Payment

Generate KHQR QR code for payment.

**Endpoint:** `POST /api/payments/bakong/create`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "booking_id": "uuid-here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking_id": "uuid-here",
    "booking_number": "BOOK-20240101-001",
    "qr_code": "00020101021229...",
    "md5_hash": "abc123...",
    "deep_link": "bakong://qr?data=...",
    "qr_image_base64": "data:image/png;base64,...",
    "amount": 100.00,
    "currency": "USD",
    "payment_type": "full",
    "merchant_id": "choeng_rayu@aclb",
    "merchant_name": "DerLg Tourism"
  },
  "message": "Bakong payment created successfully"
}
```

**QR Code Format:**
- EMV-compliant KHQR format
- Contains merchant ID, amount, currency, bill number
- Can be scanned by any Bakong-compatible app
- Includes CRC16 checksum for validation

### 2. Check Payment Status

Check current payment status without processing.

**Endpoint:** `GET /api/payments/bakong/status/:md5Hash`

**Authentication:** Required (JWT)

**Response:**
```json
{
  "success": true,
  "data": {
    "md5_hash": "abc123...",
    "status": "PAID",
    "transaction_id": "bakong-tx-id",
    "amount": 100.00,
    "currency": "USD",
    "paid_at": "2024-01-01T12:00:00.000Z",
    "from_account": "customer@bank",
    "to_account": "merchant@bank"
  },
  "message": "Bakong payment status retrieved successfully"
}
```

**Status Values:**
- `PENDING`: Payment not yet completed
- `PAID`: Payment successfully completed
- `FAILED`: Payment failed
- `EXPIRED`: Payment QR code expired

### 3. Verify Payment

Manually verify and process a payment.

**Endpoint:** `POST /api/payments/bakong/verify`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "booking_id": "uuid-here",
  "md5_hash": "abc123..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking_id": "uuid-here",
    "booking_number": "BOOK-20240101-001",
    "transaction_id": "uuid-here",
    "payment_status": "completed",
    "booking_status": "confirmed",
    "amount": 100.00,
    "currency": "USD",
    "paid_at": "2024-01-01T12:00:00.000Z"
  },
  "message": "Bakong payment verified and processed successfully"
}
```

### 4. Monitor Payment (Automatic Polling)

Automatically monitor payment status with polling until completed or timeout.

**Endpoint:** `POST /api/payments/bakong/monitor`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "booking_id": "uuid-here",
  "md5_hash": "abc123...",
  "timeout": 300000,
  "interval": 5000
}
```

**Parameters:**
- `timeout`: Maximum monitoring time in milliseconds (default: 300000 = 5 minutes)
- `interval`: Polling interval in milliseconds (default: 5000 = 5 seconds)

**Response:**
```json
{
  "success": true,
  "data": {
    "booking_id": "uuid-here",
    "booking_number": "BOOK-20240101-001",
    "payment_status": "PAID",
    "transaction_id": "uuid-here",
    "booking_status": "confirmed",
    "attempts": 12
  },
  "message": "Payment monitoring completed successfully"
}
```

**How It Works:**
1. Starts polling Bakong API every 5 seconds
2. Checks payment status on each poll
3. If PAID: Processes payment and returns success
4. If FAILED/EXPIRED: Returns error
5. If PENDING: Continues polling until timeout
6. Automatically creates transaction record when paid
7. Updates booking status accordingly

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Bakong Configuration
BAKONG_MERCHANT_ID=choeng_rayu@aclb
BAKONG_PHONE=+855969983479
BAKONG_DEVELOPER_TOKEN=your_developer_token_here
BAKONG_API_URL=https://api-bakong.nbc.gov.kh/v1
```

### Merchant Details

- **Merchant ID:** `choeng_rayu@aclb` (ACLB bank account)
- **Phone:** `+855969983479`
- **Merchant Name:** DerLg Tourism
- **Merchant City:** Phnom Penh

## Payment Types

### 1. Full Payment
- User pays 100% upfront
- 5% discount applied
- Booking immediately confirmed
- Bonus: Free airport pickup

### 2. Deposit Payment
- User pays 50-70% upfront (default: 50%)
- Remaining balance due before trip
- Booking status: Pending until full payment
- Reminder sent for remaining balance

### 3. Milestone Payment
- 50% upfront
- 25% one week before trip
- 25% upon arrival
- Automatic payment scheduling
- Reminders sent for each milestone

## Currency Support

### USD (US Dollar)
- Currency Code: 840
- Format: 100.00
- Minimum: $0.01

### KHR (Cambodian Riel)
- Currency Code: 116
- Format: 400000.00
- Minimum: 100 KHR

## QR Code Generation

### KHQR Format

The QR code follows EMV QR Code Specification:

```
00 02 01                    # Payload Format Indicator
01 02 12                    # Point of Initiation (Dynamic)
29 XX ...                   # Merchant Account Information
  00 16 com.bakong.khqr     # Bakong identifier
  01 XX merchant_id         # Merchant ID
  02 XX phone_number        # Phone number (optional)
53 03 840                   # Currency (USD=840, KHR=116)
54 XX amount                # Transaction amount
58 02 KH                    # Country code
59 XX merchant_name         # Merchant name
60 XX merchant_city         # Merchant city
62 XX ...                   # Additional data
  01 XX bill_number         # Bill number
  03 XX store_label         # Store label
  07 XX terminal_label      # Terminal label
63 04 XXXX                  # CRC16 checksum
```

### MD5 Hash Tracking

Each QR code generates a unique MD5 hash used for:
- Payment tracking
- Status checking
- Transaction verification
- Duplicate prevention

## Error Handling

### Common Errors

#### BAKONG_1001: Configuration Error
```json
{
  "success": false,
  "error": "Bakong merchant ID not configured",
  "code": "BAKONG_1001"
}
```
**Solution:** Set `BAKONG_MERCHANT_ID` in environment variables

#### BAKONG_1002: Invalid Currency
```json
{
  "success": false,
  "error": "Invalid currency. Only USD and KHR supported",
  "code": "BAKONG_1002"
}
```
**Solution:** Use "USD" or "KHR" as currency

#### BAKONG_1003: API Authentication Failed
```json
{
  "success": false,
  "error": "Bakong authentication failed: Invalid developer token",
  "code": "BAKONG_1003"
}
```
**Solution:** Verify `BAKONG_DEVELOPER_TOKEN` is correct

#### BAKONG_1004: IP Not Whitelisted
```json
{
  "success": false,
  "error": "Bakong access forbidden: IP address must be from Cambodia",
  "code": "BAKONG_1004"
}
```
**Solution:** Ensure server is hosted in Cambodia or use VPN

#### BAKONG_1005: Rate Limit Exceeded
```json
{
  "success": false,
  "error": "Bakong rate limit exceeded: Too many requests",
  "code": "BAKONG_1005"
}
```
**Solution:** Implement exponential backoff, reduce polling frequency

#### PAY_5005: Monitoring Timeout
```json
{
  "success": false,
  "error": "Payment monitoring failed: TIMEOUT",
  "code": "PAY_5005"
}
```
**Solution:** User didn't complete payment within timeout period

## Testing

### Prerequisites

1. Server running: `npm run dev`
2. Valid JWT token from login
3. Booking with `payment.method = 'bakong'`

### Run Test Script

```bash
npm run test:bakong
```

### Manual Testing Steps

1. **Create Payment:**
```bash
curl -X POST http://localhost:5000/api/payments/bakong/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"booking_id": "YOUR_BOOKING_ID"}'
```

2. **Scan QR Code:**
- Open Bakong mobile app
- Scan the generated QR code
- Complete payment

3. **Check Status:**
```bash
curl -X GET http://localhost:5000/api/payments/bakong/status/MD5_HASH \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

4. **Monitor Payment:**
```bash
curl -X POST http://localhost:5000/api/payments/bakong/monitor \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "YOUR_BOOKING_ID",
    "md5_hash": "MD5_HASH",
    "timeout": 300000,
    "interval": 5000
  }'
```

## Security

### Best Practices

1. **Developer Token Protection:**
   - Never commit token to version control
   - Store in environment variables
   - Rotate regularly

2. **Payment Verification:**
   - Always verify payment status with Bakong API
   - Don't trust client-side payment confirmation
   - Check transaction amount matches booking amount

3. **MD5 Hash Validation:**
   - Verify MD5 hash matches QR code
   - Prevent duplicate payment processing
   - Track all payment attempts

4. **Escrow Protection:**
   - All payments held in escrow
   - Released after service delivery
   - Refund protection for customers

## Integration with Booking Flow

### 1. Booking Creation
```typescript
const booking = await Booking.create({
  // ... booking details
  payment: {
    method: 'bakong',
    type: 'full', // or 'deposit', 'milestone'
    status: 'pending',
    transactions: []
  }
});
```

### 2. Generate QR Code
```typescript
const payment = await createBakongPayment(booking.id);
// Display QR code to user
```

### 3. Monitor Payment
```typescript
// Option A: Automatic monitoring (recommended)
const result = await monitorBakongPayment(booking.id, payment.md5_hash);

// Option B: Manual polling by frontend
setInterval(async () => {
  const status = await checkPaymentStatus(payment.md5_hash);
  if (status === 'PAID') {
    await verifyPayment(booking.id, payment.md5_hash);
  }
}, 5000);
```

### 4. Payment Confirmation
```typescript
// Automatically handled by monitor/verify endpoints
// - Creates PaymentTransaction record
// - Updates booking payment status
// - Updates booking status to confirmed
// - Sends confirmation email
// - Creates Google Calendar event
```

## Troubleshooting

### QR Code Not Scanning

**Problem:** Bakong app can't scan QR code

**Solutions:**
- Ensure QR code image is clear and high resolution
- Check QR code format is EMV-compliant
- Verify CRC16 checksum is correct
- Try regenerating QR code

### Payment Status Always Pending

**Problem:** Payment shows as pending even after payment

**Solutions:**
- Verify Bakong developer token is valid
- Check server IP is whitelisted by NBC
- Ensure Bakong API URL is correct
- Check network connectivity to Bakong API
- Verify MD5 hash matches the QR code

### Monitoring Timeout

**Problem:** Monitoring times out before payment

**Solutions:**
- Increase timeout value (default: 5 minutes)
- Reduce polling interval for faster detection
- Check if user actually completed payment
- Verify Bakong app payment was successful

### Duplicate Transactions

**Problem:** Multiple transaction records for same payment

**Solutions:**
- Check for existing transaction before creating
- Use MD5 hash for duplicate detection
- Implement idempotency keys
- Add unique constraint on transaction_id

## Support

### Bakong API Documentation
- Official Docs: https://bakong.nbc.gov.kh/developers
- API Reference: https://api-bakong.nbc.gov.kh/docs

### NBC Contact
- Website: https://www.nbc.gov.kh
- Email: bakong@nbc.gov.kh
- Phone: +855 23 722 563

### DerLg Support
- For integration issues, contact development team
- Check logs in `logs/bakong-api.log`
- Review error messages in API responses

## Changelog

### Version 1.0.0 (2024-01-01)
- Initial Bakong KHQR integration
- QR code generation (EMV-compliant)
- Payment status checking
- Automatic payment monitoring with polling
- Support for USD and KHR currencies
- Deep link generation
- Transaction tracking with MD5 hash
- Escrow payment protection

---

**Made with ❤️ for Cambodia's digital payment ecosystem**
