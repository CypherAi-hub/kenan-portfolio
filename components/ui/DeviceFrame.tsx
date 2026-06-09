import Image from "next/image";

export type FrameKind = "phone" | "browser" | "terminal";

export default function DeviceFrame({
  kind,
  src,
  alt,
  priority,
}: {
  kind: FrameKind;
  src: string;
  alt: string;
  priority?: boolean;
}) {
  if (kind === "phone") {
    return (
      <div className="border-border bg-bg-elevated mx-auto aspect-[9/19.5] w-[260px] rounded-[36px] border-2 p-2 shadow-2xl">
        <div className="bg-bg relative h-full w-full overflow-hidden rounded-[28px]">
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="260px"
            className="object-cover"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwQTBCMEQiLz4="
          />
        </div>
      </div>
    );
  }
  if (kind === "browser") {
    return (
      <div className="border-border bg-bg-elevated w-full overflow-hidden rounded-lg border">
        <div className="border-border flex items-center gap-2 border-b px-3 py-2">
          <span className="bg-status-error/60 h-2.5 w-2.5 rounded-full" />
          <span className="bg-status-active/60 h-2.5 w-2.5 rounded-full" />
          <span className="bg-accent/60 h-2.5 w-2.5 rounded-full" />
          <span className="text-fg-muted ml-3 font-mono text-[10px]">{alt}</span>
        </div>
        <div className="relative aspect-[16/10]">
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 640px, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    );
  }
  return (
    <div className="border-border bg-bg w-full overflow-hidden rounded-lg border font-mono">
      <div className="border-border text-fg-muted border-b px-3 py-2 text-[10px]">{alt}</div>
      <div className="relative aspect-[16/10]">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
