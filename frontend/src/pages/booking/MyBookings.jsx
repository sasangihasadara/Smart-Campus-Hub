import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, 
    MapPin, 
    Clock, 
    Users, 
    AlertCircle, 
    CheckCircle2, 
    Clock3, 
    XCircle, 
    MoreVertical,
    Search,
    ArrowRight,
    RefreshCw,
    Loader2
} from 'lucide-react';
import { getMyBookings, cancelBooking } from '../../services/bookingService';

const STATUS_TABS = [
    { id: 'ALL', label: 'All' },
    { id: 'PENDING', label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { id: 'APPROVED', label: 'Approved', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { id: 'REJECTED', label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    { id: 'CANCELLED', label: 'Cancelled', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' }
];

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('ALL');
    const [cancellingId, setCancellingId] = useState(null);
    const [confirmCancelId, setConfirmCancelId] = useState(null);
    const navigate = useNavigate();

    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMyBookings();
            setBookings(data);
            // Save last visit to localStorage for unread badge logic
            localStorage.setItem('lastBookingVisit', new Date().toISOString());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const filteredBookings = useMemo(() => {
        if (activeTab === 'ALL') return bookings;
        return bookings.filter(b => b.status === activeTab);
    }, [bookings, activeTab]);

    const counts = useMemo(() => {
        const c = { ALL: bookings.length };
        STATUS_TABS.slice(1).forEach(tab => {
            c[tab.id] = bookings.filter(b => b.status === tab.id).length;
        });
        return c;
    }, [bookings]);

    const handleCancel = async (id) => {
        setCancellingId(id);
        try {
            await cancelBooking(id);
            // Optimistic Update
            setBookings(current => 
                current.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b)
            );
            setConfirmCancelId(null);
        } catch (err) {
            alert(err.message);
        } finally {
            setCancellingId(null);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING': return <Clock3 className="text-amber-500" size={16} />;
            case 'APPROVED': return <CheckCircle2 className="text-green-500" size={16} />;
            case 'REJECTED': return <XCircle className="text-red-500" size={16} />;
            case 'CANCELLED': return <AlertCircle className="text-gray-400" size={16} />;
            default: return null;
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
            case 'CANCELLED': return 'bg-gray-100 text-gray-600 border-gray-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col items-center max-w-md text-center">
                    <AlertCircle className="text-red-500 mb-4" size={48} />
                    <h2 className="text-xl font-bold text-gray-800">Oops! Something went wrong</h2>
                    <p className="text-gray-600 mt-2 mb-6">{error}</p>
                    <button 
                        onClick={fetchBookings}
                        className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                    >
                        <RefreshCw size={18} />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                <p className="text-gray-500 mt-1">Track and manage your resource booking requests.</p>
            </header>

            {/* Status Tabs */}
            <div className="flex overflow-x-auto pb-2 mb-8 gap-2 no-scrollbar">
                {STATUS_TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border
                            ${activeTab === tab.id 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                            }`}
                    >
                        {tab.label}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] 
                            ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            {counts[tab.id]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Bookings List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                {loading ? (
                    // Skeleton Loaders
                    [1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-3 w-2/3">
                                    <div className="h-6 bg-gray-100 rounded-lg w-3/4"></div>
                                    <div className="h-4 bg-gray-50 rounded-lg w-1/2"></div>
                                </div>
                                <div className="h-8 bg-gray-100 rounded-full w-24"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="h-10 bg-gray-50 rounded-xl"></div>
                                <div className="h-10 bg-gray-50 rounded-xl"></div>
                            </div>
                        </div>
                    ))
                ) : filteredBookings.length > 0 ? (
                    filteredBookings.map(booking => (
                        <div 
                            key={booking.id} 
                            className="bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/50 transition-all p-6 group"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-start justify-between lg:justify-start lg:gap-4 mb-2">
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {booking.resourceName}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border uppercase flex items-center gap-1.5 ${getStatusStyles(booking.status)}`}>
                                            {getStatusIcon(booking.status)}
                                            {booking.status}
                                        </span>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-gray-500 mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={14} className="text-blue-500" />
                                            {booking.resourceLocation}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} className="text-blue-500" />
                                            {formatDate(booking.date)}
                                        </div>
                                        <div className="flex items-center gap-1.5 font-medium text-gray-700">
                                            <Clock size={14} className="text-blue-500" />
                                            {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                                        </div>
                                        {booking.expectedAttendees && (
                                            <div className="flex items-center gap-1.5">
                                                <Users size={14} className="text-blue-500" />
                                                {booking.expectedAttendees} Attendees
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-gray-50/50 rounded-xl p-3 border border-dashed border-gray-200">
                                        <p className="text-sm text-gray-600 line-clamp-2 italic">
                                            "{booking.purpose}"
                                        </p>
                                    </div>

                                    {booking.adminNote && (
                                        <div className="mt-4 flex gap-2 items-start p-3 bg-red-50/50 rounded-xl border border-red-100">
                                            <AlertCircle size={16} className="text-red-500 mt-0.5" />
                                            <div>
                                                <span className="block text-xs font-bold text-red-700 uppercase tracking-wider">Admin Remark</span>
                                                <p className="text-sm text-red-600 italic">{booking.adminNote}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="lg:w-48 shrink-0 flex lg:flex-col gap-2">
                                    {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                                        confirmCancelId === booking.id ? (
                                            <div className="w-full space-y-2 animate-in slide-in-from-right-4">
                                                <p className="text-[10px] font-bold text-red-500 text-center uppercase tracking-tighter">Are you sure?</p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleCancel(booking.id)}
                                                        disabled={cancellingId === booking.id}
                                                        className="flex-1 bg-red-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                                                    >
                                                        {cancellingId === booking.id ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Yes'}
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmCancelId(null)}
                                                        className="flex-1 bg-gray-100 text-gray-600 text-xs font-bold py-2 rounded-lg hover:bg-gray-200"
                                                    >
                                                        Back
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmCancelId(booking.id)}
                                                className="w-full flex items-center justify-center gap-2 text-red-500 text-sm font-bold py-2.5 rounded-xl hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
                                            >
                                                <XCircle size={16} />
                                                Cancel Booking
                                            </button>
                                        )
                                    )}
                                    <button className="w-full flex items-center justify-center gap-2 text-gray-400 text-sm font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                                        <MoreVertical size={16} />
                                        Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    // Empty State
                    <div className="flex flex-col items-center justify-center py-20 px-4 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="bg-white p-6 rounded-full shadow-xl shadow-gray-200/50 mb-6">
                            <Calendar className="text-gray-300" size={64} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">No {activeTab.toLowerCase()} bookings found</h3>
                        <p className="text-gray-500 mt-2 mb-8 text-center max-w-sm">
                            {activeTab === 'ALL' 
                                ? "You haven't made any resource reservations yet." 
                                : `You don't have any bookings with status ${activeTab.toLowerCase()} at the moment.`}
                        </p>
                        <button 
                            onClick={() => navigate('/available')}
                            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
                        >
                            Browse Available Resources
                            <ArrowRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
