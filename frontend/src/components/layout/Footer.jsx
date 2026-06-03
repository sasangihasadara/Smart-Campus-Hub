import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-20 px-8 md:px-36">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-20 pb-16 border-b border-white/10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                                <LayoutDashboard size={24} />
                            </div>
                            <span className="text-2xl font-bold">SmartCampus</span>
                        </div>
                        <p className="text-slate-400 leading-relaxed font-medium">
                            Empowering IT administration and campus management with a unified platform for tracking facilities, equipment, and maintenance tickets in real-time.
                        </p>
                    </div>
                    
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold">Operations Hub</h3>
                        <ul className="space-y-4 text-gray-400 font-medium">
                            <li><Link to="/resources" className="hover:text-white transition-colors">Resources</Link></li>
                            <li><Link to="/bookings" className="hover:text-white transition-colors">Bookings</Link></li>
                            <li><Link to="/tickets" className="hover:text-white transition-colors">Tickets</Link></li>
                            <li><Link to="/admin-login" className="hover:text-white transition-colors">Admin Login</Link></li>
                            <li><Link to="/technician-login" className="hover:text-white transition-colors">Technician Login</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-bold">Subscribe to system alerts</h3>
                        <p className="text-gray-400 font-medium">Get the latest updates on campus maintenance, planned outages, and new resources.</p>
                        <div className="flex gap-2">
                            <input className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 w-full outline-none focus:border-blue-500 font-medium" placeholder="Enter your email" />
                            <button className="bg-blue-600 px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">Subscribe</button>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-center pt-10 text-gray-500 text-sm font-medium">
                    <p>Copyright 2026 © Smart Campus Operations Hub. All Right Reserved.</p>
                    <div className="flex gap-8 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
