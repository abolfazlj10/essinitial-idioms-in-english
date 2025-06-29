'use client'
import { useEffect, useRef, useState } from "react";
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
import { FaChevronRight } from "react-icons/fa";

import Link from "next/link";

// Maximum number of words that can be selected
const MAX_WORDS_LIMIT = 6;

export default function Story () {
    
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
        const levelOfWord = wordLevels[wordToRemove]
        const lessonOfWord = wordLessons[wordToRemove]
        
        // Remove the word
        setWords(prevArr => prevArr.filter((_, key) => key !== index))
        
        // Remove word from wordLevels and wordLessons tracking
        setWordLevels(prev => {
            const newWordLevels = { ...prev }
            delete newWordLevels[wordToRemove]
            return newWordLevels
        })
        
        setWordLessons(prev => {
            const newWordLessons = { ...prev }
            delete newWordLessons[wordToRemove]
            return newWordLessons
        })
        
        // Note: We don't remove levels or lessons from arrays when words are removed
        // Levels and lessons remain visible even when they have no words
    }

    
    
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
    
    return(
        <div className="h-full flex flex-col gap-5 overflow-hidden">
            <div className="flex gap-5 select-none">
                <div className="flex-1 flex flex-col gap-2">
                    <div className={`w-full h-[8px] bg-gradient-to-r from-primaryColor from-40% to-bgColor rounded ${steper >= 1 ? 'bg-gradient-to-r from-primaryColor from-40% to-bgColor' : 'bg-[#eaeced]'}`}></div>
                    <div>Level</div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                    <div className={`w-full h-[8px] bg-[#eaeced] rounded  ${steper >= 2 ? 'bg-gradient-to-r from-primaryColor from-40% to-bgColor' : 'bg-[#eaeced]'}`}></div>
                    <div className="text-gray-400">Lessons</div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                    <div className={`w-full h-[8px] bg-[#eaeced] rounded  ${steper >= 3 ? 'bg-gradient-to-r from-primaryColor from-40% to-bgColor' : 'bg-[#eaeced]'}`}></div>
                    <div className="text-gray-400">Words</div>
                </div>
            </div>
            <div className="grid grid-cols-[7fr_2fr] gap-10 flex-1 overflow-hidden">
                <div className="flex flex-col gap-9 overflow-hidden">
                    <div className="flex flex-col gap-3 select-none">
                        <div className="text-[30px] font-semibold">Select Level</div>
                        <div className="text-gray-400 text-lg">Select your level that you wanna see its words</div>
                    </div>
                    <div className="flex gap-10 ">
                        {/* Border-based selection with hover effects */}
                        <div onClick={()=> selectLevel('elementry')} className={`border-3 flex-1 p-6 rounded-xl shadow-lg flex flex-col gap-5 items-start duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-2xl relative ${currentSelectedLevel === 'elementry' ? 'border-green-400 bg-green-50 shadow-green-200' : 'border-gray-300 hover:border-green-300'}`}>
                            {currentSelectedLevel === 'elementry' && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                </div>
                            )}
                            <div className="text-4xl px-2 py-1 border border-gray-400/10 rounded-lg"><TbBoxMultiple1 /></div>
                            <div className="text-xl font-semibold flex select-none items-center gap-5"><span>Elementry</span><span className="text-sm text-blue-400">{elementry.levels[0].lessons.length} lesson</span></div>
                            <div className="text-gray-400 text-lg">Description in one line</div>
                        </div>
                        <div onClick={()=> selectLevel('intermediate')} className={`border-3 flex-1 p-6 rounded-xl shadow-lg flex flex-col gap-5 items-start duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-2xl relative ${currentSelectedLevel === 'intermediate' ? 'border-blue-400 bg-blue-50 shadow-blue-200' : 'border-gray-300 hover:border-blue-300'}`}>
                            {currentSelectedLevel === 'intermediate' && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                </div>
                            )}
                            <div className="text-4xl px-2 py-1 border border-gray-400/10 rounded-lg"><TbBoxMultiple2 /></div>
                            <div className="text-xl font-semibold flex select-none items-center gap-5"><span>Intermediate</span><span className="text-sm text-blue-400">{intermediate.levels[0].lessons.length} lesson</span></div>
                            <div className="text-gray-400 text-lg">Description in one line</div>
                        </div>
                        <div onClick={()=> selectLevel('advanced')} className={`border-3 flex-1 p-6 rounded-xl shadow-lg flex flex-col gap-5 items-start duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-2xl relative ${currentSelectedLevel === 'advanced' ? 'border-red-400 bg-red-50 shadow-red-200' : 'border-gray-300 hover:border-red-300'}`}>
                            {currentSelectedLevel === 'advanced' && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                </div>
                            )}
                            <div className="text-4xl px-2 py-1 border border-gray-400/10 rounded-lg"><TbBoxMultiple3 /></div>
                            <div className="text-xl font-semibold flex select-none items-center gap-5"><span>Advanced</span><span className="text-sm text-blue-400">{advanced.levels[0].lessons.length} lesson</span></div>
                            <div className="text-gray-400 text-lg">Description in one line</div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-8 flex-1 overflow-hidden">
                        <div className="flex flex-col gap-3 select-none">
                            <div className="text-[30px] font-semibold">Select Words</div>
                            <div className="text-gray-400 text-lg">Select your words after that you selected the lesson</div>
                            {/* Word count progress */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-gray-100 rounded-full h-2 shadow-inner border border-gray-200">
                                    <div 
                                        className={`h-2 rounded-full transition-all duration-500 ease-out shadow-sm bg-gradient-to-r from-green-300 ${words.length >= MAX_WORDS_LIMIT ? 'to-green-600' : 'to-green-400'}`}
                                        style={{ 
                                            width: `${(words.length / MAX_WORDS_LIMIT) * 100}%`,
                                            boxShadow: words.length >= MAX_WORDS_LIMIT 
                                                ? '0 0 12px rgba(34,197,94,0.4)' 
                                                : '0 0 10px rgba(34, 197, 94, 0.2)'
                                        }}
                                    ></div>
                                </div>
                                <div className="flex flex-col items-center min-w-[60px]">
                                    <span className={`text-sm font-bold ${words.length >= MAX_WORDS_LIMIT ? 'text-green-600' : 'text-green-700'}`}>{words.length}/{MAX_WORDS_LIMIT}</span>
                                    <span className="text-xs font-medium text-gray-500">
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
                        <div className="flex flex-1 bg-[#f9f9f9]/50 border-3 rounded-xl shadow-lg px-2 py-4 overflow-hidden gap-5 mb-3">
                            <div ref={scroller} className="scroll-smooth overflow-y-scroll h-full w-3/12 flex flex-col gap-2 p-2 [&::-webkit-scrollbar]:w-[7px] [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-2xl [&::-webkit-scrollbar-thumb]:rounded-2xl [&::-webkit-scrollbar-thumb]:bg-bgColor/80 [&::-webkit-scrollbar-thumb:hover]:bg-bgColor " dir="rtl">
                                {books[currentSelectedLevel]?.levels[0]?.lessons.map((item: any,index: number)=>(
                                    <div dir="ltr" onClick={()=>{
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
                                    }} className={`border rounded-lg px-4 py-3 select-none bg-white hover:bg-[#f1f1f1] cursor-pointer duration-75 flex items-center justify-between ${lessons.includes(item.lesson_number) ? 'border-primaryColor bg-primaryColor/10' : ''} ${currentViewingLesson === item.lesson_number ? 'ring-2 ring-primaryColor' : ''}`} key={index}>
                                        <div className="space-y-2">
                                            <div className="text-xl font-bold">Lesson {item.lesson_number}</div>
                                            <div className="text-sm text-gray-400">{books[currentSelectedLevel]?.levels[0]?.lessons[0]?.idioms.length} idioms</div>
                                        </div>
                                        <FaChevronRight/>
                                    </div>
                                ))}
                            </div>
                            <div className="p-5 flex-2 space-x-8 space-y-3 border-l-2 border-bgColor">
                                {currentViewingLesson !== null ? 
                                    <div className="space-y-3">
                                        <div className="text-lg font-semibold text-gray-600 border-b pb-2">
                                            Lesson {currentViewingLesson}
                                        </div>
                                        <div className="flex flex-wrap gap-3">
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
                                                                className={`text-lg select-none font-bold shadow border-3 bg-[#f9f9f9] border-primaryColor duration-100 rounded-full px-4 py-3 inline-block ${
                                                                    isSelected 
                                                                        ? 'border-bgColor bg-primaryColor text-white cursor-pointer' 
                                                                        : isLimitReached 
                                                                            ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                                            : 'cursor-pointer hover:bg-[#f1f1f1]'
                                                                }`} 
                                                                key={key}
                                                                title={isLimitReached ? `Maximum ${MAX_WORDS_LIMIT} words reached. Remove some words first.` : ''}
                                                            >
                                                                {item.english_phrase}
                                                            </div>
                                                        )
                                                    })
                                                : []
                                            })()}
                                        </div>
                                    </div>
                                : 
                                    <div className="h-full flex items-center justify-center">at first you should select the lesson which you want</div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border border-gray-400/10 rounded-xl relative overflow-hidden shadow-xl">
                    <img className="absolute top-1/2 -right-20 z-20 scale-x-150" src="./blob-haikei.svg" />
                    <img className="absolute top-0 -left-40 z-20 scale-x-150" src="./blob-haikei.svg" />
                    <div className="bg-white/30 h-full w-full backdrop-blur-2xl z-30 relative py-7 px-5 flex flex-col gap-10">
                        <div>
                            <div className="border-4 backdrop-blur-2xl justify-self-start py-1 px-4 font-semibold rounded-xl bg-blue-500/50 -mb-5 -ml-4 z-20 relative select-none">Levels :</div>
                            <div className="text-[25px] font-semibold text-center rounded-xl bg-white/20 border py-4 px-5 flex justify-center items-center">
                                {level.length > 0 ? (
                                    <div className="flex flex-wrap gap-3 justify-center">
                                        {level.map((levelName, index) => (
                                            <div key={index} className={`px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                                                levelName === 'elementry' ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                                                levelName === 'intermediate' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 
                                                'bg-gradient-to-r from-red-500 to-red-600'
                                            }`}>
                                                {levelName === 'elementry' && <TbBoxMultiple1 className="text-lg" />}
                                                {levelName === 'intermediate' && <TbBoxMultiple2 className="text-lg" />}
                                                {levelName === 'advanced' && <TbBoxMultiple3 className="text-lg" />}
                                                {levelName.charAt(0).toUpperCase() + levelName.slice(1)}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-gray-400 text-lg">No levels selected</div>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="border-4 backdrop-blur-2xl justify-self-start py-1 px-4 font-semibold rounded-xl bg-blue-500/50 -mb-5 -ml-4 z-20 relative select-none">Lessons :</div>
                            <div className="text-[25px] font-semibold text-center rounded-xl bg-white/20 border  py-4 px-5 flex justify-center items-center">
                                {lessons.length > 0 ? (
                                    <div className="flex flex-wrap gap-3 justify-center">
                                        {lessons.map((lessonNumber, index) => {
                                            const wordsFromLesson = Object.values(wordLessons).filter(lesson => lesson === lessonNumber).length
                                            return (
                                                <div key={index} className="px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-r from-purple-500 to-purple-600">
                                                    <FaChevronRight className="text-lg" />
                                                    Lesson {lessonNumber}
                                                    <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                                                        {wordsFromLesson} word{wordsFromLesson !== 1 ? 's' : ''}
                                                    </span>
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
                            <div className="border-4 backdrop-blur-2xl justify-self-start py-1 px-4 font-semibold rounded-xl bg-blue-500/50 -mb-5 -ml-4 z-20 relative select-none">Words :</div>
                            <div className="text-xl font-semibold rounded-xl bg-white/20 border py-8 px-5 flex gap-5 flex-wrap overflow-y-auto max-h-[250px] [&::-webkit-scrollbar]:w-[7px] [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-2xl [&::-webkit-scrollbar-thumb]:rounded-2xl [&::-webkit-scrollbar-thumb]:bg-bgColor/80 [&::-webkit-scrollbar-thumb:hover]:bg-bgColor ">
                                    {words.length ?
                                        words.map((item,index)=>(
                                            <div key={index} className={`relative shadow rounded-xl px-2 py-1 flex gap-1 bg-bgColor/20 border-3 border-dashed ${levelColors[wordLevels[item]]}`}>
                                                <span onClick={ ()=> removeWord(index)} className="px-2 rounded-full select-none cursor-pointer">×</span>
                                                <span>{item}</span>
                                            </div>
                                        ))
                                        :
                                        <div className="m-auto text-gray-400 text-lg">Choose your favorite words</div>
                                    }
                            </div>
                            {/* Word count and legend row */}
                            <div className="flex items-center justify-between mt-2 mb-3 text-sm">
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                        <span>Elementary</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                        <span>Intermediate</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                        <span>Advanced</span>
                                    </div>
                                </div>
                                <div className={`text-sm font-semibold ${words.length >= MAX_WORDS_LIMIT ? 'text-green-600' : 'text-gray-600'}`}>{words.length} / {MAX_WORDS_LIMIT}</div>
                            </div>
                        </div>
                        <div>
                            <div className="border-4 backdrop-blur-2xl justify-self-start py-1 px-4 font-semibold rounded-xl bg-blue-500/50 -mb-5 -ml-4 z-20 relative select-none">Information :</div>
                            <textarea placeholder="Write some information for the story that you want!" className="resize-none min-h-[100px] text-lg font-semibold text-center rounded-xl bg-white/20 border pt-6 px-5 w-full outline-0 placeholder:text-lg placeholder:text-gray-400"/>
                        </div>
                        <Link 
                            href={words.length >= 1 ? '/' : '#'} 
                            className={`text-[22px] text-center font-bold mt-auto border rounded-xl py-4 shadow-xl duration-200 ${
                                words.length >= 1 
                                    ? 'bg-gradient-to-br from-primaryColor to-blue-600 text-white hover:shadow-2xl hover:scale-105 cursor-pointer' 
                                    : 'bg-primaryColor/50 text-white cursor-not-allowed'
                            }`}
                            onClick={(e) => {
                                if (words.length < 1) {
                                    e.preventDefault()
                                }
                            }}
                        >
                            Create Story {'=>'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}