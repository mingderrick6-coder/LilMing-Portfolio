"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { collections } from "@/data/collections";
import styles from "./Views.module.css";

const listCovers: Record<string, string> = {
  "poster-design": "/list/poster-design.webp",
  "e-commerce-kv-design": "/list/e-commerce-kv-design.webp",
  "product-detail-page": "/list/product-detail-page.webp",
  "article-design": "/list/article-design.webp",
  "event-visual-design": "/list/event-visual-design.webp",
};

type ListViewProps = {
  active: boolean;
};

type ListPhase = "preparing" | "shown" | "leaving";

type ItemStyle = CSSProperties & {
  "--item-index": number;
};

type PreviewMotion = {
  element: HTMLDivElement | null;
  x: number;
  y: number;
  scale: number;
};

export default function ListView({ active }: ListViewProps) {
  const [phase, setPhase] = useState<ListPhase>("preparing");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [previewStack, setPreviewStack] = useState<number[]>([]);
  const pointerRef = useRef({ x: 0, y: 0 });
  const motionsRef = useRef(new Map<number, PreviewMotion>());
  const stackRef = useRef(previewStack);
  const hoveredRef = useRef(hoveredIndex);
  const activeRef = useRef(active);

  stackRef.current = previewStack;
  hoveredRef.current = hoveredIndex;
  activeRef.current = active;

  useEffect(() => {
    let firstFrame = 0;
    let secondFrame = 0;

    if (active) {
      setPhase("preparing");
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => setPhase("shown"));
      });
    } else {
      setPhase("leaving");
      setHoveredIndex(null);
    }

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [active]);

  useEffect(() => {
    let animationFrame = 0;

    const animatePreviews = () => {
      animationFrame = window.requestAnimationFrame(animatePreviews);
      let followX = pointerRef.current.x;
      let followY = pointerRef.current.y;
      const ordered = [...stackRef.current].reverse();

      ordered.forEach((projectIndex, depth) => {
        const motion = motionsRef.current.get(projectIndex);
        if (!motion?.element) return;

        motion.x += (followX - motion.x) * 0.1;
        motion.y += (followY - motion.y) * 0.1;
        const targetScale = activeRef.current && hoveredRef.current !== null
          ? Math.max(0.72, 1 - depth * 0.07)
          : 0;
        motion.scale += (targetScale - motion.scale) * 0.07;
        motion.element.style.transform = `translate3d(${motion.x}px, ${motion.y}px, 0) translate(-25%, -75%) scale(${motion.scale})`;
        motion.element.style.opacity = motion.scale > 0.02 ? "1" : "0";
        followX = motion.x;
        followY = motion.y;
      });
    };

    animatePreviews();
    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  const updatePointer = (event: PointerEvent<HTMLElement>) => {
    pointerRef.current = { x: event.clientX, y: event.clientY };
  };

  const showPreview = (index: number, event: PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType === "touch") return;
    updatePointer(event);
    setHoveredIndex(index);
    setPreviewStack((current) => [...current.filter((item) => item !== index), index].slice(-5));
  };

  const phaseClass = phase === "shown"
    ? styles.listShown
    : phase === "preparing"
      ? styles.listPreparing
      : styles.listLeaving;

  return (
    <section
      className={`${styles.listView} ${phaseClass} ${active ? styles.listActive : styles.listInactive}`}
      aria-hidden={!active}
      onPointerMove={updatePointer}
      onPointerLeave={() => setHoveredIndex(null)}
    >
      <nav className={styles.projectList} aria-label="Work collections">
        {collections.map((collection, index) => (
          <Link
            className={`${styles.projectTitle} ${
              hoveredIndex !== null && hoveredIndex !== index ? styles.dimmedTitle : ""
            }`}
            href={`/collections/${collection.slug}`}
            key={collection.slug}
            style={{ "--item-index": index } as ItemStyle}
            tabIndex={active ? 0 : -1}
            onPointerEnter={(event) => showPreview(index, event)}
            onPointerLeave={() => setHoveredIndex(null)}
            onFocus={() => setHoveredIndex(index)}
            onBlur={() => setHoveredIndex(null)}
          >
            {collection.title}
          </Link>
        ))}
      </nav>

      <div className={styles.previewLayer} aria-hidden="true">
        {previewStack.map((projectIndex) => {
          const collection = collections[projectIndex];
          return (
            <div
              className={styles.listPreview}
              key={collection.slug}
              ref={(element) => {
                if (!element) {
                  motionsRef.current.delete(projectIndex);
                  return;
                }
                const existing = motionsRef.current.get(projectIndex);
                motionsRef.current.set(projectIndex, {
                  element,
                  x: existing?.x ?? pointerRef.current.x,
                  y: existing?.y ?? pointerRef.current.y,
                  scale: existing?.scale ?? 0,
                });
              }}
            >
              <Image src={listCovers[collection.slug] ?? collection.cover} alt="" fill sizes="330px" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
