/** Plain-text version for "Save as Note". */
export function devotionalToText(d) {
  const out = [];
  if (d.seriesTitle) out.push(d.seriesTitle.toUpperCase());
  if (d.author) out.push(`With ${d.author}`);
  out.push(`Topic: ${d.topic}`, `Scripture: ${d.bibleVerseReference}`);
  if (d.bibleVerse) out.push(`"${d.bibleVerse}"`);
  out.push("", "MESSAGE", d.exhortation || "");
  (d.sections || []).forEach((s) => {
    out.push("", s.heading.toUpperCase());
    if (s.scriptureReferences) out.push(s.scriptureReferences);
    (s.points || []).forEach((p, i) => {
      out.push("", `${i + 1}. ${p.title}${p.scriptureReferences ? ` ${p.scriptureReferences}` : ""}`);
      if (p.body) out.push(p.body);
    });
  });
  if (d.confession) out.push("", "CONFESSION", d.confession);
  if (d.prayer) out.push("", "PRAYER", d.prayer);
  return out.join("\n").trim();
}
