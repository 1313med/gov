import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getOwnerListingViewAttentionCount } from "../api/rental";

/**
 * Refetches when the current screen gains focus (home / profile).
 * Only meaningful for rental_owner — softer signal than booking attention.
 */
export function useOwnerListingViewAttentionCount() {
  const { auth } = useAuth();
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    if (auth?.role !== "rental_owner") {
      setCount(0);
      return;
    }
    try {
      const { data } = await getOwnerListingViewAttentionCount();
      setCount(typeof data?.count === "number" ? data.count : 0);
    } catch {
      setCount(0);
    }
  }, [auth?.role]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return count;
}
