
export const remoteLog = (msg: string, data?: any) => {
    console.log(`[RemoteLog] ${msg}`, data);
    fetch('/api/v1/debug/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ msg, data, timestamp: new Date().toISOString() })
    }).catch(() => { });
};

export const simulateInbound = async (from?: string, body?: string, channel: 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' = 'WHATSAPP') => {
    const token = localStorage.getItem('token');
    return fetch('/api/v1/debug/simulate-inbound', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ from, body, channel })
    }).then(res => res.json());
};
