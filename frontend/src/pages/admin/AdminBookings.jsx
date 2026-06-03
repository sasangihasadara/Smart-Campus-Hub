import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Search, 
    Filter, 
    Check, 
    X, 
    Clock, 
    Calendar as CalendarIcon,
    MapPin,
    User,
    Users,
    FileText,
    MoreHorizontal,
    ArrowUpRight,
    Loader2,
    Inbox,
    CheckCircle2,
    AlertCircle,
    XCircle,
    ShieldCheck
} from 'lucide-react';
import { getAllBookings, approveBooking, rejectBooking } from '../../services/bookingService';
import { useToast } from '../../components/common/Toast';

const TABS = [
    { id: 'ALL', label: 'All Bookings' },
    { id: 'PENDING', label: 'Pending' },
    { id: 'APPROVED', label: 'Approved' },
    { id: 'REJECTED', label: 'Rejected' },
    { id: 'CANCELLED', label: 'Cancelled' }
];

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [popover, setPopover] = useState(null); // { id, type, note }
    
    const { addToast } = useToast();

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllBookings();
            setBookings(data);
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        void fetchAllData();
    }, [fetchAllData]);

    const filteredBookings = useMemo(() => {
        return bookings.filter(b => {
            const matchesTab = activeTab === 'ALL' || b.status === activeTab;
            const searchStr = searchTerm.toLowerCase();
            const matchesSearch = 
                b.resourceName.toLowerCase().includes(searchStr) || 
                b.userName.toLowerCase().includes(searchStr) ||
                b.userId.toLowerCase().includes(searchStr);
            return matchesTab && matchesSearch;
        });
    }, [bookings, activeTab, searchTerm]);

    const stats = useMemo(() => ({
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'PENDING').length,
        approved: bookings.filter(b => b.status === 'APPROVED').length,
        rejected: bookings.filter(b => b.status === 'REJECTED').length
    }), [bookings]);

    const handleAction = async (id, type) => {
        if (type === 'reject' && !popover?.note?.trim()) {
            addToast("Please provide a reason for rejection", "error");
            return;
        }

        setActionLoading(id);
        try {
            if (type === 'approve') {
                await approveBooking(id, popover?.note || '');
                addToast("Booking approved successfully", "success");
            } else {
                await rejectBooking(id, popover.note);
                addToast("Booking rejected", "success");
            }
            
            // Local Update
            setBookings(prev => prev.map(b => 
                b.id === id ? { ...b, status: type === 'approve' ? 'APPROVED' : 'REJECTED', adminNote: popover?.note } : b
            ));
            setPopover(null);
        } catch (err) {
            addToast(err.message, "error");
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formatTime = (t) => {
        if (!t) return '';
        const [h, m] = t.split(':');
        const hour = parseInt(h);
        return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50/30 min-h-screen">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-200">
                        <ShieldCheck size={24} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Booking Management</h1>
                </div>
                <p className="text-gray-500 font-medium ml-1">Review and manage all campus resource bookings from a central dashboard.</p>
            </header>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <MetricCard label="Total Bookings" value={stats.total} icon={<ArrowUpRight />} color="blue" />
                <MetricCard label="Pending Approval" value={stats.pending} icon={<Clock />} color="amber" />
                <MetricCard label="Approved" value={stats.approved} icon={<CheckCircle2 />} color="green" />
                <MetricCard label="Rejected" value={stats.rejected} icon={<XCircle />} color="red" />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-2 mb-8 flex flex-col lg:flex-row items-center gap-4">
                <div className="flex overflow-x-auto p-1 gap-1 no-scrollbar w-full lg:w-auto">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap
                                ${activeTab === tab.id 
                                    ? 'bg-gray-900 text-white shadow-lg' 
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 w-full lg:max-w-md ml-auto pr-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text"
                        placeholder="Search by user or resource..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all font-medium"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-bottom border-gray-100">
                            <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
                            <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Resource</th>
                            <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Schedule</th>
                            <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
                        ) : filteredBookings.length > 0 ? (
                            filteredBookings.map(booking => (
                                <tr key={booking.id} className="hover:bg-blue-50/20 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                                                {booking.userName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 leading-none">{booking.userName}</p>
                                                <p className="text-xs text-gray-500 mt-1">{booking.userId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="font-bold text-gray-900">{booking.resourceName}</p>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                            <MapPin size={12} />
                                            {booking.resourceLocation}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
                                            <CalendarIcon size={14} className="text-blue-500" />
                                            {formatDate(booking.date)}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                                            <Clock size={12} />
                                            {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <StatusBadge status={booking.status} />
                                    </td>
                                    <td className="px-6 py-5 text-right relative">
                                        <div className="flex justify-end gap-2">
                                            {booking.status === 'PENDING' ? (
                                                <>
                                                    <button 
                                                        onClick={() => setPopover({ id: booking.id, type: 'approve', note: '' })}
                                                        className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                        title="Approve"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => setPopover({ id: booking.id, type: 'reject', note: '' })}
                                                        className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                        title="Reject"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </>
                                            ) : booking.status === 'APPROVED' ? (
                                                <button className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider">Cancel</button>
                                            ) : (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </div>

                                        {/* Popover Logic */}
                                        {popover?.id === booking.id && (
                                            <div className="absolute right-6 bottom-full mb-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72 text-left animate-in fade-in slide-in-from-bottom-2 duration-200">
                                                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                    {popover.type === 'approve' ? <CheckCircle2 className="text-green-500" size={16} /> : <AlertCircle className="text-red-500" size={16} />}
                                                    {popover.type === 'approve' ? 'Approve Booking' : 'Reject Booking'}
                                                </h4>
                                                <textarea 
                                                    className="w-full p-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none transition-all resize-none"
                                                    placeholder={popover.type === 'approve' ? "Add a note (optional)..." : "Reason for rejection... *"}
                                                    rows={3}
                                                    value={popover.note}
                                                    onChange={e => setPopover({ ...popover, note: e.target.value })}
                                                />
                                                <div className="flex items-center justify-between mt-4">
                                                    <button 
                                                        onClick={() => setPopover(null)}
                                                        className="text-xs font-bold text-gray-400 hover:text-gray-600"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button 
                                                        onClick={() => handleAction(booking.id, popover.type)}
                                                        disabled={actionLoading === booking.id}
                                                        className={`px-4 py-2 rounded-lg text-xs font-bold text-white shadow-lg transition-all flex items-center gap-2
                                                            ${popover.type === 'approve' ? 'bg-green-600 hover:bg-green-700 shadow-green-100' : 'bg-red-600 hover:bg-red-700 shadow-red-100'}`}
                                                    >
                                                        {actionLoading === booking.id ? <Loader2 size={12} className="animate-spin" /> : 'Confirm'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center opacity-40">
                                        <Inbox size={64} className="mb-4 text-gray-300" />
                                        <p className="text-lg font-bold text-gray-500">No bookings found for this filter</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden space-y-4">
                {filteredBookings.map(booking => (
                    <div key={booking.id} className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                    {booking.userName.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 leading-none">{booking.userName}</p>
                                    <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-wider">{booking.userId}</p>
                                </div>
                            </div>
                            <StatusBadge status={booking.status} />
                        </div>
                        
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-sm">
                                <MapPin size={16} className="text-gray-400" />
                                <span className="font-bold text-gray-800">{booking.resourceName}</span>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-500">{booking.resourceLocation}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <CalendarIcon size={16} className="text-gray-400" />
                                <span className="text-gray-700">{formatDate(booking.date)}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Clock size={16} className="text-gray-400" />
                                <span className="font-bold text-blue-600">{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
                            </div>
                        </div>

                        {booking.status === 'PENDING' && (
                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                                <button 
                                    onClick={() => setPopover({ id: booking.id, type: 'approve', note: '' })}
                                    className="w-full py-3 rounded-2xl bg-green-600 text-white font-bold text-sm shadow-lg shadow-green-100"
                                >
                                    Approve
                                </button>
                                <button 
                                    onClick={() => setPopover({ id: booking.id, type: 'reject', note: '' })}
                                    className="w-full py-3 rounded-2xl bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-100"
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function MetricCard({ label, value, icon, color }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 shadow-blue-100 border-blue-100',
        amber: 'bg-amber-50 text-amber-600 shadow-amber-100 border-amber-100',
        green: 'bg-green-50 text-green-600 shadow-green-100 border-green-100',
        red: 'bg-red-50 text-red-600 shadow-red-100 border-red-100'
    };
    
    return (
        <div className={`p-6 rounded-3xl border shadow-lg ${colors[color]} transition-transform hover:scale-[1.02] duration-300`}>
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">{label}</span>
                <div className="opacity-80">{icon}</div>
            </div>
            <div className="text-4xl font-black">{value}</div>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
        APPROVED: 'bg-green-50 text-green-700 border-green-200',
        REJECTED: 'bg-red-50 text-red-700 border-red-200',
        CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200'
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${styles[status]}`}>
            {status}
        </span>
    );
}

function SkeletonRow() {
    return (
        <tr className="animate-pulse">
            <td className="px-6 py-5"><div className="flex gap-3"><div className="w-10 h-10 bg-gray-100 rounded-full" /><div className="space-y-2"><div className="h-4 bg-gray-100 rounded w-24" /><div className="h-3 bg-gray-50 rounded w-16" /></div></div></td>
            <td className="px-6 py-5"><div className="space-y-2"><div className="h-4 bg-gray-100 rounded w-32" /><div className="h-3 bg-gray-50 rounded w-20" /></div></td>
            <td className="px-6 py-5"><div className="space-y-2"><div className="h-4 bg-gray-100 rounded w-28" /><div className="h-3 bg-gray-50 rounded w-24" /></div></td>
            <td className="px-6 py-5"><div className="h-6 bg-gray-100 rounded-full w-20" /></td>
            <td className="px-6 py-5 text-right"><div className="h-8 bg-gray-100 rounded-lg w-16 ml-auto" /></td>
        </tr>
    );
}
