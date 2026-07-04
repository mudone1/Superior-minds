import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer id="contact" className="border-t border-ink-300/20 bg-ink text-ink-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Logo variant="light" />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-300">
              A record-keeping system built for schools that take record-keeping seriously.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <h4 className="mb-3 font-mono text-xs uppercase tracking-widest text-brass-400">
                Academy
              </h4>
              <ul className="space-y-2 text-ink-300">
                <li>
                  <a href="#about" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#programs" className="hover:text-white">
                    Programs
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-mono text-xs uppercase tracking-widest text-brass-400">
                Portal
              </h4>
              <ul className="space-y-2 text-ink-300">
                <li>
                  <a href="/login" className="hover:text-white">
                    Sign in
                  </a>
                </li>
                <li>
                  <a href="/forgot-password" className="hover:text-white">
                    Reset password
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 font-mono text-xs text-ink-300">
          © {new Date().getFullYear()} Superior Minds Academy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
