import React from 'react';
import { Card, Button } from '../../components/shared';
import { Activity, Clock, Terminal, ChevronRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../../components/ui';
import { useAppDispatch, useAppSelector } from '../../store';
import { clearCompletedJobs } from '../../features/jobSlice';
import { format } from 'date-fns';
import JobDetailsModal from './JobDetailsModal';

const JobsDashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const { jobs } = useAppSelector(state => state.jobs);
    const [selectedJob, setSelectedJob] = React.useState<{ id: string, type: string } | null>(null);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return "bg-blue-50 text-blue-600";
            case 'completed': return "bg-green-50 text-[#25D366]";
            case 'failed': return "bg-red-50 text-red-500";
            default: return "bg-gray-50 text-gray-500";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'running': return <Loader2 className="animate-spin" size={24} />;
            case 'completed': return <CheckCircle2 size={24} />;
            case 'failed': return <AlertCircle size={24} />;
            default: return <Clock size={24} />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-900 text-white rounded-xl"><Activity size={20} /></div>
                    <h4 className="text-xl font-black text-gray-900">Background Activity</h4>
                </div>
                <Button variant="secondary" className="text-xs" onClick={() => dispatch(clearCompletedJobs())}>
                    Clear Completed
                </Button>
            </div>

            <div className="space-y-4">
                {jobs.length === 0 ? (
                    <Card className="p-12 text-center text-gray-400 font-bold italic">
                        No active or recent jobs found.
                    </Card>
                ) : jobs.map(job => (
                    <Card key={job.id} className="p-6 shadow-xl border-none relative overflow-hidden group hover:shadow-2xl transition-all">
                        <div className="flex items-center gap-6">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                getStatusColor(job.status)
                            )}>
                                {getStatusIcon(job.status)}
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h5 className="text-sm font-black text-gray-900 uppercase tracking-tight">{job.type.replace('_', ' ')}</h5>
                                        <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                            <Clock size={10} /> {format(new Date(job.createdAt), 'hh:mm a')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg",
                                            getStatusColor(job.status)
                                        )}>
                                            {job.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-black text-gray-500">
                                        <span className="italic">{job.message}</span>
                                        <span>{job.progress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className={cn(
                                                "h-full transition-all duration-1000",
                                                job.status === 'running' ? "bg-blue-500" : 
                                                job.status === 'completed' ? "bg-[#25D366]" : 
                                                "bg-red-400"
                                            )} 
                                            style={{ width: `${job.progress}%` }} 
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                className={cn(
                                    "p-3 rounded-2xl transition-all shadow-sm border border-gray-50 flex items-center justify-center",
                                    job.status === 'completed' ? "text-[#25D366] bg-green-50 hover:bg-green-100 border-green-100" : "text-gray-300 bg-gray-50"
                                )}
                                onClick={() => job.status === 'completed' && setSelectedJob({ id: job.id, type: job.type })}
                                title="View Results"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            <JobDetailsModal 
                isOpen={!!selectedJob} 
                onClose={() => setSelectedJob(null)} 
                jobId={selectedJob?.id || ''} 
                jobType={selectedJob?.type || ''} 
            />

            <div className="p-8 bg-gray-900 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between text-white/50 border-b border-white/10 pb-4">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em]">Latest System Logs</h5>
                    <ChevronRight size={16} />
                </div>
                <div className="space-y-2 font-mono text-[10px] text-white/70 max-h-40 overflow-y-auto">
                    {jobs.flatMap(j => j.logs).slice(-5).map((log, i) => (
                        <p key={i} className="flex gap-4">
                            <span className="text-white/30">[{new Date().toLocaleTimeString()}]</span> {log}
                        </p>
                    ))}
                    {jobs.length === 0 && <p className="text-white/30 italic">No logs available</p>}
                </div>
            </div>
        </div>
    );
};

export default JobsDashboard;
