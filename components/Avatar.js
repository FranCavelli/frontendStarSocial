export default function Avatar({ user, size = 44 }) {
  const initials = (user?.display_name || user?.username || "?")
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const style = { width: size, height: size };

  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.username}
        style={style}
        className="rounded-full object-cover border-2 border-white shadow-soft"
      />
    );
  }
  return (
    <div
      style={style}
      className="rounded-full bg-gradient-to-br from-peach to-blush border-2 border-white shadow-soft flex items-center justify-center text-ink font-display font-bold"
    >
      {initials}
    </div>
  );
}
