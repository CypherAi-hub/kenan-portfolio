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
      <div className="mx-auto aspect-[9/19.5] w-[260px] rounded-[36px] border-2 border-border bg-bg-elevated p-2 shadow-2xl">
        <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-bg">
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
      <div className="w-full overflow-hidden rounded-lg border border-border bg-bg-elevated">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-status-error/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-status-active/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent/60" />
          <span className="ml-3 font-mono text-[10px] text-fg-muted">{alt}</span>
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
    <div className="w-full overflow-hidden rounded-lg border border-border bg-bg font-mono">
      <div className="border-b border-border px-3 py-2 text-[10px] text-fg-muted">{alt}</div>
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
