import React from 'react';
import SearchBar from '../common/SearchBar';

const Hero = () => {
    return (
        <header className="flex flex-col items-center justify-center w-full md:pt-40 pt-28 px-7 md:px-0 space-y-9 text-center bg-gradient-to-b from-cyan-100/70 pb-32 relative overflow-hidden">
            {/* Background Blobs for depth */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10 opacity-20 pointer-events-none">
                <div className="absolute top-20 left-10 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                <div className="absolute top-40 right-10 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            </div>

            <div className="max-w-4xl mx-auto space-y-12">
                <h1 className="text-[26px] md:text-[42px] font-extrabold text-gray-900 tracking-tight leading-[1.2] font-heading animate-fade-in-up">
                    Your ultimate academic <br className="hidden md:block" />
                    companion for <span className="text-blue-600 relative inline-block whitespace-nowrap">
                        Operations Hub.
                        <svg className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-3 md:h-5 text-blue-400/30 opacity-70 pointer-events-none" viewBox="0 0 300 15" preserveAspectRatio="none">
                            <path d="M5 10 Q 150 15 295 5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                            <path d="M10 12 Q 155 18 290 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </span>
                </h1>
                
                <p className="max-w-xl mx-auto text-sm md:text-base text-slate-500/80 animate-fade-in-up animation-delay-200 leading-relaxed font-medium font-sans">
                    We bring together world-class tools, interactive dashboards, and a supportive system to help you achieve your operational and maintenance goals.
                </p>
                
                <div className="w-full flex justify-center animate-fade-in-up animation-delay-400 font-sans mt-10">
                    <SearchBar />
                </div>
            </div>
        </header>
    );
};

export default Hero;
