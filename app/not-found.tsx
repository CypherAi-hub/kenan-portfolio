import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[1200px] flex-col items-center justify-center px-6 lg:px-12">
      <h1 className="text-accent font-mono text-7xl font-bold">404</h1>
      <p className="text-fg-secondary mt-4 font-mono text-sm">page not found</p>
      <Link
        href="/"
        className="group text-fg hover:text-accent mt-8 inline-flex items-center gap-2 font-mono text-sm transition-colors"
      >
        <span aria-hidden className="transition-transform group-hover:-translate-x-1">
          ←
        </span>
        back home
      </Link>
    </main>
  );
}
