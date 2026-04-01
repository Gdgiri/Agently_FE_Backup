
import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>
        {children}
    </div>
);

export const Badge: React.FC<{ variant: 'success' | 'warning' | 'error' | 'neutral', children: React.ReactNode, className?: string }> = ({ variant, children, className = "" }) => {
    const styles = {
        success: 'bg-green-50 text-green-700 border-green-100',
        warning: 'bg-yellow-50 text-yellow-700 border-yellow-100',
        error: 'bg-red-50 text-red-700 border-red-100',
        neutral: 'bg-gray-50 text-gray-600 border-gray-100',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[variant]} ${className}`}>
            {children}
        </span>
    );
};

export const Button: React.FC<{
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost',
    children: React.ReactNode,
    onClick?: () => void,
    className?: string,
    disabled?: boolean
    type?: "button" | "submit" | "reset"
}> = ({ variant = 'primary', children, onClick, className = "", disabled, type = "button" }) => {
    const base = "px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm flex items-center justify-center gap-2";
    const styles = {
        primary: "bg-[#25D366] text-white hover:bg-[#1ebe5d] disabled:opacity-50",
        secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
        danger: "bg-red-500 text-white hover:bg-red-600",
        ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
    };
    return (
        <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>
            {children}
        </button>
    );
};

export const Input: React.FC<{
    label: string;
    type?: string;
    placeholder?: string;
    value?: any;
    readOnly?: boolean;
    masked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    className?: string;
}> = ({ label, type = 'text', placeholder, value, readOnly, masked, onChange, onKeyDown, className = "" }) => (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <input
            type={masked ? 'password' : type}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            readOnly={readOnly}
            placeholder={placeholder}
            className={`px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#25D366] focus:border-transparent outline-none transition-all ${readOnly ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
        />
    </div>
);

export const SectionHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {action && <div className="flex gap-2">{action}</div>}
    </div>
);
