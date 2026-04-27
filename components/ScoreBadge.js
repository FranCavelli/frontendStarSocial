export default function ScoreBadge({ score = 0, size = "md" }) {
  const value = Number(score || 0);
  const display = value.toFixed(1);

  let bg = "bg-blush";
  let text = "text-ink";
  if (value >= 4.5) {
    bg = "bg-mint";
  } else if (value >= 3.5) {
    bg = "bg-butter";
  } else if (value >= 2.5) {
    bg = "bg-peach";
  } else if (value > 0) {
    bg = "bg-blush";
  } else {
    bg = "bg-white";
  }

  const sizes = {
    sm: "text-xs px-2.5 py-1 gap-1",
    md: "text-sm px-3 py-1.5 gap-1.5",
    lg: "text-2xl px-5 py-2 gap-2 font-display font-bold",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${bg} ${text} ${sizes[size]} shadow-soft border border-white/70`}
    >
      <span className="text-[#f5a524] leading-none">★</span>
      <span className="leading-none">{display}</span>
    </span>
  );
}
