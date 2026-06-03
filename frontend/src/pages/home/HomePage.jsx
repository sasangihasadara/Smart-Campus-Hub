import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Download, PieChart, Star } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Hero from '../../components/home/Hero';
import FeaturesSection from '../../components/home/FeaturesSection';
import TestimonialsSection from '../../components/home/TestimonialsSection';
import CallToAction from '../../components/home/CallToAction';
import Footer from '../../components/layout/Footer';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-700 font-sans">
            <Navbar />
            
            <Hero />

            <FeaturesSection />

            {/* Catalogue Preview (Available Facilities & Assets) */}
            <section className="py-28 bg-white px-4 md:px-14">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-5 tracking-tight font-heading">Available Facilities & Assets</h2>
                        <p className="text-slate-500/80 max-w-2xl text-sm md:text-base leading-relaxed font-medium">
                            Search and filter lecture halls, labs, equipment and more. View real-time availability and submit booking requests instantly.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        {[
                            { name: "Lecture Hall A", type: "Facility", status: "Available", statusColor: "text-green-600 bg-green-50", building: "Main Block" },
                            { name: "Advanced Physics Lab", type: "Lab", status: "Occupied", statusColor: "text-amber-600 bg-amber-50", building: "Science Wing" },
                            { name: "Multimedia Projector 04", type: "Asset", status: "Maintenance", statusColor: "text-red-600 bg-red-50", building: "IT Dept" }
                        ].map((card, idx) => (
                            <div key={idx} className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all group font-sans">
                                <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-300 italic group-hover:bg-blue-50 transition-colors">
                                    {card.type} Preview
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                            {card.type}
                                        </span>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${card.statusColor}`}>
                                            {card.status}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 font-heading">{card.name}</h3>
                                    <p className="text-sm font-medium text-gray-500">{card.building}</p>
                                    <button className="w-full py-3 rounded-2xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-all">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Link to="/resources" className="inline-block px-10 py-4 border border-gray-300 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                        View all resources
                    </Link>
                </div>
            </section>

            <section className="py-28 bg-slate-50 px-4 md:px-14">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-14">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-5 tracking-tight font-heading">Reports & Insights</h2>
                            <p className="text-slate-500/80 max-w-2xl text-sm md:text-base leading-relaxed font-medium">
                                Track resource usage, capacity and service health from one place. Open ready-made analytics or export reports for reviews and submissions.
                            </p>
                        </div>
                        <Link
                            to="/reports"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-sm hover:bg-blue-700 transition-all w-fit"
                        >
                            Open reports
                            <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-8">
                        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <BarChart3 size={22} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Campus resource snapshot</p>
                                    <p className="text-sm text-slate-500">A quick preview of the reporting workspace</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                {[
                                    { label: "Active resources", value: "124", tone: "text-emerald-600 bg-emerald-50" },
                                    { label: "Utilization rate", value: "87%", tone: "text-blue-600 bg-blue-50" },
                                    { label: "Pending fixes", value: "09", tone: "text-amber-600 bg-amber-50" },
                                ].map((item) => (
                                    <div key={item.label} className="border border-gray-200 rounded-2xl p-5 bg-white">
                                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">{item.label}</p>
                                        <div className={`inline-flex px-4 py-2 rounded-2xl text-2xl font-bold ${item.tone}`}>
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-3 gap-3 items-end h-48">
                                {[
                                    { label: "Labs", value: 82, color: "bg-blue-500" },
                                    { label: "Halls", value: 64, color: "bg-emerald-500" },
                                    { label: "Assets", value: 48, color: "bg-amber-500" },
                                ].map((item) => (
                                    <div key={item.label} className="flex flex-col justify-end h-full gap-3">
                                        <span className="text-sm font-semibold text-slate-500 text-center">{item.value}</span>
                                        <div className="rounded-t-3xl bg-slate-100 border border-slate-200 h-full flex items-end overflow-hidden">
                                            <div
                                                className={`w-full ${item.color} rounded-t-3xl`}
                                                style={{ height: `${item.value}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-700 text-center">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-5">
                            {[
                                {
                                    icon: <PieChart size={20} />,
                                    title: "Visual summaries",
                                    copy: "See status distribution, resource categories and capacity trends without switching screens.",
                                },
                                {
                                    icon: <Download size={20} />,
                                    title: "Export ready",
                                    copy: "Generate printable reports and CSV files for meetings, audits and lecturer requests.",
                                },
                                {
                                    icon: <Star size={20} />,
                                    title: "Submission friendly",
                                    copy: "Keep a clean analytics page ready to demo from the home experience straight into reports.",
                                },
                            ].map((item) => (
                                <div key={item.title} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 font-heading mb-2">{item.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.copy}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <TestimonialsSection />

            <CallToAction />

            <Footer />
        </div>
    );
};

export default HomePage;
