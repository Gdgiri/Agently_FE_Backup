
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Job {
    id: string; // jobId returned by backend
    type: 'map_search' | 'enrich' | 'rag_ingest';
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    message?: string;
    createdAt: string;
    updatedAt: string;
    logs: string[];
    params?: any;
    results?: any[]; // Persistent storage for discovered leads
}

interface JobState {
    jobs: Job[];
}

const initialState: JobState = {
    jobs: [],
};

const jobSlice = createSlice({
    name: 'jobs',
    initialState,
    reducers: {
        // Add a new job from a backend jobId
        addJob: (state, action: PayloadAction<Job>) => {
            state.jobs.unshift(action.payload);
        },
        // Update a specific job (e.g., mark as completed)
        updateJob: (state, action: PayloadAction<Partial<Job> & { id: string }>) => {
            const index = state.jobs.findIndex(j => j.id === action.payload.id);
            if (index !== -1) {
                state.jobs[index] = { ...state.jobs[index], ...action.payload, updatedAt: new Date().toISOString() };
            }
        },
        removeJob: (state, action: PayloadAction<string>) => {
            state.jobs = state.jobs.filter(j => j.id !== action.payload);
        },
        clearCompletedJobs: (state) => {
            state.jobs = state.jobs.filter(j => j.status !== 'completed');
        },
        completeJobsByType: (state, action: PayloadAction<Job['type']>) => {
            let changed = false;
            state.jobs.forEach(job => {
                if (job.type === action.payload && (job.status === 'running' || job.status === 'pending')) {
                    job.status = 'completed';
                    job.progress = 100;
                    job.updatedAt = new Date().toISOString();
                    job.logs.push(`System: Background job successfully completed.`);
                    changed = true;
                }
            });
        },
        // Store results for a specific job
        setJobResults: (state, action: PayloadAction<{ id: string, results: any[] }>) => {
            const index = state.jobs.findIndex(j => j.id === action.payload.id);
            if (index !== -1) {
                state.jobs[index].results = action.payload.results;
            }
        },
        // Remove a specific result from a job
        removeJobResult: (state, action: PayloadAction<{ jobId: string, resultId: string }>) => {
            const index = state.jobs.findIndex(j => j.id === action.payload.jobId);
            if (index !== -1 && state.jobs[index].results) {
                state.jobs[index].results = state.jobs[index].results!.filter(r => r.id !== action.payload.resultId);
            }
        }
    },
});

export const { 
    addJob, 
    updateJob, 
    removeJob, 
    clearCompletedJobs, 
    completeJobsByType,
    setJobResults,
    removeJobResult
} = jobSlice.actions;
export default jobSlice.reducer;
