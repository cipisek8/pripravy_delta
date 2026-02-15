"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function AuthRefresh() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Server components in the layout (like AuthButton) may not re-render on
    // client navigation unless we refresh the current route.
    router.refresh();
  }, [pathname, router]);

  return null;
}
