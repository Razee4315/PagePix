import { motion } from "framer-motion";
import { MagnifyingGlassPlus } from "@phosphor-icons/react";
import type { ConversionProgress } from "../types";

interface PageThumbnailGridProps {
  thumbnails: ConversionProgress[];
  totalPages: number;
  onThumbnailClick?: (index: number) => void;
}

function SkeletonThumbnail({ index }: { index: number }) {
  return (
    <div className="aspect-[3/4] rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-zinc-700/30 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
          delay: index * 0.1,
        }}
      />
      <div className="absolute bottom-2 left-2">
        <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">
          {index + 1}
        </span>
      </div>
    </div>
  );
}

export function PageThumbnailGrid({
  thumbnails,
  totalPages,
  onThumbnailClick,
}: PageThumbnailGridProps) {
  const slots = Array.from({ length: totalPages }, (_, i) => {
    const thumb = thumbnails.find((t) => t.currentPage === i + 1);
    return { page: i + 1, thumb };
  });

  // Build a mapping from page number to index in the thumbnails array
  // so we can pass the correct index to the lightbox
  const pageToThumbIndex = new Map<number, number>();
  thumbnails.forEach((t, idx) => {
    pageToThumbIndex.set(t.currentPage, idx);
  });

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
      {slots.map(({ page, thumb }) =>
        thumb ? (
          <motion.div
            key={page}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className={`aspect-[3/4] rounded-lg overflow-hidden bg-white dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700 relative group ${
              onThumbnailClick && thumb.thumbnailBase64 ? "cursor-pointer" : ""
            }`}
            onClick={() => {
              if (onThumbnailClick && thumb.thumbnailBase64) {
                const idx = pageToThumbIndex.get(page);
                if (idx !== undefined) onThumbnailClick(idx);
              }
            }}
          >
            {thumb.thumbnailBase64 ? (
              <img
                src={`data:image/png;base64,${thumb.thumbnailBase64}`}
                alt={`Page ${page}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-accent/5">
                <span className="text-xs font-mono text-accent">{page}</span>
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="absolute bottom-0 inset-x-0 p-1.5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-white">{page}</span>
                {onThumbnailClick && thumb.thumbnailBase64 && (
                  <MagnifyingGlassPlus size={12} weight="bold" className="text-white/70" />
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <SkeletonThumbnail key={page} index={page - 1} />
        ),
      )}
    </div>
  );
}
