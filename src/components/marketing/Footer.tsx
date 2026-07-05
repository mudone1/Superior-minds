import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react";
import { ROUTES } from "@/lib/constants";

const QUICK_LINKS = [
  { label: "About", href: "#about" },
  { label: "Programs", href: "#programs" },
  { label: "Admissions", href: "#admissions" },
  { label: "Gallery", href: "#gallery" },
];

export function Footer() {
  return (
    <footer id="footer-contact" className="bg-royal-900 py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Image
                src="/branding/superior-minds-logo.png"
                alt=""
                width={40}
                height={34}
                className="h-9 w-auto"
              />
              <span className="font-jakarta text-base font-bold">Superior Minds Academy</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Shaping bright minds for tomorrow — quality nursery and primary education in
              Minna, Niger State.
            </p>
            <div className="mt-6 flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Follow us on social media"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-gold hover:text-royal-900"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-jakarta text-sm font-bold uppercase tracking-widest text-gold">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-white/70 hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link href={ROUTES.login} className="text-sm text-white/70 hover:text-white">
                  Staff &amp; Parent Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-jakarta text-sm font-bold uppercase tracking-widest text-gold">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <span>Minna, Niger State, Nigeria</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <a href="tel:+2340000000000" className="hover:text-white">
                  +234 000 000 0000
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <a href="mailto:admissions@superiorminds.edu.ng" className="hover:text-white">
                  admissions@superiorminds.edu.ng
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-jakarta text-sm font-bold uppercase tracking-widest text-gold">
              Visiting Hours
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>Monday – Friday: 8:00 AM – 4:00 PM</li>
              <li>Saturday: By appointment</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/50 sm:flex-row">
          <span>&copy; {new Date().getFullYear()} Superior Minds Academy. All rights reserved.</span>
          <Link href={ROUTES.login} className="hover:text-white/80">
            Staff &amp; Parent Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}
