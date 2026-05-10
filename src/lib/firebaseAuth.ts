import { sendPasswordResetEmail } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from './firebase'

export interface PasswordResetResult {
  success: boolean
  message: string
}

export const handleFirebasePasswordReset = async (
  email: string
): Promise<PasswordResetResult> => {
  try {
    await sendPasswordResetEmail(auth, email)
    return {
      success: true,
      message: 'Password reset email sent successfully',
    }
  } catch (error) {
    if (error instanceof FirebaseError) {
      let message = 'Failed to send reset email'

      switch (error.code) {
        case 'auth/user-not-found':
          message = 'No account found with this email address'
          break
        case 'auth/invalid-email':
          message = 'Please enter a valid email address'
          break
        case 'auth/too-many-requests':
          message = 'Too many reset requests. Please try again later'
          break
        default:
          message = error.message || 'Failed to send reset email'
      }

      return {
        success: false,
        message,
      }
    }

    return {
      success: false,
      message: 'An unexpected error occurred',
    }
  }
}