import { motion } from "framer-motion";
import type { ConversionProgress } from "../types";

interface PageThumbnailGridProps {
  thumbnails: ConversionProgress[];
  totalPages: number;
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
}: PageThumbnailGridProps) {
  const slots = Array.from({ length: totalPages }, (_, i) => {
    const thumb = thumbnails.find((t) => t.currentPage === i + 1);
    return { page: i + 1, thumb };
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
            className="aspect-[3/4] rounded-lg overflow-hidden bg-white dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700 relative group"
          >
            {thumb.thumbnailBase64 ? (
              <img
                src={`data:image/png;base64,${thumb.thumbnailBase64}`}
                alt={`Page ${page}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-accent/5">
                <span className="text-xs font-mono text-accent">{page}</span>
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/40 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-mono text-white">{page}</span>
            </div>
          </motion.div>
        ) : (
          <SkeletonThumbnail key={page} index={page - 1} />
        ),
      )}
    </div>
  );
}
