export class AnalyticsEvents {
  static readonly Upload = {
    FileUploading: 'upload/fileUploading',
    FileUploaded: 'upload/fileUploaded',
    FileUploadFailed: 'upload/fileUploadFailed'
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
