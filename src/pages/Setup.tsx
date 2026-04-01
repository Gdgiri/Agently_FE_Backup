
import React, { useState } from 'react';
import { SectionHeader, Card, Input, Button, Badge } from '../components/shared';
import {
    CheckCircle2,
    RefreshCcw,
    CreditCard,
    ArrowRight,
    History,
    TrendingDown,
    ChevronRight,
    Zap,
    ShieldCheck,
    X
} from 'lucide-react';
import { MOCK_CREDIT_PACKAGES, MOCK_CREDIT_CONSUMPTION } from '../constants';

const Setup: React.FC = () => {
    const [isValidating, setIsValidating] = useState(false);
    const [showBuyCredits, setShowBuyCredits] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <SectionHeader
                title="WhatsApp Setup"
                subtitle="Manage your Meta Business credentials and messaging credits"
            />

            {/* Credit Balance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-l-4 border-l-[#25D366] relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 text-[#25D366]/5 group-hover:scale-110 transition-transform duration-500">
                        <CreditCard size={120} />
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <CreditCard size={14} className="text-[#25D366]" /> Available Credits
                        </h4>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-4xl font-black text-gray-900">4,281</span>
                            <span className="text-xs font-bold text-[#25D366] bg-green-50 px-2 py-0.5 rounded-full border border-green-100">Healthy</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-4 flex items-center gap-1.5">
                            Approx. <b className="text-gray-900">1,400</b> Marketing msgs left
                        </p>
                        <Button onClick={() => setShowBuyCredits(true)} className="w-full mt-6 shadow-lg shadow-green-100">
                            <Zap size={16} /> Recharge Credits
                        </Button>
                    </div>
                </Card>

                <Card className="p-6">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <TrendingDown size={14} className="text-blue-500" /> Avg. Daily Consumption
                    </h4>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-4xl font-black text-gray-900">142</span>
                        <span className="text-xs text-gray-500">credits/day</span>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between text-xs">
                        <span className="text-gray-400">Projected Run Rate:</span>
                        <span className="font-bold text-gray-900">30 days</span>
                    </div>
                </Card>

                <Card className="p-6">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <ShieldCheck size={14} className="text-purple-500" /> Billing Status
                    </h4>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-2xl font-black text-gray-900">PRO PLAN</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Next renewal: <b className="text-gray-900">Dec 12, 2023</b></p>
                    <button className="text-[10px] font-bold text-[#25D366] uppercase mt-10 hover:underline flex items-center gap-1">
                        Manage Subscription <ChevronRight size={12} />
                    </button>
                </Card>
            </div>

            {/* Consumption Details */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <History size={18} className="text-gray-400" /> Credit Consumption Logs
                    </h4>
                    <button className="text-xs font-bold text-[#25D366] hover:underline uppercase tracking-tight">Export Statement</button>
                </div>
                <Card className="overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-bold text-gray-400 uppercase text-[10px]">Date</th>
                                <th className="px-6 py-4 font-bold text-gray-400 uppercase text-[10px]">Description</th>
                                <th className="px-6 py-4 font-bold text-gray-400 uppercase text-[10px]">Category</th>
                                <th className="px-6 py-4 font-bold text-gray-400 uppercase text-[10px] text-right">Debit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {MOCK_CREDIT_CONSUMPTION.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-xs text-gray-500">{log.date}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{log.description}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${log.type === 'Marketing' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                                log.type === 'Utility' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                    log.type === 'Service' ? 'bg-green-50 text-green-600 border border-green-100' :
                                                        'bg-gray-50 text-gray-400 border border-gray-100'
                                            }`}>
                                            {log.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-bold text-red-500">
                                        {log.amount > 0 ? `-$${log.amount.toFixed(2)}` : '--'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
                        <button className="text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1">Load Older Records <ChevronRight size={14} className="rotate-90" /></button>
                    </div>
                </Card>
            </section>

            {/* Existing Business Connection Details */}
            <section className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-900">API & Meta Integration</h4>
                <Card className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Phone Number ID" placeholder="1029384756" />
                        <Input label="Business Account ID" placeholder="9876543210" />
                        <Input label="Access Token" masked value="EAAGm..." />
                        <Input label="Webhook Verify Token" placeholder="Generate custom token" />
                        <div className="md:col-span-2">
                            <Input label="Callback URL (Read-only)" readOnly value="https://api.agently.com/v1/whatsapp/webhook" />
                        </div>
                    </div>
                    <div className="mt-8 flex gap-4">
                        <Button variant="secondary" onClick={() => { }} className="w-full md:w-auto">
                            <RefreshCcw size={16} /> Reset Credentials
                        </Button>
                        <Button
                            className="w-full md:w-auto"
                            onClick={() => {
                                setIsValidating(true);
                                setTimeout(() => setIsValidating(false), 2000);
                            }}
                            disabled={isValidating}
                        >
                            {isValidating ? 'Validating...' : 'Save & Validate Connection'}
                        </Button>
                    </div>
                </Card>
            </section>

            {/* Modals */}
            {showBuyCredits && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowBuyCredits(false)} />
                    <Card className="relative w-full max-w-2xl p-0 overflow-hidden animate-in zoom-in duration-300 shadow-2xl">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Purchase Messaging Credits</h3>
                                <p className="text-xs text-gray-500">Credits never expire and apply to all conversation categories.</p>
                            </div>
                            <button onClick={() => setShowBuyCredits(false)} className="p-2 hover:bg-white rounded-full text-gray-400"><X size={20} /></button>
                        </div>

                        <div className="p-8 bg-white space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {MOCK_CREDIT_PACKAGES.map(pkg => (
                                    <button
                                        key={pkg.id}
                                        onClick={() => setSelectedPackage(pkg.id)}
                                        className={`relative p-6 border-2 rounded-2xl text-center transition-all duration-300 ${selectedPackage === pkg.id
                                                ? 'border-[#25D366] bg-green-50 shadow-lg scale-105'
                                                : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                                            }`}
                                    >
                                        {pkg.popular && (
                                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#25D366] text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md uppercase tracking-wider">Most Popular</span>
                                        )}
                                        <h5 className="font-bold text-gray-900 text-sm mb-1">{pkg.name}</h5>
                                        <div className="text-2xl font-black text-gray-900">{pkg.credits.toLocaleString()}</div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">Credits</p>
                                        <div className="mt-6 text-xl font-bold text-[#25D366]">
                                            ${pkg.price}
                                        </div>
                                        {selectedPackage === pkg.id && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg"><CheckCircle2 size={16} /></div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                                <ShieldCheck size={18} className="text-blue-500 mt-0.5" />
                                <p className="text-[11px] text-blue-700 leading-relaxed">
                                    Purchases are processed securely. Your credits will be added instantly to your balance after successful payment. Agently uses direct Meta API pricing tiers with a small platform fee.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
                            <div className="text-sm font-bold text-gray-600">
                                {selectedPackage ? (
                                    <span>Total: <b className="text-gray-900 text-lg">${MOCK_CREDIT_PACKAGES.find(p => p.id === selectedPackage)?.price}</b></span>
                                ) : 'Select a package to continue'}
                            </div>
                            <div className="flex gap-3">
                                <Button variant="ghost" onClick={() => setShowBuyCredits(false)}>Cancel</Button>
                                <Button disabled={!selectedPackage} className="px-8 bg-blue-600 hover:bg-blue-700">
                                    Secure Checkout <ArrowRight size={16} />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Setup;
