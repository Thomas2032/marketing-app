"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type ProjectSubNavProps = {
  projectId: string;
  className?: string;
};

export function ProjectSubNav({ projectId, className }: ProjectSubNavProps) {
  const pathname = usePathname();
  const createHref = `/projects/${projectId}`;
  const publishHref = `/projects/${projectId}/publish`;
  const isPublish = pathname === publishHref;

  return (
    <nav
      className={cn(
        "mb-8 flex items-center gap-1 border-b border-violet-100",
        className,
      )}
      aria-label="Project sections"
    >
      <SubNavLink href={createHref} active={!isPublish}>
        Create campaign
      </SubNavLink>
      <SubNavLink href={publishHref} active={isPublish}>
        Publish queue
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
        "cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200",
        active
          ? "bg-violet-100 text-violet-800"
          : "text-slate-600 hover:bg-violet-50 hover:text-violet-700",
      )}
    >
      {children}
    </Link>
  );
}
