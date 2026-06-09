/** Street-level address for display (segment before the first comma). */
export const toBaseFormattedAddress = (
  formattedAddress: string | null | undefined
): string => {
  if (!formattedAddress) return "";
  const commaIndex = formattedAddress.indexOf(",");
  const base =
    commaIndex === -1
      ? formattedAddress
      : formattedAddress.slice(0, commaIndex);
  return base.trim();
};
