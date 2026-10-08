export function fold(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");
}

export function matcher(query: string): ((folded: string) => boolean) | null {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  return (folded) => words.every((w) => folded.includes(w));
}

export function folder() {
  const kept = new WeakMap<object, string>();
  return (item: object, parts: () => (string | number | undefined | false | null)[]): string => {
    let text = kept.get(item);
    if (text === undefined) {
      text = fold(parts().filter(Boolean).join(" "));
      kept.set(item, text);
    }
    return text;
  };
}
