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

import type { AuthRequest } from '../middleware/auth.middleware.js';

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.admin?.id;
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { whatsappNumber: true, whatsappApiKey: true }
    });
    res.json(admin);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.admin?.id;
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

    const { whatsappNumber, whatsappApiKey } = req.body;
    
    const updated = await prisma.admin.update({
      where: { id: adminId },
      data: { whatsappNumber, whatsappApiKey }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createOfflineBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingDate, slots, playerName, playerPhone } = req.body;
    const queryDate = new Date(bookingDate);

    let totalPrice = 0;
    const formattedSlots = slots.map((startStr: string) => {
      const hour = parseInt(startStr.split(':')[0] || '0', 10);
      const price = (hour >= 8 && hour < 20) ? 500 : 700;
      totalPrice += price;
      const nextHour = (hour + 1) % 24;
      const endStr = `${nextHour.toString().padStart(2, '0')}:00`;
      return { startTime: startStr, endTime: endStr, price };
    });

    const newBookings = await prisma.$transaction(
      formattedSlots.map((slot: any) => 
        prisma.booking.create({
          data: {
            playerName: playerName || 'Offline Booking',
            playerPhone: playerPhone || '0000000000',
            playerEmail: 'offline@boxcricket.local',
            bookingDate: queryDate,
            startTime: slot.startTime,
            endTime: slot.endTime,
            totalPrice: slot.price,
            otpCode: 'OFFLNE',
            status: 'VERIFIED',
            isVerified: true,
            isOffline: true
          }
        })
      )
    );

    res.status(201).json({ message: "Offline slots blocked successfully", bookings: newBookings });
  } catch (error: any) {
    console.error('Offline booking error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'One or more selected slots are already booked.' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
