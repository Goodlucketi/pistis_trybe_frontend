import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, BookOpen, Eye, EyeOff, Calendar, ChevronUp, ChevronDown, X } from "lucide-react";
import {
  getAdminDevotionals, createDevotional, updateDevotional, deleteDevotional,
} from "../../../services/DevotionalService";
import Pagination from "../../../community/components/admin/Pagination";
import ConfirmModal from "../../../community/components/admin/ConfirmModal";
import DevotionalContent from "../../../community/components/feed/DevotionalContent";
import { toast } from "react-toastify";

const DEFAULT_SERIES = "Birthing Conviction Devotional";
const DEFAULT_AUTHOR = "Pastor Japheth Joseph";

const emptyPoint = () => ({ title: "", scriptureReferences: "", body: "" });
const emptySection = () => ({ heading: "", scriptureReferences: "", points: [emptyPoint()] });

const EMPTY_FORM = {
  seriesTitle: DEFAULT_SERIES,
  author: DEFAULT_AUTHOR,
  topic: "",
  bibleVerseReference: "",
  bibleVerse: "",
  exhortation: "",
  sections: [emptySection()],
  confession: "",
  prayer: "",
  date: new Date().toISOString().split("T")[0],
  isPublished: true,
};

const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white";
const textareaCls = `${inputCls} resize-y`;

