import type { Request, Response } from 'express';
import { prisma } from '../db.js';

export const getBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const status = req.body.status as string;
    const otpCode = req.body.otpCode as string | undefined;

    if (status === 'VERIFIED') {
      const booking = await prisma.booking.findUnique({ where: { id } });
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      if (booking.otpCode !== otpCode) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }
    }
    
    const updated = await prisma.booking.update({
      where: { id },
      data: { status }
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
