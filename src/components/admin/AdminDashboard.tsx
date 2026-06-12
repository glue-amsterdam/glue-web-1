"use client";

import Link from "next/link";
import BigButton from "@/components/big-button";
import { ADMIN_QUICK_LINKS } from "@/constants/admin-navigation";

export default function AdminDashboard() {
  return (
    <div className="space-y-8 min-h-dvh">
      <p className="base-text-size text-zinc-600">
        Select a section from the sidebar to manage site content, tour settings,
        and yearly archives.
      </p>

      <section className="space-y-4">
        <h2 className="title-text text-zinc-900">Quick access</h2>
        <div className="flex flex-wrap gap-3">
          {ADMIN_QUICK_LINKS.map((link) => (
            <BigButton
              key={link.href}
              as="link"
              href={link.href}
              label={link.name}
              mode="navbar"
            />
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="title-text mb-3 text-zinc-900">Getting started</h2>
        <ul className="base-text-size list-disc space-y-2 pl-5 text-zinc-700">
          <li>Use the sidebar groups to browse all admin sections.</li>
          <li>
            About sub-sections (Team, FAQ, etc.) are nested under{" "}
            <Link href="/admin/about" className="underline hover:text-zinc-900">
              About
            </Link>
            .
          </li>
          <li>
            Yearly content (archive, sticky groups, citizens) is managed from{" "}
            <Link
              href="/admin/yearly-content"
              className="underline hover:text-zinc-900"
            >
              Yearly Content
            </Link>
            .
          </li>
        </ul>
      </section>
    </div>
  );
}
