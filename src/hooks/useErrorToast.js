/**
 * A simple utility to extract a readable message from any error shape.
 * Works with our API error format { message, status, details }
 * and with generic JS errors.
 */
export const getErrorMessage = (error) => {
  if (!error) return "Something went wrong. Please try again.";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  return "Something went wrong. Please try again.";
};

/**
 * Use this in onError callbacks of React Query mutations:
 *
 * onError: (error) => toast.error(getErrorMessage(error))
 *
 * Or without a toast library:
 * onError: (error) => alert(getErrorMessage(error))
 */
export default getErrorMessage;