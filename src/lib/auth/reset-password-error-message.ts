const getErrorMessage = (error: unknown): string | null => {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  return null;
};

export const isRecoveryTokenError = (message: string): boolean => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("expired") ||
    normalized.includes("invalid") ||
    normalized.includes("otp")
  );
};

export type GetResetPasswordErrorMessageOptions = {
  isRecoveryVerified?: boolean;
};

export const getResetPasswordErrorMessage = (
  error: unknown,
  options: GetResetPasswordErrorMessageOptions = {},
): string => {
  const message = getErrorMessage(error);
  if (!message) {
    return "Failed to reset password. Please try again.";
  }

  const normalized = message.toLowerCase();

  if (normalized.includes("different from the old password")) {
    return "Your new password must be different from your current password. You can try again below without requesting a new reset email.";
  }

  if (isRecoveryTokenError(message)) {
    if (options.isRecoveryVerified) {
      return "Failed to update your password. Enter a new password below and try again.";
    }
    return "This reset link is invalid or has expired. Request a new one from the login page.";
  }

  return message;
};
