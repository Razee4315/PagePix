import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  // Smooth animated counter
  const motionPercent = useMotionValue(0);
  const displayPercent = useTransform(motionPercent, (v) => `${Math.round(v)}%`);
  const prevPercent = useRef(0);

  useEffect(() => {
    const controls = animate(motionPercent, percent, {
      type: "spring",
      stiffness: 80,
      damping: 20,
    });
    prevPercent.current = percent;
    return controls.stop;
  }, [percent, motionPercent]);

  // Page segment markers
  const segments = total > 1 && total <= 40
    ? Array.from({ length: total - 1 }, (_, i) => ((i + 1) / total) * 100)
    : [];

  return (
    <div className="w-full space-y-3">
      {/* Header row */}
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
            Page {current}
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            of {total}
          </span>
        </div>
        <motion.span
          className="text-sm font-mono font-semibold text-accent tabular-nums"
        >
          {displayPercent}
        </motion.span>
      </div>

      {/* Bar */}
      <div className="relative h-2.5 w-full rounded-full bg-zinc-200/80 dark:bg-zinc-800/80 overflow-hidden">
        {/* Filled portion */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          style={{
            background: "linear-gradient(90deg, var(--color-accent) 0%, #60a5fa 50%, var(--color-accent) 100%)",
            backgroundSize: "200% 100%",
          }}
        >
          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
            }}
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>

        {/* Leading edge glow */}
        {percent > 0 && percent < 100 && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
              filter: "blur(4px)",
            }}
            initial={{ left: 0 }}
            animate={{ left: `${percent}%` }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
          />
        )}

        {/* Page segment tick marks */}
        {segments.map((pos, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px"
            style={{ left: `${pos}%` }}
          >
            <div className={`w-full h-full ${
              pos < percent
                ? "bg-white/20"
                : "bg-zinc-300/50 dark:bg-zinc-700/50"
            }`} />
          </div>
        ))}
      </div>

      {/* Completion state */}
      {percent === 100 && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="text-xs font-medium text-success"
        >
          Finalizing...
        </motion.p>
      )}
    </div>
  );
}
