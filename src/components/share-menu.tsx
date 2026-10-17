"use client";
import { useEffect, useId, useRef, useState } from "react";
function ShareGlyph({ kind }: { kind: "whatsapp" | "facebook" | "copy" }) {
  if (kind === "whatsapp") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a9.5 9.5 0 0 0-8.1 14.46L2.6 21.4l5.05-1.28A9.5 9.5 0 1 0 12 2Zm0 17.3a7.75 7.75 0 0 1-3.95-1.08l-.28-.17-2.99.76.8-2.91-.18-.3A7.76 7.76 0 1 1 12 19.3Zm4.25-5.8c-.23-.12-1.38-.68-1.6-.76-.21-.08-.37-.12-.52.12-.16.23-.6.76-.74.91-.13.16-.27.18-.5.06-.23-.12-.98-.36-1.86-1.15a6.94 6.94 0 0 1-1.29-1.6c-.13-.23-.01-.36.1-.47.1-.1.23-.27.35-.4.11-.14.15-.24.23-.4.08-.15.04-.29-.02-.4-.06-.12-.52-1.26-.72-1.72-.19-.46-.38-.4-.52-.4h-.45c-.16 0-.4.06-.62.3-.21.23-.81.79-.81 1.94 0 1.14.83 2.25.95 2.4.11.16 1.63 2.5 3.96 3.5.55.24.98.38 1.32.49.56.17 1.06.15 1.46.09.45-.07 1.38-.57 1.58-1.11.19-.55.19-1.03.13-1.12-.05-.1-.21-.16-.44-.28Z" /></svg>;
  if (kind === "facebook") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8.5V7.2c0-.63.42-.78.72-.78h1.82V3.14L14.03 3C10.9 3 9.8 4.87 9.8 7.45V8.5H7v3.68h2.8V21H14v-8.82h2.8l.42-3.68H14Z" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 7A4.5 4.5 0 0 0 4 11.5v4A4.5 4.5 0 0 0 8.5 20h4a4.5 4.5 0 0 0 4.24-3H14.5a2.5 2.5 0 0 1-2 1h-4A2.5 2.5 0 0 1 6 15.5v-4A2.5 2.5 0 0 1 8.5 9h2V7h-2Zm3-3A4.5 4.5 0 0 0 7.26 7h2.24a2.5 2.5 0 0 1 2-1h4a2.5 2.5 0 0 1 2.5 2.5v4a2.5 2.5 0 0 1-2.5 2.5h-2v2h2a4.5 4.5 0 0 0 4.5-4.5v-4A4.5 4.5 0 0 0 15.5 4h-4Zm-3 7.5a1 1 0 0 1 1-1h5a1 1 0 1 1 0 2h-5a1 1 0 0 1-1-1Z" /></svg>;
}

export function ShareMenu({ title, icon, onCopy, inline = false, href = "/#destinations" }: { title: string; icon: string; onCopy: (title: string) => Promise<void>; inline?: boolean; href?: string }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", escape);
    return () => { window.removeEventListener("pointerdown", close); window.removeEventListener("keydown", escape); };
  }, []);
  function openPlatform(platform: "whatsapp" | "facebook") {
    const url = new URL(href, window.location.origin).href;
    const target = platform === "whatsapp"
      ? `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`
      : `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(target, "_blank", "noopener,noreferrer");
    setOpen(false);
  }
  return <div ref={root} className={`share-menu ${inline ? "share-inline" : ""} ${open ? "open" : ""}`}>
    <button className="share-button" aria-label={`Share ${title}`} aria-expanded={open} aria-controls={menuId} onClick={() => setOpen(value => !value)}><img className="icon" src={icon.startsWith("/") ? icon : `/figma/${icon}.svg`} alt="" />{inline && "Share"}</button>
    <div id={menuId} className="share-popover" aria-label={`Sharing options for ${title}`}>
      <button aria-label="Share on WhatsApp" onClick={() => openPlatform("whatsapp")}><ShareGlyph kind="whatsapp" /><span>WhatsApp</span></button>
      <button aria-label="Share on Facebook" onClick={() => openPlatform("facebook")}><ShareGlyph kind="facebook" /><span>Facebook</span></button>
      <button aria-label="Copy package link" onClick={async () => { await onCopy(title); setOpen(false); }}><ShareGlyph kind="copy" /><span>Copy link</span></button>
    </div>
  </div>;
}
