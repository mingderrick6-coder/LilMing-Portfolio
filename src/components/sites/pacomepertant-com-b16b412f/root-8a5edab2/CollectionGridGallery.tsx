"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { CollectionImage } from "@/data/collections";
import type { Project } from "@/data/projects";
import ProjectPreview from "./ProjectPreview";
import styles from "./Collection.module.css";

type CollectionGridGalleryProps = {
  images: CollectionImage[];
  eager: boolean;
  threeColumns: boolean;
};

export default function CollectionGridGallery({ images, eager, threeColumns }: CollectionGridGalleryProps) {
  const [preview, setPreview] = useState<Project | null>(null);
  const [mounted, setMounted] = useState(false);
  const closePreview = useCallback(() => setPreview(null), []);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!preview) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [preview]);

  const openPreview = (image: CollectionImage) => {
    setPreview({
      slug: image.id,
      title: image.title,
      image: image.src,
      thumbnail: image.thumbnail
    });
  };

  return (
    <>
      <div className={`${styles.gallery} ${styles.grid} ${threeColumns ? styles.threeColumns : ""}`}>
        {images.map((image, imageIndex) => (
          <figure key={image.id} id={`work-${image.id}`} className={styles.work}>
            <button
              className={styles.imageButton}
              type="button"
              aria-label={`查看大图：${image.title}`}
              onClick={() => openPreview(image)}
            >
              {/* Imported assets are already optimized and retain their full aspect ratio. */}
              <img
                src={image.animated ? image.src : image.thumbnail}
                alt={image.title}
                width={image.animated ? image.width : image.previewWidth}
                height={image.animated ? image.height : image.previewHeight}
                loading={eager && imageIndex === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            </button>
            <figcaption>
              <span>{image.title}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {mounted && createPortal(
        <ProjectPreview project={preview} onClose={closePreview} preload={false} />,
        document.body
      )}
    </>
  );
}
