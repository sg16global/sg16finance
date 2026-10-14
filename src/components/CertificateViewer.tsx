"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BadgeCheck, Minus, Plus, X, ZoomIn } from "lucide-react";

const CERT_SRC = "/license/nm-certificate-of-organization.webp";
const WATERMARK_TEXT = "OFFICIAL PROPERTY OF SAIF TECH GLOBAL LLC - VERIFICATION ONLY";

// Tiled, rotated watermark layer painted above the certificate image.
const watermarkTile = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='520' height='260'><text x='260' y='130' text-anchor='middle' transform='rotate(-28 260 130)' font-family='Arial,sans-serif' font-size='13' font-weight='700' fill='#C76A16' fill-opacity='0.28'>${WATERMARK_TEXT}</text></svg>`,
)}")`;

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.5;

const block = (e: { preventDefault: () => void }) => e.preventDefault();

function ProtectedCertificate({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative select-none ${className}`}
      onContextMenu={block}
      onDragStart={block}
      style={{ WebkitTouchCallout: "none", userSelect: "none" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={CERT_SRC}
        alt="State of New Mexico Certificate of Organization for Saif Tech Global LLC"
        draggable={false}
        className="block w-full h-auto"
        style={{ userSelect: "none", pointerEvents: "none" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ backgroundImage: watermarkTile, backgroundRepeat: "repeat", pointerEvents: "none", userSelect: "none" }}
      />
    </div>
  );
}

export default function CertificateViewer() {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setZoom(MIN_ZOOM);
    openerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
      else if (e.key === "-") setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
      // Block save / print shortcuts while the viewer is open (deterrent only).
      else if ((e.ctrlKey || e.metaKey) && ["s", "p", "u"].includes(e.key.toLowerCase())) e.preventDefault();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="View official State of New Mexico Certificate of Organization"
        className="group relative block w-full max-w-[200px] overflow-hidden rounded-lg border border-[#C76A16]/30 bg-white/5 transition-colors hover:border-[#FF9A3C]/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9A3C]"
      >
        <ProtectedCertificate />
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-[#050709]/85 py-1.5 text-[10px] font-mono-data font-bold uppercase tracking-wider text-[#FF9A3C] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <ZoomIn className="h-3 w-3" />
          Verify license
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Certificate of Organization verification"
          className="fixed inset-0 z-[100] flex flex-col bg-[#050709]/95 backdrop-blur-sm"
          onClick={close}
          onContextMenu={block}
        >
          <div
            className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-white">
              <BadgeCheck className="h-4 w-4 text-[#2ECC71]" />
              <span className="text-xs font-semibold">Certificate of Organization · Saif Tech Global LLC</span>
              <span className="hidden sm:inline text-[10px] font-mono-data text-[#7D8594]">0008128993 · NEW MEXICO</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
                disabled={zoom <= MIN_ZOOM}
                aria-label="Zoom out"
                className="rounded-md border border-white/10 p-1.5 text-white/80 hover:border-[#FF9A3C]/60 hover:text-white disabled:opacity-30"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-10 text-center text-[11px] font-mono-data text-[#FF9A3C]">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
                disabled={zoom >= MAX_ZOOM}
                aria-label="Zoom in"
                className="rounded-md border border-white/10 p-1.5 text-white/80 hover:border-[#FF9A3C]/60 hover:text-white disabled:opacity-30"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close certificate viewer"
                className="ml-2 rounded-md border border-white/10 p-1.5 text-white/80 hover:border-[#FF9A3C]/60 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4" onClick={close}>
            <div
              className="mx-auto cursor-zoom-in"
              style={{ width: `min(${zoom * 100}%, ${zoom * 640}px)`, cursor: zoom >= MAX_ZOOM ? "zoom-out" : "zoom-in" }}
              onClick={(e) => {
                e.stopPropagation();
                setZoom((z) => (z >= MAX_ZOOM ? MIN_ZOOM : Math.min(MAX_ZOOM, z + ZOOM_STEP)));
              }}
            >
              <ProtectedCertificate className="rounded-sm shadow-2xl shadow-black/60" />
            </div>
          </div>

          <p
            className="border-t border-white/10 px-4 py-2 text-center text-[10px] font-mono-data text-[#7D8594]"
            onClick={(e) => e.stopPropagation()}
          >
            Click the certificate or use +/− to zoom · Reproduction prohibited · Verification use only
          </p>
        </div>
      )}
    </>
  );
}
