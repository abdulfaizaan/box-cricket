import React, { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:5000';

interface Booking {
  id: string;
  playerName: string;
  playerPhone: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
}

export default function AdminDashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [currentVerifyId, setCurrentVerifyId] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setBookings(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    }
  };

  const updateStatus = async (id: string, newStatus: string, otpCode?: string) => {

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, otpCode })
      });
      
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to update status');
        return false;
      }
      
      fetchBookings();
      return true;
    } catch (err) {
      console.error('Update failed', err);
      alert('Network error while updating status');
      return false;
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVerifyId || !otpInput.trim()) return;
    
    setIsUpdating(true);
    const success = await updateStatus(currentVerifyId, 'VERIFIED', otpInput.trim());
    setIsUpdating(false);
    
    if (success) {
      setVerifyModalOpen(false);
      setOtpInput('');
    }
  };

  const totalRevenue = bookings.filter(b => b.status === 'VERIFIED').reduce((sum, b) => sum + Number(b.totalPrice), 0);
  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
  const verifiedCount = bookings.filter(b => b.status === 'VERIFIED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans pb-20">
      {/* Sticky Glass Header */}
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Host Dashboard</h1>
              <p className="text-[10px] sm:text-xs text-emerald-400 font-medium tracking-wider uppercase">Box Cricket Admin</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="bg-white/5 border border-white/10 text-slate-300 font-semibold px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl hover:bg-white/10 hover:text-white transition-all hover:scale-105 flex items-center gap-2 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 sm:mt-10">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-10">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
            <p className="text-slate-400 font-medium text-xs sm:text-sm mb-1 uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-3xl sm:text-4xl font-black text-white">₹{totalRevenue}</h3>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
            <p className="text-slate-400 font-medium text-xs sm:text-sm mb-1 uppercase tracking-wider">Verified Bookings</p>
            <h3 className="text-3xl sm:text-4xl font-black text-white">{verifiedCount}</h3>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all"></div>
            <p className="text-slate-400 font-medium text-xs sm:text-sm mb-1 uppercase tracking-wider">Pending Approvals</p>
            <h3 className="text-3xl sm:text-4xl font-black text-white">{pendingCount}</h3>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-semibold text-xs uppercase tracking-widest bg-white/[0.02]">
                  <th className="p-6 whitespace-nowrap">Player Info</th>
                  <th className="p-6 whitespace-nowrap">Schedule</th>
                  <th className="p-6 whitespace-nowrap">Amount</th>
                  <th className="p-6 whitespace-nowrap">Status</th>
                  <th className="p-6 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                        <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                      <p className="text-slate-400 font-medium text-lg">No bookings found</p>
                      <p className="text-slate-500 text-sm mt-1">When players book slots, they will appear here.</p>
                    </td>
                  </tr>
                ) : bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="font-bold text-white text-base">{booking.playerName}</div>
                      <div className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        {booking.playerPhone}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="font-semibold text-slate-200">{new Date(booking.bookingDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                      <div className="text-sm text-slate-500 mt-1 font-mono bg-black/20 inline-block px-2 py-0.5 rounded border border-white/5">{booking.startTime} - {booking.endTime}</div>
                    </td>
                    <td className="p-6 font-extrabold text-emerald-400 text-lg">
                      ₹{booking.totalPrice}
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase inline-flex items-center gap-1.5 ${
                        booking.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        booking.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {booking.status === 'VERIFIED' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>}
                        {booking.status === 'PENDING' && <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></div>}
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-4 sm:p-6 text-right">
                      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                        {booking.status === 'PENDING' && (
                          <button
                            onClick={() => {
                              setCurrentVerifyId(booking.id);
                              setOtpInput('');
                              setVerifyModalOpen(true);
                            }}
                            className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm whitespace-nowrap w-full sm:w-auto"
                          >
                            Verify OTP
                          </button>
                        )}
                        {booking.status !== 'CANCELLED' && (
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to cancel this booking?')) {
                                updateStatus(booking.id, 'CANCELLED');
                              }
                            }}
                            className="bg-white/5 text-slate-400 hover:bg-red-500/20 hover:text-red-400 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap w-full sm:w-auto"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {verifyModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setVerifyModalOpen(false)}
          ></div>
          <div className="relative bg-slate-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-sm p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 border border-emerald-500/20">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Verify Booking</h3>
            <p className="text-slate-400 text-xs sm:text-sm mb-6">Enter the 6-digit OTP provided by the player to confirm their arrival and payment.</p>
            
            <form onSubmit={handleVerifySubmit}>
              <input
                type="text"
                required
                maxLength={6}
                pattern="\d{6}"
                value={otpInput}
                onChange={e => setOtpInput(e.target.value)}
                placeholder="123456"
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-center text-3xl font-mono text-white tracking-[0.25em] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all mb-6"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setVerifyModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-300 bg-white/5 hover:bg-white/10 transition-all border border-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || otpInput.length !== 6}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/25 flex justify-center items-center"
                >
                  {isUpdating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
