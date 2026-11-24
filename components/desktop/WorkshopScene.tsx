/**
 * Decorative workshop illustration behind the desktop icons and windows.
 * Shown only on roomy screens (see the `roomy` variant in globals.css). The SVG carries
 * its own CSS animations and switches them off for prefers-reduced-motion.
 */
export function WorkshopScene() {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG; next/image adds nothing here
    <img
      data-workshop
      src="/desk/workshop.svg"
      alt=""
      aria-hidden="true"
      draggable={false}
      decoding="async"
      className="pointer-events-none absolute bottom-0 left-1/2 z-0 hidden aspect-[2/1] w-[min(820px,70%)] -translate-x-1/2 select-none roomy:block"
    />
  );
}
