
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch, RootState, useAppSelector } from '../store';
import { fetchTenantsAsync } from '../features/tenantSlice';
import { fetchContactsAsync, fetchTagsAsync } from '../features/contactSlice';
import { fetchConversationsAsync, addMessage, setTypingStatus } from '../features/chatSlice';
import { fetchDashboardStatsAsync } from '../features/dashboardSlice';

import { socketClient } from '../lib/socket';
import { remoteLog } from '../lib/debug';

// A robust, professional "Notify" sound in base64 split for readability/linting
const NOTIFICATION_SOUND =
    'data:audio/mp3;base64,SUQzBAAAAAABAFRYWFgAAAASAAADbWFqb3JfYnJhbmQAZGFzaABUWFhYAAAAEgAAA21pbm9yX3ZlcnNpb24AMABUWFhYAAAAHAAAA2NvbXBhdGlibGVfYnJhbmRzAGlzbzZtcDQxAFRQRTEAAAAMAABhcnRpc3QAbm9uZQBUWFhYAAAADAAAA2Jhc2VsaW5lAHllcwBUWFhYAAAAEAAAA2VuY29kZV9zZXR0aW5ncwA3AFRYWFgAAAAQAAADZW5jb2RlX3ZlcnNpb24ANABUWFhYAAAADAAAA2FwcGxlX2lkAHllcwBUWFhYAAAACQAAA2ZpeGVkAHllcwBUWFhYAAAACQAAA21heGltdW0AeWVzAFRYWFgAAAAJAAADbWluaW11bQB5ZXMAD/+5BkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYaW5nAAAADwAAABYAACkUAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB' +
    '//uQZAAAC8EV7mAAAA0mYr7KAAABuPId38AAADfAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+5BkAAArtRHzmAAAF5X7LPmAAADqIDv8AAAXtfss+UAAMVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7kmQCAB8w0Z+4AAAbWfsq+ZAAAUYyTdt6AAAA3wAAADGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uSZAgAAAAA0gAAAAAABpAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7kmQCAB7KkZ88AAAFY36LPkAAAXiSOn7mEAAXFfss+QAALAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/';

// Initialize audio object once to avoid latency and gc issues
let notificationAudio: HTMLAudioElement | null = null;
if (typeof window !== 'undefined') {
    notificationAudio = new Audio(NOTIFICATION_SOUND);
    notificationAudio.volume = 0.6;
}

const playNotificationSound = () => {
    if (!notificationAudio) return;
    try {
        console.log('[Sound] 🔔 Attempting to play notification sound...');
        // Reset to start if already playing or finished
        notificationAudio.currentTime = 0;
        notificationAudio.play().catch(e => {
            console.warn('[Sound] ⚠️ Playback blocked by browser policy. Interaction required.', e.message);
        });
    } catch (err) {
        console.warn('[Sound] ❌ Failed to play audio:', err);
    }
};

const AuthBootstrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated, loading: authLoading, user } = useAppSelector((state: RootState) => state.auth);
    const { tenants } = useAppSelector((state: RootState) => state.tenant);
    const { soundEnabled } = useAppSelector((state: RootState) => state.settings);
    const [isReady, setIsReady] = React.useState(false);

    useEffect(() => {
        const bootstrap = async () => {
            if (isAuthenticated) {
                remoteLog('Session active. Initializing ecosystem...');

                try {
                    // 1. Fetch tenants first to establish context/X-Tenant-Id
                    const tenantResult = await dispatch(fetchTenantsAsync()).unwrap();
                    const activeTenantId = user?.tenantId || tenantResult[0]?.id;

                    // 2. Initialize Socket with established tenantId
                    if (activeTenantId) {
                        remoteLog(`Connecting to socket for tenant: ${activeTenantId}`);
                        const socket = socketClient.connect(activeTenantId);

                        socket?.on('message:received', (message: any) => {
                            dispatch(addMessage(message));
                            dispatch(fetchConversationsAsync());
                            const isSoundOn = localStorage.getItem('soundEnabled') !== 'false';
                            if (isSoundOn) playNotificationSound();
                        });

                        socket?.on('typing:status', (data: { conversationId: string, isTyping: boolean }) => {
                            dispatch(setTypingStatus(data));
                        });

                        // Appointment Real-time Updates Bridge
                        const triggerAppointmentRefresh = () => {
                            console.log('[Socket] 📅 Triggering global appointment refresh');
                            window.dispatchEvent(new CustomEvent('refresh-appointments'));
                        };

                        socket?.on('appointment:updated', triggerAppointmentRefresh);
                        socket?.on('appointment:created', triggerAppointmentRefresh);
                        socket?.on('appointment:deleted', triggerAppointmentRefresh);
                        socket?.on('refresh:data', triggerAppointmentRefresh);
                    }

                    // 3. Fetch dependent data in parallel
                    await Promise.all([
                        dispatch(fetchContactsAsync()),
                        dispatch(fetchTagsAsync()),
                        dispatch(fetchConversationsAsync()),
                        dispatch(fetchDashboardStatsAsync())
                    ]);
                    console.log('[AuthBootstrap] Ecosystem ready.');
                } catch (err) {
                    console.error('[AuthBootstrap] Bootstrapping failed:', err);
                } finally {
                    setIsReady(true);
                }
            } else {
                socketClient.disconnect();
                setIsReady(true);
            }
        };

        bootstrap();

        // 30-second fallback polling
        const fallbackInterval = setInterval(() => {
            if (isAuthenticated) {
                dispatch(fetchConversationsAsync());
            }
        }, 30000);

        return () => {
            socketClient.socket?.off('message:received');
            socketClient.socket?.off('typing:status');
            socketClient.socket?.off('appointment:updated');
            socketClient.socket?.off('appointment:created');
            socketClient.socket?.off('appointment:deleted');
            socketClient.socket?.off('refresh:data');
            clearInterval(fallbackInterval);
        };
    }, [isAuthenticated, dispatch, user?.tenantId, tenants[0]?.id]);

    if (!isReady || authLoading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
                <div className="w-12 h-12 bg-[#25D366] rounded-xl flex items-center justify-center text-white font-black italic animate-bounce shadow-2xl">A</div>
                <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Synchronizing Environment...</p>
            </div>
        );
    }

    return <>{children}</>;
};

export default AuthBootstrap;
