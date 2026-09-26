import type { SVGProps } from "react";

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="32" height="32" viewBox="0 0 1252 1252" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path fill="#000" d="M504 920.9c-122.6-7.36-229.83-41.78-304.67-97.8-28.96-21.67-48.34-41.22-56.2-56.68-5.05-9.94-6.47-17.25-5.81-29.92.9-17.37 6.08-33.32 19.25-59.22l7.23-14.23-.54-20.28c-2.34-87.52 31.22-166.64 91.24-215.08 39.88-32.18 88.78-51.4 151-59.35 19.89-2.54 57.52-2.52 74 .04 65.47 10.15 127.87 42.65 184.26 95.93 33.34 31.51 58.68 62.25 91.13 110.52 17.36 25.83 26.83 36.94 40.75 47.81 43.08 33.64 96.81 38.75 131.48 12.5 8.27-6.26 12.76-11.47 17.28-20.07 13.88-26.43 6.26-51.54-23.07-76.04-5.41-4.51-11.68-10.3-13.93-12.87-13.88-15.77-22.72-36.54-26.5-62.28-2.55-17.31-.8-57.28 3.16-72.07 1.61-6.05 6.3-6.2 9.93-.33 3.31 5.35 16.49 17.22 26.33 23.69 16.88 11.1 34.44 18.83 53.46 23.53 8.83 2.18 13.01 2.65 23.72 2.64l13-.01 21.85-10.16c51.35-23.87 77.12-41.31 91.52-61.92 4.93-7.06 9.41-3.22 12.95 11.11 3.49 14.06 4.49 26.31 3.9 47.48-1.75 62.17-24.98 120.97-67.12 169.86-13.74 15.95-37.66 37.42-51.35 46.11-3.31 2.1-4.38 3.46-4.84 6.19-1.37 8.19-5.9 23.27-10.07 33.5C987.6 732 944.03 784.84 890.5 825.21c-37.88 28.56-83.55 53.01-123.9 66.33-46.99 15.51-105.05 25.66-168.31 29.43-19.66 1.18-74.22 1.13-94.29-.07M281.49 761.5c20.6-3.14 39.01-9.36 53.51-18.11 8.52-5.14 10.2-7.23 7.96-9.94-1.82-2.2-2.95-1.86-11.91 3.52-9.88 5.94-21.13 10.43-34.05 13.59-15.73 3.85-25.38 4.82-48 4.81-23.28-.02-38.75-1.47-66.98-6.31-9.07-1.55-17.02-2.61-17.68-2.36-1.79.69-2.45 3.22-1.37 5.25 1.08 2.02 13.21 4.59 38.22 8.11 29.22 4.12 59.14 4.65 80.3 1.44m67.71-172.61c22.96-4.81 39.83-28.76 35.94-51.02-4.07-23.36-25.42-40.48-48.1-38.58-18.58 1.56-34.48 14.44-40.03 32.42-9.89 32.03 19.34 64.06 52.19 57.18"/>
    </svg>
  );
}

export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  );
}

export function DownloadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "", ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function HamburgerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
