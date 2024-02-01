// gtag.js
import ReactGA from 'react-ga';

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Initialize ReactGA with your GA tracking ID
ReactGA.initialize(GA_TRACKING_ID);

// Pageview tracking
export const pageview = (url) => {
    ReactGA.pageview(url);
};

// Event tracking
export const event = ({ action }) => {
    ReactGA.event({
        action,

    });
};

// Transaction tracking
export const transaction = ({ id, label, value }) => {
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
};
