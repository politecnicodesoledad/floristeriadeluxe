import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LOVABLE_ASSET_ORIGIN = "https://floristeriadeluxe.lovable.app";

export function resolveAssetUrl(src?: string | null) {
  if (!src) return "";
  if (src.startsWith("/__l5e/")) {
    return `${LOVABLE_ASSET_ORIGIN}${src}`;
  }
  return src;
}

export function isLegacyBrokenImageUrl(src?: string | null) {
  return /floristeriadeluxe\.com|108\.167\.149\.240/i.test(src ?? "");
}
