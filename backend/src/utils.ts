export const toError = (error: Error | undefined) => {
  return {
    name: error?.name,
    message: error?.message,
    stack: error?.stack
  }
}
