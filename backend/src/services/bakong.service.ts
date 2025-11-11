import axios from 'axios';
import crypto from 'crypto';
import QRCode from 'qrcode';
import logger from '../utils/logger';
import config from '../config/env';

/**
 * Bakong KHQR Service
 * Handles Bakong (KHQR) payment processing including QR code generation and payment verification
 */

// Bakong API configuration
const BAKONG_API_URL = process.env.BAKONG_API_URL || 'https://api-bakong.nbc.gov.kh/v1';
const BAKONG_DEVELOPER_TOKEN = process.env.BAKONG_DEVELOPER_TOKEN || '';

/**
 * KHQR Payment Data Interface
 */
interface KHQRPaymentData {
  merchantId: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  currency: 'USD' | 'KHR';
  billNumber: string;
  storeLabel?: string;
  terminalLabel?: string;
  phoneNumber?: string;
}

/**
 * KHQR Response Interface
 */
interface KHQRResponse {
  qrCode: string;
  md5Hash: string;
  deepLink: string;
  imageBuffer?: Buffer;
}

/**
 * Payment Status Response Interface
 */
interface PaymentStatusResponse {
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
  transactionId?: string;
  amount?: number;
  currency?: string;
  paidAt?: Date;
  fromAccountId?: string;
  toAccountId?: string;
  hash?: string;
  description?: string;
}

/**
 * Generate KHQR QR code string
 * Creates an EMV-compliant KHQR QR code for Bakong payments
 */
export const generateKHQRCode = (data: KHQRPaymentData): string => {
  try {
    // EMV QR Code format for Bakong
    const qrData: string[] = [];

    // Payload Format Indicator (ID: 00)
    qrData.push('000201');

    // Point of Initiation Method (ID: 01) - Dynamic QR
    qrData.push('010212');

    // Merchant Account Information (ID: 29) - Bakong specific
    const merchantInfo = [
      '0016' + 'com.bakong.khqr', // Bakong identifier
      formatTLV('01', data.merchantId), // Merchant ID
    ];

    if (data.phoneNumber) {
      merchantInfo.push(formatTLV('02', data.phoneNumber));
    }

    const merchantInfoStr = merchantInfo.join('');
    qrData.push('29' + padLeft(merchantInfoStr.length.toString(), 2) + merchantInfoStr);

    // Transaction Currency (ID: 53)
    const currencyCode = data.currency === 'USD' ? '840' : '116'; // USD: 840, KHR: 116
    qrData.push('5303' + currencyCode);

    // Transaction Amount (ID: 54)
    if (data.amount > 0) {
      const amountStr = data.amount.toFixed(2);
      qrData.push('54' + padLeft(amountStr.length.toString(), 2) + amountStr);
    }

    // Country Code (ID: 58)
    qrData.push('5802KH');

    // Merchant Name (ID: 59)
    const merchantName = data.merchantName.substring(0, 25);
    qrData.push('59' + padLeft(merchantName.length.toString(), 2) + merchantName);

    // Merchant City (ID: 60)
    const merchantCity = data.merchantCity.substring(0, 15);
    qrData.push('60' + padLeft(merchantCity.length.toString(), 2) + merchantCity);

    // Additional Data Field Template (ID: 62)
    const additionalData: string[] = [];

    // Bill Number (ID: 01)
    if (data.billNumber) {
      additionalData.push(formatTLV('01', data.billNumber));
    }

    // Store Label (ID: 03)
    if (data.storeLabel) {
      additionalData.push(formatTLV('03', data.storeLabel));
    }

    // Terminal Label (ID: 07)
    if (data.terminalLabel) {
      additionalData.push(formatTLV('07', data.terminalLabel));
    }

    if (additionalData.length > 0) {
      const additionalDataStr = additionalData.join('');
      qrData.push('62' + padLeft(additionalDataStr.length.toString(), 2) + additionalDataStr);
    }

    // Combine all data
    const qrString = qrData.join('');

    // Calculate CRC (ID: 63)
    const crc = calculateCRC16(qrString + '6304');
    const finalQRCode = qrString + '6304' + crc;

    logger.info(`KHQR code generated for bill ${data.billNumber}`);

    return finalQRCode;
  } catch (error: any) {
    logger.error('Error generating KHQR code:', error);
    throw new Error(`KHQR code generation failed: ${error.message}`);
  }
};

