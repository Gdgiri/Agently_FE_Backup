import React, { useState, useEffect } from 'react';
import { Card, Input, Button } from '../../components/shared';
import { Database, Plus, RefreshCw, Trash2, Link as LinkIcon, Info, Loader2, XCircle, Globe } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { ingestRAG, queryRAG, clearTestQuery, fetchSources, fetchRAGStats, deleteSource } from '../../features/ragSlice';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const RAGIngestion: React.FC = () => {
    const dispatch = useAppDispatch();
    const { sources, stats, loading, testQueryResult, testQuerySources, testQueryLoading, testQueryError } = useAppSelector(state => state.rag);
    const [url, setUrl] = useState('');
    const [queryText, setQueryText] = useState('');

    // Fetch on mount
    useEffect(() => {
        dispatch(fetchSources());
        dispatch(fetchRAGStats());
    }, [dispatch]);

    // Simple 10s polling for source status
    useEffect(() => {
        const interval = setInterval(() => {
            dispatch(fetchSources());
            dispatch(fetchRAGStats());
        }, 10000);
        return () => clearInterval(interval);
    }, [dispatch]);

    const handleIngest = async () => {
        if (!url) {
            toast.error('Please enter a URL');
            return;
        }
        dispatch(ingestRAG({ url }));
        setUrl('');
    };

    const handleQuery = () => {
        if (!queryText.trim()) return;
        dispatch(clearTestQuery());
        dispatch(queryRAG({ question: queryText.trim() }));
    };

    const handleDelete = (id: string, url: string) => {
        if (window.confirm(`Are you sure you want to remove this knowledge source?\n\nURL: ${url}\n\nThis will remove this context from your AI's brain.`)) {
            dispatch(deleteSource(id));
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Ingestion Form */}
                <div className="lg:col-span-1">
                    <Card className="p-8 space-y-6 shadow-2xl bg-white h-full">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Database size={24} /></div>
                            <h4 className="text-lg font-black text-gray-900">Knowledge Ingestion</h4>
                        </div>
                        
                        <p className="text-sm font-medium text-gray-500 leading-relaxed">
                            Add website URLs to the AI knowledge base. Our crawler will index the content into vector chunks for better RAG performance.
                        </p>

                        <div className="space-y-4">
                            <Input 
                                label="Domain / URL" 
                                placeholder="https://example.com" 
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                            <Button 
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl"
                                onClick={handleIngest}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} 
                                {loading ? 'Ingesting...' : 'Ingest to AI Knowledge'}
                            </Button>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <Info size={14} className="text-indigo-600" /> System Stats
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Total Chunks</p>
                                    <p className="text-lg font-black text-gray-900">
                                        {stats?.totalChunksInDatabase ? (stats.totalChunksInDatabase / 1000).toFixed(1) + 'k' : '0'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Latency</p>
                                    <p className="text-lg font-black text-gray-900">
                                        {stats?.averageQueryLatencyMs || '120'}ms
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Sources Table */}
                <div className="lg:col-span-2">
                    <Card className="overflow-hidden shadow-2xl bg-white h-full min-h-[400px]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Active Knowledge Sources</h4>
                                <div className="flex items-center gap-2 px-2 py-0.5 bg-gray-50 rounded-full border border-gray-100">
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    <span className="text-[9px] font-black text-gray-400 uppercase">Live Indexing</span>
                                </div>
                            </div>
                            <Button 
                                variant="ghost" 
                                className="text-xs py-1 h-auto font-black uppercase text-gray-400 hover:text-indigo-600"
                                onClick={() => dispatch(fetchSources())}
                            >
                                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> 
                                Refresh
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px]">Source URL</th>
                                        <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px]">Status</th>
                                        <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px]">Chunks</th>
                                        <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {sources.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-bold italic">
                                                No knowledge sources yet. Add a URL to start!
                                            </td>
                                        </tr>
                                    ) : sources.map(source => (
                                        <tr key={source.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <LinkIcon size={14} className="text-gray-400" />
                                                    <span className="font-bold text-gray-900 truncate max-w-[200px]" title={source.url}>{source.url}</span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 ml-6">
                                                    Added {new Date(source.createdAt).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`h-1.5 w-1.5 rounded-full ${
                                                        source.crawlStatus === 'completed' ? 'bg-green-500' :
                                                        source.crawlStatus === 'processing' || source.crawlStatus === 'queued' ? 'bg-indigo-500 animate-pulse' :
                                                        'bg-red-500'
                                                    }`}></span>
                                                    <span className={`text-[10px] font-black uppercase italic ${
                                                        source.crawlStatus === 'completed' ? 'text-green-600' :
                                                        source.crawlStatus === 'processing' || source.crawlStatus === 'queued' ? 'text-indigo-600' :
                                                        'text-red-600'
                                                    }`}>
                                                        {source.crawlStatus}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono font-black text-gray-500">
                                                {source.totalChunks || 0}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1 translate-x-2">
                                                    <button 
                                                        className="p-2 text-red-100 group-hover:text-red-400 hover:text-red-600 transition-colors"
                                                        onClick={() => handleDelete(source.id, source.url)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Bottom Row: Test Knowledge Full Width */}
            <Card className="p-8 space-y-6 shadow-2xl bg-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#25D366]/10 text-[#25D366] rounded-xl"><Database size={24} /></div>
                    <h4 className="text-lg font-black text-gray-900">Test Knowledge</h4>
                </div>
                
                <p className="text-sm font-medium text-gray-500 leading-relaxed">
                    Manually test what the AI knows based on the ingested documents.
                </p>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <Input 
                            label="Query Knowledge"
                            placeholder="e.g. What are your shipping hours?" 
                            value={queryText}
                            onChange={(e) => setQueryText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleQuery();
                            }}
                        />
                    </div>
                    <Button 
                        className="bg-[#25D366] hover:bg-green-600 text-white shadow-xl px-8"
                        onClick={handleQuery}
                        disabled={testQueryLoading}
                    >
                        {testQueryLoading ? <Loader2 className="animate-spin" size={16} /> : <Database size={16} />} 
                        {testQueryLoading ? 'Querying...' : 'Ask AI'}
                    </Button>
                </div>

                <AnimatePresence>
                    {(testQueryResult || testQueryError) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`p-10 rounded-[2rem] border ${testQueryError ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'} relative overflow-hidden`}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400">
                                    {testQueryError ? 'Error Message' : 'AI Intelligent Response'}
                                </span>
                                <button 
                                    className="p-2 hover:bg-white rounded-full transition-all text-gray-400 hover:text-gray-900 shadow-sm"
                                    onClick={() => dispatch(clearTestQuery())}
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>

                            <div className={`prose prose-sm max-w-none mb-8 ${testQueryError ? 'text-red-600' : 'text-gray-800'}`}>
                                {testQueryError ? (
                                    <p className="font-bold">{testQueryError}</p>
                                ) : (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {testQueryResult || ''}
                                    </ReactMarkdown>
                                )}
                            </div>

                            {testQuerySources && testQuerySources.length > 0 && (
                                <div className="pt-8 border-t border-gray-200 mt-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <LinkIcon size={14} className="text-indigo-600" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Retrieved Knowledge Fragments</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-medium leading-relaxed">
                                        {testQuerySources.map((src, i) => (
                                            <div key={i} className="text-[10px] p-4 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                                <div className="flex items-center gap-2 text-indigo-600 font-bold mb-3 truncate group-hover:text-indigo-800 transition-colors">
                                                    <Globe size={12} /> {src.sourceUrl}
                                                </div>
                                                <p className="text-gray-500 line-clamp-3 italic italic font-medium">
                                                    "{src.chunkText}"
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </div>
    );
};

export default RAGIngestion;
