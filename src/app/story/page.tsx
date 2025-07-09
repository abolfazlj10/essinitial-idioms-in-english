'use client'
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleGenAI } from "@google/genai";
// ________ ts types ________
import type { Book, Level, LevelArray } from "@/types/book";
// __________ jsons the Book __________
import elementry from '../../data/book/elementry.json'
import intermediate from '../../data/book/intermediate.json'
import advanced from '../../data/book/advanced.json'
// _______ icons _______
import { TbBoxMultiple1 } from "react-icons/tb";
import { TbBoxMultiple2 } from "react-icons/tb";
import { TbBoxMultiple3 } from "react-icons/tb";
import { FaSpinner , FaCheck } from "react-icons/fa";
import Appbar from "@/components/appbar";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { RxLineHeight } from "react-icons/rx";
import { TbLineHeight } from "react-icons/tb";
import GroupButton from "@/components/ui/group-button";
const MAX_WORDS_LIMIT = 6;

export default function Story () {

    const router = useRouter();
    
    const [books] = useState<Record<Level,Book>>({'elementry':elementry,'intermediate':intermediate,'advanced':advanced})
    const [level,setLevel] = useState<LevelArray>(['elementry'])
    const [lessons,setLessons] = useState<Array<number>>([])
    const [currentViewingLesson, setCurrentViewingLesson] = useState<number | null>(null)
    const scroller = useRef<HTMLDivElement | null>(null)
    const [steper,setSteper] = useState<number>(1)
    const [words,setWords] = useState<Array<string>>([])
    const [wordLevels, setWordLevels] = useState<Record<string, Level>>({})
    const [wordLessons, setWordLessons] = useState<Record<string, number>>({})
    const [currentSelectedLevel, setCurrentSelectedLevel] = useState<Level>('elementry')
    const [information, setInformation] = useState<string>("");
    const [story, setStory] = useState<string>("");
    const [storyFa, setStoryFa] = useState<string>("");
    const [storyEn, setStoryEn] = useState<string>("");
    const [loadingStory, setLoadingStory] = useState<boolean>(false);
    const [showStory, setShowStory] = useState<boolean>(false);
    const [fontSize, setFontSize] = useState(20);
    const [lineHeight, setLineHeight] = useState(2);
    const [focusMode, setFocusMode] = useState<'all' | 'en' | 'fa'>('all');
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const highlightColorEn = 'bg-blue-100';
    const highlightColorFa = 'bg-green-100';
    const [clickedButton, setClickedButton] = useState<string | null>(null);
    const [isLargeScreen, setIsLargeScreen] = useState<boolean>(typeof window !== "undefined" ? window.innerWidth >= 1280 : false);

    // Color mapping for different levels
    const levelColors: Record<Level, string> = {
        'elementry': 'border-green-400',
        'intermediate': 'border-blue-400',
        'advanced': 'border-red-400'
    }

    const selectLevel = (theLevel: Level): void => {
        // Check if current level has any lessons selected
        const currentLevelHasLessons = lessons.some(lessonNumber => {
            // Find which level this lesson belongs to
            const lessonLevel = Object.keys(books).find(level => {
                const levelBooks = books[level as Level]
                return levelBooks?.levels[0]?.lessons.some((lesson: any) => lesson.lesson_number === lessonNumber)
            }) as Level
            return lessonLevel === currentSelectedLevel
        })
        
        // If current level has no lessons selected, remove it from levels array
        if (!currentLevelHasLessons) {
            setLevel(prev => prev.filter(l => l !== currentSelectedLevel))
        }
        
        setCurrentSelectedLevel(theLevel)
        
        // Add new level to levels array if not already present
        if (!level.includes(theLevel)) {
            setLevel(prev => [...prev, theLevel])
        }
    }

    const addWord = (word: string, lessonIndex: number): void => {
        const foundIndex = words.findIndex((item) => item === word)
        const lessonNumber = books[currentSelectedLevel]?.levels[0]?.lessons[lessonIndex]?.lesson_number
        
        if (foundIndex !== -1) {
            // Word already exists, remove it
            removeWord(foundIndex)
        } else {
            // Check if we've reached the maximum limit
            if (words.length >= MAX_WORDS_LIMIT) {
                return
            }
            
            // Add new word and its level
            setWords(prevWords => [...prevWords, word])
            setWordLevels(prev => ({ ...prev, [word]: currentSelectedLevel }))
            setWordLessons(prev => ({ ...prev, [word]: lessonNumber }))
        }
    }

    const removeWord = (index: number): void => {
        const wordToRemove = words[index]

        // Create new state snapshots
        const newWords = words.filter((_, i) => i !== index)
        const newWordLevels = { ...wordLevels }
        delete newWordLevels[wordToRemove]
        const newWordLessons = { ...wordLessons }
        delete newWordLessons[wordToRemove]

        // Update word states
        setWords(newWords)
        setWordLevels(newWordLevels)
        setWordLessons(newWordLessons)
        
        // After removing a word, we need to clean up any lessons or levels
        // that no longer have any associated words.

        // Clean up lessons:
        // A lesson should be removed from the list if it's not the currently viewed one
        // AND it has no more words selected from it.
        setLessons(prevLessons =>
            prevLessons.filter(lessonNumber => {
                const hasWords = Object.values(newWordLessons).includes(lessonNumber)
                return hasWords || lessonNumber === currentViewingLesson
            })
        )
        
        // Clean up levels:
        // A level should be removed if it's not the currently selected one
        // AND it has no more words selected from it.
        setLevel(prevLevels =>
            prevLevels.filter(levelName => {
                if (levelName === currentSelectedLevel) return true // Always keep the active level
                
                // Check if any word in the new list belongs to this level
                const hasWords = Object.values(newWordLevels).includes(levelName)
                return hasWords
            })
        )
    }

    const StoryCreator = async (): Promise<void> => {
        const apiKey = 'AIzaSyCDXMKBUSPiT5eL13KBgAdP4GMX_Q9S_PY'
        const theWords = words.join(' - ');
        // Updated prompt for both Persian and English (in English)
        const prompt = `Write a story using these idioms for a language learner. First, provide the story in Persian (Farsi) and then its English translation, each clearly labeled.\nIn both the Persian and English stories, put the exact translation or equivalent of each idiom in [brackets] so it can be highlighted.\nIdioms: ${theWords}.${information ? '\nAdditional information: ' + information : ''}\nOutput format:\nPersian:\n[FA]\nEnglish:\n[EN]`;
        setLoadingStory(true);
        setStory("");
        setStoryFa("");
        setStoryEn("");
        try {
            const ai = new GoogleGenAI({ apiKey: apiKey });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });
            // Parse the response for FA and EN parts robustly
            const text = response.text || "No story generated.";
            setStory(text); // still keep the raw output
            // Try multiple regexes and fallback splitting
            let fa = "", en = "";
            let faMatch = text.match(/Persian:?\s*\[FA\]([\s\S]*?)English:?/i);
            let enMatch = text.match(/English:?\s*\[EN\]([\s\S]*)/i);
            if (!faMatch || !enMatch) {
                // Try just [FA] and [EN]
                faMatch = text.match(/\[FA\]([\s\S]*?)\[EN\]/i);
                enMatch = text.match(/\[EN\]([\s\S]*)/i);
            }
            if (!faMatch || !enMatch) {
                // Try splitting by [FA] and [EN] manually
                const faIdx = text.indexOf('[FA]');
                const enIdx = text.indexOf('[EN]');
                if (faIdx !== -1 && enIdx !== -1) {
                    fa = text.substring(faIdx + 4, enIdx).trim();
                    en = text.substring(enIdx + 4).trim();
                }
            } else {
                fa = faMatch[1]?.trim() || "";
                en = enMatch[1]?.trim() || "";
            }
            setStoryFa(fa);
            setStoryEn(en);
            setShowStory(true);
        } catch (err: any) {
            setStory("Error generating story: " + (err?.message || "Unknown error"));
            setStoryFa("");
            setStoryEn("");
        } finally {
            setLoadingStory(false);
        }
    }    

    useEffect(()=>{
        console.log(story)
    },[story])
    
    useEffect(() => {
        setCurrentViewingLesson(null)
        
        // Only clean up when we're actually switching levels (not on initial load)
        if (level.length > 1) {
            // Remove lessons with 0 words from the previous level
            setLessons(prev => prev.filter(lessonNumber => {
                const wordsFromLesson = Object.values(wordLessons).filter(lesson => lesson === lessonNumber).length
                return wordsFromLesson > 0
            }))
            
            // Remove levels that have no lessons after filtering, but keep the current selected level
            setLevel(prev => {
                const levelsToKeep = prev.filter(levelName => {
                    // Always keep the current selected level
                    if (levelName === currentSelectedLevel) return true
                    
                    const lessonsFromLevel = lessons.filter(lessonNumber => {
                        const wordsFromLesson = Object.values(wordLessons).filter(lesson => lesson === lessonNumber).length
                        if (wordsFromLesson === 0) return false // Skip lessons with 0 words
                        
                        // Find which level this lesson belongs to
                        const lessonLevel = Object.keys(books).find(level => {
                            const levelBooks = books[level as Level]
                            return levelBooks?.levels[0]?.lessons.some((lesson: any) => lesson.lesson_number === lessonNumber)
                        }) as Level
                        return lessonLevel === levelName
                    }).length
                    
                    return lessonsFromLevel > 0
                })
                
                return levelsToKeep
            })
        }
        
        if(words.length == 0)
            setSteper(1)        

        if(scroller.current)
            scroller.current.scrollTo(0,0)

    }, [currentSelectedLevel]);

    useEffect(()=>{
        if(lessons.length > 0 && words.length == 0)
            setSteper(2)
        else if(lessons.length > 0 && words.length != 0)
            setSteper(3)
        else if(lessons.length == 0)
            setSteper(1)

    },[lessons])

    useEffect(()=>{
        if(words.length != 0)
            setSteper(3)
        else if(words.length == 0 && steper == 3)
            setSteper(2)
        else if(words.length == 0 && lessons.length != 0)
            setSteper(2)
    },[words])

    // Utility function to split text into sentences or paragraphs
    function splitSentences(text: string, lang: 'en' | 'fa') {
        let parts: string[] = [];
        if (lang === 'fa') {
            parts = text.split(/\n+/).filter(Boolean);
            if (parts.length === 1) {
                parts = text.split(/(?<=[.!؟])\s+/).filter(Boolean);
            }
        } else {
            parts = text.split(/\n+/).filter(Boolean);
            if (parts.length === 1) {
                parts = text.split(/(?<=[.!?])\s+/).filter(Boolean);
            }
        }
        return parts;
    }

    // هایلایت اصطلاحات انتخاب‌شده در متن
    function highlightIdioms(text: string, idioms: string[], lang: 'en' | 'fa') {
        if (!idioms.length) return text;
        // ترتیب طولانی‌ترها اول برای جلوگیری از تداخل
        const sortedIdioms = [...idioms].sort((a, b) => b.length - a.length);
        let replaced = text;
        sortedIdioms.forEach(idiom => {
            // برای انگلیسی: حساس به حروف کوچک/بزرگ نباشد
            const pattern = lang === 'en'
                ? new RegExp(`(${idiom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
                : new RegExp(`(${idiom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
            replaced = replaced.replace(pattern, '<span class="bg-primaryColor/20 font-bold rounded px-1">$1</span>');
        });
        return replaced;
    }

    function splitAndSyncHighlight(text: string, lang: 'en' | 'fa') {
        let parts: string[] = [];
        if (lang === 'fa') {
            parts = text.split(/\n+/).filter(Boolean);
            if (parts.length === 1) {
                parts = text.split(/(?<=[.!؟])\s+/).filter(Boolean);
            }
        } else {
            parts = text.split(/\n+/).filter(Boolean);
            if (parts.length === 1) {
                parts = text.split(/(?<=[.!?])\s+/).filter(Boolean);
            }
        }
        const highlightColor = lang === 'fa' ? highlightColorFa : highlightColorEn;
        return (
            <span>
                {parts.map((part, idx) => {
                    let html = part;
                    // هایلایت عبارات داخل [ ] در هر دو زبان
                    html = part.replace(/\[([^\]]+)\]/g, '<span class="bg-primaryColor/20 font-bold rounded px-1">$1</span>');
                    return (
                        <span
                            key={idx}
                            className={`transition-all duration-300 rounded px-0.5 animate-fadein ${hoveredIndex === idx ? highlightColor + ' ring-2 ring-primaryColor/60 shadow-lg' : ''}`}
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            style={{cursor: 'pointer'}}
                            dangerouslySetInnerHTML={{ __html: html }}
                        />
                    );
                })}
            </span>
        );
    }

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 1280px)');
        const handleChange = (e: MediaQueryListEvent) => setIsLargeScreen(e.matches);

        // Set initial value
        setIsLargeScreen(mediaQuery.matches);

        // Listen for changes
        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    return(
        <div className="h-full border-2 p-5 max-tablet:px-3 desktop:border-black laptop:border-blue-400 tablet:border-green-400 max-tablet:border-purple-700 max-mobile:border-red-500">
        {/* <div className="h-full border-2 p-5"> */}
            <div className="h-full flex flex-col gap-5 max-[1500px]:gap-4">
                {showStory ? (
                    <div className="flex flex-col flex-1 gap-7 overflow-hidden p-4 md:p-8 rounded-2xl animate-fadein">
                        <Appbar onBackClick={()=> setShowStory(false)} title='The story' iconSrc="./icon/Otter.svg" rightButton={(
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primaryColor/90 hover:bg-primaryColor text-white shadow-lg font-semibold max-tablet:text-xs transition-all duration-150 cursor-pointer">+ New Story</button>
                        )}/>
                        <>
                        <div className="flex justify-center mb-4 gap-6 flex-wrap">
                            {/* Language Group */}
                            <div className="flex flex-col items-center gap-1">
                                <div className="text-xs font-bold text-gray-500 mb-1">Language</div>
                                <GroupButton
                                    options={[
                                        { label: "Both", value: "all", icon: null },
                                        { label: "EN", value: "en", icon: <img src="/icon/Flag England.svg" alt="EN" className="w-5 h-5" /> },
                                        { label: "FA", value: "fa", icon: <img src="/icon/Flag Iran.svg" alt="FA" className="w-5 h-5" /> },
                                    ]}
                                    value={focusMode}
                                    onChange={val => {
                                        setClickedButton(val);
                                        setTimeout(() => setClickedButton(null), 150);
                                        setFocusMode(val as typeof focusMode);
                                    }}
                                    clickedButton={clickedButton}
                                    className="mb-2"
                                />
                            </div>
                            {/* Typography Group */}
                            <div className="flex flex-col items-center gap-1">
                                <div className="text-xs font-bold text-gray-500 mb-1">Typography</div>
                                <GroupButton
                                    options={[
                                        { value: "decFont", icon: <AiOutlineMinus />, label: "" },
                                        { value: "incFont", icon: <AiOutlinePlus />, label: "" },
                                        { value: "decLine", icon: <TbLineHeight />, label: "" },
                                        { value: "incLine", icon: <RxLineHeight />, label: "" },
                                    ]}
                                    value={""}
                                    onChange={val => {
                                        setClickedButton(val);
                                        setTimeout(() => setClickedButton(null), 150);
                                        if (val === "incFont") setFontSize(f => Math.min(40, f+2));
                                        else if (val === "decFont") setFontSize(f => Math.max(14, f-2));
                                        else if (val === "incLine") setLineHeight(l => Math.min(3, l+0.2));
                                        else if (val === "decLine") setLineHeight(l => Math.max(1.2, l-0.2));
                                    }}
                                    clickedButton={clickedButton}
                                    className="mb-2"
                                />
                            </div>
                        </div>
                        
                        {storyFa && storyEn ? (
                            <div className="flex flex-col md:flex-row gap-8 flex-1 items-stretch">
                                {/* English Box */}
                                <div className={`flex-1 bg-gray-50 rounded-2xl shadow-lg p-6 flex flex-col gap-4 ring-2 ring-gray-200 border border-gray-100 relative transition-all duration-300 scale-95 ${focusMode==='fa' ? 'opacity-30 blur-[2px]' : focusMode==='en' ? 'scale-100 shadow-2xl z-10' : ''}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                                        <img src="/icon/Flag England.svg" alt="English" className="w-6 h-6" />
                                        <span className="font-bold text-2xl text-blue-700">English</span>
                                    </div>
                                    <div className="text-gray-800 whitespace-pre-line" style={{fontSize, lineHeight}}>
                                        {splitAndSyncHighlight(storyEn, 'en')}
                                    </div>
                                    <button
                                        className="absolute top-4 right-4 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-sm font-semibold shadow transition-all duration-150 cursor-pointer"
                                        onClick={() => {navigator.clipboard.writeText(storyEn)}}
                                    >Copy</button>
                                </div>
                                {/* Divider */}
                                <div className="hidden md:block w-px bg-gray-200 mx-6 my-8 self-stretch rounded"></div>
                                {/* Persian Box */}
                                <div className={`flex-1 bg-gray-50 rounded-2xl shadow-lg p-6 flex flex-col gap-4 ring-2 ring-gray-200 border border-gray-100 relative transition-all duration-300 scale-95 ${focusMode==='en' ? 'opacity-30 blur-[2px]' : focusMode==='fa' ? 'scale-100 shadow-2xl z-10' : ''}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-3 h-3 rounded-full bg-green-400"></span>
                                        <img src="/icon/Flag Iran.svg" alt="Persian" className="w-6 h-6" />
                                        <span className="font-bold text-2xl text-green-700">Persian</span>
                                    </div>
                                    <div dir="rtl" className="font-iranYekan text-gray-900 whitespace-pre-line text-right" style={{fontSize, lineHeight}}>
                                        {splitAndSyncHighlight(storyFa, 'fa')}
                                    </div>
                                    <button
                                        className="absolute top-4 right-4 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-full text-sm font-semibold shadow transition-all duration-150 cursor-pointer"
                                        onClick={() => {navigator.clipboard.writeText(storyFa)}}
                                    >Copy</button>
                                </div>
                            </div>
                        ) : story ? (
                            <div className="text-xl leading-8 bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 font-mono">
                                <b>Unstructured output:</b>
                                <br/>{story}
                            </div>
                        ) : null}
                        </>
                    </div>
                ) : (
                    <>
                        <Appbar onBackClick={()=> router.push('/')} title='Story creator' iconSrc="./icon/Otter.svg" rightButton={isLargeScreen ? false : <button className="border rounded p-1 max-tablet:text-[10px] max-tablet:px-2">details</button>}/>
                        <div className="flex gap-5 max-laptop:gap-2 max-tablet:gap-1 select-none px-2">
                            <div className="flex-1 flex flex-col gap-2 max-laptop:gap-1">
                                <div className={`w-full h-[8px] max-laptop:h-[6px] max-tablet:h-[4px] bg-gradient-to-r from-primaryColor from-40% to-bgColor rounded ${steper >= 1 ? 'bg-gradient-to-r from-primaryColor from-40% to-bgColor' : 'bg-[#eaeced]'}`}></div>
                                <div className=" max-laptop:text-sm max-tablet:text-[10px]">Level</div>
                            </div>
                            <div className="flex-1 flex flex-col gap-2 max-laptop:gap-1">
                                <div className={`w-full h-[8px] max-laptop:h-[6px] max-tablet:h-[4px] bg-[#eaeced] rounded  ${steper >= 2 ? 'bg-gradient-to-r from-primaryColor from-40% to-bgColor' : 'bg-[#eaeced]'}`}></div>
                                <div className="text-gray-400 max-laptop:text-sm max-tablet:text-[10px]">Lessons</div>
                            </div>
                            <div className="flex-1 flex flex-col gap-2 max-laptop:gap-1">
                                <div className={`w-full h-[8px] max-laptop:h-[6px] max-tablet:h-[4px] bg-[#eaeced] rounded  ${steper >= 3 ? 'bg-gradient-to-r from-primaryColor from-40% to-bgColor' : 'bg-[#eaeced]'}`}></div>
                                <div className="text-gray-400 max-laptop:text-sm max-tablet:text-[10px]">Words</div>
                            </div>
                        </div>
                        <div className="grid desktop:grid-cols-[7fr_2fr] grid-cols-none gap-10 flex-1 overflow-hidden max-[1500px]:gap-3 max-laptop:gap-0">
                            <div className="flex flex-col gap-9 max-desktop:gap-5 overflow-hidden">
                                <div className="flex flex-col gap-3 max-laptop:gap-1 select-none px-2">
                                    <div className="text-[30px] max-laptop:text-[25px] max-tablet:text-base font-semibold">Select Level</div>
                                    <div className="text-gray-400 text-lg max-laptop:text-base max-tablet:text-xs">Select your level that you wanna see its words</div>
                                </div>
                                <div className="flex gap-10 px-2 max-[2000px]:gap-5 max-laptop:flex-col">
                                    <div onClick={()=> selectLevel('elementry')} className={`border-3 max-laptop:border-2 flex-1 p-6 max-laptop:py-4 max-[2000px]:p-4 max-[1500px]:py-2 max-tablet:py-2 max-tablet:px-2 rounded-xl shadow-lg flex flex-col max-laptop:grid max-laptop:grid-cols-[auto_8fr] gap-5 max-[2000px]:gap-3 items-start duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-2xl relative ${currentSelectedLevel === 'elementry' ? 'border-green-400' : 'border-gray-300 hover:border-green-300'}`}>
                                        {currentSelectedLevel === 'elementry' && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 max-tablet:w-5 max-tablet:h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs">✓</span>
                                            </div>
                                        )}
                                        <div className="text-4xl max-tablet:text-3xl max-mobile:xl px-2 py-1 border border-gray-400/10 rounded-lg"><TbBoxMultiple1 /></div>
                                        <div className="text-xl max-[1500px]:text-lg font-semibold flex select-none items-center gap-5 max-laptop:flex-col max-laptop:gap-1 max-laptop:hidden"><span>Elementry</span><span className="text-sm text-blue-400 max-[1340px]:text-xs">{elementry.levels[0].lessons.length} lesson</span></div>
                                        <div className="text-gray-400 text-lg max-[2000px]:text-sm max-[1315px]:text-sm max-laptop:mt-auto max-laptop:hidden">Start with common, everyday idioms.</div>
                                        <div className="min-laptop:hidden flex flex-col gap-2 max-tablet:gap-1">
                                            <div className="font-semibold grid grid-cols-[auto_1fr] gap-4 items-center select-none text-lg max-tablet:text-base"><span>Elementry</span><span className="text-sm text-blue-400 max-[1340px]:text-xs max-tablet:text-[10px]">{elementry.levels[0].lessons.length} lesson</span></div>
                                            <div className="text-gray-400 max-laptop:text-sm max-tablet:text-xs">Start with common, everyday idioms.</div>
                                        </div>
                                    </div>
                                    <div onClick={()=> selectLevel('intermediate')} className={`border-3 max-laptop:border-2 flex-1 p-6 max-laptop:py-4 max-[2000px]:p-4 max-[1500px]:py-2 max-tablet:py-2 max-tablet:px-2 rounded-xl shadow-lg flex flex-col max-laptop:grid max-laptop:grid-cols-[auto_8fr] gap-5 max-[2000px]:gap-3 items-start duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-2xl relative ${currentSelectedLevel === 'intermediate' ? 'border-blue-400' : 'border-gray-300 hover:border-blue-300'}`}>
                                        {currentSelectedLevel === 'intermediate' && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 max-tablet:w-5 max-tablet:h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs">✓</span>
                                            </div>
                                        )}
                                        <div className="text-4xl max-tablet:text-3xl max-mobile:xl px-2 py-1 border border-gray-400/10 rounded-lg"><TbBoxMultiple2 /></div>
                                        <div className="text-xl max-[1500px]:text-lg font-semibold flex select-none items-center gap-5 max-laptop:flex-col max-laptop:gap-1 max-laptop:hidden"><span>Intermediate</span><span className="text-sm text-blue-400 max-[1340px]:text-xs">{intermediate.levels[0].lessons.length} lesson</span></div>
                                        <div className="text-gray-400 text-lg max-[2000px]:text-sm max-[1315px]:text-sm max-laptop:mt-auto max-laptop:hidden">Explore more complex and nuanced phrases.</div>
                                        <div className="min-laptop:hidden flex flex-col gap-2 max-tablet:gap-1">
                                            <div className="font-semibold grid grid-cols-[auto_1fr] gap-4 items-center select-none text-lg max-tablet:text-base"><span>Intermediate</span><span className="text-sm text-blue-400 max-[1340px]:text-xs max-tablet:text-[10px]">{intermediate.levels[0].lessons.length} lesson</span></div>
                                            <div className="text-gray-400 max-laptop:text-sm max-tablet:text-xs">Explore more complex and nuanced phrases.</div>
                                        </div>
                                    </div>
                                    <div onClick={()=> selectLevel('advanced')} className={`border-3 max-laptop:border-2 flex-1 p-6 max-laptop:py-4 max-[2000px]:p-4 max-[1500px]:py-2 max-tablet:py-2 max-tablet:px-2 rounded-xl shadow-lg flex flex-col max-laptop:grid max-laptop:grid-cols-[auto_8fr] gap-5 max-[2000px]:gap-3 items-start duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-2xl relative ${currentSelectedLevel === 'advanced' ? 'border-red-400' : 'border-gray-300 hover:border-red-300'}`}>
                                        {currentSelectedLevel === 'advanced' && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 max-tablet:w-5 max-tablet:h-5 bg-red-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs">✓</span>
                                            </div>
                                        )}
                                        <div className="text-4xl max-tablet:text-3xl max-mobile:xl px-2 py-1 border border-gray-400/10 rounded-lg"><TbBoxMultiple3 /></div>
                                        <div className="text-xl max-[1500px]:text-lg font-semibold flex select-none items-center gap-5 max-laptop:flex-col max-laptop:gap-1 max-laptop:hidden"><span>Advanced</span><span className="text-sm text-blue-400 max-[1340px]:text-xs">{advanced.levels[0].lessons.length} lesson</span></div>
                                        <div className="text-gray-400 text-lg max-[2000px]:text-sm max-[1315px]:text-sm max-laptop:mt-auto max-laptop:hidden">Master sophisticated and specialized idioms.</div>
                                        <div className="min-laptop:hidden flex flex-col gap-2 max-tablet:gap-1">
                                            <div className="font-semibold grid grid-cols-[auto_1fr] gap-4 items-center select-none text-lg max-tablet:text-base"><span>Advanced</span><span className="text-sm text-blue-400 max-[1340px]:text-xs max-tablet:text-[10px]">{advanced.levels[0].lessons.length} lesson</span></div>
                                            <div className="text-gray-400 max-laptop:text-sm max-tablet:text-xs">Master sophisticated and specialized idioms.</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-8 flex-1 overflow-hidden px-2">
                                    <div className="flex flex-col gap-3 max-laptop:gap-1 select-none">
                                        <div className="text-[30px] max-laptop:text-[25px] max-tablet:text-base font-semibold">Select Words</div>
                                        <div className="text-gray-400 text-lg max-laptop:text-base max-tablet:text-xs">Select your words after that you selected the lesson</div>
                                        {/* Word count progress */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 bg-gray-100 rounded-full h-2 max-laptop:h-1 shadow-inner border border-gray-200">
                                                <div 
                                                    className={`h-2 max-laptop:h-1 rounded-full transition-all duration-500 ease-out shadow-sm bg-gradient-to-r from-bgColor ${words.length >= MAX_WORDS_LIMIT ? 'to-primaryColor/80' : 'to-primaryColor/100'}`}
                                                    style={{ 
                                                        width: `${(words.length / MAX_WORDS_LIMIT) * 100}%`,
                                                        boxShadow: words.length > 0
                                                            ? `0 0 12px rgba(92, 107, 236, ${words.length >= MAX_WORDS_LIMIT ? '0.5' : '0.3'})`
                                                            : 'none'
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="flex flex-col items-center min-w-[60px]">
                                                <span className={`text-sm max-tablet:text-xs font-bold ${words.length >= MAX_WORDS_LIMIT ? 'text-primaryColor' : 'text-primaryColor/80'}`}>{words.length}/{MAX_WORDS_LIMIT}</span>
                                                <span className="text-xs max-tablet:text-[9px] font-medium text-gray-500">
                                                    {words.length >= MAX_WORDS_LIMIT 
                                                        ? 'Completed!' 
                                                        : words.length >= MAX_WORDS_LIMIT * 0.8 
                                                            ? 'Almost Full' 
                                                            : words.length >= MAX_WORDS_LIMIT * 0.5
                                                                ? 'Halfway'
                                                                : 'Getting Started'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 flex bg-white/20 backdrop-blur-sm border border-primaryColor/20 rounded-xl shadow-lg px-2 py-4 overflow-hidden gap-5 mb-5">
                                        <div ref={scroller} className="scroll-smooth overflow-y-auto h-full w-3/12 max-[1800px]:w-4/12 max-[1440px]:w-full max-[1440px]:flex-1 max-desktop:flex-none max-desktop:w-4/12 [&::-webkit-scrollbar]:w-[7px] [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-2xl [&::-webkit-scrollbar-thumb]:rounded-2xl [&::-webkit-scrollbar-thumb]:bg-bgColor/80 [&::-webkit-scrollbar-thumb:hover]:bg-bgColor" dir="rtl">
                                            <div className="h-full w-full grid grid-cols-2 max-[892px]:grid-cols-1 gap-2 p-2" dir="ltr">
                                                {books[currentSelectedLevel]?.levels[0]?.lessons.map((item: any,index: number)=>(
                                                    (() => {
                                                        // پیدا کردن سطح درس
                                                        let lessonLevel: Level = 'elementry';
                                                        for (const levelKey of Object.keys(books) as Level[]) {
                                                            const found = books[levelKey]?.levels[0]?.lessons.some((lesson: any) => lesson.lesson_number === item.lesson_number);
                                                            if (found) {
                                                                lessonLevel = levelKey;
                                                                break;
                                                            }
                                                        }
                                                        // تعیین کلاس‌های انتخاب‌شده بر اساس سطح
                                                        const selectedBg = lessonLevel === 'elementry' ? 'bg-green-100' : lessonLevel === 'intermediate' ? 'bg-blue-100' : 'bg-red-100';
                                                        const selectedBorder = lessonLevel === 'elementry' ? 'border-green-400' : lessonLevel === 'intermediate' ? 'border-blue-400' : 'border-red-400';
                                                        const selectedText = lessonLevel === 'elementry' ? 'text-green-700' : lessonLevel === 'intermediate' ? 'text-blue-700' : 'text-red-700';
                                                        const selectedDot = lessonLevel === 'elementry' ? 'bg-green-500' : lessonLevel === 'intermediate' ? 'bg-blue-500' : 'bg-red-500';
                                                        return (
                                                            <div dir="ltr" onClick={() => {
                                                                // Check if current lesson has any words selected
                                                                const currentLessonHasWords = Object.values(wordLessons).some(lessonNumber => lessonNumber === currentViewingLesson)
                                                                // If current lesson has no words, remove it from lessons array
                                                                if (currentViewingLesson !== null && !currentLessonHasWords) {
                                                                    setLessons(prev => prev.filter(l => l !== currentViewingLesson))
                                                                }
                                                                setCurrentViewingLesson(item.lesson_number)
                                                                // Add new lesson to lessons array if not already present
                                                                if (!lessons.includes(item.lesson_number)) {
                                                                    setLessons(prev => [...prev, item.lesson_number])
                                                                }
                                                            }}
                                                                className={`border rounded-lg pl-3 py-2 select-none bg-white/20 backdrop-blur-sm hover:bg-white/40 cursor-pointer duration-200 flex flex-col items-start gap-1 transition-all
                                                                    ${lessons.includes(item.lesson_number) ? 'border-primaryColor' : 'border-gray-200/40'}
                                                                    ${currentViewingLesson === item.lesson_number ? `${selectedBg} ${selectedBorder} shadow-md scale-[1.04] ${selectedText} border-2` : ''}
                                                                `}
                                                                style={{ fontWeight: 500 }}
                                                                key={index}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`w-2 h-2 rounded-full inline-block ${lessonLevel === 'elementry' ? 'bg-green-300' : ''} ${lessonLevel === 'intermediate' ? 'bg-blue-300' : ''} ${lessonLevel === 'advanced' ? 'bg-red-300' : ''} ${currentViewingLesson === item.lesson_number ? selectedDot : ''}`}></span>
                                                                    <span className="text-lg max-[1510px]:text-base max-[1440px]:text-sm font-semibold">Lesson {item.lesson_number}</span>
                                                                </div>
                                                                <div className="text-xs text-gray-400">{books[currentSelectedLevel]?.levels[0]?.lessons[0]?.idioms.length} idioms</div>
                                                            </div>
                                                        );
                                                    })()
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-5 flex-2 space-y-3 border-l-2 border-bgColor max-desktop:py-0">
                                            {currentViewingLesson !== null ? 
                                                <div className="space-y-3 h-full flex flex-col max-desktop:overflow-hidden">
                                                    <div className="text-lg max-desktop:text-sm max-[1440px]:hidden desktop:block max-desktop:hidden font-semibold text-gray-600 border-b pb-2">
                                                        Lesson {currentViewingLesson}
                                                    </div>
                                                    <div className="flex flex-wrap gap-3 max-[1430px]:overflow-y-auto desktop:flex-none p-2 [&::-webkit-scrollbar]:w-[7px] [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-2xl [&::-webkit-scrollbar-thumb]:rounded-2xl [&::-webkit-scrollbar-thumb]:bg-bgColor/80 [&::-webkit-scrollbar-thumb:hover]:bg-bgColor">
                                                        {(() => {
                                                            const lessonIndex = books[currentSelectedLevel]?.levels[0]?.lessons.findIndex((lesson: any) => lesson.lesson_number === currentViewingLesson)
                                                            return lessonIndex !== -1 ? 
                                                                books[currentSelectedLevel]?.levels[0]?.lessons[lessonIndex]?.idioms.map((item: any, key: number) => {
                                                                    const isSelected = words.includes(item.english_phrase)
                                                                    const isLimitReached = words.length >= MAX_WORDS_LIMIT && !isSelected
                                                                    
                                                                    return (
                                                                        <div 
                                                                            onClick={() => {
                                                                                if (!isLimitReached) {
                                                                                    addWord(item.english_phrase, lessonIndex)
                                                                                }
                                                                            }} 
                                                                            className={`text-lg max-[1800px]:text-base max-[1440px]:text-sm select-none font-bold shadow border-3 transition-all duration-200 rounded-full px-4 py-3 inline-flex items-center justify-center gap-2 ${
                                                                                isSelected 
                                                                                    ? 'bg-primaryColor text-white border-primaryColor/80 shadow-lg scale-105 cursor-pointer' 
                                                                                    : isLimitReached 
                                                                                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50' 
                                                                                        : 'bg-[#f9f9f9] border-primaryColor border-dashed cursor-pointer hover:bg-primaryColor/10 hover:scale-105'
                                                                            }`} 
                                                                            key={key}
                                                                            title={isLimitReached ? `Maximum ${MAX_WORDS_LIMIT} words reached. Remove some words first.` : ''}
                                                                        >
                                                                            {item.english_phrase}
                                                                            {isSelected && <FaCheck className="text-sm max-[1440px]:text-xs" />}
                                                                        </div>
                                                                    )
                                                                })
                                                            : []
                                                        })()}
                                                    </div>
                                                </div>
                                            : 
                                                <div className="h-full flex items-center justify-center max-desktop:text-sm max-laptop:text-xs">at first you should select the lesson which you want</div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="border border-gray-400/10 rounded-xl relative overflow-hidden min-w-[370px] max-[1500px]:min-w-[320px] shadow-lg mx-2 mb-5 hidden desktop:block">
                                <img className="absolute select-none top-1/2 -right-20 z-20 scale-x-150" src="./blob-haikei.svg" />
                                <img className="absolute select-none top-0 -left-40 z-20 scale-x-150" src="./blob-haikei.svg" />
                                <div className="bg-white/30 h-full w-full backdrop-blur-2xl z-30 relative py-7 px-5 flex flex-col gap-4 ">
                                    <div>
                                        <div className="border-4 backdrop-blur-2xl justify-self-start py-1 px-4 font-semibold rounded-xl bg-blue-500/50 -mb-5 -ml-4 z-20 relative select-none">Levels :</div>
                                        <div className="text-[25px] font-semibold text-center rounded-xl bg-white/20 border py-5 px-5 flex justify-center items-center">
                                            {level.length > 0 ? (
                                                <div className="grid grid-cols-2 gap-3 w-full">
                                                    {level.map((levelName, index) => {
                                                        const iconColor = levelName === 'elementry' ? 'text-green-600' : levelName === 'intermediate' ? 'text-blue-600' : 'text-red-600';
                                                        const IconComponent = levelName === 'elementry' ? TbBoxMultiple1 : levelName === 'intermediate' ? TbBoxMultiple2 : TbBoxMultiple3;
                                                        const isLastAndOdd = index === level.length - 1 && level.length % 2 !== 0;

                                                        return (
                                                            <div
                                                                key={index}
                                                                className={`
                                                                    px-4 py-3 rounded-xl text-base 
                                                                    flex items-center justify-center gap-3
                                                                    transition-all duration-200 
                                                                    bg-white/20 backdrop-blur-sm border-primaryColor hover:bg-white/40
                                                                    ${isLastAndOdd ? 'col-span-2' : ''}
                                                                `}
                                                                style={{ borderWidth: 1 }}
                                                            >
                                                                <IconComponent className={`${iconColor} text-2xl`} />
                                                                <span className="font-semibold text-gray-800">{levelName.charAt(0).toUpperCase() + levelName.slice(1)}</span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-gray-400 text-lg">No levels selected</div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="border-4 backdrop-blur-2xl justify-self-start py-1 px-4 font-semibold rounded-xl bg-blue-500/50 -mb-5 -ml-4 z-20 relative select-none">Lessons :</div>
                                        <div className="text-[25px] font-semibold text-center rounded-xl bg-white/20 border py-5 px-5 flex justify-center items-center">
                                            {lessons.length > 0 ? (
                                                <div className="grid grid-cols-2 gap-3 w-full">
                                                    {lessons.map((lessonNumber, index) => {
                                                        const wordsFromLesson = Object.values(wordLessons).filter(lesson => lesson === lessonNumber).length;
                                                        
                                                        let lessonLevel: Level = 'elementry';
                                                        for (const levelKey of Object.keys(books) as Level[]) {
                                                            const found = books[levelKey]?.levels[0]?.lessons.some((lesson: any) => lesson.lesson_number === lessonNumber);
                                                            if (found) {
                                                                lessonLevel = levelKey;
                                                                break;
                                                            }
                                                        }

                                                        const isLastAndOdd = index === lessons.length - 1 && lessons.length % 2 !== 0;
                                                        const badgeClass = lessonLevel === 'elementry' ? 'bg-green-500 text-white' : lessonLevel === 'intermediate' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white';
                                                        const isSemiActive = wordsFromLesson === 0;

                                                        return (
                                                            <div
                                                                key={index}
                                                                className={`
                                                                    relative
                                                                    px-3 py-2 rounded-xl text-sm
                                                                    flex items-center justify-center
                                                                    transition-all duration-200 backdrop-blur-sm
                                                                    ${isLastAndOdd ? 'col-span-2' : ''}
                                                                    ${isSemiActive
                                                                        ? 'bg-white/10 border-primaryColor/40 opacity-70 hover:opacity-100 hover:bg-white/20'
                                                                        : 'bg-white/20 border-primaryColor hover:bg-white/40'
                                                                    }
                                                                `}
                                                                style={{ fontWeight: 500, borderWidth: 1 }}
                                                                title={isSemiActive ? "This lesson has no selected words yet." : `${wordsFromLesson} word(s) selected`}
                                                            >
                                                                {wordsFromLesson > 0 && (
                                                                    <span className={`absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 w-5 h-5 rounded-full text-xs font-semibold z-10 border-2 border-white flex items-center justify-center ${badgeClass}`}>
                                                                        {wordsFromLesson}
                                                                    </span>
                                                                )}
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`
                                                                        w-2 h-2 rounded-full inline-block
                                                                        ${lessonLevel === 'elementry' ? 'bg-green-400' : ''}
                                                                        ${lessonLevel === 'intermediate' ? 'bg-blue-400' : ''}
                                                                        ${lessonLevel === 'advanced' ? 'bg-red-400' : ''}
                                                                    `}></span>
                                                                    <span className="text-gray-800">Lesson {lessonNumber}</span>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-gray-400 text-lg ">Select lessons to continue</div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="border-4 backdrop-blur-2xl justify-self-start py-1 px-4 font-semibold rounded-xl bg-blue-500/50 -mb-5 -ml-4 z-20 relative select-none">Idioms :</div>
                                        <div className="rounded-xl bg-white/20 border py-5 px-5 flex gap-2 flex-wrap overflow-y-auto w-full max-h-[200px] [&::-webkit-scrollbar]:w-[7px] [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-2xl [&::-webkit-scrollbar-thumb]:rounded-2xl [&::-webkit-scrollbar-thumb]:bg-bgColor/80 [&::-webkit-scrollbar-thumb:hover]:bg-bgColor ">
                                            {words.length ?
                                                words.map((item,index)=>{
                                                    const level = wordLevels[item];
                                                    const dot = level === 'elementry' ? 'bg-green-400' : level === 'intermediate' ? 'bg-blue-400' : 'bg-red-400';
                                                    const removeHover = level === 'elementry' ? 'hover:text-green-600' : level === 'intermediate' ? 'hover:text-blue-600' : 'hover:text-red-600';
                                                    return (
                                                        <div key={index} className={`max-[1500px]:w-full max-[1500px]:justify-between max-[1500px]:py-2 relative rounded-full px-3 py-1 flex items-center gap-2 bg-white/20 backdrop-blur-sm border-3 border-primaryColor border-dashed text-gray-800 transition-all duration-150 hover:shadow-sm hover:bg-white/30`}>
                                                            <span className={`w-2 h-2 rounded-full inline-block ${dot}`}></span>
                                                            <span className="font-medium text-sm select-none">{item}</span>
                                                            <button onClick={()=> removeWord(index)} className={`ml-1 rounded-full bg-transparent text-gray-500 ${removeHover} transition-colors duration-150 select-none cursor-pointer text-base leading-none`}>×</button>
                                                        </div>
                                                    )
                                                })
                                                :
                                                <div className="m-auto text-gray-400 text-lg">Choose your favorite words</div>
                                            }
                                        </div>
                                        {/* Word count and legend row */}
                                        <div className="flex items-center justify-between max-[1500px]:flex-wrap gap-2 mt-2 mb-3 text-sm max-[2432px]:text-xs">
                                            <div className="flex gap-4 max-[2432px]:gap-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-green-400 rounded-full max-[2432px]:h-2 max-[2432px]:w-2"></div>
                                                    <span>Elementary</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-blue-400 rounded-full max-[2432px]:h-2 max-[2432px]:w-2"></div>
                                                    <span>Intermediate</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-red-400 rounded-full max-[2432px]:h-2 max-[2432px]:w-2"></div>
                                                    <span>Advanced</span>
                                                </div>
                                            </div>
                                            <div className={`text-sm ml-auto font-semibold ${words.length >= MAX_WORDS_LIMIT ? 'text-primaryColor' : 'text-gray-600'}`}>{words.length} / {MAX_WORDS_LIMIT}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="border-4 backdrop-blur-2xl justify-self-start py-1 px-4 font-semibold rounded-xl bg-blue-500/50 -mb-5 -ml-4 z-20 relative select-none">Information :</div>
                                        <textarea placeholder="Write some information for the story that you want!" className="placeholder:select-none resize-none min-h-[100px] text-lg font-semibold text-center rounded-xl bg-white/20 border pt-6 px-5 w-full outline-0 placeholder:text-lg placeholder:text-gray-400" 
                                            value={information}
                                            onChange={e => setInformation(e.target.value)}
                                        />
                                    </div>
                                    <div 
                                        className={`text-[22px] text-center font-bold mt-auto border rounded-xl py-4 shadow-xl duration-200 select-none flex justify-center items-center ${
                                            loadingStory
                                                ? 'bg-gradient-to-br from-primaryColor/50 to-blue-600/50 text-white cursor-wait'
                                                : words.length >= 1 
                                                    ? 'bg-gradient-to-br from-primaryColor to-blue-600 text-white hover:shadow-2xl hover:scale-105 cursor-pointer' 
                                                    : 'bg-gradient-to-br from-primaryColor/50 to-blue-600/50 text-white cursor-not-allowed'
                                        }`}
                                        onClick={() => {
                                            if (words.length >= 1 && !loadingStory) {
                                                StoryCreator()
                                            }
                                        }}
                                    >
                                        {loadingStory ? <span className="flex items-center gap-2">Generating<FaSpinner className="animate-spin text-2xl" /></span> : 'Create Story =>'} 
                                    </div>
                                </div>
                            </div>
                            <div className="mx-2 desktop:hidden">
                                <div className="select-none px-2 mb-3 max-laptop:mb-1">
                                    <div className="text-[30px] max-laptop:text-[25px] max-tablet:text-base font-semibold">Informations</div>
                                </div>
                                <div className="flex">
                                    <div className="flex-1">
                                        <textarea className="border min-h-[100px] w-full rounded-xl p-2 outline-0 placeholder:max-tablet:text-xs" placeholder="Write what you want in this story, AI will build it!"></textarea>
                                    </div>
                                </div>
                                <div className="flex-1 mt-2">
                                    <div 
                                        className={`text-[22px] max-tablet:text-lg flex-1 text-center font-bold mt-auto border rounded-xl py-4 max-tablet:py-3 shadow-xl duration-200 select-none flex justify-center items-center ${
                                            loadingStory
                                                ? 'bg-gradient-to-br from-primaryColor/50 to-blue-600/50 text-white cursor-wait'
                                                : words.length >= 1 
                                                    ? 'bg-gradient-to-br from-primaryColor to-blue-600 text-white hover:shadow-2xl hover:scale-105 cursor-pointer' 
                                                    : 'bg-gradient-to-br from-primaryColor/50 to-blue-600/50 text-white cursor-not-allowed'
                                        }`}
                                        onClick={() => {
                                            if (words.length >= 1 && !loadingStory) {
                                                StoryCreator()
                                            }
                                        }}
                                    >
                                        {loadingStory ? <span className="flex items-center gap-2">Generating<FaSpinner className="animate-spin text-2xl" /></span> : 'Create Story =>'} 
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}