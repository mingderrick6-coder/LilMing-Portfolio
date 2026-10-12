"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import * as THREE from "three";
import styles from "./MorphSlider.module.css";

// Melt transition adapted from React Bits MorphSlider by David Haz.
// https://github.com/DavidHDev/react-bits/tree/main/src/ts-default/Components/MorphSlider
// License: /third-party/react-bits-LICENSE.md
const fragmentShader = /* glsl */ `
  uniform sampler2D tCurrent;
  uniform sampler2D tNext;
  uniform float uProgress;
  uniform float uTime;
  uniform vec3 uOverlay;
  varying vec2 vUv;

  float hash21(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    float p = clamp(uProgress, 0.0, 1.0);
    float env = max(0.0, sin(p * 3.14159265359));
    vec2 uv = vUv;
    float nn = fbm(uv * 2.4 + uTime * 0.03);
    float warp = fbm(uv * 2.4 * 1.7 - uTime * 0.02);
    vec2 g = vec2(nn, warp) - 0.5;
    vec2 uvC = uv + g * 0.55 * 0.5 * p;
    vec2 uvN = uv - g * 0.55 * 0.5 * (1.0 - p);
    float m = mix(p, smoothstep(nn - 0.15, nn + 0.15, p), env);
    float ca = 0.35 * env * 0.03;
    vec3 colC = vec3(
      texture2D(tCurrent, uvC + vec2(ca, 0.0)).r,
      texture2D(tCurrent, uvC).g,
      texture2D(tCurrent, uvC - vec2(ca, 0.0)).b
    );
    vec3 colN = vec3(
      texture2D(tNext, uvN + vec2(ca, 0.0)).r,
      texture2D(tNext, uvN).g,
      texture2D(tNext, uvN - vec2(ca, 0.0)).b
    );
    vec3 col = mix(colC, colN, m);
    float edge = smoothstep(0.25, 1.25, length(uv - 0.5));
    col = mix(col, uOverlay, edge * 0.28 * env);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

type MorphSliderProps = {
  image: string;
  secondImage: string;
  title: string;
  active: boolean;
};

type SliderController = {
  goTo: (index: number) => void;
  beginDrag: () => boolean;
  drag: (progress: number) => void;
  endDrag: (cancelled: boolean) => void;
};

export default function MorphSlider({ image, secondImage, title, active }: MorphSliderProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SliderController | null>(null);
  const pointerStartRef = useRef<{ x: number; id: number } | null>(null);
  const activeRef = useRef(active);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  activeRef.current = active;

  useEffect(() => {
    if (!active || !stageRef.current) return;
    setReady(false);
    setIndex(0);
    const stage = stageRef.current;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = styles.canvas;
    renderer.domElement.setAttribute("aria-hidden", "true");
    stage.appendChild(renderer.domElement);

    const uniforms = {
      tCurrent: { value: null as THREE.Texture | null },
      tNext: { value: null as THREE.Texture | null },
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uOverlay: { value: new THREE.Color("#06b6d4") }
    };
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      toneMapped: false,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader
    });
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(geometry, material));
    const camera = new THREE.Camera();
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const textures: THREE.Texture[] = [];
    let disposed = false;
    let loaded = false;
    let current = 0;
    let target = 1;
    let animating = false;
    let dragging = false;
    let dragProgress = 0;
    let frame = 0;

    const render = () => {
      if (loaded && !disposed) renderer.render(scene, camera);
    };
    const resize = () => {
      renderer.setSize(stage.clientWidth, stage.clientHeight, false);
      render();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    resize();

    const prepare = (next: number) => {
      target = next;
      uniforms.tCurrent.value = textures[current];
      uniforms.tNext.value = textures[target];
    };
    const commit = (next: number) => {
      current = next;
      uniforms.tCurrent.value = textures[current];
      uniforms.tNext.value = textures[current];
      uniforms.uProgress.value = 0;
      animating = false;
      setIndex(current);
      render();
    };
    const settle = (end: number, duration: number) => {
      if (motionPreference.matches) {
        commit(end === 1 ? target : current);
        return;
      }
      animating = true;
      const from = uniforms.uProgress.value;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = duration === 1100
          ? (t < 0.5 ? 4 * t * t * t : 1 - 4 * Math.pow(1 - t, 3))
          : 1 - Math.pow(1 - t, 3);
        uniforms.uProgress.value = from + (end - from) * eased;
        uniforms.uTime.value = now / 1000;
        render();
        if (t < 1) frame = requestAnimationFrame(tick);
        else commit(end === 1 ? target : current);
      };
      frame = requestAnimationFrame(tick);
    };

    controllerRef.current = {
      goTo(next) {
        if (!loaded || animating || dragging || next === current) return;
        prepare(next);
        setIndex(next);
        settle(1, 1100);
      },
      beginDrag() {
        if (!loaded || animating || dragging) return false;
        dragging = true;
        dragProgress = 0;
        prepare(1 - current);
        return true;
      },
      drag(progress) {
        if (!dragging) return;
        dragProgress = progress;
        uniforms.uProgress.value = motionPreference.matches ? 0 : progress;
        uniforms.uTime.value = performance.now() / 1000;
        setIndex(progress > 0.5 ? target : current);
        render();
      },
      endDrag(cancelled) {
        if (!dragging) return;
        dragging = false;
        if (dragProgress === 0) return;
        const end = !cancelled && dragProgress > 0.4 ? 1 : 0;
        setIndex(end === 1 ? target : current);
        settle(end, 500);
      }
    };

    const loader = new THREE.TextureLoader();
    Promise.all([image, secondImage].map(async (src, i) => {
      const texture = await loader.loadAsync(src);
      if (disposed) {
        texture.dispose();
        return;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      textures[i] = texture;
    })).then(() => {
      if (disposed) return;
      loaded = true;
      commit(0);
      setReady(true);
    }).catch(() => {
      if (!disposed) setReady(false);
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      controllerRef.current = null;
      const pointer = pointerStartRef.current;
      if (pointer && stage.hasPointerCapture(pointer.id)) stage.releasePointerCapture(pointer.id);
      pointerStartRef.current = null;
      const dispose = () => {
        textures.forEach((texture) => texture.dispose());
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
      // Keep the last rendered frame through the preview's 200ms exit fade.
      if (!activeRef.current && !motionPreference.matches) window.setTimeout(dispose, 200);
      else dispose();
    };
  }, [active, image, secondImage]);

  const endPointer = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    if (pointerStartRef.current?.id !== event.pointerId) return;
    pointerStartRef.current = null;
    controllerRef.current?.endDrag(cancelled);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className={`${styles.slider} ${ready ? styles.ready : ""}`}>
      <img className={styles.image} src={index === 0 ? image : secondImage} alt={`${title}，第 ${index + 1} 张`} />
      <div
        ref={stageRef}
        className={styles.stage}
        role="group"
        aria-roledescription="carousel"
        aria-label={`${title}图片滑块`}
        tabIndex={active ? 0 : -1}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            controllerRef.current?.goTo(1 - index);
          }
        }}
        onPointerDown={(event) => {
          if (event.button !== 0 || !controllerRef.current?.beginDrag()) return;
          pointerStartRef.current = { x: event.clientX, id: event.pointerId };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const pointer = pointerStartRef.current;
          if (!pointer || pointer.id !== event.pointerId) return;
          const progress = Math.min(Math.abs(event.clientX - pointer.x) / event.currentTarget.clientWidth, 1);
          controllerRef.current?.drag(progress);
        }}
        onPointerUp={(event) => endPointer(event)}
        onPointerCancel={(event) => endPointer(event, true)}
      />
      <div className={styles.controls}>
        {[-1, 1].map((direction) => (
          <button key={direction} type="button" className={styles.button} disabled={!active || !ready} aria-label={direction === -1 ? "上一张" : "下一张"} onClick={() => controllerRef.current?.goTo(1 - index)}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d={direction === -1 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
      <div className={styles.indicators}>
        {[0, 1].map((slide) => (
          <button key={slide} type="button" className={`${styles.dot} ${slide === index ? styles.selected : ""}`} disabled={!active || !ready} aria-label={`显示第 ${slide + 1} 张`} aria-pressed={slide === index} onClick={() => controllerRef.current?.goTo(slide)} />
        ))}
      </div>
      <span className={styles.status} aria-live="polite">第 {index + 1} 张，共 2 张</span>
    </div>
  );
}
