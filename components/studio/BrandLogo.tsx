import Image from "next/image";
export default function BrandLogo({ footer = false }: { footer?: boolean }) {
  return (
    <span className={"brand-lockup" + (footer ? " brand-lockup-footer" : "")}>
      <Image
        src="/brand/kjl-designs-single-monogram.png"
        alt="KJL Designs"
        width={2172}
        height={724}
        priority={!footer}
        className="brand-lockup-image"
      />
    </span>
  );
}
