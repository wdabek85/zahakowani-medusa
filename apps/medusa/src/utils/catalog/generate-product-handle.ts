const POLISH_TO_ASCII: Record<string, string> = {
  ą: "a",
  ć: "c",
  ę: "e",
  ł: "l",
  ń: "n",
  ó: "o",
  ś: "s",
  ź: "z",
  ż: "z",
  Ą: "a",
  Ć: "c",
  Ę: "e",
  Ł: "l",
  Ń: "n",
  Ó: "o",
  Ś: "s",
  Ź: "z",
  Ż: "z",
}

/**
 * Builds a URL-safe slug from a product title, per brief #1 §8.
 *
 * Pipeline:
 *  1. Replace Polish diacritics with ASCII equivalents
 *  2. Lowercase
 *  3. Replace any run of non-alphanumeric chars with a single "-"
 *  4. Trim leading/trailing "-"
 *
 * Examples:
 *  - "Hak holowniczy Skoda Octavia 3 2013-2019 1800kg Z/016"
 *    → "hak-holowniczy-skoda-octavia-3-2013-2019-1800kg-z-016"
 *  - "Hak holowniczy + Wiązka 13-Pin Skoda Octavia 3 ..."
 *    → "hak-holowniczy-wiazka-13-pin-skoda-octavia-3-..."
 */
export function generateProductHandle(title: string): string {
  const transliterated = title
    .split("")
    .map((ch) => POLISH_TO_ASCII[ch] ?? ch)
    .join("")

  return transliterated
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
