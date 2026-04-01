
import React from 'react';
import { Card, SectionHeader, Badge } from '../components/shared';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, MessageCircle, CheckCircle, AlertCircle, DollarSign, Instagram } from 'lucide-react';

const lineData = [
    { name: 'Nov 1', sent: 400, received: 240 },
    { name: 'Nov 5', sent: 300, received: 139 },
    { name: 'Nov 10', sent: 200, received: 980 },
    { name: 'Nov 15', sent: 278, received: 390 },
    { name: 'Nov 20', sent: 189, received: 480 },
    { name: 'Nov 25', sent: 239, received: 380 },
];

const pieData = [
    { name: 'Marketing', value: 400 },
    { name: 'Utility', value: 300 },
    { name: 'Service', value: 300 },
];

const COLORS = ['#25D366', '#E4405F', '#3b82f6', '#f59e0b'];

const KPI: React.FC<{ label: string; value: string; trend?: string; icon: React.ReactNode; color?: string }> = ({ label, value, trend, icon, color = "#25D366" }) => (
    <Card className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between text-gray-400">
            <div className="p-2 bg-gray-50 rounded-lg" style={{ color }}>{icon}</div>
            {trend && <span className="text-xs font-medium text-green-600 flex items-center gap-1"><TrendingUp size={12} /> {trend}</span>}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
    </Card>
);

const Dashboard: React.FC = () => {
    return (
        <div className="p-6 space-y-6">
            <SectionHeader title="Omnichannel Dashboard" subtitle="Real-time performance metrics for WhatsApp and Instagram" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPI label="Total Messages" value="12,842" trend="+12%" icon={<MessageCircle size={20} />} />
                <KPI label="WhatsApp Volume" value="8,432" icon={<MessageCircle size={20} />} color="#25D366" />
                <KPI label="Instagram Volume" value="4,410" icon={<Instagram size={20} />} color="#E4405F" />
                <KPI label="Success Rate" value="98.2%" icon={<CheckCircle size={20} />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6">
                    <h4 className="font-semibold mb-6">Messages Activity (WhatsApp vs Instagram)</h4>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} />
                                <YAxis fontSize={12} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="sent" name="WhatsApp" stroke="#25D366" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="received" name="Instagram" stroke="#E4405F" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-6">
                    <h4 className="font-semibold mb-6">Channel Distribution</h4>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'WhatsApp', value: 8432 },
                                        { name: 'Instagram', value: 4410 }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill="#25D366" />
                                    <Cell fill="#E4405F" />
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center text-[#25D366]">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <h4 className="font-semibold">WhatsApp Connection</h4>
                                <p className="text-sm text-gray-500">API Status: Healthy</p>
                            </div>
                        </div>
                        <Badge variant="success">Online</Badge>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                                <Instagram size={24} />
                            </div>
                            <div>
                                <h4 className="font-semibold">Instagram Connection</h4>
                                <p className="text-sm text-gray-500">Webhook Status: Healthy</p>
                            </div>
                        </div>
                        <Badge variant="success">Online</Badge>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
