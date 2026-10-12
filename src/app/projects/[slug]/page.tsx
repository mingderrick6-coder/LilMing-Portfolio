import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectPage from "@/components/sites/pacomepertant-com-b16b412f/root-8a5edab2/ProjectPage";
import { projects } from "@/data/projects";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);

  return project
    ? { title: `${project.title} — LilMing`, description: project.description }
    : { title: "Project not found" };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const projectIndex = projects.findIndex((item) => item.slug === slug);

  if (projectIndex === -1) notFound();

  const project = projects[projectIndex];
  const nextProject = projects[(projectIndex + 1) % projects.length];

  return <ProjectPage project={project} nextProject={nextProject} />;
}
