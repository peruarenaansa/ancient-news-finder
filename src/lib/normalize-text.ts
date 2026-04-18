/**
 * Diakritikoak kentzen ditu (á → a, ñ → n, ç → c...) eta minuskuletara pasa.
 * Horrek bilaketa malguagoa egiten du, batez ere euskarazko/gaztelaniazko testuetan.
 */
export function normalizeText(input: string): string {
  return input
    .normalize('NFD')
    // Konbinatutako diakritiko-markak kendu (U+0300 - U+036F).
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}
