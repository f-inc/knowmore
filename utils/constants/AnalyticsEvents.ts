export class AnalyticsEvents {
  static readonly Landing = {
    GetStartedClicked: 'getStarted/getStartedClicked',
    LearnMoreClicked: 'getStarted/learnMoreClicked'
  };

  static readonly Upload = {
    FileUploading: 'upload/fileUploading',
    FileUploaded: 'upload/fileUploaded',
    FileUploadFailed: 'upload/fileUploadFailed',

    UserLoggingIn: 'upload/userLoggingIn'
  };

  static readonly Checkout = {
    CheckoutCreated: 'checkout/checkoutCreated',
    CheckoutStarted: 'checkout/checkoutStarted',
    CheckoutSuccess: 'checkout/checkoutSuccess',
    CheckoutFailed: 'checkout/checkoutFailed'
  };

  static readonly Auth = {
    UserLoggedIn: 'auth/userLoggedIn',
    UserLoggedOut: 'auth/userLoggedOut',
    UserSignUp: 'auth/userSignUp',
    UserVerificationEmailSent: 'auth/userVerificationEmailSent',
    UserVerificationEmailFailed: 'auth/userVerificationEmailFailed',
    PasswordResetInitiated: 'auth/passwordResetInitiated',
    PasswordResetCompleted: 'auth/passwordResetCompleted',
    SocialLogin: {
      Google: 'auth/socialLogin/google',
      Facebook: 'auth/socialLogin/facebook',
      Twitter: 'auth/socialLogin/twitter'
    }
  };
}
