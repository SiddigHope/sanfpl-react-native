export const normalize = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD') // separate base letters and accents
    .replace(/[\u0300-\u036f]/g, ''); // remove diacritics
}