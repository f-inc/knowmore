import ReactPixel from 'react-facebook-pixel';

export const FACEBOOK_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

// Check if the window object is defined
if (typeof window !== 'undefined') {
    ReactPixel.init(FACEBOOK_PIXEL_ID);
}

export const pageview = () => {
    if (typeof window !== 'undefined') {
        ReactPixel.pageView();
    }
};

export const event = (name, options = {}) => {
    if (typeof window !== 'undefined') {
        ReactPixel.track(name, options);
    }
};
