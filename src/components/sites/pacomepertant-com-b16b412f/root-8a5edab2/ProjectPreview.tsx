"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { projects, type Project } from "@/data/projects";
import MorphSlider from "./MorphSlider";
import styles from "./ProjectPreview.module.css";

type ProjectPreviewProps = {
  project: Project | null;
  onClose: () => void;
  preload?: boolean;
};

function getRestorableFocus() {
  const activeElement = document.activeElement;

  if (
    !(activeElement instanceof HTMLElement)
    || activeElement === document.body
    || activeElement.tagName === "CANVAS"
  ) {
    return null;
  }

  return activeElement;
}

export default function ProjectPreview({ project, onClose, preload = true }: ProjectPreviewProps) {
  const [displayedProject, setDisplayedProject] = useState<Project | null>(project);
  const [visible, setVisible] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (project) {
      const isNewPreview = !wasOpenRef.current;
      wasOpenRef.current = true;
      setDisplayedProject(project);

      if (!isNewPreview) {
        setVisible(true);
        return;
      }

      previousFocusRef.current = getRestorableFocus();
      setVisible(false);

      let secondFrame = 0;
      const firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          setVisible(true);
        });
      });

      return () => {
        window.cancelAnimationFrame(firstFrame);
        window.cancelAnimationFrame(secondFrame);
      };
    }

    if (!wasOpenRef.current) return;

    wasOpenRef.current = false;
    setVisible(false);

    const previousFocus = previousFocusRef.current;

    if (previousFocus?.isConnected) {
      previousFocus.focus({ preventScroll: true });
    } else {
      closeButtonRef.current?.blur();
    }

    previousFocusRef.current = null;
  }, [project]);

  useEffect(() => {
    if (visible) closeButtonRef.current?.focus({ preventScroll: true });
  }, [visible]);

  useEffect(() => {
    if (!project) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        const controls = overlayRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [tabindex="0"]'
        );
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
        return;
      }
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, project]);

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && project) onClose();
  };

  return (
    <>
      {preload && (
        <div className={styles.preload} aria-hidden="true">
          {projects.map((item) => (
            <img key={item.slug} src={item.thumbnail} alt="" />
          ))}
        </div>
      )}

      <div
        ref={overlayRef}
        className={`${styles.overlay} ${visible ? styles.overlayVisible : ""}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!visible}
        inert={!visible}
        aria-label={displayedProject ? `${displayedProject.title} preview` : "Project preview"}
        onClick={handleBackdropClick}
      >
        <button
          ref={closeButtonRef}
          className={styles.closeButton}
          type="button"
          aria-label="Close project preview"
          tabIndex={visible ? 0 : -1}
          onClick={onClose}
        >
          <span aria-hidden="true" />
        </button>

        {displayedProject && (
          <figure className={styles.figure} onClick={(event) => event.stopPropagation()}>
            {displayedProject.secondImage ? (
              <MorphSlider
                key={displayedProject.slug}
                image={displayedProject.image}
                secondImage={displayedProject.secondImage}
                title={displayedProject.title}
                active={project?.slug === displayedProject.slug}
              />
            ) : (
              <img
                className={styles.projectImage}
                src={displayedProject.image}
                alt={displayedProject.title}
              />
            )}
            <figcaption>{displayedProject.title}</figcaption>
          </figure>
        )}
      </div>
    </>
  );
}
