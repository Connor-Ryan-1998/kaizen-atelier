import { DEMO_VIDEO_ID } from "@/lib/site";

export function DemoWindow({ videoId = DEMO_VIDEO_ID }: { videoId?: string | null }) {
  return (
    <figure>
      <div className="relative aspect-video w-full overflow-hidden rounded-md border-[1.5px] border-ink bg-ink">
        {videoId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            title="Live demo"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex flex-col items-center gap-3">
              <span aria-hidden className="h-9 w-9 animate-spin rounded-full border-[3px] border-surface/30 border-t-vermilion" />
              <span className="font-mono text-sm text-surface">buffering… (forever)</span>
            </div>
          </div>
        )}
      </div>
      <figcaption className="mt-3 text-sm italic text-muted">Live demos never fail. This is a recording.</figcaption>
    </figure>
  );
}
