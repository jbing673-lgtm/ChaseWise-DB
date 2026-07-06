import { Checkout } from '@creem_io/nextjs';

export const GET = Checkout({
  apiKey: process.env.CREEM_API_KEY!,
  testMode: process.env.NODE_ENV !== 'production',
  defaultSuccessUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
});