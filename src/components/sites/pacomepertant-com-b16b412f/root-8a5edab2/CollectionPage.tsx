import Link from "next/link";
import { collections, type Collection } from "@/data/collections";
import CollectionGridGallery from "./CollectionGridGallery";
import LongArtworkGallery from "./LongArtworkGallery";
import styles from "./Collection.module.css";

type CollectionPageProps = {
  collection: Collection;
};

export default function CollectionPage({ collection }: CollectionPageProps) {
  const nextCollection = collections[collection.index % collections.length];
  const numbered = String(collection.index).padStart(2, "0");

  return (
    <main className={styles.page}>
      <div className={styles.gridBackdrop} aria-hidden="true" />
      <header className={styles.chrome}>
        <Link href="/?view=list" className={styles.backButton}>
          <span aria-hidden="true">←</span> 返回目录
        </Link>
      </header>

      <div className={styles.content}>
        <section className={styles.hero} aria-labelledby="collection-title">
          <div className={styles.heroMeta}>
            <span>{numbered} / COLLECTION</span>
          </div>
          <h1 id="collection-title">{collection.title}<span>.</span></h1>
          <nav className={styles.categoryNav} aria-label="作品分类">
            {collections.map((item) => (
              <Link
                key={item.slug}
                href={`/collections/${item.slug}`}
                aria-current={item.slug === collection.slug ? "page" : undefined}
              >
                {item.title}
              </Link>
            ))}
          </nav>
          {collection.sections.length > 1 && (
            <nav className={styles.sectionNav} aria-label="本页作品分组">
              {collection.sections.map((section, index) => (
                <a key={section.id} href={`#${section.id}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span> {section.title}
                </a>
              ))}
            </nav>
          )}
          {collection.layout === "reading" && (
            <nav className={styles.sectionNav} aria-label="阅读目录">
              {collection.sections.flatMap((section) => section.images).map((image, index) => (
                <a key={image.id} href={`#work-${image.id}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span> {image.title}
                </a>
              ))}
            </nav>
          )}
        </section>

        <div className={styles.sections}>
          {collection.sections.map((section, sectionIndex) => (
            <section key={section.id} id={section.id} className={styles.section}>
              {section.title && (collection.sections.length > 1 || section.title !== collection.title) && (
                <div className={styles.sectionHeading}>
                  <h2><span>{String(sectionIndex + 1).padStart(2, "0")}</span>{section.title}</h2>
                  <span>{String(section.images.length).padStart(2, "0")}</span>
                </div>
              )}
              {collection.layout === "reading" ? (
                <LongArtworkGallery images={section.images} />
              ) : collection.layout === "grid" ? (
                <CollectionGridGallery
                  images={section.images}
                  eager={sectionIndex === 0}
                  threeColumns={(collection.slug === "poster-design" || collection.slug === "illustration") && section.images[0].width <= section.images[0].height * 1.2}
                />
              ) : (
                <div className={`${styles.gallery} ${styles[collection.layout]}`}>
                  {section.images.map((image, imageIndex) => (
                    <figure key={image.id} id={`work-${image.id}`} className={styles.work}>
                      <a href={image.src} target="_blank" rel="noopener noreferrer" aria-label={`查看大图：${image.title}`}>
                        {/* Imported assets are already optimized and retain their full aspect ratio. */}
                        <img
                          src={image.src}
                          alt={image.title}
                          width={image.width}
                          height={image.height}
                          loading={sectionIndex === 0 && imageIndex === 0 ? "eager" : "lazy"}
                          decoding="async"
                        />
                      </a>
                    </figure>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        <footer className={styles.footer}>
          <Link href={`/collections/${nextCollection.slug}`} className={styles.nextCollection}>
            <span>NEXT COLLECTION</span>
            <strong>{nextCollection.title}<span aria-hidden="true">↗</span></strong>
          </Link>
          <p>LilMing © 2026</p>
        </footer>
      </div>
    </main>
  );
}
