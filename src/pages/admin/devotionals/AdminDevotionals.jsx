import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, BookOpen, Eye, EyeOff, Calendar } from "lucide-react";
import {
  getAdminDevotionals, createDevotional, updateDevotional, deleteDevotional,
} from "../../../services/DevotionalService";
import Pagination from "../../../community/components/admin/Pagination";
import ConfirmModal from "../../../community/components/admin/ConfirmModal";
import { toast } from "react-toastify";

const EMPTY_FORM = {
  topic: "",
  bibleVerse: "",
  bibleVerseReference: "",
  exhortation: "",
  scriptureForMeditation: "",
  meditationReference: "",
  date: new Date().toISOString().split("T")[0],
  isPublished: true,
};

function DevotionalPreviewCard({ d }) {
  if (!d?.topic) return null;
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-[#401667]">{d.topic}</h2>
      </div>
      <div className="bg-white rounded-xl p-4 border-l-4 border-[#401667]">
        <p className="text-xs font-bold text-[#401667] uppercase tracking-wider mb-1">
          {d.bibleVerseReference}
        </p>
        <p className="text-sm text-gray-700 italic leading-relaxed">"{d.bibleVerse}"</p>
      </div>
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message</p>
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{d.exhortation}</p>
      </div>
      <div className="bg-purple-50 rounded-xl p-4">
        <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
          Scripture for Meditation — {d.meditationReference}
        </p>
        <p className="text-sm text-gray-700 italic leading-relaxed">"{d.scriptureForMeditation}"</p>
      </div>
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
      topic: d.topic,
      bibleVerse: d.bibleVerse,
      bibleVerseReference: d.bibleVerseReference,
      exhortation: d.exhortation,
      scriptureForMeditation: d.scriptureForMeditation,
      meditationReference: d.meditationReference,
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

  const canSubmit = form.topic && form.bibleVerse && form.bibleVerseReference &&
    form.exhortation && form.scriptureForMeditation && form.meditationReference && form.date;

  const formFields = [
    { name: "bibleVerseReference", label: "Bible Verse Reference", placeholder: "e.g. John 3:16", type: "input" },
    { name: "bibleVerse", label: "Bible Verse", placeholder: "For God so loved the world...", type: "textarea", rows: 3 },
    { name: "exhortation", label: "Exhortation / Message", placeholder: "Write your message to the community...", type: "textarea", rows: 7 },
    { name: "meditationReference", label: "Scripture for Meditation (Reference)", placeholder: "e.g. Psalm 23:1-6", type: "input" },
    { name: "scriptureForMeditation", label: "Scripture for Meditation (Text)", placeholder: "The Lord is my shepherd...", type: "textarea", rows: 3 },
  ];

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
                <p className="text-xs text-gray-400">Fill in all fields</p>
              </div>
            </div>
            <button onClick={resetForm} className="text-sm text-gray-400 hover:text-gray-600">
              Cancel
            </button>
          </div>

          <div className="space-y-5">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date <span className="text-red-500">*</span>
                <span className="text-xs text-gray-400 font-normal ml-2">
                  One devotional per day
                </span>
              </label>
              <input
                type="date" name="date" value={form.date} onChange={handleChange}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Topic <span className="text-red-500">*</span>
              </label>
              <input
                type="text" name="topic" value={form.topic} onChange={handleChange}
                placeholder="e.g. Walking in Faith"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Dynamic fields */}
            {formFields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {field.label} <span className="text-red-500">*</span>
                </label>
                {field.type === "input" ? (
                  <input
                    type="text" name={field.name} value={form[field.name]}
                    onChange={handleChange} placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <textarea
                    name={field.name} value={form[field.name]}
                    onChange={handleChange} placeholder={field.placeholder}
                    rows={field.rows}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                )}
              </div>
            ))}

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
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 italic">"{d.bibleVerse}"</p>
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
