"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const CLS = "pending-ring";

function clearAll() {
  document.querySelectorAll(`.${CLS}[data-nav-pending]`).forEach((el) => {
    el.classList.remove(CLS);
    el.removeAttribute("data-nav-pending");
    el.removeAttribute("aria-busy");
  });
}

function mark(el: Element) {
  el.classList.add(CLS);
  el.setAttribute("data-nav-pending", "");
  el.setAttribute("aria-busy", "true");
}

/**
 * Site-wide loading feedback: any internal link or POST form button that is tapped
 * gets a spinning light ring until the next page is shown.
 */
export default function NavFeedback() {
  const pathname = usePathname();
  const search = useSearchParams();

  // New page shown → remove the rings
  useEffect(() => {
    clearAll();
  }, [pathname, search]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const safety = () => {
      clearTimeout(timer);
      timer = setTimeout(clearAll, 15000); // never spin forever
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest("a");
      if (!a || !a.href || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Same page (only #anchor) → no loading
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      mark(a);
      safety();
    };

    const onSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement;
      // Real navigations only (e.g. sign out); React forms show their own spinner
      if (form.getAttribute("method")?.toLowerCase() !== "post" || !form.getAttribute("action")) return;
      const btn = (e.submitter as Element | null) ?? form.querySelector("button[type=submit]");
      if (btn) {
        mark(btn);
        safety();
      }
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, []);

  return null;
}
