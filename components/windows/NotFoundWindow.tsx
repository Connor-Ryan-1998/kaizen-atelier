export function NotFoundWindow() {
  return (
    <div>
      <p className="mb-4 font-mono text-sm">This file doesn&apos;t exist. Like my weekends.</p>
      {/* Intentional full navigation: leaves the 404 response and resets the desktop. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a
        href="/"
        className="inline-block rounded-[7px] border-[1.5px] border-ink bg-vermilion px-3.5 py-2 text-sm font-bold text-white shadow-hard"
      >
        Back to desktop
      </a>
    </div>
  );
}
