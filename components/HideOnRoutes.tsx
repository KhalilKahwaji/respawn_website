"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Renders its children everywhere except the listed routes.
 *
 * Exists because the sponsor strip lives in the root layout footer, and a
 * layout in the App Router has no access to the current pathname - only a
 * client component does. The children are still server-rendered; this only
 * decides whether they reach the DOM.
 */
export default function HideOnRoutes({
  routes,
  children,
}: {
  routes: string[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  if (pathname && routes.includes(pathname)) return null;
  return <>{children}</>;
}
