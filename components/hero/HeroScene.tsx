"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import { createWindRenderer } from "./windShader";
import { createLeafField, LEAF_COUNT_LOW_END } from "./leaves";
import { getDeviceProfile } from "@/lib/device";

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

type SceneConfig = {
  webgl: boolean;
  leaves: number; // max leaves (Infinity = default desktop/mobile counts)
  debugMask: boolean;
  reason: string;
};

function decideConfig(reducedMotion: boolean): SceneConfig {
  const debugMask = new URLSearchParams(window.location.search).get("debug") === "mask";
  if (debugMask) return { webgl: true, leaves: 0, debugMask, reason: "?debug=mask" };
  if (reducedMotion) return { webgl: false, leaves: 0, debugMask, reason: "prefers-reduced-motion" };
  const device = getDeviceProfile();
  if (device.saveData) return { webgl: false, leaves: 0, debugMask, reason: device.reasons.join(", ") };
  if (device.lowEnd) {
    return { webgl: false, leaves: LEAF_COUNT_LOW_END, debugMask, reason: `low-end: ${device.reasons.join(", ")}` };
  }
  return { webgl: true, leaves: Infinity, debugMask, reason: "capable device" };
}

/**
 * Hero background: plain image (always rendered, fallback) +
 * WebGL wind layer + Canvas 2D leaves, driven by ONE requestAnimationFrame loop.
 */
export default function HeroScene() {
  const rootRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const leafRef = useRef<HTMLCanvasElement>(null);
  const [config, setConfig] = useState<SceneConfig | null>(null);
  const [glReady, setGlReady] = useState(false);

  // prefers-reduced-motion + device capability → choose what to run
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setConfig(decideConfig(mq.matches));
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    setGlReady(false);
    const root = rootRef.current;
    const img = imgRef.current;
    if (!config || !root || !img) return;

    const glCanvas = glRef.current;
    const leafCanvas = leafRef.current;
    const wind = config.webgl && glCanvas ? createWindRenderer(glCanvas, { debugMask: config.debugMask }) : null;
    const leaves = config.leaves > 0 && leafCanvas ? createLeafField(leafCanvas, config.leaves) : null;

    const mode = wind ? "webgl" : config.webgl ? "static-image (WebGL unavailable)" : "static-image";
    root.dataset.heroMode = wind ? "webgl" : "static";
    console.info(
      `[hero] mode: ${mode}${config.debugMask ? " + debug mask" : ""} | leaves: ${
        leaves ? (config.leaves === Infinity ? "default" : config.leaves) : 0
      } | reason: ${config.reason}`,
    );

    if (!wind && !leaves) return; // fully static: nothing to animate

    const onImage = () => {
      if (!wind || !img.naturalWidth) return;
      try {
        wind.setImage(img);
        setGlReady(true);
      } catch (err) {
        console.warn("[hero] texture upload failed, using static image", err);
        root.dataset.heroMode = "static";
        setGlReady(false);
      }
    };
    if (img.complete) onImage();
    img.addEventListener("load", onImage);

    const onLost = (e: Event) => {
      e.preventDefault();
      console.warn("[hero] WebGL context lost, using static image");
      root.dataset.heroMode = "static";
      setGlReady(false);
    };
    glCanvas?.addEventListener("webglcontextlost", onLost);

    const resize = () => {
      const rect = root.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      if (wind && glCanvas) {
        glCanvas.width = Math.round(rect.width * dpr);
        glCanvas.height = Math.round(rect.height * dpr);
        wind.resize(glCanvas.width, glCanvas.height, rect.width, rect.height);
      }
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
    let lastStamp = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - lastFrame < FRAME_MS - 1) return; // cap at 60fps on 120Hz screens
      lastFrame = now;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      time += dt; // fed to the shader's u_time every frame
      wind?.render(time);
      if (leaves) {
        leaves.update(dt, time);
        leaves.draw();
      }
      if (now - lastStamp > 1000) {
        lastStamp = now;
        root.dataset.heroTime = time.toFixed(1); // visible in devtools: proves time advances
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

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    io.observe(root);
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      img.removeEventListener("load", onImage);
      glCanvas?.removeEventListener("webglcontextlost", onLost);
      wind?.destroy();
    };
  }, [config]);

  const debug = !!config?.debugMask;

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
      {config?.webgl && (
        // key: a fresh canvas each time, since a lost/destroyed context can't be reused
        <canvas
          key={debug ? "gl-debug" : "gl"}
          ref={glRef}
          className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${debug ? "z-20" : ""}`}
          style={{ opacity: glReady ? 1 : 0 }}
        />
      )}
      {!debug && (
        <>
          {/* Dark gradient: stronger at the bottom so the text reads well */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-[#0c1a12]/90" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0c1a12]/70 to-transparent" />
        </>
      )}
      {config && config.leaves > 0 && (
        <canvas ref={leafRef} className="pointer-events-none absolute inset-0 h-full w-full" />
      )}
    </div>
  );
}
