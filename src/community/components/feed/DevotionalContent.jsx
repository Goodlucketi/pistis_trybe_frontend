/**
 * Renders a devotional's body in the "Birthing Conviction" structure:
 * Topic → Scripture → Message → Sections (heading, refs, numbered points) → Confession → Prayer.
 * Shared by the reader tab and the admin live preview.
 */

const BULLET_RE = /^\s*[*•-]\s+/;

/** Renders free text: blank lines split paragraphs; lines starting with "* " or "- " become bullets. */
export function RichText({ text, className = "" }) {
  if (!text?.trim()) return null;

  const blocks = [];
  let para = [];
  let bullets = [];
  const flushPara = () => { if (para.length) { blocks.push({ type: "p", lines: para }); para = []; } };
  const flushBullets = () => { if (bullets.length) { blocks.push({ type: "ul", items: bullets }); bullets = []; } };

  text.split(/\r?\n/).forEach((line) => {
    if (!line.trim()) { flushPara(); flushBullets(); return; }
    if (BULLET_RE.test(line)) { flushPara(); bullets.push(line.replace(BULLET_RE, "")); return; }
    flushBullets();
    para.push(line);
  });
  flushPara();
  flushBullets();

  return (
    <div className={`space-y-3 ${className}`}>
      {blocks.map((b, i) =>
        b.type === "p" ? (
          <p key={i} className="text-gray-700 leading-relaxed whitespace-pre-line">{b.lines.join("\n")}</p>
        ) : (
          <ul key={i} className="list-disc pl-5 space-y-1.5 text-gray-700 leading-relaxed">
            {b.items.map((item, j) => {
              // "Label: rest" → bold label
              const m = item.match(/^([^:]{2,60}):\s+(.*)$/);
              return (
                <li key={j}>
                  {m ? (<><span className="font-semibold text-gray-900">{m[1]}:</span> {m[2]}</>) : item}
                </li>
              );
            })}
          </ul>
        )
      )}
    </div>
  );
}

const Refs = ({ children }) =>
  children?.trim() ? <p className="text-sm font-semibold text-[#401667] mt-1">{children}</p> : null;

const SectionLabel = ({ children }) => (
  <h3 className="text-sm font-bold text-[#401667] uppercase tracking-wider mb-3">{children}</h3>
);

export default function DevotionalContent({ d, compact = false }) {
  if (!d) return null;
  const sections = (d.sections || []).filter((s) => s?.heading?.trim());

  return (
    <div className={compact ? "space-y-5 text-sm" : "space-y-8"}>
      {/* Topic + main scripture */}
      <div className="text-center">
        {d.topic && (
          <h2 className={`${compact ? "text-lg" : "text-xl md:text-2xl"} font-bold text-gray-900 uppercase leading-snug`}>
            {d.topic}
          </h2>
        )}
        {d.bibleVerseReference && (
          <p className="inline-block mt-3 px-3 py-1 rounded-full bg-purple-100 text-[#401667] text-sm font-semibold">
            Scripture: {d.bibleVerseReference}
          </p>
        )}
      </div>

      {d.bibleVerse?.trim() && (
        <div className="bg-purple-50 border-l-4 border-[#401667] rounded-r-xl p-5">
          <p className="text-gray-800 font-medium italic leading-relaxed">"{d.bibleVerse}"</p>
          <p className="text-sm text-[#401667] font-semibold mt-2">— {d.bibleVerseReference}</p>
        </div>
      )}

      {/* Message */}
      {d.exhortation?.trim() && (
        <section>
          <SectionLabel>Message</SectionLabel>
          <RichText text={d.exhortation} />
        </section>
      )}

      {/* Structured sections */}
      {sections.map((s, si) => (
        <section key={si}>
          <div className="border-b border-gray-200 pb-2 mb-4">
            <h3 className="font-bold text-gray-900 uppercase tracking-wide">{s.heading}</h3>
            <Refs>{s.scriptureReferences}</Refs>
          </div>
          <ol className="space-y-4">
            {(s.points || []).filter((p) => p?.title?.trim()).map((p, pi) => (
              <li key={pi} className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-[#401667] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {pi + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{p.title}</p>
                  <Refs>{p.scriptureReferences}</Refs>
                  <RichText text={p.body} className="mt-2" />
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}

      {/* Legacy: scripture for meditation (older devotionals) */}
      {d.scriptureForMeditation?.trim() && (
        <div className="bg-gray-50 rounded-xl p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Scripture for Meditation</p>
          <p className="text-sm text-gray-700 italic leading-relaxed mb-2">"{d.scriptureForMeditation}"</p>
          <p className="text-xs text-[#401667] font-semibold">— {d.meditationReference}</p>
        </div>
      )}

      {/* Confession */}
      {d.confession?.trim() && (
        <section className="bg-[#401667] text-white rounded-2xl p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-purple-200">Confession</h3>
          <p className="leading-relaxed whitespace-pre-line font-medium">{d.confession}</p>
        </section>
      )}

      {/* Prayer */}
      {d.prayer?.trim() && (
        <section className="bg-purple-50 border border-purple-100 rounded-2xl p-5">
          <SectionLabel>Prayer</SectionLabel>
          <RichText text={d.prayer} />
        </section>
      )}
    </div>
  );
}
