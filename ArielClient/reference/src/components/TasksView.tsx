/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CheckSquare, Plus, CheckCircle, Clock, Trash2, Calendar, 
  MapPin, RefreshCcw, Link, Link2, ListFilter, X, User
} from 'lucide-react';
import { Task, TaskType, TaskStatus, Lead, Deal, User as AppUser } from '../types';

interface TasksViewProps {
  tasks: Task[];
  leads: Lead[];
  deals: Deal[];
  users: AppUser[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

export default function TasksView({
  tasks,
  leads,
  deals,
  users,
  onAddTask,
  onUpdateTask,
  onDeleteTask
}: TasksViewProps) {
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('Pending');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>('Call');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [leadId, setLeadId] = useState('');
  const [dealId, setDealId] = useState('');

  const handleOpenForm = () => {
    setTitle('');
    setType('Call');
    setDueDate(new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0]);
    setAssignedTo(users[0]?.name || 'Varun Ariel');
    setLeadId('');
    setDealId('');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onAddTask({
      title,
      type,
      dueDate,
      status: 'Pending',
      assignedTo,
      leadId: leadId || undefined,
      dealId: dealId || undefined
    });
    setIsFormOpen(false);
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'All') return true;
    return t.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center p-4 bg-white rounded-xl border border-slate-200 shadow-xs gap-4">
        {/* Toggle Filters Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg self-start">
          <button
            onClick={() => setFilter('Pending')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
              filter === 'Pending' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Pending Reminders
          </button>
          <button
            onClick={() => setFilter('Completed')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
              filter === 'Completed' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Completed tasks
          </button>
          <button
            onClick={() => setFilter('All')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
              filter === 'All' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Logs
          </button>
        </div>

        <button
          onClick={handleOpenForm}
          id="new-task-btn"
          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task Action</span>
        </button>
      </div>

      {/* Main Checklist Directory Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <CheckCircle className="w-12 h-12 text-slate-200 mx-auto stroke-1 mb-2" />
            <p className="text-xs font-medium">No tasks logged under the "{filter}" filter.</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const linkedLead = leads.find(l => l.id === task.leadId);
            const linkedDeal = deals.find(d => d.id === task.dealId);

            return (
              <div 
                key={task.id}
                id={`task-row-${task.id}`}
                className={`p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/50 transition gap-4 ${
                  task.status === 'Completed' ? 'bg-slate-50/20' : ''
                }`}
              >
                {/* Checkbox + Title Group */}
                <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                    checked={task.status === 'Completed'}
                    onChange={() => onUpdateTask(task.id, { status: task.status === 'Completed' ? 'Pending' : 'Completed' })}
                    id={`task-${task.id}-toggle`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-bold text-slate-700 leading-normal truncate ${
                      task.status === 'Completed' ? 'line-through text-slate-400 decoration-slate-300' : ''
                    }`}>
                      {task.title}
                    </p>
                    
                    {/* Meta labels row */}
                    <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-[10px] text-slate-400 font-medium">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold tracking-wider ${
                        task.type === 'Call' ? 'bg-blue-50 text-blue-600' :
                        task.type === 'Email' ? 'bg-violet-50 text-violet-600' :
                        task.type === 'Demo' ? 'bg-amber-50 text-amber-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {task.type}
                      </span>
                      
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-300" />
                        Due: <span className="font-semibold text-slate-600">{task.dueDate}</span>
                      </span>

                      {linkedLead && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-sky-50 text-sky-700 rounded-md">
                          <Link className="w-3 h-3" />
                          Lead: {linkedLead.name} ({linkedLead.company})
                        </span>
                      )}

                      {linkedDeal && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                          <Link2 className="w-3 h-3" />
                          Deal: {linkedDeal.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Assignee Representative + Operations */}
                <div className="flex justify-between sm:justify-end items-center gap-4 text-xs">
                  <div className="flex items-center space-x-1 font-semibold text-slate-500">
                    <User className="w-3.5 h-3.5 text-slate-300" />
                    <span>Representative: {task.assignedTo}</span>
                  </div>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded transition"
                    id={`del-task-${task.id}-btn`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Scheduler Dialog Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Add Pending Action Item</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 font-sans">task Description / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule AWS review workshop"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Call Category Type</label>
                  <select
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none font-semibold text-slate-700"
                    value={type}
                    onChange={(e) => setType(e.target.value as TaskType)}
                  >
                    <option value="Call">📞 Call Outreach</option>
                    <option value="Email">📧 Email Campaign</option>
                    <option value="Meeting">🤝 Meeting discovery</option>
                    <option value="Demo">💻 technical Demo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Assignee Staff Member</label>
                <select
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none font-semibold text-slate-700"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  {users.map(u => (
                    <option key={u.id} value={u.name}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex flex-col gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Context Alignment (Optional)</span>
                
                <div className="grid grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Connect to Lead</label>
                    <select
                      className="w-full p-2 bg-white border border-slate-200 rounded text-xs leading-normal font-medium"
                      value={leadId}
                      onChange={(e) => {
                        setLeadId(e.target.value);
                        if (e.target.value) setDealId(''); // exclusive
                      }}
                    >
                      <option value="">None</option>
                      {leads.map(l => (
                        <option key={l.id} value={l.id}>{l.name} ({l.company})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Connect to Deal</label>
                    <select
                      className="w-full p-2 bg-white border border-slate-200 rounded text-xs leading-normal font-medium"
                      value={dealId}
                      onChange={(e) => {
                        setDealId(e.target.value);
                        if (e.target.value) setLeadId(''); // exclusive
                      }}
                    >
                      <option value="">None</option>
                      {deals.map(d => (
                        <option key={d.id} value={d.id}>{d.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-250 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                  id="save-task-btn"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