const move = (arr, i, dir) => {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
        {hint && <span className="text-xs text-gray-400 font-normal ml-2">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function IconBtn({ onClick, title, disabled, danger, children }) {
  return (
    <button
      type="button" onClick={onClick} title={title} disabled={disabled}
      className={`p-1.5 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed ${
        danger ? "text-gray-400 hover:text-red-600 hover:bg-red-50" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

const POINT_BODY_PLACEHOLDER =
  "Explanation. Start a line with \"* \" for a bullet, e.g.\n* The helplessness of man: Man cannot save himself from sin.";

/** Editor for the structured sections: heading → refs → numbered points */
function SectionsEditor({ sections, onChange }) {
  const setSection = (si, patch) =>
    onChange(sections.map((s, i) => (i === si ? { ...s, ...patch } : s)));
  const setPoint = (si, pi, patch) =>
    setSection(si, { points: sections[si].points.map((p, i) => (i === pi ? { ...p, ...patch } : p)) });

  return (
    <div className="space-y-4">
      {sections.map((s, si) => (
        <div key={si} className="rounded-2xl border border-purple-100 bg-purple-50/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-[#401667] uppercase tracking-wider">Section {si + 1}</p>
            <div className="flex items-center">
              <IconBtn title="Move up" disabled={si === 0} onClick={() => onChange(move(sections, si, -1))}><ChevronUp className="w-4 h-4" /></IconBtn>
              <IconBtn title="Move down" disabled={si === sections.length - 1} onClick={() => onChange(move(sections, si, 1))}><ChevronDown className="w-4 h-4" /></IconBtn>
              <IconBtn title="Remove section" danger onClick={() => onChange(sections.filter((_, i) => i !== si))}><Trash2 className="w-4 h-4" /></IconBtn>
            </div>
          </div>

          <input
            className={inputCls} value={s.heading} placeholder="Heading, e.g. WHY IS SOUL WINNING IMPORTANT TO GOD?"
            onChange={(e) => setSection(si, { heading: e.target.value })}
          />
          <input
            className={inputCls} value={s.scriptureReferences} placeholder="Section scriptures (optional), e.g. Pro. 11:30; Dan. 12:3"
            onChange={(e) => setSection(si, { scriptureReferences: e.target.value })}
          />

          <div className="space-y-3 pl-3 border-l-2 border-purple-200">
            {s.points.map((p, pi) => (
              <div key={pi} className="bg-white rounded-xl border border-gray-200 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Point {pi + 1}</span>
                  <div className="flex items-center">
                    <IconBtn title="Move up" disabled={pi === 0} onClick={() => setSection(si, { points: move(s.points, pi, -1) })}><ChevronUp className="w-4 h-4" /></IconBtn>
                    <IconBtn title="Move down" disabled={pi === s.points.length - 1} onClick={() => setSection(si, { points: move(s.points, pi, 1) })}><ChevronDown className="w-4 h-4" /></IconBtn>
                    <IconBtn title="Remove point" danger onClick={() => setSection(si, { points: s.points.filter((_, i) => i !== pi) })}><X className="w-4 h-4" /></IconBtn>
                  </div>
                </div>
                <input
                  className={inputCls} value={p.title} placeholder="Point title, e.g. It gives joy to the Father."
                  onChange={(e) => setPoint(si, pi, { title: e.target.value })}
                />
                <input
                  className={inputCls} value={p.scriptureReferences} placeholder="Scriptures (optional), e.g. John 3:16"
                  onChange={(e) => setPoint(si, pi, { scriptureReferences: e.target.value })}
                />
                <textarea
                  className={textareaCls} rows={3} value={p.body} placeholder={POINT_BODY_PLACEHOLDER}
                  onChange={(e) => setPoint(si, pi, { body: e.target.value })}
                />
              </div>
            ))}
            <button
              type="button" onClick={() => setSection(si, { points: [...s.points, emptyPoint()] })}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#401667] hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Add point
            </button>
          </div>
        </div>
      ))}

      <button
        type="button" onClick={() => onChange([...sections, emptySection()])}
        className="w-full py-2.5 border-2 border-dashed border-purple-200 rounded-xl text-sm font-semibold text-[#401667] hover:bg-purple-50 transition flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add section
      </button>
    </div>
  );
}

function DevotionalPreviewCard({ d }) {
  if (!d?.topic) return null;
  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-xs font-bold text-[#401667] uppercase tracking-widest">{d.seriesTitle || "Daily Devotional"}</p>
        {d.author && <p className="text-xs text-gray-500 mt-0.5">With {d.author}</p>}
      </div>
      <DevotionalContent d={d} compact />
    </div>
  );
}

export { DevotionalPreviewCard };

export default function AdminDevotionals() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirm, setConfirm] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-devotionals", page],
    queryFn: () => getAdminDevotionals(page, 20),
    keepPreviousData: true,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-devotionals"] });

  const createMut = useMutation({
    mutationFn: () => createDevotional(form),
    onSuccess: () => { toast.success("Devotional published!"); invalidate(); resetForm(); },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed to create"),
  });

  const updateMut = useMutation({
    mutationFn: () => updateDevotional(editingId, form),
    onSuccess: () => { toast.success("Devotional updated!"); invalidate(); resetForm(); },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed to update"),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteDevotional(id),
    onSuccess: () => { toast.success("Devotional deleted"); invalidate(); setConfirm(null); },
    onError: (e) => { toast.error(e?.response?.data?.message || "Failed"); setConfirm(null); },
  });

  const togglePublishMut = useMutation({
    mutationFn: ({ id, isPublished }) => updateDevotional(id, { isPublished }),
    onSuccess: (_, { isPublished }) => {
      toast.success(isPublished ? "Published" : "Unpublished");
      invalidate();
    },
    onError: (e) => toast.error(e?.response?.data?.message || "Failed"),
  });

  const resetForm = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(false); };

  const handleEdit = (d) => {
    setForm({
      seriesTitle: d.seriesTitle || DEFAULT_SERIES,
      author: d.author || "",
      topic: d.topic,
      bibleVerseReference: d.bibleVerseReference,
      bibleVerse: d.bibleVerse || "",
      exhortation: d.exhortation,
      sections: d.sections?.length
        ? d.sections.map((s) => ({ ...s, points: s.points?.length ? s.points : [emptyPoint()] }))
        : [emptySection()],
      confession: d.confession || "",
      prayer: d.prayer || "",
      date: d.date,
      isPublished: d.isPublished,
    });
    setEditingId(d._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const canSubmit = form.topic && form.bibleVerseReference && form.exhortation && form.date;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devotionals</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.pagination?.total ?? "—"} total devotionals</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#401667] hover:bg-[#2e1048] text-white text-sm font-semibold rounded-xl transition"
          >
            <Plus className="w-4 h-4" /> New Devotional
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#401667]" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">
                  {editingId ? "Edit Devotional" : "New Devotional"}
                </h2>
                <p className="text-xs text-gray-400">Fields marked * are required</p>
              </div>
            </div>
            <button onClick={resetForm} className="text-sm text-gray-400 hover:text-gray-600">
              Cancel
            </button>
          </div>

          <div className="space-y-5">
            {/* Header info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Devotional title">
                <input name="seriesTitle" value={form.seriesTitle} onChange={handleChange}
                  placeholder={DEFAULT_SERIES} className={inputCls} />
              </Field>
              <Field label="Minister">
                <input name="author" value={form.author} onChange={handleChange}
                  placeholder={DEFAULT_AUTHOR} className={inputCls} />
              </Field>
            </div>

            <Field label="Date" required hint="One devotional per day">
              <input type="date" name="date" value={form.date} onChange={handleChange}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </Field>

            <Field label="Topic" required>
              <input name="topic" value={form.topic} onChange={handleChange}
                placeholder="e.g. Join This Chariot; Becoming Radical with the Gospel of Jesus Christ" className={inputCls} />
            </Field>

            <Field label="Scripture" required>
              <input name="bibleVerseReference" value={form.bibleVerseReference} onChange={handleChange}
                placeholder="e.g. Romans 1:16" className={inputCls} />
            </Field>

            <Field label="Scripture text" hint="Optional, shown as a quote under the reference">
              <textarea name="bibleVerse" value={form.bibleVerse} onChange={handleChange} rows={2}
                placeholder="For I am not ashamed of the gospel of Christ..." className={textareaCls} />
            </Field>

            <Field label="Message" required hint="Opening message. Leave a blank line between paragraphs">
              <textarea name="exhortation" value={form.exhortation} onChange={handleChange} rows={7}
                placeholder="Soul winning is the main assignment of every believer..." className={textareaCls} />
            </Field>

            <Field label="Sections" hint="Each heading with its numbered points">
              <SectionsEditor
                sections={form.sections}
                onChange={(sections) => setForm((prev) => ({ ...prev, sections }))}
              />
            </Field>

            <Field label="Confession">
              <textarea name="confession" value={form.confession} onChange={handleChange} rows={4}
                placeholder="I am a radical soul winner..." className={textareaCls} />
            </Field>

            <Field label="Prayer" hint="Leave a blank line between paragraphs">
              <textarea name="prayer" value={form.prayer} onChange={handleChange} rows={6}
                placeholder="Lord, give me a heart for souls..." className={textareaCls} />
            </Field>

            {/* Publish toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox" id="isPublished" name="isPublished"
                checked={form.isPublished} onChange={handleChange}
                className="w-4 h-4 accent-[#401667]"
              />
              <label htmlFor="isPublished" className="text-sm text-gray-700 font-medium">
                Publish immediately
              </label>
            </div>

            {/* Live preview */}
            {form.topic && (
              <div className="bg-gradient-to-br from-[#401667]/5 to-purple-50 rounded-2xl p-5 border border-purple-100">
                <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider mb-4">
                  Live Preview
                </p>
                <DevotionalPreviewCard d={form} />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={resetForm}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                Cancel
              </button>
              <button
                onClick={() => editingId ? updateMut.mutate() : createMut.mutate()}
                disabled={!canSubmit || createMut.isPending || updateMut.isPending}
                className="flex-1 px-5 py-2.5 bg-[#401667] hover:bg-[#2e1048] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
              >
                {(createMut.isPending || updateMut.isPending) && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {editingId ? "Save Changes" : "Publish Devotional"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Devotionals list */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-4 border-[#401667] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !data?.devotionals?.length ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No devotionals yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.devotionals.map((d) => (
            <div key={d._id} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      d.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {d.isPublished ? "Published" : "Draft"}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "long", year: "numeric", month: "long", day: "numeric",
                      })}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">{d.topic}</h3>
                  <p className="text-xs text-purple-600 font-medium mt-0.5">{d.bibleVerseReference}</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {d.bibleVerse ? `"${d.bibleVerse}"` : d.exhortation}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setExpandedId(expandedId === d._id ? null : d._id)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => togglePublishMut.mutate({ id: d._id, isPublished: !d.isPublished })}
                    className={`p-2 rounded-lg transition ${
                      d.isPublished
                        ? "hover:bg-amber-50 text-amber-500 hover:text-amber-700"
                        : "hover:bg-green-50 text-gray-400 hover:text-green-600"
                    }`}
                    title={d.isPublished ? "Unpublish" : "Publish"}
                  >
                    {d.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(d)}
                    className="p-2 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-[#401667] transition"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirm({ id: d._id, topic: d.topic })}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded preview */}
              {expandedId === d._id && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <DevotionalPreviewCard d={d} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} pages={data?.pagination?.pages} onPageChange={setPage} />

      <ConfirmModal
        isOpen={!!confirm}
        title={`Delete "${confirm?.topic}"?`}
        message="This devotional will be permanently deleted and removed from the app."
        confirmLabel="Delete"
        onConfirm={() => deleteMut.mutate(confirm?.id)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
