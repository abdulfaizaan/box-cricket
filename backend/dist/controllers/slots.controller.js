import { prisma } from '../db.js';
export const getSlots = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date || typeof date !== 'string') {
            return res.status(400).json({ error: 'Date query parameter is required (YYYY-MM-DD)' });
        }
        const queryDate = new Date(date);
        if (isNaN(queryDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }
        // Fetch booked slots for the day
        const bookedSlots = await prisma.booking.findMany({
            where: {
                bookingDate: queryDate,
                status: { in: ['PENDING', 'VERIFIED'] }
            },
            select: { startTime: true }
        });
        const bookedSet = new Set(bookedSlots.map((b) => b.startTime));
        // Generate 24 hourly slots
        const slots = [];
        const now = new Date();
        // Create Date object for the current day being requested to compare with 'now'
        // Ensure we handle timezone and time correctly to check if slot is past.
        // For MVP, we will assume local time.
        // Assuming IST (Asia/Kolkata) timezone for the facility
        const istTimeString = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const nowIST = new Date(istTimeString);
        // Parse the queried date (YYYY-MM-DD)
        const dateParts = date.split('-');
        const year = Number(dateParts[0]);
        const month = Number(dateParts[1]);
        const day = Number(dateParts[2]);
        for (let i = 0; i < 24; i++) {
            const hourStr = i.toString().padStart(2, '0');
            const nextHourStr = ((i + 1) % 24).toString().padStart(2, '0');
            const startTime = `${hourStr}:00`;
            const endTime = `${nextHourStr}:00`;
            // Calculate dynamic price based on rules (Day 08-20 = 500, Night 20-08 = 700)
            const price = (i >= 8 && i < 20) ? 500 : 700;
            // Determine status
            let isBooked = bookedSet.has(startTime);
            // Check if expired
            let isExpired = false;
            // Create a Date object representing the slot time in "IST" context
            // This works by creating both dates in the server's local timezone context
            // but with the hours representing IST hours.
            const slotDateIST = new Date(year, month - 1, day, i, 0, 0, 0);
            if (slotDateIST < nowIST) {
                isExpired = true;
            }
            slots.push({
                start: startTime,
                end: endTime,
                price,
                status: isExpired ? 'EXPIRED' : (isBooked ? 'BOOKED' : 'AVAILABLE')
            });
        }
        res.json({ date, slots });
    }
    catch (error) {
        console.error('Error fetching slots:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
//# sourceMappingURL=slots.controller.js.map