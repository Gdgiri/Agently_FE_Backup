import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './features/authSlice';
import tenantReducer from './features/tenantSlice';
import chatReducer from './features/chatSlice';
import contactReducer from './features/contactSlice';
import dashboardReducer from './features/dashboardSlice';
import campaignReducer from './features/campaignSlice';
import templateReducer from './features/templateSlice';
import settingsReducer from './features/settingsSlice';
import leadReducer from './features/leadSlice';
import mapReducer from './features/mapSlice';
import jobReducer from './features/jobSlice';
import ragReducer from './features/ragSlice';

const rootReducer = combineReducers({
    auth: authReducer,
    tenant: tenantReducer,
    chat: chatReducer,
    contacts: contactReducer,
    dashboard: dashboardReducer,
    campaigns: campaignReducer,
    templates: templateReducer,
    settings: settingsReducer,
    leads: leadReducer,
    map: mapReducer,
    jobs: jobReducer,
    rag: ragReducer,
});

const persistConfig = {
    key: 'agently_root',
    version: 1,
    storage,
    whitelist: ['jobs', 'map'], // Only persist these for now
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
