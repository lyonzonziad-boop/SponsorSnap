import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <div className="ss-card max-w-md overflow-hidden text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/creator-vlog.jpg" alt="" className="h-40 w-full object-cover" />
        <div className="p-8">
          <h1 className="text-2xl font-semibold">Page not found</h1>
          <p className="text-[var(--ink-soft)]">This URL does not match a SponsorSnap page.</p>
          <Link href="/" className="ss-btn ss-btn-primary mt-4 inline-flex">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
