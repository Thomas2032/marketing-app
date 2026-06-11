"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type ProjectSubNavProps = {
  projectId: string;
};

export function ProjectSubNav({ projectId }: ProjectSubNavProps) {
  const pathname = usePathname();
  const createHref = `/projects/${projectId}`;
  const publishHref = `/projects/${projectId}/publish`;
  const isPublish = pathname === publishHref;

  return (
    <nav
      className="mb-8 flex items-center gap-1 border-b border-violet-100"
      aria-label="Project sections"
    >
      <SubNavLink href={createHref} active={!isPublish}>
        Create
      </SubNavLink>
      <SubNavLink href={publishHref} active={isPublish}>
        Publish
      </SubNavLink>
    </nav>
  );
}

type SubNavLinkProps = {
  href: string;
  active: boolean;
  children: React.ReactNode;
};

function SubNavLink({ href, active, children }: SubNavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "cursor-pointer border-b-2 px-4 py-2.5 text-sm font-medium transition-colors duration-200",
        active
          ? "border-violet-600 text-violet-700"
          : "border-transparent text-slate-500 hover:border-violet-200 hover:text-violet-700",
      )}
    >
      {children}
    </Link>
  );
}
