import apiClient from '../apiClient';

export interface WebhookTokenResponse {
    success: boolean;
    token: string;
    webhookUrl: string;
    instructions: string;
}

export const webhookTokenApi = {
    /** GET /settings/webhook-token — get or auto-create token */
    getToken: () =>
        apiClient.get<WebhookTokenResponse>('/settings/webhook-token'),

    /** POST /settings/webhook-token/regenerate — invalidate old, issue new */
    regenerate: () =>
        apiClient.post<WebhookTokenResponse>('/settings/webhook-token/regenerate', {}),
};
