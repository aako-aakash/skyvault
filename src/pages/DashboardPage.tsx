import React from 'react';
import { Card } from '@/components/common';
import type { ApplicationRecord, AppStatus } from '@/types';

const MOCK_APPS: ApplicationRecord[] = [
  { id: 'SVL-A1B2C3', name: 'Rajesh Kumar',  type: 'Personal Loan',  amount: '₹5,00,000',  status: 'approved', date: '10 Jun 2025', score: 742 },
  { id: 'SVL-D4E5F6', name: 'Priya Sharma',  type: 'Home Loan',      amount: '₹45,00,000', status: 'review',   date: '09 Jun 2025', score: 698 },
  { id: 'SVL-G7H8I9', name: 'Amit Patel',    type: 'Business Loan',  amount: '₹12,00,000', status: 'pending',  date: '08 Jun 2025', score: 615 },
  { id: 'SVL-J0K1L2', name: 'Sunita Verma',  type: 'Personal Loan',  amount: '₹3,50,000',  status: 'approved', date: '07 Jun 2025', score: 768 },
  { id: 'SVL-M3N4O5', name: 'Vikram Singh',  type: 'Home Loan',      amount: '₹62,00,000', status: 'rejected', date: '06 Jun 2025', score: 541 },
  { id: 'SVL-P6Q7R8', name: 'Meera Nair',    type: 'Business Loan',  amount: '₹8,00,000',  status: 'pending',  date: '05 Jun 2025', score: 631 },
  { id: 'SVL-Q9R0S1', name: 'Arun Sharma',   type: 'Personal Loan',  amount: '₹7,00,000',  status: 'approved', date: '04 Jun 2025', score: 755 },
  { id: 'SVL-T2U3V4', name: 'Kavita Reddy',  type: 'Home Loan',      amount: '₹38,00,000', status: 'review',   date: '03 Jun 2025', score: 703 },
];

const STATUS_CONFIG: Record<AppStatus, { label: string; cls: string }> = {
  approved: { label: 'Approved',      cls: 'bg-success-light text-green-800 border border-success-border' },
  review:   { label: 'Under Review',  cls: 'bg-[#EEF2FF] text-[#3730A3] border border-[#C7D2FE]' },
  pending:  { label: 'Pending',       cls: 'bg-warning-light text-yellow-800 border border-warning-border' },
  rejected: { label: 'Rejected',      cls: 'bg-danger-light text-red-800 border border-danger-border' },
};

const STATS = [
  { label: 'Total Applications', value: '247', change: '+12 this week',   up: true  },
  { label: 'Approved',           value: '189', change: '76.5% rate',      up: true  },
  { label: 'Under Review',       value: '38',  change: 'Avg 2.3 days',   up: false },
  { label: 'Disbursed',          value: '₹94.2 Cr', change: 'This month', up: true },
];

const DashboardPage: React.FC = () => (
  <div className="animate-fade-in">
    <div className="mb-5">
      <h1 className="font-heading font-bold text-xl text-gray-800">Applications Dashboard</h1>
      <p className="text-sm text-gray-500 mt-1">Live pipeline of all loan applications</p>
    </div>

    {/* KPI Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {STATS.map(({ label, value, change, up }) => (
        <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-card">
          <p className="text-[11px] text-gray-500 mb-1">{label}</p>
          <p className="font-heading font-bold text-[20px] text-gray-800 mb-1">{value}</p>
          <p className={`text-[11px] font-medium ${up ? 'text-success' : 'text-gray-500'}`}>{change}</p>
        </div>
      ))}
    </div>

    {/* Applications Table */}
    <Card title="Recent Applications" subtitle="All active and historical loan applications" icon="📋">
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-[13px]" aria-label="Loan applications">
          <thead>
            <tr>
              {['Ref ID', 'Applicant', 'Loan Type', 'Amount', 'Score', 'Date', 'Status'].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="text-left py-2.5 px-3.5 bg-gray-50 text-[11px] font-semibold text-gray-600 uppercase tracking-wide border-b border-gray-200 first:rounded-tl-lg last:rounded-tr-lg"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_APPS.map((app) => {
              const { label, cls } = STATUS_CONFIG[app.status];
              const scoreColor =
                app.score >= 720 ? 'text-success' :
                app.score >= 620 ? 'text-warning' :
                'text-danger';
              return (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                  <td className="py-3 px-3.5">
                    <code className="text-[11px] bg-gray-100 px-2 py-0.5 rounded font-mono">{app.id}</code>
                  </td>
                  <td className="py-3 px-3.5 font-medium text-gray-800">{app.name}</td>
                  <td className="py-3 px-3.5 text-gray-600">{app.type}</td>
                  <td className="py-3 px-3.5 font-semibold text-brand-600">{app.amount}</td>
                  <td className="py-3 px-3.5">
                    <span className={`font-bold ${scoreColor}`}>{app.score}</span>
                  </td>
                  <td className="py-3 px-3.5 text-gray-500 text-[12px]">{app.date}</td>
                  <td className="py-3 px-3.5">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${cls}`}>
                      {label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
);

export default DashboardPage;
