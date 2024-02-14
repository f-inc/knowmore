import ReactPixel from 'react-facebook-pixel';

export const FACEBOOK_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

// Check if the window object is defined
ReactPixel.init(FACEBOOK_PIXEL_ID);

export const pageview = () => {
    ReactPixel.pageView();
};

export const event = (name, options = {}) => {
    ReactPixel.track(name, options);
};
