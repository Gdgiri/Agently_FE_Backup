
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
    soundEnabled: boolean;
}

const initialState: SettingsState = {
    soundEnabled: localStorage.getItem('soundEnabled') !== 'false' // Default to true if not explicitly disabled
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        toggleSound: (state) => {
            state.soundEnabled = !state.soundEnabled;
            localStorage.setItem('soundEnabled', state.soundEnabled.toString());
        },
        setSoundEnabled: (state, action: PayloadAction<boolean>) => {
            state.soundEnabled = action.payload;
            localStorage.setItem('soundEnabled', state.soundEnabled.toString());
        }
    }
});

export const { toggleSound, setSoundEnabled } = settingsSlice.actions;
export default settingsSlice.reducer;
