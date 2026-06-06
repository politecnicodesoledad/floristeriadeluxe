import { useCallback, useEffect, useState } from "react";
import { store, type CartItem } from "./store";

function useStoreEvent(callback: () => void) {
  useEffect(() => {
    const handler = () => callback();
    window.addEventListener("fdx:store", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("fdx:store", handler);
      window.removeEventListener("storage", handler);
    };
  }, [callback]);
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const refresh = useCallback(() => setItems(store.getCart()), []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  useStoreEvent(refresh);
  return { items, count: items.reduce((s, i) => s + i.qty, 0), refresh };
}

export function useProducts() {
  const [list, setList] = useState(() => [] as ReturnType<typeof store.getProducts>);
  const refresh = useCallback(() => setList(store.getProducts()), []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  useStoreEvent(refresh);
  return { products: list, refresh };
}

export function useBanner() {
  const [banner, setBanner] = useState(() => store.getBanner());
  const refresh = useCallback(() => setBanner(store.getBanner()), []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  useStoreEvent(refresh);
  return banner;
}

export function useSiteImages() {
  const [images, setImages] = useState(() => store.getSiteImages());
  const refresh = useCallback(() => setImages(store.getSiteImages()), []);
  useEffect(() => { refresh(); }, [refresh]);
  useStoreEvent(refresh);
  return images;
}

// (legacy useUser eliminado — usa useAuth() de @/contexts/AuthContext)