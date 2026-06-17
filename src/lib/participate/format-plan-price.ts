export const formatParticipatePlanPrice = (
  planPrice: string | number,
  currencyLogo: string
): string => {
  const price =
    typeof planPrice === "number" ? String(planPrice) : planPrice.trim();
  const logo = currencyLogo?.trim() || "€";
  return `${logo} ${price}`;
};
