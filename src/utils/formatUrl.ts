export function formatUrl(url: string): string {
  if (!url) return "";

  // Check if the URL already starts with a protocol
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // If no protocol is present, add 'https://'
  return `https://${url}`;
}
