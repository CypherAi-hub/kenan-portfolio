export default function BrandLogo({ footer = false }: { footer?: boolean }) {
  return (
    <span
      className={"kjl-wordmark" + (footer ? " kjl-wordmark-footer" : "")}
      aria-label="KJL Designs"
    >
      <span className="kjl-initials" aria-hidden="true">
        kjl<span>.</span>
      </span>
      <span className="kjl-wordmark-name" aria-hidden="true">
        Designs<span>Independent digital studio</span>
      </span>
    </span>
  );
}
