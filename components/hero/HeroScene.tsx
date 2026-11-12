"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import { createWindRenderer } from "./windShader";
import { createLeafField } from "./leaves";

const MAX_DPR = 2;
const FRAME_MS = 1000 / 60; // 60fps cap

const common = { alt: "", sizes: "100vw", quality: 80, priority: true } as const;
const { props: desktop } = getImageProps({
  ...common,
  src: "/hero/hero-desktop.jpg",
  width: 2576,
  height: 1438,
});
const { props: mobile } = getImageProps({
  ...common,
  src: "/hero/hero-mobile.jpg",
  width: 1438,
  height: 2576,
});

/**
 * Hero background: plain image (always rendered, fallback) +
 * WebGL wind layer + Canvas 2D leaves, driven by ONE requestAnimationFrame loop.
 *
 * The hero background is pinned (sticky) and the next section slides over it,
 * so the background itself is always "in the viewport". To know when it is fully
 * covered we observe `coverTargetId` (the in-flow hero section): once that has
 * scrolled out, the curtain covers the whole background → pause + hide layers.
 */
export default function HeroScene({ coverTargetId }: { coverTargetId?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const leafRef = useRef<HTMLCanvasElement>(null);
  const [motionOk, setMotionOk] = useState(false);
  const [glReady, setGlReady] = useState(false);

  // prefers-reduced-motion → static image only
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setMotionOk(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!motionOk) {
      setGlReady(false);
      return;
    }
    const root = rootRef.current;
    const img = imgRef.current;
    const glCanvas = glRef.current;
    const leafCanvas = leafRef.current;
    if (!root || !img || !glCanvas || !leafCanvas) return;

    const wind = createWindRenderer(glCanvas); // null → plain image stays visible
    const leaves = createLeafField(leafCanvas);

    const onImage = () => {
      if (!wind || !img.naturalWidth) return;
      try {
        wind.setImage(img);
        setGlReady(true);
      } catch {
        setGlReady(false);
      }
    };
    if (img.complete) onImage();
    img.addEventListener("load", onImage);

    const onLost = (e: Event) => {
      e.preventDefault();
      setGlReady(false);
    };
    glCanvas.addEventListener("webglcontextlost", onLost);

    const resize = () => {
      const rect = root.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      glCanvas.width = Math.round(rect.width * dpr);
      glCanvas.height = Math.round(rect.height * dpr);
      wind?.resize(glCanvas.width, glCanvas.height);
      leaves?.resize(rect.width, rect.height, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(root);

    // --- single animation loop ---
    let raf = 0;
    let running = false;
    let inView = true;
    let last = 0;
    let lastFrame = 0;
    let time = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - lastFrame < FRAME_MS - 1) return; // cap at 60fps on 120Hz screens
      lastFrame = now;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      time += dt;
      wind?.render(time);
      if (leaves) {
        leaves.update(dt, time);
        leaves.draw();
      }
    };

    const sync = () => {
      const shouldRun = inView && document.visibilityState === "visible";
      if (shouldRun && !running) {
        running = true;
        last = lastFrame = performance.now();
        raf = requestAnimationFrame(frame);
      } else if (!shouldRun && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };

    const coverTarget = (coverTargetId && document.getElementById(coverTargetId)) || root;
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        // Fully covered: hide the layers too so the browser can skip compositing them.
        // The 120px top margin re-shows them before the curtain uncovers anything.
        root.style.visibility = inView ? "" : "hidden";
        sync();
      },
      { threshold: 0, rootMargin: "120px 0px 0px 0px" },
    );
    io.observe(coverTarget);
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      img.removeEventListener("load", onImage);
      glCanvas.removeEventListener("webglcontextlost", onLost);
      wind?.destroy();
      root.style.visibility = "";
    };
  }, [motionOk, coverTargetId]);

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <picture>
        <source media="(max-width: 767px)" srcSet={mobile.srcSet} sizes="100vw" />
        <img
          {...desktop}
          ref={imgRef}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </picture>
      {motionOk && (
        <canvas
          ref={glRef}
          className="absolute inset-0 h-full w-full transition-opacity duration-700"
          style={{ opacity: glReady ? 1 : 0 }}
        />
      )}
      {/* Dark gradient: stronger at the bottom so the text reads well */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-[#0c1a12]/90" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0c1a12]/70 to-transparent" />
      {motionOk && <canvas ref={leafRef} className="pointer-events-none absolute inset-0 h-full w-full" />}
    </div>
  );
}
