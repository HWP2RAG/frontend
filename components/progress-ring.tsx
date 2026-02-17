"use client";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  status: "pending" | "validating" | "uploading" | "success" | "error";
}

const STATUS_COLORS = {
  pending: "#9ca3af",
  validating: "#f59e0b",
  uploading: "#3b82f6",
  success: "#22c55e",
  error: "#ef4444",
} as const;

export function ProgressRing({
  progress,
  size = 32,
  strokeWidth = 3,
  status,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const color = STATUS_COLORS[status];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.3s ease" }}
      />
      {status === "success" && (
        <path
          d={`M${size * 0.3} ${size * 0.5} L${size * 0.45} ${size * 0.65} L${size * 0.7} ${size * 0.35}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth - 0.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
