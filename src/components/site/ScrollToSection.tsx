"use client";

import { useEffect } from "react";

/** Server redirects drop the #fragment, so this takes the visitor to the section after arriving. */
export function ScrollToSection({ id }: { id: string }) {
  useEffect(() => {
    document.getElementById(id)?.scrollIntoView();
  }, [id]);
  return null;
}
