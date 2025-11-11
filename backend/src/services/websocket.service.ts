import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config/env';
import logger from '../utils/logger';

interface JWTPayload {
  userId: string;
  userType: 'super_admin' | 'admin' | 'tourist';
  email: string;
}

interface MessageData {
  booking_id: string;
  sender_id: string;
  sender_type: 'tourist' | 'hotel_admin';
  recipient_id: string;
  message: string;
  attachments?: string[];
}

interface BookingUpdateData {
  booking_id: string;
  old_status: string;
  new_status: string;
  hotel_id?: string;
  user_id?: string;
  timestamp: Date;
}

class WebSocketService {
  private io: Server | null = null;
  private adminRoom = 'admin-dashboard';
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socket IDs
  private hotelSockets: Map<string, Set<string>> = new Map(); // hotelId -> Set of socket IDs

  /**
   * Initialize Socket.io server
   */
  public initialize(httpServer: HTTPServer): void {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.CORS_ORIGIN,
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    // Authentication middleware
    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        // Allow connection without auth for now (can be restricted later)
        logger.warn('WebSocket connection without authentication token');
        return next();
      }

      try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;
        (socket as any).user = decoded;
        logger.info(`WebSocket authenticated: ${decoded.email} (${decoded.userType})`);
        next();
      } catch (error) {
        logger.error('WebSocket authentication failed:', error);
        next(new Error('Authentication failed'));
      }
    });

    // Connection handler
    this.io.on('connection', (socket: Socket) => {
      const user = (socket as any).user as JWTPayload | undefined;

      logger.info(`WebSocket client connected: ${socket.id}`, {
        userId: user?.userId,
        userType: user?.userType,
      });

      // Track user socket connections
      if (user) {
        if (!this.userSockets.has(user.userId)) {
          this.userSockets.set(user.userId, new Set());
        }
        this.userSockets.get(user.userId)!.add(socket.id);
      }

      // Join admin room if user is admin or super_admin
      if (user && (user.userType === 'admin' || user.userType === 'super_admin')) {
        socket.join(this.adminRoom);
        logger.info(`User ${user.email} joined admin dashboard room`);
      }

      // Handle user joining a booking room
      socket.on('join:booking', (bookingId: string) => {
        socket.join(`booking:${bookingId}`);
        logger.info(`User ${user?.userId} joined booking room: ${bookingId}`);
      });

      // Handle user leaving a booking room
      socket.on('leave:booking', (bookingId: string) => {
        socket.leave(`booking:${bookingId}`);
        logger.info(`User ${user?.userId} left booking room: ${bookingId}`);
      });

      // Handle hotel admin joining hotel room
      socket.on('join:hotel', (hotelId: string) => {
        socket.join(`hotel:${hotelId}`);
        if (!this.hotelSockets.has(hotelId)) {
          this.hotelSockets.set(hotelId, new Set());
        }
        this.hotelSockets.get(hotelId)!.add(socket.id);
        logger.info(`Hotel admin ${user?.userId} joined hotel room: ${hotelId}`);
      });

      // Handle hotel admin leaving hotel room
      socket.on('leave:hotel', (hotelId: string) => {
        socket.leave(`hotel:${hotelId}`);
        const hotelSet = this.hotelSockets.get(hotelId);
        if (hotelSet) {
          hotelSet.delete(socket.id);
          if (hotelSet.size === 0) {
            this.hotelSockets.delete(hotelId);
          }
        }
        logger.info(`Hotel admin ${user?.userId} left hotel room: ${hotelId}`);
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        logger.info(`WebSocket client disconnected: ${socket.id}`, { reason });

        // Clean up user socket tracking
        if (user) {
          const userSet = this.userSockets.get(user.userId);
          if (userSet) {
            userSet.delete(socket.id);
            if (userSet.size === 0) {
              this.userSockets.delete(user.userId);
            }
          }
        }
      });

      // Handle errors
      socket.on('error', (error) => {
        logger.error('WebSocket error:', error);
      });
    });

    logger.info('WebSocket service initialized successfully');
  }

  /**
   * Broadcast real-time message to booking participants
   */
  public broadcastMessage(data: MessageData & { id: string; created_at: Date; is_read: boolean }): void {
    if (!this.io) {
      logger.warn('WebSocket service not initialized. Cannot broadcast message.');
      return;
    }

    const messageEvent = {
      ...data,
      created_at: data.created_at.toISOString(),
    };

    // Send to booking room (all participants)
    this.io.to(`booking:${data.booking_id}`).emit('message:new', messageEvent);

    // Send to specific recipient
    this.io.to(`user:${data.recipient_id}`).emit('message:new', messageEvent);

    logger.info(`Broadcasted message to booking ${data.booking_id}`, {
      sender_id: data.sender_id,
      recipient_id: data.recipient_id,
    });
  }

  /**
   * Broadcast message read status update
   */
  public broadcastMessageReadStatus(data: {
    message_id: string;
    booking_id: string;
    read_by: string;
    read_at: Date;
  }): void {
    if (!this.io) {
      logger.warn('WebSocket service not initialized. Cannot broadcast read status.');
      return;
    }

    this.io.to(`booking:${data.booking_id}`).emit('message:read', {
      ...data,
      read_at: data.read_at.toISOString(),
    });

    logger.info(`Broadcasted message read status for message ${data.message_id}`);
  }

  /**
   * Broadcast booking status change
   */
  public broadcastBookingStatusChange(data: BookingUpdateData): void {
    if (!this.io) {
      logger.warn('WebSocket service not initialized. Cannot broadcast booking status change.');
      return;
    }

    const bookingEvent = {
      ...data,
      timestamp: data.timestamp.toISOString(),
    };

    // Send to booking room
    this.io.to(`booking:${data.booking_id}`).emit('booking:status:changed', bookingEvent);

    // Send to user
    if (data.user_id) {
      this.io.to(`user:${data.user_id}`).emit('booking:status:changed', bookingEvent);
    }

    // Send to hotel admin
    if (data.hotel_id) {
      this.io.to(`hotel:${data.hotel_id}`).emit('booking:status:changed', bookingEvent);
    }

    // Send to admin dashboard
    this.io.to(this.adminRoom).emit('booking:status:changed', bookingEvent);

    logger.info(`Broadcasted booking status change for booking ${data.booking_id}`, {
      old_status: data.old_status,
      new_status: data.new_status,
    });
  }

  /**
   * Broadcast new booking notification to hotel admin
   */
  public broadcastNewBooking(data: {
    booking_id: string;
    hotel_id: string;
    user_name: string;
    check_in: Date;
    check_out: Date;
    room_type: string;
    total_price: number;
    timestamp: Date;
  }): void {
    if (!this.io) {
      logger.warn('WebSocket service not initialized. Cannot broadcast new booking.');
      return;
    }

    const bookingEvent = {
      ...data,
      check_in: data.check_in.toISOString(),
      check_out: data.check_out.toISOString(),
      timestamp: data.timestamp.toISOString(),
    };

    // Send to hotel admin
    this.io.to(`hotel:${data.hotel_id}`).emit('booking:new', bookingEvent);

    // Send to admin dashboard
    this.io.to(this.adminRoom).emit('booking:new', bookingEvent);

    logger.info(`Broadcasted new booking notification for hotel ${data.hotel_id}`);
  }

  /**
   * Broadcast provider status update to admin dashboard
   */
  public broadcastProviderStatusUpdate(data: {
    provider_type: 'guide' | 'driver';
    provider_id: string;
    provider_name: string;
    telegram_user_id: string;
    telegram_username?: string;
    old_status: string;
    new_status: string;
    timestamp: Date;
  }): void {
    if (!this.io) {
      logger.warn('WebSocket service not initialized. Cannot broadcast status update.');
      return;
    }

    const event = 'provider:status:update';

    this.io.to(this.adminRoom).emit(event, {
      ...data,
      timestamp: data.timestamp.toISOString(),
    });

    logger.info(`Broadcasted provider status update to admin dashboard`, {
      provider_type: data.provider_type,
      provider_id: data.provider_id,
      new_status: data.new_status,
    });
  }

  /**
   * Broadcast booking availability update
   */
  public broadcastBookingAvailabilityUpdate(data: {
    provider_type: 'guide' | 'driver';
    provider_id: string;
    available: boolean;
    timestamp: Date;
  }): void {
    if (!this.io) {
      logger.warn('WebSocket service not initialized. Cannot broadcast availability update.');
      return;
    }

    const event = 'booking:availability:update';

    this.io.to(this.adminRoom).emit(event, {
      ...data,
      timestamp: data.timestamp.toISOString(),
    });

    logger.info(`Broadcasted booking availability update`, {
      provider_type: data.provider_type,
      provider_id: data.provider_id,
      available: data.available,
    });
  }

  /**
   * Send notification to specific user
   */
  public sendToUser(userId: string, event: string, data: any): void {
    if (!this.io) {
      logger.warn('WebSocket service not initialized. Cannot send to user.');
      return;
    }

    this.io.to(`user:${userId}`).emit(event, data);
    logger.info(`Sent event ${event} to user ${userId}`);
  }

  /**
   * Send notification to specific hotel
   */
  public sendToHotel(hotelId: string, event: string, data: any): void {
    if (!this.io) {
      logger.warn('WebSocket service not initialized. Cannot send to hotel.');
      return;
    }

    this.io.to(`hotel:${hotelId}`).emit(event, data);
    logger.info(`Sent event ${event} to hotel ${hotelId}`);
  }

  /**
   * Broadcast to all connected clients
   */
  public broadcast(event: string, data: any): void {
    if (!this.io) {
      logger.warn('WebSocket service not initialized. Cannot broadcast.');
      return;
    }

    this.io.emit(event, data);
    logger.info(`Broadcasted event ${event} to all clients`);
  }

  /**
   * Get Socket.io instance
   */
  public getIO(): Server | null {
    return this.io;
  }

  /**
   * Check if WebSocket service is initialized
   */
  public isInitialized(): boolean {
    return this.io !== null;
  }
}

// Export singleton instance
export default new WebSocketService();
