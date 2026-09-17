export { cn } from "cn";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1611079830811-865ff4428d17?q=80&w=1000&auto=format&fit=crop";

export function getFirstImage(images: string[] | null | undefined): string {
  if (images && images.length > 0 && images[0]) {
    return images[0];
  }
  return FALLBACK_IMAGE;
}