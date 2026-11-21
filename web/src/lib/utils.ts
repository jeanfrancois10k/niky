export { cn } from "cn";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1611079830811-865ff4428d17?q=80&w=1000&auto=format&fit=crop";

export function getFirstImage(images: string[] | string | null | undefined): string {
  if (!images) return FALLBACK_IMAGE;
  if (Array.isArray(images) && images.length > 0 && images[0]) {
    return images[0];
  }
  if (typeof images === "string") {
    if (images.startsWith("[") || images.startsWith("{")) {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed) && parsed[0]) return parsed[0];
        if (typeof parsed === "object" && parsed !== null) {
          const vals = Object.values(parsed);
          if (vals[0] && typeof vals[0] === "string") return vals[0];
        }
      } catch {
        // ignore
      }
    }
    if (images.startsWith("http") || images.startsWith("/") || images.startsWith("data:image")) {
      return images;
    }
  }
  return FALLBACK_IMAGE;
}
