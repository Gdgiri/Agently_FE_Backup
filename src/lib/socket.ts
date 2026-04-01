
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

class SocketClient {
    private static instance: SocketClient;
    public socket: Socket | null = null;

    private constructor() { }

    public static getInstance(): SocketClient {
        if (!SocketClient.instance) {
            SocketClient.instance = new SocketClient();
        }
        return SocketClient.instance;
    }

    public connect(tenantId: string) {
        if (this.socket?.connected) {
            console.log(`[Socket] Already connected. Ensuring room join for: ${tenantId}`);
            this.socket.emit('join', tenantId);
            return this.socket;
        }

        console.log(`[Socket] Connecting to ${SOCKET_URL}...`);
        this.socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'], // Fallback if WS fails
        });

        this.socket.on('connect', () => {
            console.log('[Socket] ✅ Connected to server');
            this.socket?.emit('join', tenantId);
        });

        this.socket.on('joined', (data: any) => {
            console.log(`[Socket] 🏠 Joined room: ${data.room}`);
        });

        this.socket.on('connect_error', (error) => {
            console.error('[Socket] ❌ Connection error:', error.message);
        });

        this.socket.on('disconnect', () => {
            console.log('[Socket] 🔌 Disconnected');
        });

        return this.socket;
    }

    public disconnect() {
        this.socket?.disconnect();
        this.socket = null;
    }
}

export const socketClient = SocketClient.getInstance();
