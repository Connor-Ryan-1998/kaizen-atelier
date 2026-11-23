/** Kaizen Atelier mark: a little saw-tooth-roof workshop with a vermilion door and an indigo window. */
export function WorkshopLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" strokeLinejoin="round" strokeLinecap="round">
      {/* saw-tooth roof */}
      <path d="M2.5 10.5 L7 6 V10.5 L12 6 V10.5 L17 6 V10.5" stroke="#1E1B18" strokeWidth="1.5" />
      {/* chimney */}
      <path d="M19 10.5 V4.5 H21 V10.5" stroke="#1E1B18" strokeWidth="1.5" />
      {/* walls */}
      <rect x="2.5" y="10.5" width="19" height="10.5" fill="#FBF7EF" stroke="#1E1B18" strokeWidth="1.5" />
      {/* door */}
      <rect x="10" y="14" width="4.5" height="7" fill="#D9472B" stroke="#1E1B18" strokeWidth="1.5" />
      {/* window */}
      <rect x="4.75" y="13" width="3.5" height="3.5" fill="#2C3E63" stroke="#1E1B18" strokeWidth="1.2" />
      {/* hanging wrench sign */}
      <path d="M16.75 13.5 h3" stroke="#2C3E63" strokeWidth="1.5" />
      <circle cx="18.25" cy="16.25" r="1.25" stroke="#2C3E63" strokeWidth="1.2" />
    </svg>
  );
}
