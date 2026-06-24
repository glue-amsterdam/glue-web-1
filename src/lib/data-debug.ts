/** Set `DATA_DEBUG=true` in `.env.local` for verbose scan logs and the QR scan debug banner. */
export const isDataDebugEnabled = (): boolean =>
  process.env.DATA_DEBUG === "true" || process.env.DATA_DEBUG === "1";
