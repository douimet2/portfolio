"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "./track";

export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    track("pageview");
  }, [pathname]);

  return null;
}
