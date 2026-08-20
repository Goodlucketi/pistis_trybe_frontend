import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import axios from "axios";
import {
  BookOpen, StickyNote, Heart, Calendar
} from "lucide-react";
import { BIBLE_BOOKS, READING_PLANS } from "../../store/readingPlans";
import { getNotes, createNote, deleteNote, shareNoteToFeed } from "../../../services/NoteService";
import { getTodaysDevotional } from "../../../services/DevotionalService";
import getErrorMessage from "../../../hooks/useErrorToast";
import NoteModal from "./NoteModal";
import ReadTab from "./ReadTab";
import PlanTab from "./PlanTab";
import DevotionalTab from "./DevotionalTab";
import NotesTab from "./NotesTab";

const fetchPassage = async ({ book, chapter, translation }) => {
  const ref = `${book} ${chapter}`;
  const { data } = await axios.get(
    `https://bible-api.com/${encodeURIComponent(ref)}?translation=${translation}`
  );
  return data;
};

export default function BibleReader() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Reader state
  const [selectedBook, setSelectedBook] = useState("John");
  const [selectedChapter, setSelectedChapter] = useState(3);
  const [selectedVerse, setSelectedVerse] = useState(null); // null = whole chapter
  const [showVersePicker, setShowVersePicker] = useState(false);
  const [translation, setTranslation] = useState("kjv");
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [showChapterPicker, setShowChapterPicker] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  // Plan state
  const [activePlan, setActivePlan] = useState("1-year");
  const [planDay, setPlanDay] = useState(1);
  const [planReading, setPlanReading] = useState(null);

  // Notes state
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [expandedNote, setExpandedNote] = useState(null);

  const currentBook = BIBLE_BOOKS.find((b) => b.name === selectedBook);
  const totalChapters = currentBook?.chapters || 1;

  // Read tab from URL:?tab=devotional
  const [tab, setTab] = useState(searchParams.get("tab") || "read");

  // Sync tab with URL
  useEffect(() => {
    setSearchParams({ tab }, { replace: true });
  }, [tab, setSearchParams]);

  // Listen for URL changes from outside
  // eslint-disable-next-line react-hooks/exhaustive-deps -- must react to URL, not to `tab` itself
  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab && urlTab !== tab) setTab(urlTab);
  }, [searchParams]);

  // reset when book/chapter changes
  useEffect(() => {
    setSelectedVerse(null);
  }, [selectedBook, selectedChapter]);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- intended to seed state once on mount
  useEffect(() => {
    const urlBook = searchParams.get("book");
    const urlChapter = searchParams.get("chapter");
    const urlVerse = searchParams.get("verse");

    if (urlBook) setSelectedBook(urlBook);
    if (urlChapter) setSelectedChapter(parseInt(urlChapter));
    if (urlVerse) {
      setSelectedVerse(parseInt(urlVerse));
      setTimeout(() => {
        document.getElementById(`verse-${urlVerse}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 500);
    }
  }, []); // run once on mount

  // Parse URL params on mount and when they change
  useEffect(() => {
    const urlBook = searchParams.get("book");
    const urlChapter = searchParams.get("chapter");
    const urlVerse = searchParams.get("verse");
    const urlTab = searchParams.get("tab");

    if (urlTab) setTab(urlTab);
    if (urlBook) setSelectedBook(urlBook);
    if (urlChapter) setSelectedChapter(parseInt(urlChapter));

    // Set verse after passage loads so we can scroll
    if (urlVerse) {
      setSelectedVerse(parseInt(urlVerse));
      // Delay scroll until verses are rendered
      setTimeout(() => {
        document.getElementById(`verse-${urlVerse}`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 600);
    }
  }, [searchParams]);

  const { data: devotional, isLoading: devoLoading } = useQuery({
    queryKey: ["devotional-daily"],
    queryFn: getTodaysDevotional,
    staleTime: 60 * 60 * 1000, // 1 hour
    enabled: tab === "devotional",
  });

  const { data: passage, isLoading, error: passageError } = useQuery({
    queryKey: ["bible", selectedBook, selectedChapter, translation],
    queryFn: () => fetchPassage({ book: selectedBook, chapter: selectedChapter, translation }),
    staleTime: 1000 * 60 * 30,
    retry: 1,
    enabled: tab === "read",
  });

  const { data: planPassage, isLoading: planLoading } = useQuery({
    queryKey: ["bible-plan", planReading?.book, planReading?.chapter, translation],
    queryFn: () => fetchPassage({ book: planReading.book, chapter: planReading.chapter, translation }),
    enabled: !!planReading && tab === "plan",
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["notes"],
    queryFn: getNotes,
    enabled: tab === "notes",
  });

  const createNoteMutation = useMutation({
    mutationFn: () => createNote({
      title: noteTitle,
      content: noteContent,
      reference: `${selectedBook} ${selectedChapter}`,
      translation,
      verseText: passage?.verses?.[0]?.text || passage?.text?.slice(0, 200) || "",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setNoteTitle("");
      setNoteContent("");
      setShowNoteForm(false);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const shareNoteMutation = useMutation({
    mutationFn: shareNoteToFeed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Note shared to your feed! 🙏");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const goToPrevChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter((c) => c - 1);
    } else {
      const idx = BIBLE_BOOKS.findIndex((b) => b.name === selectedBook);
      if (idx > 0) {
        const prev = BIBLE_BOOKS[idx - 1];
        setSelectedBook(prev.name);
        setSelectedChapter(prev.chapters);
      }
    }
  };

  const goToNextChapter = () => {
    if (selectedChapter < totalChapters) {
      setSelectedChapter((c) => c + 1);
    } else {
      const idx = BIBLE_BOOKS.findIndex((b) => b.name === selectedBook);
      if (idx < BIBLE_BOOKS.length - 1) {
        const next = BIBLE_BOOKS[idx + 1];
        setSelectedBook(next.name);
        setSelectedChapter(1);
      }
    }
  };

  const currentPlan = READING_PLANS[activePlan];
  const currentDayReadings = currentPlan.plan[planDay - 1]?.readings || [];

  const closeNoteModal = () => {
    setShowNoteForm(false);
    setNoteTitle("");
    setNoteContent("");
  };

  // Helper to jump to verse from devotional
  const jumpToVerse = (reference) => {
    // Match "John 3:16", "Psalm 23:1-3", "Genesis 1:1" etc
    const match = reference.match(/^(.+?)\s+(\d+):(\d+)/);

    if (match) {
      const book = match[1];
      const chapter = match[2];
      const verse = match[3];
      // Pass verse in URL
      navigate(`/dashboard/bible?tab=read&book=${encodeURIComponent(book)}&chapter=${chapter}&verse=${verse}`);
    } else {
      // Fallback if no verse in reference, just go to chapter
      const chMatch = reference.match(/^(.+?)\s+(\d+)/);
      if (chMatch) {
        navigate(`/dashboard/bible?tab=read&book=${encodeURIComponent(chMatch[1])}&chapter=${chMatch[2]}`);
      } else {
        navigate("/dashboard/bible?tab=devotional");
      }
    }
  };

  const saveDevotionalAsNote = () => {
    setTab("notes");
    setShowNoteForm(true);
    setNoteTitle(`Devotional: ${devotional.topic || devotional.bibleVerseReference}`);
    setNoteContent(`Verse: ${devotional.bibleVerse}\n\nReflection: ${devotional.exhortation}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

      <NoteModal
        isOpen={showNoteForm}
        onClose={closeNoteModal}
        selectedBook={selectedBook}
        selectedChapter={selectedChapter}
        translation={translation}
        passage={passage}
        noteTitle={noteTitle}
        setNoteTitle={setNoteTitle}
        noteContent={noteContent}
        setNoteContent={setNoteContent}
        mutation={createNoteMutation}
      />

      {/* Header */}
      <div className="bg-[#401667] px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-purple-200" />
          <h2 className="text-white font-semibold text-lg">Bible</h2>
        </div>
        <div className="grid grid-cols-2 md:flex gap-2 bg-purple-900/40 rounded-xl p-1 overflow-x-auto">
          {[
            { id: "read", label: "Read", icon: BookOpen },
            { id: "plan", label: "Plan", icon: Calendar },
            { id: "devotional", label: "Devotional", icon: Heart },
            { id: "notes", label: "Notes", icon: StickyNote },
          ].map(({ id, label, icon }) => {
            const TabIcon = icon;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`border-1 flex-1 min-w-fit flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  tab === id ? "bg-white text-[#401667] shadow-sm" : "text-purple-200 hover:text-white"
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                {label}
                {id === "notes" && notes.length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === "notes" ? "bg-[#401667] text-white" : "bg-purple-700 text-purple-200"}`}>
                    {notes.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ════════════ READ TAB ════════════ */}
      {tab === "read" && (
        <ReadTab
          showBookPicker={showBookPicker}
          setShowBookPicker={setShowBookPicker}
          showChapterPicker={showChapterPicker}
          setShowChapterPicker={setShowChapterPicker}
          showVersePicker={showVersePicker}
          setShowVersePicker={setShowVersePicker}
          showTranslation={showTranslation}
          setShowTranslation={setShowTranslation}
          selectedBook={selectedBook}
          setSelectedBook={setSelectedBook}
          selectedChapter={selectedChapter}
          setSelectedChapter={setSelectedChapter}
          selectedVerse={selectedVerse}
          setSelectedVerse={setSelectedVerse}
          passage={passage}
          isLoading={isLoading}
          passageError={passageError}
          translation={translation}
          setTranslation={setTranslation}
          totalChapters={totalChapters}
          goToPrevChapter={goToPrevChapter}
          goToNextChapter={goToNextChapter}
          onAddNote={() => setShowNoteForm(true)}
        />
      )}

      {/* ════════════ PLAN TAB ════════════ */}
      {tab === "plan" && (
        <PlanTab
          activePlan={activePlan}
          setActivePlan={setActivePlan}
          planDay={planDay}
          setPlanDay={setPlanDay}
          planReading={planReading}
          setPlanReading={setPlanReading}
          currentPlan={currentPlan}
          currentDayReadings={currentDayReadings}
          planPassage={planPassage}
          planLoading={planLoading}
          selectedVerse={selectedVerse}
          translation={translation}
        />
      )}

      {/* ════════════ DEVOTIONAL TAB ════════════ */}
      {tab === "devotional" && (
        <DevotionalTab
          devotional={devotional}
          devoLoading={devoLoading}
          onJumpToVerse={jumpToVerse}
          onSaveAsNote={saveDevotionalAsNote}
        />
      )}

      {/* ════════════ NOTES TAB ════════════ */}
      {tab === "notes" && (
        <NotesTab
          notes={notes}
          expandedNote={expandedNote}
          setExpandedNote={setExpandedNote}
          shareNoteMutation={shareNoteMutation}
          deleteNoteMutation={deleteNoteMutation}
          onNewNote={() => { setTab("read"); setShowNoteForm(true); }}
        />
      )}
    </div>
  );
}