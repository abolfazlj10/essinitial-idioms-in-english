'use client'
import { useEffect, useRef, useState } from "react";
// ________ ts types ________
import type { Book, Level, LevelArray } from "@/types/book";
// _______ Gemini Pack ________
import { GoogleGenAI } from "@google/genai";
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
export default function Story () {
    
    const ai = new GoogleGenAI({ apiKey: "AIzaSyBR8oVsvdR2a52qeU32foDaF73O0ixW5vg" });
    const [books] = useState<Record<Level,Book>>({'elementry':elementry,'intermediate':intermediate,'advanced':advanced})
    const [level,setLevel] = useState<LevelArray>([])
    const [lesson,setLesson] = useState<number | null>(null)
    const scroller = useRef<HTMLDivElement | null>(null)
    const [steper,setSteper] = useState<number>(1)
    const [words,setWords] = useState<Array<string>>([])
    // Track which word belongs to which level
    const [wordLevels, setWordLevels] = useState<Record<string, Level>>({})
    const [currentSelectedLevel, setCurrentSelectedLevel] = useState<Level>('elementry')

    // Color mapping for different levels
    const levelColors: Record<Level, string> = {
        'elementry': 'border-green-400',
        'intermediate': 'border-yellow-400', 
        'advanced': 'border-red-400'
    }

    // Icon color mapping for different levels
    const iconColors: Record<Level, string> = {
        'elementry': 'text-green-500',
        'intermediate': 'text-yellow-500', 
        'advanced': 'text-red-500'
    }

    // Gradient backgrounds for different levels (alternative option)
    const gradientColors: Record<Level, string> = {
        'elementry': 'from-green-400/20 to-green-600/20',
        'intermediate': 'from-yellow-400/20 to-yellow-600/20', 
        'advanced': 'from-red-400/20 to-red-600/20'
    }

    // Glow effects for different levels (alternative option)
    const glowColors: Record<Level, string> = {
        'elementry': 'shadow-green-500/50',
        'intermediate': 'shadow-yellow-500/50', 
        'advanced': 'shadow-red-500/50'
    }

    const selectLevel = (theLevel: Level): void => {
        setCurrentSelectedLevel(theLevel)
    }

    const addWord = (word: string): void => {
        const foundIndex = words.findIndex((item) => item === word)
        
        if (foundIndex !== -1) {
            // Word already exists, remove it
            removeWord(foundIndex)
        } else {
            // Add new word and its level
            setWords(prevWords => [...prevWords, word])
            setWordLevels(prev => ({ ...prev, [word]: currentSelectedLevel }))
            
            // Add level to levels array if not already present
            if (!level.includes(currentSelectedLevel)) {
                setLevel(prev => [...prev, currentSelectedLevel])
            }
        }
    }

    const removeWord = (index: number): void => {
        const wordToRemove = words[index]
        const levelOfWord = wordLevels[wordToRemove]
        
        // Remove the word
        setWords(prevArr => prevArr.filter((_, key) => key !== index))
        
        // Remove word from wordLevels tracking
        setWordLevels(prev => {
            const newWordLevels = { ...prev }
            delete newWordLevels[wordToRemove]
            return newWordLevels
        })
        
        // Check if this was the last word from this level
        const remainingWordsFromLevel = Object.values(wordLevels).filter(level => level === levelOfWord).length - 1
        
        if (remainingWordsFromLevel === 0) {
            // Remove level from levels array if no more words from this level
            setLevel(prev => prev.filter(l => l !== levelOfWord))
        }
    }

    
    
    useEffect(() => {
        console.log(currentSelectedLevel)
        setLesson(null)
        if(words.length == 0)
            setSteper(1)        

        if(scroller.current)
            scroller.current.scrollTo(0,0)

    }, [currentSelectedLevel]);

    useEffect(()=>{
        if(lesson != null && words.length == 0)
            setSteper(2)
        else if(lesson != null && words.length != 0)
            setSteper(3)

    },[lesson])

    useEffect(()=>{
        if(words.length != 0)
            setSteper(3)
        else if(words.length == 0 && steper == 3)
            setSteper(2)
        else if(words.length == 0 && lesson != null)
            setSteper(2)
    },[words])
    
    useEffect(()=>{
        console.log('mounted!')
        // const test = async () => {

        //     async function main() {
        //         const response = await ai.models.generateContent({
        //             model: "gemini-2.0-flash",
        //             contents: "tell me about closures in javascript",
        //         });
        //         console.log(response.text);
        //     }
        //     await main();
        // }
        // test()
    })
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
                        <div onClick={()=> selectLevel('intermediate')} className={`border-3 flex-1 p-6 rounded-xl shadow-lg flex flex-col gap-5 items-start duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-2xl relative ${currentSelectedLevel === 'intermediate' ? 'border-yellow-400 bg-yellow-50 shadow-yellow-200' : 'border-gray-300 hover:border-yellow-300'}`}>
                            {currentSelectedLevel === 'intermediate' && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
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
                        </div>
                        <div className="flex flex-1 bg-[#f9f9f9]/50 border-3 rounded-xl shadow-lg px-2 py-4 overflow-hidden gap-5 mb-3">
                            <div ref={scroller} className="scroll-smooth overflow-y-scroll h-full w-3/12 flex flex-col gap-2 px-2 [&::-webkit-scrollbar]:w-[7px] [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-2xl [&::-webkit-scrollbar-thumb]:rounded-2xl [&::-webkit-scrollbar-thumb]:bg-bgColor/80 [&::-webkit-scrollbar-thumb:hover]:bg-bgColor " dir="rtl">
                                {books[currentSelectedLevel]?.levels[0]?.lessons.map((item: any,index: number)=>(
                                    <div dir="ltr" onClick={()=>setLesson(index)} className="border rounded-lg px-4 py-3 select-none bg-white hover:bg-[#f1f1f1] cursor-pointer duration-75 flex items-center justify-between" key={index}>
                                        <div className="space-y-2">
                                            <div className="text-xl font-bold">Lesson {item.lesson_number}</div>
                                            <div className="text-sm text-gray-400">{books[currentSelectedLevel]?.levels[0]?.lessons[0]?.idioms.length} idioms</div>
                                        </div>
                                        <FaChevronRight/>
                                    </div>
                                ))}
                            </div>
                            <div className="p-5 flex-2 space-x-8 space-y-3 border-l-2 border-bgColor">
                                {lesson != null ? 
                                    books[currentSelectedLevel]?.levels[0]?.lessons[lesson]?.idioms.map((item: any,key: number)=>(
                                        <div onClick={ ()=> addWord(item.english_phrase)} className={`text-lg select-none font-bold shadow border-3 bg-[#f9f9f9] border-primaryColor duration-100 rounded-full px-4 py-3 inline-block cursor-pointer ${words.includes(item.english_phrase) && 'border-bgColor bg-primaryColor text-white'}`} key={key}>{item.english_phrase}</div>
                                    ))
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
                            <div className="border-4 backdrop-blur-2xl justify-self-start py-1 px-4 font-semibold rounded-xl bg-blue-500/50 -mb-5 -ml-4 z-20 relative select-none">Level :</div>
                            <div className="text-[25px] font-semibold text-center rounded-xl bg-white/20 border py-2">
                                {level.length > 0 ? level.join(', ') : 'No levels selected'}
                            </div>
                        </div>
                        <div>
                            <div className="border-4 backdrop-blur-2xl justify-self-start py-1 px-4 font-semibold rounded-xl bg-blue-500/50 -mb-5 -ml-4 z-20 relative select-none">Lesson :</div>
                            <div className="text-[25px] font-semibold text-center rounded-xl bg-white/20 border py-2">{ lesson != null ? `Lesson ${books[currentSelectedLevel]?.levels[0]?.lessons[lesson]?.lesson_number}` : '_'}</div>
                        </div>
                        <div>
                            <div className="border-4 backdrop-blur-2xl justify-self-start py-1 px-4 font-semibold rounded-xl bg-blue-500/50 -mb-5 -ml-4 z-20 relative select-none">Words :</div>
                            <div className="text-xl font-semibold rounded-xl bg-white/20 border pt-8 pb-4 px-5 flex gap-5 flex-wrap">
                                    {words.length ?
                                        words.map((item,index)=>(
                                            <div key={index} className={`relative shadow rounded-xl px-2 py-1 inline-block bg-bgColor/20 border-3 border-dashed ${levelColors[wordLevels[item]]}`}>
                                                <span>{item}</span>
                                                <span onClick={ ()=> removeWord(index)} className="bg-gray-600 absolute -left-4 -top-4 px-2 text-white rounded-full select-none cursor-pointer">×</span>
                                            </div>
                                        ))
                                        :
                                        <div className="m-auto text-[25px]">_</div>
                                    }
                            </div>
                            <div className="flex gap-4 mb-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                    <span>Elementary</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                    <span>Intermediate</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                    <span>Advanced</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="border-4 backdrop-blur-2xl justify-self-start py-1 px-4 font-semibold rounded-xl bg-blue-500/50 -mb-5 -ml-4 z-20 relative select-none">Information :</div>
                            <textarea placeholder="write some inforamatio as foor the story that you want!" className="min-h-[150px] resize-none text-xl font-semibold text-center rounded-xl bg-white/20 border pt-6 px-5 w-full outline-0 placeholder:text-lg"/>
                        </div>
                        <Link href='/' className="text-[22px] text-center font-bold mt-auto border rounded-xl py-4 bg-gradient-to-br from-primaryColor to-blue-600 text-white shadow-xl cursor-pointer hover:shadow-2xl hover:scale-105 duration-200 ">Create Story {'=>'}</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}