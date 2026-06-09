import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:5000';

type Slot = {
  start: string;
  end: string;
  price: number;
  status: 'AVAILABLE' | 'BOOKED' | 'EXPIRED';
};

export default function OfflineBooking({ token }: { token: string }) {
  const getLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState<string>(getLocalDateString(new Date()));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'booking'>('idle');

  const [playerName, setPlayerName] = useState('');
  const [playerPhone, setPlayerPhone] = useState('');

  useEffect(() => {
    fetchSlots(date);
  }, [date]);

  async function fetchSlots(selectedDate: string) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/slots?date=${selectedDate}`);
      const data = await res.json();
      if (data.slots) {
        setSlots(data.slots);
        setSelectedSlots(new Set());
      }
    } catch (e) {
      console.error("Failed to fetch slots", e);
    } finally {
      setLoading(false);
    }
  }

  const toggleSlot = (start: string, status: string) => {
    if (status !== 'AVAILABLE') return;
    const newSelection = new Set(selectedSlots);
    if (newSelection.has(start)) {
      newSelection.delete(start);
    } else {
      newSelection.add(start);
    }
    setSelectedSlots(newSelection);
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSlots.size === 0) return alert("Please select at least one slot");
    
    setBookingStatus('booking');
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/bookings/offline`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          playerName: playerName || 'Offline Booking',
          playerPhone: playerPhone || '0000000000',
          bookingDate: date,
          slots: Array.from(selectedSlots).sort()
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert('Offline slots blocked successfully!');
        setPlayerName('');
        setPlayerPhone('');
        fetchSlots(date);
      } else {
        alert("Failed: " + (data.error || "Unknown error"));
        fetchSlots(date);
      }
    } catch (error) {
      alert("Network error.");
    } finally {
      setBookingStatus('idle');
    }
  };

  const upcomingDates = React.useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return {
        isoString: getLocalDateString(d),
        dayName: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate(),
        monthName: d.toLocaleDateString('en-US', { month: 'short' })
      };
    });
  }, []);

  return (
    <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-10 text-white">
      <h2 className="text-2xl font-bold mb-6">Manual Offline Booking</h2>
      <p className="text-slate-400 text-sm mb-8">Block out slots that were booked offline or over a phone call so they won't appear online.</p>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar mb-8">
        {upcomingDates.map(d => {
          const isSelected = date === d.isoString;
          return (
            <button
              key={d.isoString}
              onClick={() => setDate(d.isoString)}
              type="button"
              className={`snap-center flex-shrink-0 w-20 h-24 rounded-2xl flex flex-col items-center justify-center transition-all ${
                isSelected 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider">{d.dayName}</span>
              <span className="text-2xl font-black mt-1 mb-1">{d.dayNumber}</span>
              <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>{d.monthName}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-12"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {slots.map((slot) => {
                const isSelected = selectedSlots.has(slot.start);
                let btnClass = "p-3 rounded-xl border text-center transition-all duration-150 flex flex-col items-center justify-center ";
                
                if (slot.status === 'AVAILABLE') {
                  if (isSelected) {
                    btnClass += "border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                  } else {
                    btnClass += "border-white/10 bg-white/5 hover:bg-white/10 text-slate-300";
                  }
                } else {
                  btnClass += "border-transparent bg-black/50 text-slate-600 cursor-not-allowed";
                }

                return (
                  <button 
                    type="button"
                    key={slot.start}
                    onClick={() => toggleSlot(slot.start, slot.status)}
                    disabled={slot.status !== 'AVAILABLE'}
                    className={btnClass}
                  >
                    <span className="text-lg font-bold">{slot.start}</span>
                    <span className="text-xs mt-1 font-medium">{slot.status === 'AVAILABLE' ? 'Available' : slot.status}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-fit">
          <h3 className="text-lg font-bold mb-4">Block Details</h3>
          <form onSubmit={handleBook} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Player Name (Optional)</label>
              <input 
                type="text" 
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                placeholder="Offline Player"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number (Optional)</label>
              <input 
                type="text" 
                value={playerPhone}
                onChange={e => setPlayerPhone(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                placeholder="10-digit mobile"
              />
            </div>
            <div className="pt-4 border-t border-white/10">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Selected Slots:</span>
                <span className="font-bold text-white">{selectedSlots.size}</span>
              </div>
              <button 
                type="submit"
                disabled={selectedSlots.size === 0 || bookingStatus === 'booking'}
                className="w-full bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-400 transition-all disabled:opacity-50 mt-2"
              >
                {bookingStatus === 'booking' ? 'Blocking...' : 'Block Selected Slots'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
