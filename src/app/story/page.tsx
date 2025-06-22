'use client'
import { GoogleGenAI } from "@google/genai";
import { useEffect } from "react";
import advanced from '../../data/book/advanced.json'
import elementry from '../../data/book/elementry.json'
import intermediate from '../../data/book/intermediate.json'
import { TbBoxMultiple1 } from "react-icons/tb";
import { TbBoxMultiple2 } from "react-icons/tb";
import { TbBoxMultiple3 } from "react-icons/tb";
import { SiGitbook } from "react-icons/si";
import Link from "next/link";
export default function Story () {
    const ai = new GoogleGenAI({ apiKey: "AIzaSyBR8oVsvdR2a52qeU32foDaF73O0ixW5vg" });
      
    useEffect(()=>{
        const test = async () => {

            async function main() {
                const response = await ai.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: "tell me about closures in javascript",
                });
                console.log(response.text);
            }
            await main();
        }
        // test()
    })
    return(
        <div className="h-full flex flex-col gap-5 overflow-hidden">
            <div className="flex gap-5 select-none">
                <div className="flex-1 flex flex-col gap-2">
                    <div className="w-full h-[8px] bg-gradient-to-r from-primaryColor from-40% to-bgColor rounded"></div>
                    <div>Level</div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                    <div className="w-full h-[8px] bg-[#eaeced] rounded"></div>
                    <div className="text-gray-400">Lessons</div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                    <div className="w-full h-[8px] bg-[#eaeced] rounded"></div>
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
                        <div className="border-3 border-primaryColor flex-1 p-6 rounded-xl shadow-lg flex flex-col gap-5 items-start">
                            <div className="text-4xl px-2 py-1 border border-gray-400/10 rounded-lg"><TbBoxMultiple1 /></div>
                            <div className="text-xl font-semibold flex select-none items-center gap-5"><span>Elementry</span><span className="text-sm text-blue-400">{elementry.levels[0].lessons.length} lesson</span></div>
                            <div className="text-gray-400 text-lg">Description in one line</div>
                        </div>
                        <div className="border flex-1 p-6 rounded-xl shadow-lg flex flex-col gap-5 items-start">
                            <div className="text-4xl px-2 py-1 border border-gray-400/10 rounded-lg"><TbBoxMultiple2 /></div>
                            <div className="text-xl font-semibold flex select-none items-center gap-5"><span>Intermediate</span><span className="text-sm text-blue-400">{intermediate.levels[0].lessons.length} lesson</span></div>
                            <div className="text-gray-400 text-lg">Description in one line</div>
                        </div>
                        <div className="border flex-1 p-6 rounded-xl shadow-lg flex flex-col gap-5 items-start">
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
                        <div className="flex flex-1 border rounded-xl p-2 overflow-hidden">
                            <div className="overflow-y-scroll h-full flex-1 flex flex-col gap-5 px-2">
                                {elementry.levels[0].lessons.map((item,key)=>(
                                    <div className="border rounded p-2" key={key}>Lesson {item.lesson_number}</div>
                                ))}
                            </div>
                            <div className="p-2 flex-1">
                                <div className="text-lg font-semibold">Words</div>
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
                            <div className="text-[25px] font-semibold text-center rounded-xl bg-white/20 border py-2">Elementry</div>
                        </div>
                        <div>
                            <div className="border-4 backdrop-blur-2xl justify-self-start py-1 px-4 font-semibold rounded-xl bg-blue-500/50 -mb-5 -ml-4 z-20 relative select-none">Lesson :</div>
                            <div className="text-[25px] font-semibold text-center rounded-xl bg-white/20 border py-2">Lesson 13</div>
                        </div>
                        <div>
                            <div className="border-4 backdrop-blur-2xl justify-self-start py-1 px-4 font-semibold rounded-xl bg-blue-500/50 -mb-5 -ml-4 z-20 relative select-none">Words :</div>
                            <div className="text-xl font-semibold rounded-xl bg-white/20 border pt-8 pb-4 px-5 flex gap-5 flex-wrap">
                                <div className="relative border-3 border-primaryColor shadow border-dashed rounded-xl px-2 py-1 bg-bgColor/20 inline-block">
                                    <span>get in</span>
                                    <span className="bg-gray-600 absolute -left-4 -top-4 px-2 text-white rounded-full select-none">×</span>
                                </div>
                                <div className="relative border-3 border-primaryColor shadow border-dashed rounded-xl px-2 py-1 bg-bgColor/20 inline-block">
                                    <span>take off</span>
                                    <span className="bg-gray-600 absolute -left-4 -top-4 px-2 text-white rounded-full select-none">×</span>
                                </div>
                                <div className="relative border-3 border-primaryColor shadow border-dashed rounded-xl px-2 py-1 bg-bgColor/20 inline-block">
                                    <span>put on</span>
                                    <span className="bg-gray-600 absolute -left-4 -top-4 px-2 text-white rounded-full select-none">×</span>
                                </div>
                                <div className="relative border-3 border-primaryColor shadow border-dashed rounded-xl px-2 py-1 bg-bgColor/20 inline-block">
                                    <span>figure out</span>
                                    <span className="bg-gray-600 absolute -left-4 -top-4 px-2 text-white rounded-full select-none">×</span>
                                </div>
                                <div className="relative border-3 border-primaryColor shadow border-dashed rounded-xl px-2 py-1 bg-bgColor/20 inline-block">
                                    <span>on porpuse</span>
                                    <span className="bg-gray-600 absolute -left-4 -top-4 px-2 text-white rounded-full select-none">×</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="border-4 backdrop-blur-2xl justify-self-start py-1 px-4 font-semibold rounded-xl bg-blue-500/50 -mb-5 -ml-4 z-20 relative select-none">Information :</div>
                            <div className="font-semibold text-center rounded-xl bg-white/20 border pt-6 pb-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio deserunt quas nemo dolore explicabo quidem rem necessitatibus accusantium .</div>
                        </div>
                        <Link href='/' className="text-[22px] text-center font-bold mt-auto border rounded-xl py-4 bg-gradient-to-br from-primaryColor to-blue-600 text-white shadow-xl cursor-pointer hover:shadow-2xl hover:scale-105 duration-200 ">Create Story =></Link>
                    </div>
                </div>
            </div>
        </div>
    )
}