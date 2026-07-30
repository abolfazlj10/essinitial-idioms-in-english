"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Eye,
  Search,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import ResultStory from "@/components/story/result";
import { useLevelBooks } from "@/hooks/use-level-books";
import { getIdiomsForLesson, getLessons, idiomMatchesSearch, LEVELS, type IdiomEntry, type LevelSummary } from "@/lib/idioms";
import { getFirstLessonNumber, getParam, parseLessonParam, parseLevelParam } from "@/lib/study-navigation";
import { addStory, getBookmarks, toggleBookmark, type Bookmark as StoredBookmark } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { useStoryGenerator } from "@/hooks/useStory";
import type { Book as BookData, LevelId } from "@/types/types";

const DEFAULT_LEVEL: LevelId = "elementary";
const STUDY_BLUR_MODE_KEY = "idioms:v1:lesson-study-blur-mode";

export type StudySearchParams = {
  level?: string | string[];
  lesson?: string | string[];
  idiom?: string | string[];
};

type BookPageProps = {
  initialBook: BookData;
  initialLevel: LevelId;
  levelSummaries: LevelSummary[];
  searchParams?: StudySearchParams;
};

type StudyBlurMode = "persian" | "english" | "none";
type LineLanguage = "english" | "persian";

function readStudyBlurMode(): StudyBlurMode {
  try {
    const saved = window.localStorage.getItem(STUDY_BLUR_MODE_KEY);
    return saved === "english" || saved === "none" || saved === "persian" ? saved : "persian";
  } catch {
    return "persian";
  }
}

function saveStudyBlurMode(mode: StudyBlurMode): void {
  try {
    window.localStorage.setItem(STUDY_BLUR_MODE_KEY, mode);
  } catch {
    // The in-memory preference remains useful if storage is unavailable.
  }
}

function padPosition(position: number): string {
  return String(position).padStart(2, "0");
}

function getRequestedLesson(levelSummaries: LevelSummary[], level: LevelId, searchParams?: StudySearchParams): number {
  return parseLessonParam(levelSummaries, level, getParam(searchParams?.lesson)) ?? getFirstLessonNumber(levelSummaries, level);
}

function isCovered(mode: StudyBlurMode, overrides: Record<string, boolean>, key: string, language: LineLanguage): boolean {
  const defaultCovered = mode === "persian" ? language === "persian" : mode === "english" ? language === "english" : false;
  return overrides[`${key}:${language}`] ? !defaultCovered : defaultCovered;
}

