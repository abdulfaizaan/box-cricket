import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:5000';

type Slot = {
  start: string;
  end: string;
  price: number;
  status: 'AVAILABLE' | 'BOOKED' | 'EXPIRED';
};

export default function BookingFlow() {
  // Use local date instead of UTC to avoid timezone shift
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
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'booking' | 'success'>('idle');
  
  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Result
  const [bookingResult, setBookingResult] = useState<any>(null);
  
  // For ticket download
  const ticketRef = useRef<HTMLDivElement>(null);
  
  // Hydration fix
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchSlots(date);
  }, [date]);

  if (!mounted) {
    return (
      <div className="grid lg:grid-cols-3 gap-10 min-h-[500px] bg-white border-4 border-black p-8 shadow-[12px_12px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-center w-full col-span-3">
          <div className="w-10 h-10 border-4 border-black border-t-[#ccff00] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  async function fetchSlots(selectedDate: string) {
    setLoading(true);
    try {
      // In production this would point to the deployed backend
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
  };

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
      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: name,
          playerPhone: phone,
          playerEmail: email,
          bookingDate: date,
          slots: Array.from(selectedSlots).sort() // Send sorted start times
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setBookingStatus('success');
        setBookingResult(data);
      } else {
        alert("Booking failed: " + (data.error || "Unknown error"));
        setBookingStatus('idle');
        fetchSlots(date); 
      }
    } catch (error) {
      alert("Network error. Please make sure backend is running on port 5000.");
      setBookingStatus('idle');
    }
  };

  const downloadTicket = async () => {
    if (!ticketRef.current) return;
    try {
      const dataUrl = await toPng(ticketRef.current, { backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `PitchPass-Ticket-${bookingResult.otpCode}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to generate ticket image", error);
      alert("Failed to download ticket. Please try again or take a screenshot.");
    }
  };

  if (bookingStatus === 'success') {
    return (
      <div className="bg-white p-6 sm:p-10 border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_rgba(0,0,0,1)] text-center max-w-2xl mx-auto">
        <div ref={ticketRef} className="printable-ticket-container bg-white pt-4 pb-8 px-4 sm:px-8 -mx-4 sm:-mx-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#ccff00] border-4 border-black rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <svg className="w-10 h-10 sm:w-12 sm:h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-black mb-4 sm:mb-6 uppercase tracking-tighter">Booking Confirmed!</h2>
        
        <div className="bg-[#f4f4f0] p-6 sm:p-8 mb-6 sm:mb-8 inline-block text-left border-4 border-black w-full shadow-[6px_6px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          {/* Ticket jagged edge effect */}
          <div className="absolute top-0 left-0 w-full flex justify-around -mt-2">
            {[...Array(20)].map((_, i) => <div key={i} className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full border-b-4 border-black"></div>)}
          </div>
          
          <div className="flex justify-between items-end mb-4 border-b-4 border-black pb-4 mt-4">
            <span className="text-black font-black uppercase text-lg sm:text-xl">Date</span>
            <span className="text-black font-bold text-base sm:text-lg bg-white border-2 border-black px-2 sm:px-3 py-1">{date}</span>
          </div>
          <div className="flex justify-between items-end mb-4 sm:mb-6">
            <span className="text-black font-black uppercase text-lg sm:text-xl">Total Paid</span>
            <span className="text-2xl sm:text-4xl font-black text-black bg-[#ccff00] border-2 border-black px-2 sm:px-3 py-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">₹{bookingResult.totalPrice}</span>
          </div>
          
          <div className="text-center mt-6 sm:mt-8 border-t-4 border-dashed border-black pt-6 sm:pt-8">
            <p className="text-xs sm:text-sm text-black uppercase tracking-widest font-black mb-3 sm:mb-4">Your Verification OTP</p>
            <p className="text-5xl sm:text-7xl font-black text-white bg-black tracking-[0.2em] py-3 sm:py-4 border-4 border-black shadow-[4px_4px_0px_rgba(204,255,0,1)] sm:shadow-[6px_6px_0px_rgba(204,255,0,1)] transform -rotate-1">{bookingResult.otpCode}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 sm:gap-4 text-left bg-black text-white p-4 sm:p-5 border-4 border-black shadow-[4px_4px_0px_rgba(204,255,0,1)] sm:shadow-[6px_6px_0px_rgba(204,255,0,1)] mb-6 sm:mb-8 transform rotate-1">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#ccff00] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <p className="font-bold text-sm sm:text-lg">
            Payment must be made offline at the venue. Screenshot this ticket and show the OTP to the admin upon arrival.
          </p>
        </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 no-print mt-2 sm:mt-4">
          <button onClick={downloadTicket} className="w-full bg-[#ccff00] text-black border-4 border-black px-6 sm:px-8 py-4 sm:py-5 font-black uppercase text-lg sm:text-xl transition-colors shadow-[6px_6px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] sm:hover:translate-x-[8px] sm:hover:translate-y-[8px] flex justify-center items-center gap-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Download Ticket
          </button>
          <button onClick={() => window.location.href = '/'} className="w-full bg-white text-black border-4 border-black px-6 sm:px-8 py-4 sm:py-5 font-black uppercase text-lg sm:text-xl hover:bg-black hover:text-white transition-colors shadow-[6px_6px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] sm:hover:translate-x-[8px] sm:hover:translate-y-[8px]">
            Return Home
          </button>
        </div>

        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .printable-ticket-container, .printable-ticket-container * {
              visibility: visible;
            }
            .printable-ticket-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              border: none !important;
              box-shadow: none !important;
            }
            .no-print {
              display: none !important;
            }
            /* Brutalist styles override for print to ensure they render well on paper */
            .printable-ticket-container .bg-\\[\\#ccff00\\] {
              background-color: white !important;
              color: black !important;
              border: 2px solid black !important;
            }
            .printable-ticket-container .bg-black {
              background-color: white !important;
              color: black !important;
              border: 2px solid black !important;
            }
          }
        `}</style>
      </div>
    );
  }

  const selectedPrice = Array.from(selectedSlots).reduce((total, start) => {
    const slot = slots.find(s => s.start === start);
    return total + (slot ? slot.price : 0);
  }, 0);

  const upcomingDates = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      isoString: getLocalDateString(d),
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' })
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
      {/* Left Column: Slots */}
      <div className="lg:col-span-2 bg-white p-4 sm:p-8 border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_rgba(0,0,0,1)]">
        <div className="mb-8 sm:mb-10 flex flex-col gap-4 sm:gap-6 border-b-4 border-black pb-6 sm:pb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tight">Select Date & Time</h2>
            <p className="text-black font-bold mt-2 text-base sm:text-lg">Choose the slots you wish to smash.</p>
          </div>
          
          {/* Horizontal Brutalist Date Selector */}
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full">
            {upcomingDates.map(d => {
              const isSelected = date === d.isoString;
              return (
                <button
                  key={d.isoString}
                  onClick={() => setDate(d.isoString)}
                  type="button"
                  className={`snap-center flex-shrink-0 w-20 sm:w-24 h-24 sm:h-28 border-4 border-black flex flex-col items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-black text-[#ccff00] shadow-none translate-x-[4px] translate-y-[4px] sm:translate-x-[6px] sm:translate-y-[6px]' 
                      : 'bg-white text-black hover:bg-[#ccff00] shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  <span className={`text-xs sm:text-sm font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-gray-500'}`}>{d.dayName}</span>
                  <span className="text-3xl sm:text-4xl font-black mt-1 mb-1">{d.dayNumber}</span>
                  <span className={`text-[10px] sm:text-xs font-bold uppercase ${isSelected ? 'text-[#ccff00]' : 'text-gray-400'}`}>{d.monthName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 sm:py-24">
            <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
            <p className="text-gray-500 font-medium text-base sm:text-lg">Fetching live availability...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {slots.map((slot) => {
              const isSelected = selectedSlots.has(slot.start);
              let btnClass = "p-3 sm:p-4 border-4 text-center transition-all duration-150 focus:outline-none flex flex-col items-center justify-center ";
              
              if (slot.status === 'AVAILABLE') {
                if (isSelected) {
                  btnClass += "border-black bg-black text-[#ccff00] shadow-none translate-x-[4px] translate-y-[4px] sm:translate-x-[6px] sm:translate-y-[6px]";
                } else {
                  btnClass += "border-black bg-white hover:bg-[#ccff00] text-black cursor-pointer shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] sm:hover:translate-x-[6px] sm:hover:translate-y-[6px]";
                }
              } else if (slot.status === 'BOOKED') {
                btnClass += "border-black bg-[#f4f4f0] text-gray-400 cursor-not-allowed shadow-[4px_4px_0px_rgba(0,0,0,0.1)] sm:shadow-[6px_6px_0px_rgba(0,0,0,0.1)] relative overflow-hidden";
              } else {
                btnClass += "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed shadow-none";
              }

              return (
                <button 
                  type="button"
                  key={slot.start}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleSlot(slot.start, slot.status);
                  }}
                  disabled={slot.status !== 'AVAILABLE'}
                  aria-disabled={slot.status !== 'AVAILABLE'}
                  className={btnClass}
                >
                  {slot.status === 'BOOKED' && <div className="absolute inset-0 bg-black/5 flex items-center justify-center" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)' }}></div>}
                  <span className="text-lg sm:text-xl font-black pointer-events-none relative z-10">{slot.start}</span>
                  <span className={`text-xs sm:text-sm mt-1 font-bold pointer-events-none relative z-10 ${isSelected ? 'text-white' : ''}`}>
                    {slot.status === 'AVAILABLE' ? `₹${slot.price}` : slot.status}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column: Booking Form */}
      <div className="bg-[#ccff00] p-5 sm:p-8 border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_rgba(0,0,0,1)] h-fit lg:sticky lg:top-6 mt-6 lg:mt-0">
        <h2 className="text-2xl sm:text-3xl font-black text-black mb-6 sm:mb-8 uppercase tracking-tight bg-white border-2 border-black inline-block px-3 sm:px-4 py-1 shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_rgba(0,0,0,1)] transform -rotate-2">Book It</h2>
        
        <div className="mb-6 sm:mb-8 bg-white p-4 sm:p-6 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-end mb-3 sm:mb-4">
            <span className="text-black font-black uppercase text-base sm:text-lg">Selected Slots</span>
            <span className="font-black text-white bg-black px-3 sm:px-4 py-1 text-lg sm:text-xl shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">{selectedSlots.size}</span>
          </div>
          <div className="flex justify-between items-end mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-4 border-black">
            <span className="text-black font-black uppercase text-base sm:text-lg">Total</span>
            <span className="text-3xl sm:text-4xl font-black text-black">₹{selectedPrice}</span>
          </div>
        </div>

        <form onSubmit={handleBook} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-black text-black mb-1 sm:mb-2 uppercase tracking-wider">Full Name</label>
            <input 
              suppressHydrationWarning
              required
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-3 sm:p-4 border-4 border-black bg-white focus:bg-[#f4f4f0] outline-none transition-colors font-bold text-black text-base sm:text-lg shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_rgba(0,0,0,1)] focus:shadow-[1px_1px_0px_rgba(0,0,0,1)] sm:focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] sm:focus:translate-x-[2px] sm:focus:translate-y-[2px]"
              placeholder="VIRAT KOHLI"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-black text-black mb-1 sm:mb-2 uppercase tracking-wider">Phone Number</label>
            <input 
              suppressHydrationWarning
              required
              type="tel" 
              pattern="[0-9]{10}"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full p-3 sm:p-4 border-4 border-black bg-white focus:bg-[#f4f4f0] outline-none transition-colors font-bold text-black text-base sm:text-lg shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_rgba(0,0,0,1)] focus:shadow-[1px_1px_0px_rgba(0,0,0,1)] sm:focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] sm:focus:translate-x-[2px] sm:focus:translate-y-[2px]"
              placeholder="10-DIGIT MOBILE"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-black text-black mb-1 sm:mb-2 uppercase tracking-wider">Email Address</label>
            <input 
              suppressHydrationWarning
              required
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 sm:p-4 border-4 border-black bg-white focus:bg-[#f4f4f0] outline-none transition-colors font-bold text-black text-base sm:text-lg shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_rgba(0,0,0,1)] focus:shadow-[1px_1px_0px_rgba(0,0,0,1)] sm:focus:shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] sm:focus:translate-x-[2px] sm:focus:translate-y-[2px]"
              placeholder="VIRAT@EXAMPLE.COM"
            />
          </div>
          
          <button 
            type="submit"
            disabled={selectedSlots.size === 0 || bookingStatus === 'booking'}
            className="w-full bg-black text-[#ccff00] font-black uppercase text-xl sm:text-2xl py-4 sm:py-5 border-4 border-black shadow-[4px_4px_0px_rgba(255,255,255,1)] sm:shadow-[8px_8px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] sm:hover:translate-x-[8px] sm:hover:translate-y-[8px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[4px_4px_0px_rgba(255,255,255,1)] sm:disabled:shadow-[8px_8px_0px_rgba(255,255,255,1)] mt-6 sm:mt-8"
          >
            {bookingStatus === 'booking' ? (
              <span className="flex items-center justify-center gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-4 border-[#ccff00] border-t-transparent animate-spin"></div>
                Confirming
              </span>
            ) : 'Smash It!'}
          </button>
          
          <p className="text-xs sm:text-sm text-center text-black font-bold mt-4 sm:mt-6 uppercase">
            ⚡ Pay offline at the venue.
          </p>
        </form>
      </div>
    </div>
  );
}
