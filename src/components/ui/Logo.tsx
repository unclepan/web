import Link from "next/link";

type LogoProps = {
  /** Unique id so the SVG <radialGradient> doesn't clash across the page. */
  id?: string;
  className?: string;
  href?: string;
};

/**
 * The Cruip "Simple" logo: a rounded square with a teal→blue radial gradient.
 * Accepts an `id` so multiple instances (header/footer) can coexist.
 */
export default function Logo({
  id = "header-logo",
  className = "w-8 h-8",
  href = "/",
}: LogoProps) {
  const svg = (
    <svg className={className} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient cx="21.152%" cy="86.063%" fx="21.152%" fy="86.063%" r="79.941%" id={id}>
          <stop stopColor="#4FD1C5" offset="0%" />
          <stop stopColor="#81E6D9" offset="25.871%" />
          <stop stopColor="#338CF5" offset="100%" />
        </radialGradient>
      </defs>
      <rect width="32" height="32" rx="16" fill={`url(#${id})`} fillRule="nonzero" />
    </svg>
  );

  return (
    <Link className="block" href={href} aria-label="Cruip">
      {svg}
    </Link>
  );
}
