"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface IndexApp {
  slug: string;
  title: string;
  description: string;
  status: string;
  started: string;
  chapter: string;
  cover?: string;
  field: string;
  ink: string;
}

interface Filter {
  id: string;
  label: string;
}

export default function AppIndex({ apps, filters }: { apps: IndexApp[]; filters: Filter[] }) {
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(apps[0]?.slug ?? "");
  const listRef = useRef<HTMLOListElement>(null);
  const pointerRef = useRef(false);

  const visible = apps.filter((a) => filter === "all" || a.chapter === filter);

  // While scrolling (not pointing), the row nearest the middle of the screen is the active one.
  useEffect(() => {
    const list = listRef.current;
    if (!list || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (pointerRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) setActive((entry.target as HTMLElement).dataset.slug ?? "");
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    list.querySelectorAll("li").forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, [filter]);

  const choose = (id: string) => {
    setFilter(id);
    const first = apps.find((a) => id === "all" || a.chapter === id);
    if (first) setActive(first.slug);
  };

  const current = apps.find((a) => a.slug === active) ?? visible[0];

  return (
    <>
    <div className="index-title">
      <h2 className="head" data-reveal>
        Every app, in one list
      </h2>
    </div>
    <div className="index-grid">
      <div className="index-stage" aria-hidden="true">
        <div
          className="index-frame"
          style={{ "--stage": current?.field, "--stage-ink": current?.ink } as React.CSSProperties}
        >
          {apps.map((a) =>
            a.cover ? (
              <figure key={a.slug} data-active={a.slug === current?.slug}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.cover} alt="" loading="lazy" />
              </figure>
            ) : (
              // Only the active app's name is drawn, so no hidden title sits under another.
              a.slug === current?.slug && (
                <figure key={a.slug} data-active className="words">
                  <p className="head">{a.title}</p>
                </figure>
              )
            )
          )}
        </div>
      </div>

      <div className="index-list">
        <ul className="filters" aria-label="Show apps built">
          {filters.map((f) => (
            <li key={f.id}>
              <button type="button" aria-pressed={filter === f.id} onClick={() => choose(f.id)}>
                {f.label}
              </button>
            </li>
          ))}
        </ul>
        <ol
          className="rows"
          ref={listRef}
          onPointerEnter={() => (pointerRef.current = true)}
          onPointerLeave={() => (pointerRef.current = false)}
        >
          {apps.map((a) => (
            <li
              key={a.slug}
              className="row"
              data-slug={a.slug}
              data-active={a.slug === current?.slug}
              hidden={!visible.includes(a)}
            >
              <Link
                href={`/projects/${a.slug}`}
                onPointerEnter={() => setActive(a.slug)}
                onFocus={() => setActive(a.slug)}
              >
                <span className="name">
                  <span className="dot" style={{ background: a.field }} aria-hidden="true" />
                  {a.title}
                </span>
                <span className="meta num">
                  {a.status} · {a.started}
                </span>
                <span className="more">
                  <span>
                    <p>{a.description}</p>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
    </>
  );
}
