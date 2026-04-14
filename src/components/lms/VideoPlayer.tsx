interface Props {
  videoUrl: string;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match) return match[1];
  }
  return null;
}

export default function VideoPlayer({ videoUrl }: Props) {
  const videoId = extractYouTubeId(videoUrl);

  if (!videoUrl || !videoId) {
    return (
      <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Video no disponible</p>
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-xl overflow-hidden bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
        title="Video de la lección"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
