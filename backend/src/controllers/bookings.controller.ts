import type { Request, Response } from 'express';
import { prisma } from '../db.js';
import crypto from 'crypto';
import { z } from 'zod';

const bookingSchema = z.object({
  playerName: z.string().min(2),
  playerPhone: z.string().length(10),
  playerEmail: z.string().email(),
  bookingDate: z.string(),
  slots: z.array(z.string()).min(1) // array of startTimes, e.g. ["08:00", "09:00"]
});

export const createBooking = async (req: Request, res: Response) => {
  try {
    const parsedData = bookingSchema.parse(req.body);
    const { playerName, playerPhone, playerEmail, bookingDate, slots } = parsedData;

    const queryDate = new Date(bookingDate);

    // Calculate total price based on our slot logic
    let totalPrice = 0;
    const formattedSlots = slots.map(startStr => {
      const hour = parseInt(startStr.split(':')[0] || '0', 10);
      const price = (hour >= 8 && hour < 20) ? 500 : 700;
      totalPrice += price;
      
      const nextHour = (hour + 1) % 24;
      const endStr = `${nextHour.toString().padStart(2, '0')}:00`;
      
      return { startTime: startStr, endTime: endStr, price };
    });

    // Generate secure 6-digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();

    // Use a transaction to book all slots at once
    const newBookings = await prisma.$transaction(
      formattedSlots.map(slot => 
        prisma.booking.create({
          data: {
            playerName,
            playerPhone,
            playerEmail,
            bookingDate: queryDate,
            startTime: slot.startTime,
            endTime: slot.endTime,
            totalPrice: slot.price,
            otpCode,
          }
        })
      )
    );
    // Asynchronously send WhatsApp notification
    (async () => {
      try {
        const admin = await prisma.admin.findFirst({
          where: { whatsappNumber: { not: null }, whatsappApiKey: { not: null } }
        });
        if (admin && admin.whatsappNumber && admin.whatsappApiKey) {
          const message = `🔔 *New Booking Alert* 🔔\n\n*Name:* ${playerName}\n*Phone:* ${playerPhone}\n*Date:* ${bookingDate}\n*Slots:* ${slots.join(', ')}\n*Total:* ₹${totalPrice}\n*OTP:* ${otpCode}`;
          const url = `https://api.callmebot.com/whatsapp.php?phone=${admin.whatsappNumber}&text=${encodeURIComponent(message)}&apikey=${admin.whatsappApiKey}`;
          await fetch(url);
        }
      } catch (err) {
        console.error('Failed to send WhatsApp notification:', err);
      }
    })();

    res.status(201).json({
      message: "Booking successful",
      otpCode,
      totalPrice,
      bookings: newBookings.map((b: any) => ({
        id: b.id,
        date: b.bookingDate,
        start: b.startTime,
        end: b.endTime
      }))
    });
  } catch (error: any) {
    console.error('Booking error:', error);
    
    // Check if it's a Prisma unique constraint violation (P2002)
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'One or more selected slots are already booked.' });
    }
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: (error as any).errors });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
};
