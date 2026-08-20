/**
 * The backend stores post/chat media as plain Cloudinary URLs (mediaUrls: string[])
 * with no per-item type — the MIME type is used only at upload time and not persisted.
 * Cloudinary still differentiates in the URL path: videos are served under
 * `/video/upload/`, images under `/image/upload/`. We use that signal (plus a
 * filename-extension fallback) to decide how to render an item.
 */
export const isVideoUrl = (url = "") => {
  const s = String(url);
  return (
    /\/video\/upload\//.test(s) ||
    /\.(mp4|webm|mov|avi|mkv|m3u8)([?#].*)?$/i.test(s)
  );
};