/**
 * Format TLV (Tag-Length-Value) structure
 */
const formatTLV = (tag: string, value: string): string => {
  const length = padLeft(value.length.toString(), 2);
  return tag + length + value;
};

/**
 * Pad left with zeros
 */
const padLeft = (str: string, length: number): string => {
  return str.padStart(length, '0');
};

/**
 * Calculate CRC16-CCITT checksum
 */
const calculateCRC16 = (data: string): string => {
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;

    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc = crc << 1;
      }
    }
  }

  crc = crc & 0xFFFF;
  return crc.toString(16).toUpperCase().padStart(4, '0');
};

/**
 * Generate MD5 hash for QR code tracking
 */
export const generateMD5Hash = (qrCode: string): string => {
  return crypto.createHash('md5').update(qrCode).digest('hex');
};

/**
 * Generate QR code image
 */
export const generateQRImage = async (
  qrCode: string,
  options: { format?: 'buffer' | 'dataURL' | 'png' } = {}
): Promise<Buffer | string> => {
  try {
    const format = options.format || 'buffer';

    if (format === 'buffer') {
      return await QRCode.toBuffer(qrCode, {
        errorCorrectionLevel: 'M',
        type: 'png',
        width: 300,
        margin: 2,
      });
    } else if (format === 'dataURL') {
      return await QRCode.toDataURL(qrCode, {
        errorCorrectionLevel: 'M',
        width: 300,
        margin: 2,
      });
    } else {
      return await QRCode.toBuffer(qrCode, {
        errorCorrectionLevel: 'M',
        type: 'png',
        width: 300,
        margin: 2,
      });
    }
  } catch (error: any) {
    logger.error('Error generating QR image:', error);
    throw new Error(`QR image generation failed: ${error.message}`);
  }
};

/**
 * Generate Bakong deep link for mobile app
 */
export const generateDeepLink = (qrCode: string): string => {
  try {
    // Bakong app deep link format
    const encodedQR = encodeURIComponent(qrCode);
    const deepLink = `bakong://qr?data=${encodedQR}`;

    logger.info('Bakong deep link generated');

    return deepLink;
  } catch (error: any) {
    logger.error('Error generating deep link:', error);
    throw new Error(`Deep link generation failed: ${error.message}`);
  }
};

/**
 * Check payment status via Bakong API
 */
