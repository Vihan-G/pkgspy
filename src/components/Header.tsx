import Link from "next/link";

export function Header() {
  return (
    <header className="h-14 border-b border-[#18181b] bg-[#09090b] sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-[#09090b]/85">
      <div className="mx-auto max-w-7xl h-full px-4 sm:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span
            aria-hidden
            className="grid place-items-center w-7 h-7 rounded-md bg-[#1c1a2b] border border-[#2a2540] text-[#a78bfa]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            </svg>
          </span>
          <span className="font-semibold tracking-tight text-[#fafafa]">pkgspy</span>
          <span className="hidden sm:inline text-[12px] text-[#71717a] ml-1">
            npm dependency visualizer
          </span>
        </Link>

        <a
          href="https://github.com/Vihan-G/pkgspy"
          target="_blank"
          rel="noreferrer noopener"
          className="text-[13px] text-[#a1a1aa] hover:text-white transition-colors flex items-center gap-1.5"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.25 3.35.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18A10.8 10.8 0 0 1 12 6.8c.97 0 1.95.13 2.86.39 2.18-1.49 3.14-1.18 3.14-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.14v3.18c0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
          </svg>
          <span className="hidden sm:inline">github.com/Vihan-G</span>
          <span className="sm:hidden">GitHub</span>
        </a>
      </div>
    </header>
  );
}
