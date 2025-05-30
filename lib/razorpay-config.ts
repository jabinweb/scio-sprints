const isTestMode = process.env.NEXT_PUBLIC_PAYMENT_MODE === 'test';

export const razorpayConfig = {
  keyId: isTestMode 
    ? process.env.NEXT_PUBLIC_RAZORPAY_TEST_KEY_ID 
    : process.env.NEXT_PUBLIC_RAZORPAY_LIVE_KEY_ID,
  keySecret: isTestMode 
    ? process.env.RAZORPAY_TEST_KEY_SECRET 
    : process.env.RAZORPAY_LIVE_KEY_SECRET,
  isTestMode
};
