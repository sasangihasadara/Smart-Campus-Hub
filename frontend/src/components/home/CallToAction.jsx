import React from 'react';
import { ArrowRight } from 'lucide-react';

const CallToAction = () => {
    return (
        <section className="py-32 px-7 bg-white">
            <div className="max-w-4xl mx-auto text-center space-y-8">
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight font-heading leading-tight animate-fade-in-up">
                    Streamline your campus operations today
                </h2>
                <p className="text-sm md:text-base text-slate-500/80 animate-fade-in-up animation-delay-200 font-medium">
                    Take control of your facility bookings and maintenance requests. Join the Smart Campus Operations Hub to improve efficiency and resource allocation.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up animation-delay-400">
                    <button className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/25 hover:scale-105 active:scale-95">
                        Access System
                    </button>
                    <button className="flex items-center gap-2 font-bold text-gray-700 hover:text-blue-600 transition-colors group">
                        Learn more <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CallToAction;
