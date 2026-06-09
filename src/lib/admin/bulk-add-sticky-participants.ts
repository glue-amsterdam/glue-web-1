export const splitCommaTokens = (text: string): string[] =>
  text
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);
