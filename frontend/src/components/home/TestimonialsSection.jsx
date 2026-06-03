import React from 'react';
import { Star } from 'lucide-react';

const TestimonialsSection = () => {
    const reviews = [
        { name: "Dr. Sarath Wijesinghe", role: "Dean of Science", feedback: "The centralized booking system has completely eliminated scheduling conflicts for our faculty." },
        { name: "Thimira Prashan", role: "Lead Technician", feedback: "Live ticket updates make it incredibly easy to manage maintenance requests across the campus." },
        { name: "Suresh de Silva", role: "System Administrator", feedback: "Having a single dashboard for resources and reporting has tremendously improved our operations." }
    ];

    return (
        <section className="py-28 bg-blue-50/30 px-4 md:px-14">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight font-heading">What Campus Staff Say</h2>
                    <p className="text-slate-500/80 max-w-2xl mx-auto text-sm md:text-base font-medium">Hear how our unified platform is streamlining daily operations for administrators and technicians.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {reviews.map((review, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-14 w-14 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-bold text-xl">
                                    {review.name[0]}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{review.name}</h4>
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{review.role}</p>
                                </div>
                            </div>
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
                            </div>
                            <p className="text-gray-600 italic leading-relaxed font-medium">"{review.feedback}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