export const checkPaymentStatus = async (
  md5Hash: string
): Promise<PaymentStatusResponse> => {
  try {
    if (!BAKONG_DEVELOPER_TOKEN) {
      throw new Error('Bakong developer token not configured');
    }

    // Call Bakong API to check payment status
    const response = await axios.get(
      `${BAKONG_API_URL}/check_transaction_by_hash`,
      {
        params: {
          hash: md5Hash,
        },
        headers: {
          'Authorization': `Bearer ${BAKONG_DEVELOPER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    const data = response.data;

    // Parse response
    const status: PaymentStatusResponse = {
      status: data.status || 'PENDING',
      transactionId: data.transactionId,
      amount: data.amount ? parseFloat(data.amount) : undefined,
      currency: data.currency,
      paidAt: data.paidAt ? new Date(data.paidAt) : undefined,
      fromAccountId: data.fromAccountId,
      toAccountId: data.toAccountId,
      hash: data.hash,
      description: data.description,
    };

    logger.info(`Payment status checked for hash ${md5Hash}: ${status.status}`);

    return status;
  } catch (error: any) {
    // Handle specific Bakong API errors
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      if (status === 401) {
        logger.error('Bakong API authentication failed - invalid token');
        throw new Error('Bakong authentication failed: Invalid developer token');
      } else if (status === 403) {
        logger.error('Bakong API access forbidden - IP not whitelisted');
        throw new Error('Bakong access forbidden: IP address must be from Cambodia');
      } else if (status === 404) {
        logger.info(`Payment not found for hash ${md5Hash}`);
        return { status: 'PENDING' };
      } else if (status === 429) {
        logger.error('Bakong API rate limit exceeded');
        throw new Error('Bakong rate limit exceeded: Too many requests');
      } else {
        logger.error(`Bakong API error (${status}): ${message}`);
        throw new Error(`Bakong API error: ${message}`);
      }
    }

    logger.error('Error checking payment status:', error);
    throw new Error(`Payment status check failed: ${error.message}`);
  }
};

/**
 * Bulk check payment status (up to 50 transactions)
 */
export const bulkCheckPaymentStatus = async (
  md5Hashes: string[]
): Promise<Map<string, PaymentStatusResponse>> => {
  try {
    if (!BAKONG_DEVELOPER_TOKEN) {
      throw new Error('Bakong developer token not configured');
    }

    if (md5Hashes.length > 50) {
      throw new Error('Maximum 50 transactions can be checked at once');
    }

    // Call Bakong API for bulk check
    const response = await axios.post(
      `${BAKONG_API_URL}/check_transactions_bulk`,
      {
        hashes: md5Hashes,
      },
      {
        headers: {
          'Authorization': `Bearer ${BAKONG_DEVELOPER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000, // 15 second timeout for bulk
      }
    );

    const results = new Map<string, PaymentStatusResponse>();

    // Parse bulk response
    if (response.data && Array.isArray(response.data.transactions)) {
      response.data.transactions.forEach((tx: any) => {
        results.set(tx.hash, {
          status: tx.status || 'PENDING',
          transactionId: tx.transactionId,
          amount: tx.amount ? parseFloat(tx.amount) : undefined,
          currency: tx.currency,
          paidAt: tx.paidAt ? new Date(tx.paidAt) : undefined,
          fromAccountId: tx.fromAccountId,
          toAccountId: tx.toAccountId,
          hash: tx.hash,
          description: tx.description,
        });
      });
    }

    logger.info(`Bulk payment status checked for ${md5Hashes.length} transactions`);

    return results;
  } catch (error: any) {
    logger.error('Error in bulk payment status check:', error);
    throw new Error(`Bulk payment status check failed: ${error.message}`);
  }
};

/**
 * Create complete Bakong payment
 * Generates QR code, MD5 hash, and deep link
 */
export const createBakongPayment = async (
  amount: number,
  currency: 'USD' | 'KHR',
  billNumber: string,
  merchantName?: string,
  merchantCity?: string
): Promise<KHQRResponse> => {
  try {
    // Use configured merchant details or defaults
    const paymentData: KHQRPaymentData = {
      merchantId: config.BAKONG_MERCHANT_ID,
      merchantName: merchantName || 'DerLg Tourism',
      merchantCity: merchantCity || 'Phnom Penh',
      amount: amount,
      currency: currency,
      billNumber: billNumber,
      storeLabel: 'DerLg',
      terminalLabel: 'WEB',
      phoneNumber: config.BAKONG_PHONE.replace('+', ''),
    };

    // Generate QR code
    const qrCode = generateKHQRCode(paymentData);

    // Generate MD5 hash for tracking
    const md5Hash = generateMD5Hash(qrCode);

    // Generate deep link
    const deepLink = generateDeepLink(qrCode);

    // Generate QR image buffer
    const imageBuffer = await generateQRImage(qrCode, { format: 'buffer' }) as Buffer;

    logger.info(`Bakong payment created for bill ${billNumber}: ${md5Hash}`);

    return {
      qrCode,
      md5Hash,
      deepLink,
      imageBuffer,
    };
  } catch (error: any) {
    logger.error('Error creating Bakong payment:', error);
    throw new Error(`Bakong payment creation failed: ${error.message}`);
  }
};

/**
 * Verify Bakong webhook signature (if applicable)
 */
export const verifyBakongWebhook = async (
  body: any,
  _signature?: string
): Promise<boolean> => {
  try {
    // Bakong webhook verification logic
    // This depends on Bakong's webhook implementation
    // For now, we'll validate the basic structure

    if (!body.event_type || !body.data) {
      return false;
    }

    logger.info(`Bakong webhook received: ${body.event_type}`);

    return true;
  } catch (error: any) {
    logger.error('Error verifying Bakong webhook:', error);
    return false;
  }
};

export default {
  generateKHQRCode,
  generateMD5Hash,
  generateQRImage,
  generateDeepLink,
  checkPaymentStatus,
  bulkCheckPaymentStatus,
  createBakongPayment,
  verifyBakongWebhook,
};
