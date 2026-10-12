import Image from "next/image";
import Link from "next/link";
import { aboutContent } from "@/data/about";
import { siteContent } from "@/data/projects";
import routeStyles from "./Routes.module.css";
import styles from "./About.module.css";

export default function AboutPage() {
  return (
    <main className={`${routeStyles.page} ${styles.about}`} lang="zh-CN">
      <div className={routeStyles.gridBackdrop} aria-hidden="true" />

      <header className={routeStyles.chrome}>
        <Link className={styles.worksButton} href="/">
          <span aria-hidden="true">←</span> 返回作品
        </Link>
      </header>

      <div className={styles.content}>
        <section className={styles.hero} aria-labelledby="about-title">
          <div>
            <p className={styles.eyebrow}>ABOUT ME / 关于我</p>
            <h1 id="about-title" className={styles.name}>
              {aboutContent.displayName}<span>.</span>
            </h1>
            <span className={styles.nameTag}>{aboutContent.name} / {aboutContent.nickname}</span>
            <h2 className={styles.role}>{aboutContent.role}</h2>
            <p className={styles.introduction}>{aboutContent.introduction}</p>
            <p className={styles.description}>{aboutContent.description}</p>
          </div>
          <div className={styles.heroArt} aria-hidden="true">
            <Image
              src="/sites/pacomepertant-com-b16b412f/shared/about-avatar.png"
              alt=""
              width={10230}
              height={8447}
              sizes="(max-width: 700px) 80vw, 34vw"
              loading="eager"
            />
            <span className={styles.artCaption}>FROM IDEA TO REALITY.</span>
          </div>
        </section>

        <div className={styles.highlights} aria-label="设计经验概览">
          {aboutContent.highlights.map((highlight) => (
            <div key={highlight.label}>
              <strong>{highlight.value}<span>{highlight.unit}</span></strong>
              <p>{highlight.label}</p>
            </div>
          ))}
        </div>

        <nav className={styles.sectionNav} aria-label="关于页内容">
          <a href="#expertise">01 专业能力</a>
          <a href="#experience">02 工作经历</a>
          <a href="#projects">03 项目经历</a>
          <a href="#contact">04 联系我</a>
        </nav>

        <section className={styles.resumeSection} id="expertise" aria-labelledby="expertise-title">
          <div className={styles.sectionTitle}>
            <span>01 / EXPERTISE</span>
            <h2 id="expertise-title">不止一种<br />表达方式。</h2>
            <p>专业能力</p>
          </div>
          <div>
            <div className={styles.capabilities}>
              {aboutContent.capabilities.map((capability, index) => (
                <article key={capability.title}>
                  <span className={styles.itemIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{capability.title}</h3>
                  <p>{capability.description}</p>
                </article>
              ))}
            </div>
            <div className={styles.toolkit}>
              <h3>日常工具 / TOOLKIT</h3>
              <ul>{aboutContent.tools.map((tool) => <li key={tool}>{tool}</li>)}</ul>
            </div>
            <p className={styles.approach}>{aboutContent.approach}</p>
          </div>
        </section>

        <section className={styles.resumeSection} id="experience" aria-labelledby="experience-title">
          <div className={styles.sectionTitle}>
            <span>02 / EXPERIENCE</span>
            <h2 id="experience-title">一路积累，<br />持续生长。</h2>
            <p>工作经历 / 2020 - 2026</p>
          </div>
          <div>
            {aboutContent.experience.map((experience, index) => (
              <article className={styles.job} key={experience.company}>
                <div className={styles.jobMeta}>
                  <span className={styles.jobNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.period}>{experience.period}</span>
                </div>
                <h3>{experience.company}</h3>
                <p className={styles.jobRole}>{experience.role}</p>
                <ul className={styles.responsibilities}>
                  {experience.responsibilities.map((responsibility) => <li key={responsibility}>{responsibility}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.resumeSection} id="projects" aria-labelledby="projects-title">
          <div className={styles.sectionTitle}>
            <span>03 / SELECTED EXPERIENCE</span>
            <h2 id="projects-title">从一个想法，<br />到完整落地。</h2>
            <p>项目经历</p>
          </div>
          <div>
            {aboutContent.projectExperience.map((project) => (
              <article className={styles.caseStudy} key={project.title}>
                <p className={styles.caseCategory}>{project.category}</p>
                <h3>{project.title}</h3>
                {project.paragraphs.map((paragraph) => <p className={styles.caseDescription} key={paragraph}>{paragraph}</p>)}
                {project.metrics.length > 0 && (
                  <div className={styles.caseMetrics}>
                    {project.metrics.map((metric) => (
                      <div key={metric.label}>
                        <strong>{metric.value}</strong>
                        <span>{metric.label}</span>
                      </div>
                    ))}
                  </div>
                )}
                {project.brands.length > 0 && (
                  <div className={styles.brandList}>
                    <p>服务品牌</p>
                    <ul>{project.brands.map((brand) => <li key={brand}>{brand}</li>)}</ul>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <footer className={styles.contact} id="contact" aria-labelledby="contact-title">
          <p className={styles.eyebrow}>04 / LET'S TALK</p>
          <div className={styles.contactHeading}>
            <h2 id="contact-title">一起把想法，<br />做成作品<span>。</span></h2>
            <div className={styles.downloadActions}>
              <a className={styles.worksButton} href="/downloads/lilming-resume-2026.pdf" download="小明简历-2026.pdf">
                下载简历 <span aria-hidden="true">↓</span>
              </a>
              <a className={styles.worksButton} href="/downloads/lilming-portfolio-2026.pdf" download="小明2026作品集新.pdf">
                下载完整作品集 <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          <dl className={styles.contactDetails}>
            <div><dt>邮箱</dt><dd><a href={`mailto:${siteContent.email}`}>{siteContent.email}</a></dd></div>
            <div><dt>电话</dt><dd><a href={`tel:${aboutContent.phone}`}>{aboutContent.phone}</a></dd></div>
            <div><dt>生日</dt><dd>{aboutContent.birthday}</dd></div>
          </dl>
          <div className={styles.footerBottom}>
            <span>{aboutContent.displayName} © 2026</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
