export function Footer() {
  return (
    <footer className="border-t border-[#18181b] bg-[#09090b]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="grid place-items-center w-6 h-6 rounded-md bg-[#1c1a2b] border border-[#2a2540] text-[#a78bfa]"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
              </svg>
            </span>
            <span className="font-semibold text-[#fafafa] text-[14px]">pkgspy</span>
          </div>
          <div className="text-[12.5px] text-[#a1a1aa] flex flex-col sm:items-end gap-0.5">
            <span>
              Made by{" "}
              <a
                href="https://github.com/Vihan-G"
                target="_blank"
                rel="noreferrer noopener"
                className="text-[#fafafa] hover:text-[#a78bfa] transition-colors font-medium"
              >
                Vihan Goenka
              </a>{" "}
              · UCSD CS &rsquo;29
            </span>
            <a
              href="https://github.com/Vihan-G/pkgspy"
              target="_blank"
              rel="noreferrer noopener"
              className="text-[#71717a] hover:text-[#a78bfa] transition-colors"
            >
              github.com/Vihan-G/pkgspy
            </a>
          </div>
        </div>
        <div className="border-t border-[#18181b] pt-4 text-center text-[11.5px] text-[#52525b]">
          Data from{" "}
          <a
            href="https://bundlephobia.com"
            target="_blank"
            rel="noreferrer noopener"
            className="text-[#71717a] hover:text-[#a78bfa] transition-colors"
          >
            bundlephobia.com
          </a>{" "}
          and{" "}
          <a
            href="https://registry.npmjs.org"
            target="_blank"
            rel="noreferrer noopener"
            className="text-[#71717a] hover:text-[#a78bfa] transition-colors"
          >
            registry.npmjs.org
          </a>
          .
        </div>
      </div>
    </footer>
  );
}
