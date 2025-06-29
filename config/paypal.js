import checkout from '@paypal/checkout-server-sdk';

const environment = new checkout.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new checkout.core.PayPalHttpClient(environment);

export default client;