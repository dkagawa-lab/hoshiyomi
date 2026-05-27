export function getLineFriendUrl() {
  const url = process.env.NEXT_PUBLIC_LINE_FRIEND_URL?.trim() || "";
  return /^https?:\/\//i.test(url) ? url : "";
}
