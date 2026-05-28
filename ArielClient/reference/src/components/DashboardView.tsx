/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Users, TrendingUp, LifeBuoy, DollarSign, Calendar, Flame,
  CheckCircle, Clock, ArrowRight, UserCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  Legend, PieChart, Pie, Cell 
} from 'recharts';
import { Lead, Deal, Ticket, Task, ActivityLog } from '../types';

interface DashboardViewProps {
  leads: Lead[];
  deals: Deal[];
  tickets: Ticket[];
  tasks: Task[];
  activities: ActivityLog[];
  onToggleTaskStatus: (taskId: string, currentStatus: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function DashboardView({
  leads,
  deals,
  tickets,
  tasks,
  activities,
  onToggleTaskStatus,
  onNavigateToTab
}: DashboardViewProps) {
  // Aggregate Metrics
  const totalLeads = leads.length;
  
  const activeDeals = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost');
  const activeDealsCount = activeDeals.length;
  
  const openTickets = tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed');
  const openTicketsCount = openTickets.length;

  const wonDeals = deals.filter(d => d.stage === 'Won');
  const monthlyRevenue = wonDeals.reduce((sum, d) => sum + d.value, 0);

  // Recharts Data 1: Deal Pipeline by Stage
  const stages = ['Proposal', 'Negotiation', 'Won', 'Lost'];
  const dealStageData = stages.map(stage => {
    const stageDeals = deals.filter(d => d.stage === stage);
    const valueSum = stageDeals.reduce((sum, d) => sum + d.value, 0);
    return {
      name: stage,
      Count: stageDeals.length,
      'Value ($)': valueSum
    };
  });

  // Recharts Data 2: Lead Sources
  const sources = ['Website', 'Referral', 'LinkedIn', 'Email Campaign'];
  const leadSourceData = sources.map(source => {
    const count = leads.filter(l => l.source === source).length;
    return { name: source, value: count };
  });

  const COLORS = ['#206ce8', '#6366f1', '#3b82f6', '#f59e0b'];

  // Upcoming Pending Tasks
  const pendingTasks = tasks
    .filter(t => t.status === 'Pending')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  // Recent Leads List
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Total Leads</span>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totalLeads}</p>
            <button 
              onClick={() => onNavigateToTab('leads')}
              className="text-blue-600 hover:text-blue-700 text-xs font-semibold mt-2 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Leads</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Active Deals</span>
            <p className="text-2xl font-bold text-slate-800 mt-1">{activeDealsCount}</p>
            <button 
              onClick={() => onNavigateToTab('deals')}
              className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold mt-2 flex items-center gap-1 cursor-pointer"
            >
              <span>View Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">Open Tickets</span>
            <p className="text-2xl font-bold text-slate-800 mt-1">{openTicketsCount}</p>
            <button 
              onClick={() => onNavigateToTab('tickets')}
              className="text-amber-600 hover:text-amber-700 text-xs font-semibold mt-2 flex items-center gap-1 cursor-pointer"
            >
              <span>Support Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <LifeBuoy className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl p-5 text-white shadow-xs border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">Total Revenue Won</span>
            <p className="text-2xl font-bold tracking-tight text-white mt-1">
              ${monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
            <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              SLA Delivery Active
            </span>
          </div>
          <div className="p-3 bg-slate-850 text-blue-450 rounded-lg border border-slate-800 text-blue-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Pipeline with Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deal Pipeline bar graph */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Deal pipeline analysis (Value vs. Stage)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dealStageData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Total Value']} />
                <Bar dataKey="Value ($)" fill="#206ce8" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources Pie Chart */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Lead Acquisition Channels
            </h3>
            <div className="h-44 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadSourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {leadSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                <span className="text-xs text-slate-400 font-medium">Total Leads</span>
                <span className="text-lg font-bold text-slate-800">{totalLeads}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-medium mt-2">
            {leadSourceData.map((d, index) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[index] }}></span>
                <span className="truncate">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leads, Tasks, and Activities Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads Table */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Recent Prospects
            </h3>
            <button 
              onClick={() => onNavigateToTab('leads')}
              className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              View More
            </button>
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[280px]">
            {recentLeads.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No leads added yet.</div>
            ) : (
              recentLeads.map((lead) => (
                <div key={lead.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-slate-700">{lead.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{lead.company} • {lead.source}</p>
                  </div>
                  <div>
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      lead.status === 'New' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                      lead.status === 'Contacted' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      lead.status === 'Qualified' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                      lead.status === 'Converted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      'bg-slate-50 text-slate-400 border border-slate-200'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Tasks list */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              My Reminders Calendar
            </h3>
            <button 
              onClick={() => onNavigateToTab('tasks')}
              className="text-xs text-indigo-600 hover:underline font-semibold cursor-pointer"
            >
              All Tasks
            </button>
          </div>
          <div className="space-y-3.5 overflow-y-auto max-h-[280px]">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400 flex flex-col items-center gap-1">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
                <span>You're all caught up! No tasks pending.</span>
              </div>
            ) : (
              pendingTasks.map((task) => (
                <div key={task.id} className="flex gap-2.5 items-start bg-slate-50 hover:bg-slate-100/70 p-2.5 rounded-lg border border-slate-100 transition duration-150">
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                    checked={task.status === 'Completed'}
                    onChange={() => onToggleTaskStatus(task.id, task.status)}
                    id={`task-${task.id}-chk`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span className="px-1 py-0.2 bg-slate-200 text-slate-600 rounded text-[9px] uppercase font-bold">
                        {task.type}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        Due: {task.dueDate}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Real-time Activity Timeline */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            CRM Live Activity Feed
          </h3>
          <div className="space-y-4 overflow-y-auto max-h-[280px] pr-1">
            {activities.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No activities logged yet.</div>
            ) : (
              activities.slice(0, 5).map((act) => (
                <div key={act.id} className="flex gap-3 text-xs">
                  <div className="relative mt-1">
                    <div className="w-2 h-2 rounded-full bg-blue-600 z-10 relative"></div>
                    <div className="absolute top-2 bottom-[-16px] left-[3px] w-0.5 bg-slate-100"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-600 font-medium">
                      {act.action}
                    </p>
                    <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                      <span>By: {act.performedBy}</span>
                      <span>{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
