// gtag.js

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export const GTM_ID = process.env.NEXT_PUBLIC_GTM;

const isGtagInitialized = () =>
  typeof window !== 'undefined' && typeof window.gtag === 'function';

export const pageview = (url) => {
  if (isGtagInitialized()) {

    window.gtag('config', GA_TRACKING_ID, {
      page_path: url
    });
  }
};

export const transaction = (transaction_id, value) => {
  if (isGtagInitialized()) {
    window.gtag('event', 'purchase', {
      transaction_id: transaction_id,
      value: value
    });
  }
};
