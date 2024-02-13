// gtag.js
import ReactGA from 'react-ga';

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Check if the window object is defined
if (typeof window !== 'undefined') {
    // Initialize ReactGA with your GA tracking ID
    ReactGA.initialize(GA_TRACKING_ID);
}

// Pageview tracking
export const pageview = (url) => {
    if (typeof window !== 'undefined') {
        ReactGA.pageview(url);
    }
};

// Event tracking
export const event = ({ action }) => {
    if (typeof window !== 'undefined') {
        ReactGA.event({
            action,
        });
    }
};

// Transaction tracking
export const transaction = ({ id, label, value }) => {
    if (typeof window !== 'undefined') {
        ReactGA.event({
            category: 'technology',
            action: 'purchase',
            label,
            transactionId: id,
            value: value,
            eventCallback: () => {
                console.log('Conversion tracked successfully!');
            },
        });
    }
};
