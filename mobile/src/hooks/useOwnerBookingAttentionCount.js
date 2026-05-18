import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getOwnerBookingAttentionCount } from "../api/booking";
import { hasUserRole } from "../utils/userRoles";

/**
 * Refetches when the current screen gains focus (e.g. home or profile tab).
 * Only meaningful for rental_owner.
 */
export function useOwnerBookingAttentionCount() {
  const { auth } = useAuth();
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    if (!hasUserRole(auth, "rental_owner")) {
      setCount(0);
      return;
    }
    try {
      const { data } = await getOwnerBookingAttentionCount();
      setCount(typeof data?.count === "number" ? data.count : 0);
    } catch {
      setCount(0);
    }
  }, [auth]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return count;
}
