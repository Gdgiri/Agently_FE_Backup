
import React, { useEffect, useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={cn("bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden", className)}>
        {children}
    </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger',
    size?: 'sm' | 'md' | 'lg'
}> = ({ variant = 'primary', size = 'md', className, ...props }) => {
    const variants = {
        primary: "bg-[#25D366] text-white hover:bg-[#1ebe5d] shadow-md shadow-green-100",
        secondary: "bg-gray-900 text-white hover:bg-gray-800 shadow-md shadow-gray-100",
        outline: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
        ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
        danger: "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-100",
    };
    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
    };
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {props.children}
        </button>
    );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; description?: string }> = ({ label, error, description, className, ...props }) => (
    <div className="space-y-1.5 flex flex-col items-start w-full">
        {label && <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{label}</label>}
        <input
            className={cn(
                "w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100",
                error && "border-red-500 focus:ring-red-100 focus:border-red-500",
                className
            )}
            {...props}
        />
        {description && <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight pl-1">{description}</p>}
        {error && <span className="text-[10px] text-red-500 font-bold">{error}</span>}
    </div>
);

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral'; className?: string }> = ({ children, variant = 'neutral', className }) => {
    const styles = {
        success: "bg-green-50 text-green-600 border-green-100 shadow-sm shadow-green-50",
        warning: "bg-yellow-50 text-yellow-600 border-yellow-100 shadow-sm shadow-yellow-50",
        error: "bg-red-50 text-red-600 border-red-100 shadow-sm shadow-red-50",
        info: "bg-blue-50 text-blue-600 border-blue-100 shadow-sm shadow-blue-50",
        neutral: "bg-gray-50 text-gray-600 border-gray-100 shadow-sm shadow-gray-50",
    };
    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border", styles[variant], className)}>
            {children}
        </span>
    );
};

export const SectionHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">{subtitle}</p>}
        </div>
        {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
);
export const Table: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <table className={cn("w-full border-collapse", className)}>
        {children}
    </table>
);

export const TableHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <thead className={cn("bg-gray-50", className)}>
        {children}
    </thead>
);

export const TableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <tbody className={className}>
        {children}
    </tbody>
);

export const TableRow: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className, onClick }) => (
    <tr className={cn("border-b border-gray-100", className, onClick && "cursor-pointer")} onClick={onClick}>
        {children}
    </tr>
);

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <td className={cn("px-4 py-3 text-sm", className)}>
        {children}
    </td>
);

export const PremiumLoading: React.FC<{
    status?: string;
    description?: string;
    progress?: number;
    show?: boolean;
}> = ({
    status = "Analyzing Data",
    description = "Optimizing your experience and syncing with WhatsApp Business API...",
    progress: manualProgress,
    show = true
}) => {
        const [internalProgress, setInternalProgress] = useState(0);

        useEffect(() => {
            if (manualProgress !== undefined) {
                setInternalProgress(manualProgress);
                return;
            }

            const interval = setInterval(() => {
                setInternalProgress(prev => {
                    if (prev >= 98) return prev;
                    const step = Math.random() * 15;
                    return Math.min(prev + step, 98);
                });
            }, 400);

            return () => clearInterval(interval);
        }, [manualProgress]);

        return (
            <AnimatePresence>
                {show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-50/80 backdrop-blur-md"
                    >
                        <div className="w-full max-w-md p-12 text-center space-y-8">
                            {/* Brand Animation */}
                            <div className="relative mx-auto w-24 h-24">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="w-full h-full bg-gradient-to-tr from-[#25D366] to-[#1ebe5d] rounded-[2rem] shadow-2xl shadow-green-200 flex items-center justify-center relative z-10"
                                >
                                    <span className="text-4xl font-black text-white italic">A</span>
                                </motion.div>
                                <motion.div
                                    animate={{
                                        scale: [1, 1.3, 1],
                                        opacity: [0.2, 0, 0.2],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                    className="absolute inset-0 bg-[#25D366] rounded-[2rem] blur-2xl"
                                />
                            </div>

                            <div className="space-y-3">
                                <motion.h3
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="text-2xl font-black text-gray-900 tracking-tight"
                                >
                                    {status}
                                    <motion.span
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >...</motion.span>
                                </motion.h3>
                                <motion.p
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-loose"
                                >
                                    {description}
                                </motion.p>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative pt-4">
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-[#25D366] to-[#1ebe5d]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${internalProgress}%` }}
                                        transition={{ stiffness: 20 }}
                                    />
                                </div>
                                <div className="flex justify-between mt-3">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Syncing</span>
                                    <span className="text-[10px] font-black text-[#25D366]">{Math.floor(internalProgress)}%</span>
                                </div>
                            </div>

                            <motion.div
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="flex items-center justify-center gap-2 pt-4"
                            >
                                <div className="w-1.5 h-1.5 bg-[#25D366] rounded-full" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">End-to-End Encryption Active</span>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    };
