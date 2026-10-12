import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";
import styles from "./Routes.module.css";

type ProjectPageProps = {
  project: Project;
  nextProject: Project;
};

export default function ProjectPage({ project, nextProject }: ProjectPageProps) {
  return (
    <main className={`${styles.page} ${styles.projectPage}`}>
      <div className={styles.gridBackdrop} aria-hidden="true" />

      <header className={styles.chrome}>
        <Link className={styles.logoLink} href="/" aria-label="Back to works">
          <Image
            className={styles.logo}
            src="/sites/pacomepertant-com-b16b412f/shared/logo.png"
            alt="Pacome Pertant"
            width={64}
            height={64}
            priority
          />
        </Link>
        <nav className={styles.projectNav} aria-label="Project navigation">
          <Link className={styles.quietLink} href="/">
            ← Works
          </Link>
          <Link className={styles.chromePill} href="/about">
            About
          </Link>
        </nav>
      </header>

      <article className={styles.projectArticle}>
        <header className={styles.projectHero}>
          <p className={styles.eyebrow}>Visual design</p>
          <h1>{project.title}</h1>
        </header>

        {(project.year || project.description) && (
          <div className={styles.editorialRow}>
            {project.year && (
              <div className={styles.projectYear}>
                <span>Year</span>
                <strong>{project.year}</strong>
              </div>
            )}
            {project.description && <p className={styles.projectDescription}>{project.description}</p>}
          </div>
        )}

        <figure className={styles.heroPoster}>
          <Image
            src={project.image}
            alt={`${project.title} project poster`}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 94vw"
          />
        </figure>

        <div className={styles.projectDetails}>
          {project.playbackId && <p className={styles.playbackId}>Mux playback ID · {project.playbackId}</p>}
          {project.behanceUrl ? (
            <a className={styles.behanceLink} href={project.behanceUrl} target="_blank" rel="noreferrer">
              View on Behance <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </div>
      </article>

      <footer className={styles.nextProject}>
        <p>Next project</p>
        <Link href={`/projects/${nextProject.slug}`}>
          <span>{nextProject.title}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </footer>
    </main>
  );
}
