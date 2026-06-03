import React from 'react';
import { Cpu, Zap, ShieldCheck, BarChart3 } from 'lucide-react';

const FeaturesSection = () => {
    const features = [
        {
            title: "Facility & Asset Bookings",
            icon: <Cpu className="text-blue-600" size={32} />,
            description: "Reserve lecture halls, labs, meeting rooms and equipment instantly with smart conflict detection."
        },
        {
            title: "Maintenance Ticketing",
            icon: <Zap className="text-blue-600" size={32} />,
            description: "Report faults, attach evidence, assign technicians and track resolution in real-time."
        },
        {
            title: "Live Notifications",
            icon: <ShieldCheck className="text-blue-600" size={32} />,
            description: "Get instant alerts for booking approvals, ticket updates and new comments."
        },
        {
            title: "Admin Dashboard",
            icon: <BarChart3 className="text-blue-600" size={32} />,
            description: "Powerful analytics, approval workflows and full oversight for administrators and technicians."
        }
    ];

    return (
        <section className="py-28 bg-gray-50/50 px-4 md:px-14">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-5 tracking-tight font-heading">Everything You Need to Succeed</h2>
                    <p className="text-slate-500/80 max-w-2xl mx-auto text-sm md:text-base leading-relaxed font-medium font-sans">
                        Discover all the tools and resources available on the Smart Campus Operations Hub designed specifically to accelerate your operational efficiency.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, idx) => (
                        <div key={idx} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
                            <div className="w-full h-44 bg-gray-50 rounded-2xl mb-8 flex items-center justify-center overflow-hidden border border-gray-100 group-hover:border-blue-200 transition-colors relative">
                                {feature.icon}
                                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors"></div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 font-heading">{feature.title}</h3>
                            <p className="text-gray-500 leading-relaxed border-l-2 border-transparent group-hover:border-blue-600 pl-0 group-hover:pl-4 transition-all duration-300 font-medium">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
