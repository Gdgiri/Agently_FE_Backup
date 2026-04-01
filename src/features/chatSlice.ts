
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { chatApi } from '../lib/api/chatApi';
import { Conversation, Message } from '../types';

interface ChatState {
    activeConversationId: string | null;
    conversations: Conversation[];
    messages: Record<string, Message[]>; // conversationId -> messages[]
    typingStatus: Record<string, boolean>; // conversationId -> isTyping
    loading: boolean;
    error: string | null;
}

const initialState: ChatState = {
    activeConversationId: null,
    conversations: [],
    messages: {},
    typingStatus: {},
    loading: false,
    error: null,
};

export const fetchConversationsAsync = createAsyncThunk(
    'chat/fetchConversations',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await chatApi.getConversations();
            return data.data; // Assuming backend wraps in { success, data }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch conversations');
        }
    }
);

export const fetchMessagesAsync = createAsyncThunk(
    'chat/fetchMessages',
    async (conversationId: string, { rejectWithValue }) => {
        try {
            const { data } = await chatApi.getMessages(conversationId);
            return { conversationId, messages: data.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch messages');
        }
    }
);

export const sendMessageAsync = createAsyncThunk(
    'chat/sendMessage',
    async (payload: { conversationId: string; content: string; type?: string }, { rejectWithValue }) => {
        try {
            const { data } = await chatApi.sendMessage(payload);
            return data.data; // The sent message object
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to send message');
        }
    }
);

export const markAsReadAsync = createAsyncThunk(
    'chat/markAsRead',
    async (conversationId: string, { rejectWithValue }) => {
        try {
            await chatApi.markAsRead(conversationId);
            return conversationId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to mark as read');
        }
    }
);

import { contactApi } from '../lib/api/contactApi';

export const updateContactAsync = createAsyncThunk(
    'chat/updateContact',
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await contactApi.update(id, data);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update contact');
        }
    }
);

export const addTagAsync = createAsyncThunk(
    'chat/addTag',
    async ({ contactId, tagId, tagName }: { contactId: string; tagId: string; tagName: string }, { rejectWithValue }) => {
        try {
            await contactApi.addTag(contactId, tagId);
            return { contactId, tagName };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to add tag');
        }
    }
);

export const removeTagAsync = createAsyncThunk(
    'chat/removeTag',
    async ({ contactId, tagId, tagName }: { contactId: string; tagId: string; tagName: string }, { rejectWithValue }) => {
        try {
            await contactApi.removeTag(contactId, tagId);
            return { contactId, tagName };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to remove tag');
        }
    }
);

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setActiveConversation: (state, action: PayloadAction<string | null>) => {
            state.activeConversationId = action.payload;
        },
        addMessage: (state, action: PayloadAction<Message>) => {
            const { conversationId, direction } = action.payload;

            // Avoid duplicates
            const existing = state.messages[conversationId]?.find(m => m.id === action.payload.id);
            if (existing) return;

            if (!state.messages[conversationId]) {
                state.messages[conversationId] = [];
            }
            state.messages[conversationId].push(action.payload);

            // Update conversation list
            const conv = state.conversations.find(c => c.id === conversationId);
            if (conv) {
                conv.lastMessage = action.payload;
                conv.updatedAt = action.payload.timestamp;

                // Increment unread count if inbound and not active
                if (direction === 'inbound' && state.activeConversationId !== conversationId) {
                    conv.unreadCount = (conv.unreadCount || 0) + 1;
                }
            }
        },
        setTypingStatus: (state, action: PayloadAction<{ conversationId: string; isTyping: boolean }>) => {
            state.typingStatus[action.payload.conversationId] = action.payload.isTyping;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchConversationsAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchConversationsAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.conversations = action.payload || [];
            })
            .addCase(fetchConversationsAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchMessagesAsync.fulfilled, (state, action) => {
                const { conversationId, messages } = action.payload;
                state.messages[conversationId] = messages;
            })
            .addCase(sendMessageAsync.fulfilled, (state, action) => {
                const message = action.payload;
                const { conversationId } = message;
                if (!state.messages[conversationId]) {
                    state.messages[conversationId] = [];
                }
                state.messages[conversationId].push(message);

                const conv = state.conversations.find(c => c.id === conversationId);
                if (conv) {
                    conv.lastMessage = message;
                    conv.updatedAt = message.timestamp;
                }
            })
            .addCase(markAsReadAsync.fulfilled, (state, action) => {
                const conversationId = action.payload;
                const conv = state.conversations.find(c => c.id === conversationId);
                if (conv) {
                    conv.unreadCount = 0;
                }
            })
            .addCase(updateContactAsync.fulfilled, (state, action) => {
                const updatedContact = action.payload;
                state.conversations.forEach(conv => {
                    if (conv.contact.id === updatedContact.id) {
                        conv.contact = { ...conv.contact, ...updatedContact };
                    }
                });
            })
            .addCase(addTagAsync.fulfilled, (state, action) => {
                const { contactId, tagName } = action.payload;
                state.conversations.forEach(conv => {
                    if (conv.contact.id === contactId) {
                        if (!conv.tags.includes(tagName)) {
                            conv.tags.push(tagName);
                        }
                    }
                });
            })
            .addCase(removeTagAsync.fulfilled, (state, action) => {
                const { contactId, tagName } = action.payload;
                state.conversations.forEach(conv => {
                    if (conv.contact.id === contactId) {
                        conv.tags = conv.tags.filter(t => t !== tagName);
                    }
                });
            });
    },
});

export const { setActiveConversation, addMessage, setTypingStatus } = chatSlice.actions;
export default chatSlice.reducer;