function StudyLine({
  language,
  text,
  covered,
  onReveal,
}: {
  language: LineLanguage;
  text: string;
  covered: boolean;
  onReveal: () => void;
}): React.ReactElement {
  const isPersian = language === "persian";

  if (!covered) {
    return (
      <p
        dir={isPersian ? "rtl" : "ltr"}
        className={cn(
          "m-0 transition-opacity duration-300",
          isPersian ? "font-iranYekan text-[15.5px] leading-[31px] text-[#4e4c46]" : "text-[21px] leading-[34px] tracking-[-0.01em] text-[#16181c]"
        )}
      >
        {text}
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={onReveal}
      aria-label={`Reveal ${isPersian ? "Persian translation" : "English example"}`}
      className={cn(
        "lesson-redacted-line block w-full cursor-pointer border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-3 focus-visible:ring-[#1f4fd8]/25",
        isPersian ? "font-iranYekan text-[15.5px] leading-[31px]" : "text-[21px] leading-[34px] tracking-[-0.01em]"
      )}
    >
      <span dir={isPersian ? "rtl" : "ltr"}>{text}</span>
    </button>
  );
}

function StudyReference({ idiom }: { idiom: IdiomEntry }): React.ReactElement {
  const rows = [
    { label: "Definition", text: idiom.english_definition, dir: "ltr" as const },
    { label: "Persian definition", text: idiom.persian_definition_meaning, dir: "rtl" as const },
    { label: "Usage note", text: idiom.english_explanation, dir: "ltr" as const },
    { label: "Persian note", text: idiom.persian_explanation_meaning, dir: "rtl" as const },
  ].filter((row) => Boolean(row.text));

  if (!rows.length) {
    return <></>;
  }

  return (
    <section className="mt-8" aria-labelledby="reference-heading">
      <h2 id="reference-heading" className="m-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9a978f]">
        Reference
      </h2>
      <dl className="mt-4 grid grid-cols-[150px_minmax(0,1fr)] gap-x-6">
        {rows.map((row, index) => (
          <div key={row.label} className="contents">
            <dt className={cn("py-3 text-[12.5px] font-bold leading-6 text-[#a5a29a]", index > 0 && "border-t border-[#f5f3ef]")}>{row.label}</dt>
            <dd
              dir={row.dir}
              className={cn(
                "m-0 py-3 text-[15px] leading-[26px] text-[#2b2e34]",
                index > 0 && "border-t border-[#f5f3ef]",
                row.dir === "rtl" && "font-iranYekan text-[14px] leading-7"
              )}
            >
              {row.text}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function Book({ initialBook, initialLevel, levelSummaries, searchParams }: BookPageProps): React.ReactElement {
  const { books, ensureLevel } = useLevelBooks(initialLevel, initialBook);
  const requestedLevel = parseLevelParam(getParam(searchParams?.level)) ?? initialLevel ?? DEFAULT_LEVEL;
  const [activeLevel] = useState<LevelId>(requestedLevel);
  const [activeLesson, setActiveLesson] = useState(() => getRequestedLesson(levelSummaries, requestedLevel, searchParams));
  const [selectedIdiomId, setSelectedIdiomId] = useState(getParam(searchParams?.idiom) ?? "");
  const [railQuery, setRailQuery] = useState("");
  const [blurMode, setBlurMode] = useState<StudyBlurMode>("persian");
  const [lineOverrides, setLineOverrides] = useState<Record<string, boolean>>({});
  const [bookmarks, setBookmarks] = useState<StoredBookmark[]>([]);
  const [mobileRailOpen, setMobileRailOpen] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [story, setStory] = useState("");
  const [storyFa, setStoryFa] = useState("");
  const [storyEn, setStoryEn] = useState("");
  const { mutate: createStory, isPending: isStoryGenerating } = useStoryGenerator();

  const lessons = useMemo(() => getLessons(books[activeLevel]), [activeLevel, books]);
  const lessonIdioms = useMemo(
    () => getIdiomsForLesson(books[activeLevel], activeLevel, activeLesson),
    [activeLevel, activeLesson, books]
  );
  const selectedIdiom = lessonIdioms.find((idiom) => idiom.id === selectedIdiomId) ?? lessonIdioms[0];
  const selectedIndex = selectedIdiom ? lessonIdioms.findIndex((idiom) => idiom.id === selectedIdiom.id) : -1;
  const railIdioms = useMemo(
    () => (railQuery.trim() ? lessonIdioms.filter((idiom) => idiomMatchesSearch(idiom, railQuery)) : lessonIdioms),
    [lessonIdioms, railQuery]
  );
  const activeLevelMeta = LEVELS.find((level) => level.id === activeLevel) ?? LEVELS[0];
  const storyIdioms = useMemo(() => lessonIdioms.map((idiom) => idiom.english_phrase).filter(Boolean), [lessonIdioms]);
  const positionLabel = selectedIdiom ? `${padPosition(selectedIndex + 1)} / ${lessonIdioms.length}` : "00 / 00";
  const nextIdiom = lessonIdioms.length ? lessonIdioms[(selectedIndex + 1 + lessonIdioms.length) % lessonIdioms.length] : undefined;
  const previousIdiom = lessonIdioms.length ? lessonIdioms[(selectedIndex - 1 + lessonIdioms.length) % lessonIdioms.length] : undefined;

  useEffect(() => {
    setBookmarks(getBookmarks());
    setBlurMode(readStudyBlurMode());
  }, []);

  useEffect(() => {
    if (selectedIdiom && selectedIdiom.id !== selectedIdiomId) {
      setSelectedIdiomId(selectedIdiom.id);
    }
  }, [selectedIdiom, selectedIdiomId]);

  useEffect(() => {
    setLineOverrides({});
  }, [blurMode, selectedIdiomId]);

  const selectIdiom = (idiom: IdiomEntry): void => {
    setSelectedIdiomId(idiom.id);
    setMobileRailOpen(false);
  };

  const selectLesson = async (lessonNumber: number): Promise<void> => {
    if (!books[activeLevel]) {
      await ensureLevel(activeLevel);
    }
    setActiveLesson(lessonNumber);
    setSelectedIdiomId("");
    setRailQuery("");
  };

  const selectNeighbour = (direction: -1 | 1): void => {
    if (!lessonIdioms.length || selectedIndex < 0) {
      return;
    }
    const nextIndex = (selectedIndex + direction + lessonIdioms.length) % lessonIdioms.length;
    setSelectedIdiomId(lessonIdioms[nextIndex].id);
  };

  const setFocusMode = (mode: StudyBlurMode): void => {
    setBlurMode(mode);
    setLineOverrides({});
    saveStudyBlurMode(mode);
  };

  const revealLine = (key: string, language: LineLanguage): void => {
    setLineOverrides((current) => ({ ...current, [`${key}:${language}`]: !current[`${key}:${language}`] }));
  };

  const toggleExampleLines = (key: string): void => {
    const englishCovered = isCovered(blurMode, lineOverrides, key, "english");
    const persianCovered = isCovered(blurMode, lineOverrides, key, "persian");
    const shouldCover = !englishCovered && !persianCovered;

    setLineOverrides((current) => {
      const next = { ...current };
      (["english", "persian"] as const).forEach((language) => {
        const defaultCovered = blurMode === "persian" ? language === "persian" : blurMode === "english" ? language === "english" : false;
        next[`${key}:${language}`] = defaultCovered !== shouldCover;
      });
      return next;
    });
  };

  const speak = (text: string): void => {
    if (!("speechSynthesis" in window)) {
      toast.error("Pronunciation is not available in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const handleGenerateLessonStory = (): void => {
    if (!storyIdioms.length) {
      toast.error("No idioms found for this lesson.");
      return;
    }

    createStory(
      { idioms: storyIdioms, information: `Create a lesson story for ${activeLevelMeta.label} lesson ${activeLesson}.` },
      {
        onSuccess: (data) => {
          if (!data.status) {
            toast.error(data.error || data.story || "Story creation failed. Please try again.");
            return;
          }
          const nextStory = data.story || "";
          const nextStoryFa = data.storyFa || "";
          const nextStoryEn = data.storyEn || "";
          setStory(nextStory);
          setStoryFa(nextStoryFa);
          setStoryEn(nextStoryEn);
          addStory({
            idioms: storyIdioms,
            information: `${activeLevelMeta.label} lesson ${activeLesson}`,
            story: nextStory,
            storyFa: nextStoryFa,
            storyEn: nextStoryEn,
          });
          setShowStory(true);
          toast.success("Lesson story saved to Archive.");
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : "Story creation failed. Please try again."),
      }
    );
  };

  if (showStory) {
    return (
      <main className="min-h-[calc(100dvh-2rem)] bg-[#edece7]">
        <ResultStory
          isShow={setShowStory}
          theStory={story}
          storyPersian={storyFa}
          storyEnglish={storyEn}
          title={`${activeLevelMeta.label} lesson ${activeLesson} story`}
          iconSrc="/icon/Seedling.svg"
        />
      </main>
    );
  }

  const isBookmarked = selectedIdiom ? bookmarks.some((bookmark) => bookmark.id === selectedIdiom.id) : false;
  const hasCoveredLines = selectedIdiom?.examples?.some((_, index) => {
    const key = `${selectedIdiom.id}:example:${index}`;
    return isCovered(blurMode, lineOverrides, key, "english") || isCovered(blurMode, lineOverrides, key, "persian");
  });

  return (
    <main className="relative left-1/2 -my-4 min-h-dvh w-screen -translate-x-1/2 bg-[#edece7] text-[#16181c] tablet:flex tablet:items-center tablet:justify-center tablet:p-5">
      <div className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-white tablet:min-h-0 tablet:max-w-[1138px] tablet:flex-row tablet:rounded-[18px] tablet:border tablet:border-[#e4e1db] tablet:shadow-[0_30px_70px_-40px_rgba(22,24,28,0.45)] laptop:h-[min(900px,calc(100dvh-2.5rem))]">
        <aside className="hidden w-[296px] shrink-0 flex-col border-r border-[#eae7e1] bg-[#faf9f6] tablet:flex">
          <div className="flex flex-col gap-3.5 px-4 pb-3.5 pt-5">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => history.back()}
                aria-label="Go back"
                className="inline-flex size-8 items-center justify-center rounded-[9px] text-[#6c6a65] transition-colors hover:bg-[#f0ede7] hover:text-[#16181c] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#1f4fd8]/25"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
              </button>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-[14.5px] font-extrabold leading-none tracking-[-0.01em]">Lesson {activeLesson}</span>
                <span className="text-[10.5px] font-bold uppercase leading-none tracking-[0.12em] text-[#a5a29a]">{activeLevelMeta.label} level</span>
              </div>
            </div>
            <label className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 size-[15px] text-[#a5a29a]" aria-hidden="true" />
              <span className="sr-only">Search this lesson</span>
              <input
                type="search"
                value={railQuery}
                onChange={(event) => setRailQuery(event.target.value)}
                placeholder="Search this lesson"
                className="h-9 w-full rounded-[10px] border border-[#e6e3dd] bg-white py-0 pl-[34px] pr-3 text-[13px] font-medium text-[#16181c] outline-none transition focus:border-[#1f4fd8] focus:ring-3 focus:ring-[#1f4fd8]/15"
              />
            </label>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#a5a29a]">Idioms</span>
              <span className="text-[11px] font-bold tabular-nums text-[#a5a29a]">{railIdioms.length} of {lessonIdioms.length}</span>
            </div>
          </div>
          <RailList idioms={railIdioms} selectedId={selectedIdiom?.id} onSelect={selectIdiom} emptyQuery={railQuery} onClear={() => setRailQuery("")} />
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="border-b border-[#efece6] px-5 pb-4 pt-5 tablet:px-9 tablet:pb-5 tablet:pt-[26px]">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="hidden text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#a5a29a] tabular-nums tablet:block">{positionLabel}</div>
                <div className="flex items-center justify-between gap-3 tablet:block">
                  <button
                    type="button"
                    onClick={() => history.back()}
                    aria-label="Go back"
                    className="inline-flex size-9 items-center justify-center rounded-[10px] bg-[#f5f3ef] text-[#3d4149] tablet:hidden"
                  >
                    <ArrowLeft className="size-[17px]" aria-hidden="true" />
                  </button>
                  <div className="text-center tablet:text-left">
                    <span className="text-[13.5px] font-extrabold tablet:hidden">Lesson {activeLesson}</span>
                    <h1 dir="ltr" className="m-0 mt-0 text-[25px] font-black leading-[1.18] tracking-[-0.032em] text-[#16181c] tablet:mt-[11px] tablet:text-[34px] tablet:leading-[1.14] tablet:tracking-[-0.034em]">
                      {selectedIdiom?.english_phrase ?? "No idioms in this lesson"}
                    </h1>
                  </div>
                  {selectedIdiom ? (
                    <button
                      type="button"
                      onClick={() => setBookmarks(toggleBookmark(selectedIdiom))}
                      aria-label={isBookmarked ? "Remove saved idiom" : "Save idiom"}
                      className="inline-flex size-9 items-center justify-center rounded-[10px] bg-[#f5f3ef] text-[#3d4149] tablet:hidden"
                    >
                      {isBookmarked ? <BookmarkCheck className="size-4 text-[#1f4fd8]" aria-hidden="true" /> : <Bookmark className="size-4" aria-hidden="true" />}
                    </button>
                  ) : <span className="size-9 tablet:hidden" />}
                </div>
                {selectedIdiom ? (
                  <p dir="rtl" className="m-0 mt-2 text-center font-iranYekan text-[14.5px] leading-7 text-[#6c6a65] tablet:mt-[9px] tablet:text-left tablet:text-[16px] tablet:leading-[30px]">
                    {selectedIdiom.persian_phrase_meaning}
                  </p>
                ) : null}
              </div>

              <div className="hidden shrink-0 flex-col items-end gap-3 tablet:flex">
                <div className="flex items-center gap-1.5">
                  <HeaderIconButton label="Previous idiom" onClick={() => selectNeighbour(-1)} disabled={!lessonIdioms.length}>
                    <ArrowLeft className="size-4" aria-hidden="true" />
                  </HeaderIconButton>
                  <HeaderIconButton label="Next idiom" onClick={() => selectNeighbour(1)} disabled={!lessonIdioms.length}>
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </HeaderIconButton>
                  <span className="mx-1 h-[22px] w-px bg-[#eae7e1]" />
                  <HeaderIconButton label="Generate lesson story" onClick={handleGenerateLessonStory} disabled={isStoryGenerating || !storyIdioms.length}>
                    <Sparkles className={cn("size-[15px]", isStoryGenerating && "animate-spin")} aria-hidden="true" />
                  </HeaderIconButton>
                  {selectedIdiom ? (
                    <HeaderIconButton label={isBookmarked ? "Remove saved idiom" : "Save idiom"} onClick={() => setBookmarks(toggleBookmark(selectedIdiom))}>
                      {isBookmarked ? <BookmarkCheck className="size-[15px] text-[#1f4fd8]" aria-hidden="true" /> : <Bookmark className="size-[15px]" aria-hidden="true" />}
                    </HeaderIconButton>
                  ) : null}
                </div>
                <FocusControl mode={blurMode} onChange={setFocusMode} />
              </div>
            </div>

            <div className="mt-4 tablet:hidden">
              <div className="flex items-center gap-2 overflow-x-auto px-0.5 pb-1 customScrollBarStyle">
                <span className="mr-0.5 shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] text-[#b0ada4]">Lesson</span>
                {lessons.map((lesson) => (
                  <button
                    key={lesson.lesson_number}
                    type="button"
                    onClick={() => void selectLesson(lesson.lesson_number)}
                    aria-pressed={activeLesson === lesson.lesson_number}
                    className={cn(
                      "inline-flex h-9 min-w-11 shrink-0 items-center justify-center rounded-[11px] border px-[13px] text-[12.5px] font-bold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#1f4fd8]/25",
                      activeLesson === lesson.lesson_number ? "border-[#16181c] bg-[#16181c] text-white" : "border-[#eae7e1] bg-white text-[#8c8a84]"
                    )}
                  >
                    {lesson.lesson_number}
                  </button>
                ))}
              </div>
              <div className="mt-3.5"><FocusControl mode={blurMode} onChange={setFocusMode} /></div>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-32 pt-[22px] customScrollBarStyle tablet:px-9 tablet:pb-10 tablet:pt-8">
            {selectedIdiom ? (
              <div key={selectedIdiom.id} className="lesson-pane max-w-[680px]">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="m-0 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#9a978f] tablet:text-[11px] tablet:tracking-[0.16em]">In context</h2>
                  <span className={cn("hidden text-[11.5px] font-semibold text-[#b0ada4] tablet:inline", !hasCoveredLines && "opacity-0")}>Tap a covered line to reveal</span>
                </div>
                {selectedIdiom.examples?.length ? (
                  <div className="mt-3 flex flex-col gap-2.5">
                    {selectedIdiom.examples.map((example, index) => {
                      const key = `${selectedIdiom.id}:example:${index}`;
                      const englishCovered = isCovered(blurMode, lineOverrides, key, "english");
                      const persianCovered = isCovered(blurMode, lineOverrides, key, "persian");
                      const hasHiddenLine = englishCovered || persianCovered;
                      const hint = englishCovered && persianCovered ? "Tap either line to reveal" : englishCovered ? "Tap to reveal the English" : persianCovered ? "Tap to reveal the Persian" : "";

                      return (
                        <article key={key} className="flex min-w-0 flex-col gap-[13px] rounded-[18px] border border-[#eeebe4] bg-white p-[18px] transition-shadow hover:border-[#e2ded5] hover:shadow-[0_1px_2px_rgba(22,24,28,0.04)] tablet:gap-4 tablet:px-[26px] tablet:py-6">
                          <div className="flex items-center justify-between gap-3.5">
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="inline-flex h-[22px] items-center justify-center rounded-[7px] bg-[#f3f1ec] px-2.5 text-[10px] font-extrabold tracking-[0.1em] text-[#a5a29a] tablet:text-[10.5px]">EX {padPosition(index + 1)}</span>
                              <span className={cn("hidden h-[22px] items-center rounded-[7px] bg-[#eff2fc] px-2.5 text-[11.5px] font-semibold text-[#5b79d6] tablet:inline-flex", !hasHiddenLine && "opacity-0")}>{hint}</span>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                              <button type="button" onClick={() => speak(example.english_text)} aria-label="Play pronunciation" className="inline-flex size-[30px] items-center justify-center rounded-[9px] text-[#c4c0b7] transition-colors hover:bg-[#f3f1ec] hover:text-[#3d4149] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#1f4fd8]/25 tablet:size-[30px]">
                                <Volume2 className="size-[15px]" aria-hidden="true" />
                              </button>
                              <button type="button" onClick={() => toggleExampleLines(key)} aria-label="Toggle hidden lines" className={cn("inline-flex size-[30px] items-center justify-center rounded-[9px] transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#1f4fd8]/25", hasHiddenLine ? "bg-[#eff2fc] text-[#1f4fd8]" : "text-[#c4c0b7] hover:bg-[#f3f1ec] hover:text-[#3d4149]")}>
                                <Eye className="size-[15px]" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                          <StudyLine language="english" text={example.english_text} covered={englishCovered} onReveal={() => revealLine(key, "english")} />
                          <StudyLine language="persian" text={example.persian_meaning} covered={persianCovered} onReveal={() => revealLine(key, "persian")} />
                          <span className={cn("inline-flex w-fit items-center rounded-[7px] bg-[#eff2fc] px-2.5 py-1 text-[11px] font-semibold text-[#5b79d6] tablet:hidden", !hasHiddenLine && "opacity-0")}>{hint}</span>
                        </article>
                      );
                    })}
                  </div>
                ) : <p className="py-8 text-sm font-semibold text-[#8c8a84]">No examples for this idiom yet.</p>}
                <StudyReference idiom={selectedIdiom} />
                <nav className="mt-9 grid grid-cols-2 gap-3 border-t border-[#f1efea] pt-5" aria-label="Idiom navigation">
                  <button type="button" onClick={() => selectNeighbour(-1)} className="flex min-w-0 items-center gap-3 rounded-[14px] border border-[#efece6] bg-white px-4 py-3.5 text-left transition-colors hover:border-[#dcd8cf] hover:bg-[#fcfbf9] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#1f4fd8]/25">
                    <ArrowLeft className="size-4 shrink-0 text-[#a5a29a]" aria-hidden="true" />
                    <span className="min-w-0"><span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#b0ada4]">Previous</span><span dir="ltr" className="mt-1 block truncate text-[13.5px] font-bold text-[#3d4149]">{previousIdiom?.english_phrase}</span></span>
                  </button>
                  <button type="button" onClick={() => selectNeighbour(1)} className="flex min-w-0 items-center justify-end gap-3 rounded-[14px] bg-[#1f4fd8] px-4 py-3.5 text-right transition-colors hover:bg-[#173ca8] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#1f4fd8]/25">
                    <span className="min-w-0"><span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">Next idiom</span><span dir="ltr" className="mt-1 block truncate text-[13.5px] font-bold text-white">{nextIdiom?.english_phrase}</span></span>
                    <ArrowRight className="size-4 shrink-0 text-white/85" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            ) : <div className="flex h-full items-center justify-center text-sm font-semibold text-[#8c8a84]">No idioms in this lesson yet.</div>}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-[18px] pt-[22px] tablet:hidden" style={{ background: "linear-gradient(to top, #ffffff 72%, rgba(255,255,255,0))" }}>
            <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-[#e6e3dd] bg-white p-[7px] shadow-[0_14px_30px_-18px_rgba(22,24,28,0.35)]">
              <button type="button" onClick={() => selectNeighbour(-1)} aria-label="Previous idiom" className="inline-flex size-[46px] shrink-0 items-center justify-center rounded-full bg-[#f3f1ed] text-[#3d4149]">
                <ArrowLeft className="size-[18px]" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => setMobileRailOpen(true)} className="inline-flex h-[46px] min-w-0 flex-1 items-center justify-center gap-2 rounded-full text-[#3d4149]">
                <span className="font-extrabold tabular-nums">{positionLabel}</span>
                <span className="text-[#a5a29a]">⌃</span>
              </button>
              <button type="button" onClick={() => selectNeighbour(1)} className="inline-flex h-[46px] shrink-0 items-center gap-2 rounded-full bg-[#1f4fd8] px-[22px] text-[14px] font-bold text-white">
                Next <ArrowRight className="size-[17px]" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        <div className={cn("absolute inset-0 z-30 bg-[#16181c]/35 transition-opacity duration-200 tablet:hidden", mobileRailOpen ? "opacity-100" : "pointer-events-none opacity-0")} onClick={() => setMobileRailOpen(false)} />
        <section className={cn("absolute inset-x-0 bottom-0 z-40 flex max-h-[74%] flex-col rounded-t-[22px] bg-white shadow-[0_-18px_44px_-20px_rgba(22,24,28,0.45)] transition duration-300 tablet:hidden", mobileRailOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-5 opacity-0")} aria-hidden={!mobileRailOpen}>
          <div className="flex items-center justify-between gap-3 border-b border-[#f1efea] px-4 pb-3 pt-4">
            <div><span className="block text-[14px] font-extrabold">Lesson {activeLesson} · idioms</span><span className="mt-1 block text-[11px] font-semibold tabular-nums text-[#a5a29a]">{positionLabel}</span></div>
            <button type="button" onClick={() => setMobileRailOpen(false)} aria-label="Close idiom list" className="inline-flex size-9 items-center justify-center rounded-[11px] bg-[#f5f3ef] text-[#3d4149]"><X className="size-4" aria-hidden="true" /></button>
          </div>
          <RailList idioms={lessonIdioms} selectedId={selectedIdiom?.id} onSelect={selectIdiom} mobile />
        </section>
      </div>
    </main>
  );
}

function HeaderIconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }): React.ReactElement {
  return <button type="button" aria-label={label} onClick={onClick} disabled={disabled} className="inline-flex size-[34px] items-center justify-center rounded-[10px] border border-[#e6e3dd] bg-white text-[#6c6a65] transition-colors hover:border-[#c9c5bc] hover:text-[#16181c] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#1f4fd8]/25">{children}</button>;
}

function FocusControl({ mode, onChange }: { mode: StudyBlurMode; onChange: (mode: StudyBlurMode) => void }): React.ReactElement {
  const options: Array<{ value: StudyBlurMode; label: string }> = [
    { value: "persian", label: "Persian hidden" },
    { value: "english", label: "English hidden" },
    { value: "none", label: "Both" },
  ];

  return <div className="inline-flex items-center gap-0.5 rounded-[11px] bg-[#f3f1ed] p-[3px]">{options.map((option) => <button key={option.value} type="button" onClick={() => onChange(option.value)} aria-pressed={mode === option.value} className={cn("h-[30px] rounded-[9px] px-3 text-[11.5px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#1f4fd8]/25", mode === option.value ? "bg-white text-[#16181c] shadow-[0_1px_2px_rgba(22,24,28,0.1)]" : "text-[#8c8a84]")}>{option.label}</button>)}</div>;
}

function RailList({ idioms, selectedId, onSelect, emptyQuery, onClear, mobile = false }: { idioms: IdiomEntry[]; selectedId?: string; onSelect: (idiom: IdiomEntry) => void; emptyQuery?: string; onClear?: () => void; mobile?: boolean }): React.ReactElement {
  if (!idioms.length) {
    return <div className="flex flex-1 flex-col items-center gap-2 px-5 py-11 text-center"><Search className="size-[22px] text-[#c9c5bc]" aria-hidden="true" /><span className="text-[13px] font-bold text-[#6c6a65]">Nothing in this lesson</span><span className="text-[12px] leading-5 text-[#a5a29a]">Try a shorter word.</span>{emptyQuery && onClear ? <button type="button" onClick={onClear} className="mt-1 h-[30px] rounded-[9px] border border-[#e6e3dd] bg-white px-3 text-[12px] font-semibold text-[#3d4149]">Clear search</button> : null}</div>;
  }
  return <div className={cn("min-h-0 flex-1 overflow-y-auto customScrollBarStyle", mobile ? "flex flex-col gap-0.5 p-2" : "flex flex-col gap-px px-2 pb-3")}>{idioms.map((idiom) => {
    const active = idiom.id === selectedId;
    const index = idioms.findIndex((item) => item.id === idiom.id);
    return <button key={idiom.id} type="button" onClick={() => onSelect(idiom)} aria-current={active ? "true" : undefined} className={cn("grid w-full grid-cols-[26px_minmax(0,1fr)] items-center gap-3 rounded-[11px] border-y-0 border-r-0 border-l-2 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#1f4fd8]/25", mobile && "min-h-14 grid-cols-[30px_minmax(0,1fr)] rounded-[13px] px-3.5", active ? "border-l-[#1f4fd8] bg-[#f1efeb] text-[#16181c]" : "border-l-transparent text-[#5f5d58] hover:bg-[#f3f1ed]")}> <span className={cn("text-[11px] font-extrabold tabular-nums", active ? "text-[#1f4fd8]" : "text-[#bfbbb2]")}>{padPosition(index + 1)}</span><span className="flex min-w-0 flex-col gap-px"><span dir="ltr" className="truncate text-[13px] font-bold leading-[19px]">{idiom.english_phrase}</span><span dir="rtl" className="truncate font-iranYekan text-[11px] leading-[19px] text-[#b0ada4]">{idiom.persian_phrase_meaning}</span></span></button>;
  })}</div>;
}
