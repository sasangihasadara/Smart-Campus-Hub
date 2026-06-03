import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { createBooking } from '../../services/bookingService';
import { typeLabel } from '../../utils/resourceModule';

export default function BookingModal({ resource, isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        purpose: '',
        expectedAttendees: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                date: '',
                startTime: '',
                endTime: '',
                purpose: '',
                expectedAttendees: ''
            });
            setError(null);
            setSuccess(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const today = new Date().toISOString().split('T')[0];

    const validate = () => {
        if (!formData.date || !formData.startTime || !formData.endTime || !formData.purpose) {
            setError("Please fill in all required fields.");
            return false;
        }
        if (formData.startTime >= formData.endTime) {
            setError("Start time must be before end time.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!validate()) return;

        setLoading(true);
        try {
            const bookingData = {
                resourceId: resource.id,
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
                purpose: formData.purpose,
                expectedAttendees: formData.expectedAttendees ? parseInt(formData.expectedAttendees) : null
            };

            await createBooking(bookingData);
            setSuccess(true);
            
            setTimeout(() => {
                onClose();
                onSuccess();
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header with Gradient */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <h2 className="text-2xl font-bold mb-1">Book Facility</h2>
                    <p className="text-blue-100 text-sm opacity-90">{resource.name}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30`}>
                            {typeLabel(resource.type)}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30 flex items-center gap-1">
                            <Users size={12} />
                            Max: {resource.capacity || 'N/A'}
                        </span>
                    </div>
                </div>

                <div className="p-6">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in duration-300">
                            <div className="bg-green-100 p-4 rounded-full mb-4">
                                <CheckCircle2 className="text-green-600" size={48} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Booking Submitted!</h3>
                            <p className="text-gray-500 mt-2">Awaiting administrator approval.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-start gap-3 animate-in slide-in-from-top-2">
                                    <AlertCircle className="text-red-500 shrink-0" size={20} />
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4">
                                {/* Date Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                                        <Calendar size={14} className="text-blue-600" />
                                        Reservation Date
                                    </label>
                                    <input
                                        type="date"
                                        min={today}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50"
                                        value={formData.date}
                                        onChange={e => setFormData({...formData, date: e.target.value})}
                                    />
                                </div>

                                {/* Time Selection */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                                            <Clock size={14} className="text-blue-600" />
                                            Start Time
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50"
                                            value={formData.startTime}
                                            onChange={e => setFormData({...formData, startTime: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                                            <Clock size={14} className="text-blue-600" />
                                            End Time
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50"
                                            value={formData.endTime}
                                            onChange={e => setFormData({...formData, endTime: e.target.value})}
                                        />
                                    </div>
                                </div>

                                {/* Expected Attendees */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                                        <Users size={14} className="text-blue-600" />
                                        Expected Attendees
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder={`Max capacity: ${resource.capacity || 'N/A'}`}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50"
                                        value={formData.expectedAttendees}
                                        onChange={e => setFormData({...formData, expectedAttendees: e.target.value})}
                                    />
                                </div>

                                {/* Purpose */}
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <FileText size={14} className="text-blue-600" />
                                            Purpose / Reason
                                        </label>
                                        <span className={`text-[10px] font-bold ${formData.purpose.length > 500 ? 'text-red-500' : 'text-gray-400'}`}>
                                            {formData.purpose.length} / 500
                                        </span>
                                    </div>
                                    <textarea
                                        required
                                        maxLength={500}
                                        rows={3}
                                        placeholder="Describe the nature of your reservation..."
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50 resize-none"
                                        value={formData.purpose}
                                        onChange={e => setFormData({...formData, purpose: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Confirm Booking</span>
                                            <CalendarCheck2 size={20} className="group-hover:scale-110 transition-transform" />
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full mt-2 py-2 text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

// Sub-component for icons if needed (CalendarCheck2 was missing from initial thoughts but available in Lucide)
function CalendarCheck2(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 14V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
      <path d="m16 20 2 2 4-4" />
    </svg>
  );
}
