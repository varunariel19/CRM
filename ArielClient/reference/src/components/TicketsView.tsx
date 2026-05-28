/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LifeBuoy, Plus, HelpCircle, AlertTriangle, CheckSquare, Clock, Trash2, 
  User, CheckCircle, Mail, Phone, Briefcase, FileText, Send, X, Clipboard
} from 'lucide-react';
import { Ticket, TicketStatus, TicketPriority, Contact, User as AppUser, Note } from '../types';

interface TicketsViewProps {
  tickets: Ticket[];
  contacts: Contact[];
  users: AppUser[];
  onAddTicket: (ticket: Omit<Ticket, 'id' | 'createdAt'>) => void;
  onUpdateTicket: (id: string, updates: Partial<Ticket>) => void;
  onDeleteTicket: (id: string) => void;
}

const STATUS_TAGS: Record<TicketStatus, { bg: string, text: string }> = {
  Open: { bg: 'bg-blue-50 text-blue-700 border-blue-150', text: '🔵 Open' },
  'In Progress': { bg: 'bg-amber-50 text-amber-700 border-amber-150', text: '🟡 In Progress' },
  Resolved: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-150', text: '🟢 Resolved' },
  Closed: { bg: 'bg-slate-50 text-slate-500 border-slate-200', text: '⚫ Closed' }
};

const PRIORITY_TAGS: Record<TicketPriority, { bg: string, text: string, anim?: boolean }> = {
  Low: { bg: 'bg-slate-100 text-slate-600', text: 'Low' },
  Medium: { bg: 'bg-blue-100 text-blue-800', text: 'Medium' },
  High: { bg: 'bg-orange-100 text-orange-800', text: 'High' },
  Critical: { bg: 'bg-red-50 text-red-700 border border-red-200 font-extrabold', text: '🔥 Critical', anim: true }
};

export default function TicketsView({
  tickets,
  contacts,
  users,
  onAddTicket,
  onUpdateTicket,
  onDeleteTicket
}: TicketsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TicketStatus>('Open');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [clientId, setClientId] = useState('');

  const handleOpenNewForm = () => {
    setEditingTicketId(null);
    setTitle('');
    setDescription('');
    setStatus('Open');
    setPriority('Medium');
    const supportAgent = users.find(u => u.role === 'Support Agent') || users[0];
    setAssignedTo(supportAgent?.name || '');
    setClientId(contacts[0]?.id || '');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (ticket: Ticket) => {
    setEditingTicketId(ticket.id);
    setTitle(ticket.title);
    setDescription(ticket.description);
    setStatus(ticket.status);
    setPriority(ticket.priority);
    setAssignedTo(ticket.assignedTo);
    setClientId(ticket.clientId);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const data = { title, description, status, priority, assignedTo, clientId };

    if (editingTicketId) {
      onUpdateTicket(editingTicketId, data);
    } else {
      onAddTicket(data);
    }
    setIsFormOpen(false);
  };

  // Filter calculation
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const supportAgents = users.filter(u => u.role === 'Support Agent' || u.role === 'Admin' || u.role === 'Manager');

  return (
    <div className="space-y-6">
      {/* Helpdesk Metrics & controls header */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center p-4 bg-white rounded-xl border border-slate-200 shadow-xs gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <HelpCircle className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets text..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Priority Filter */}
        <div className="flex flex-wrap gap-2.5 items-center">
          <select
            className="text-xs bg-slate-55 border border-slate-200 rounded-lg p-2 font-medium bg-slate-50"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            className="text-xs bg-slate-55 border border-slate-200 rounded-lg p-2 font-medium bg-slate-50"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          <button
            onClick={handleOpenNewForm}
            id="register-ticket-btn"
            className="flex items-center space-x-1 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Raise Support Ticket</span>
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-250 p-12 text-center text-slate-400">
            <LifeBuoy className="w-12 h-12 text-slate-200 mx-auto stroke-1 mb-2" />
            <p className="text-xs font-medium">No unresolved incidents filed under these filters.</p>
          </div>
        ) : (
          filteredTickets.map(ticket => {
            const client = contacts.find(c => c.id === ticket.clientId);
            const statusConfig = STATUS_TAGS[ticket.status];
            const prioConfig = PRIORITY_TAGS[ticket.priority];

            return (
              <div 
                key={ticket.id}
                id={`ticket-card-${ticket.id}`}
                className={`bg-white rounded-xl p-5 border shadow-xs hover:shadow-sm hover:border-slate-350 transition duration-150 space-y-4`}
              >
                {/* ID & Priority Header Row */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-500 rounded font-bold px-1.5 py-0.5">
                      TICKET STAFF ID: TK-{ticket.id.split('-')[1] || ticket.id}
                    </span>
                    
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${prioConfig.bg} flex items-center gap-1`}>
                      {prioConfig.anim && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                      )}
                      {prioConfig.text}
                    </span>
                  </div>

                  {/* Status Dropdowns directly editable */}
                  <div className="flex items-center space-x-2">
                    <select
                      className={`text-[10px] font-bold rounded-lg px-2.5 py-1 focus:outline-none border font-sans ${statusConfig.bg}`}
                      value={ticket.status}
                      onChange={(e) => onUpdateTicket(ticket.id, { status: e.target.value as TicketStatus })}
                      id={`ticket-status-sel-${ticket.id}`}
                    >
                      <option value="Open">🔵 Open</option>
                      <option value="In Progress">🟡 In Progress</option>
                      <option value="Resolved">🟢 Resolved</option>
                      <option value="Closed">⚫ Closed</option>
                    </select>

                    <button
                      onClick={() => onDeleteTicket(ticket.id)}
                      className="p-1 px-1.5 text-slate-300 hover:text-red-500 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    {ticket.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold pr-4 mt-1">
                    {ticket.description}
                  </p>
                </div>

                {/* Client Reference & Support Agent Assignment */}
                <div className="pt-3.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  {/* Client */}
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-600">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Requester</span>
                    {client ? (
                      <div className="mt-1 flex flex-col">
                        <span className="font-bold text-slate-700">{client.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">at {client.company} | {client.email}</span>
                      </div>
                    ) : (
                      <span className="text-[10px]">Unassigned External Contact</span>
                    )}
                  </div>

                  {/* Agent */}
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Responsible Engineer</span>
                      <div className="flex items-center space-x-1.5 mt-1 font-semibold text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ticket.assignedTo}</span>
                      </div>
                    </div>
                    {/* Inline agent update */}
                    <select
                      className="bg-white border border-slate-200 text-[10px] font-bold p-1 rounded-md focus:outline-none"
                      value={ticket.assignedTo}
                      onChange={(e) => onUpdateTicket(ticket.id, { assignedTo: e.target.value })}
                      id={`ticket-assignee-sel-${ticket.id}`}
                    >
                      {supportAgents.map(ag => (
                        <option key={ag.id} value={ag.name}>{ag.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ticket Overlay Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Log Support Incident</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Incident Headline Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Staging DB Timeout SSL errors"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Issue Details / Diagnosis *</label>
                <textarea
                  required
                  placeholder="Describe logs, environment conditions, and client SLA expectations..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none h-24 resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Contact Client Ref</label>
                  <select
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none font-semibold text-slate-700 bg-white"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                  >
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">SLA Criticality Priority</label>
                  <select
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none font-bold text-slate-700 bg-white"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">🔥 Critical (SLA 2hr)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Assigned Support Agent</label>
                <select
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none font-semibold text-slate-700 bg-white"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  {supportAgents.map(ag => (
                    <option key={ag.id} value={ag.name}>{ag.name}</option>
                  ))}
                </select>
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
                  id="save-ticket-btn"
                >
                  Log Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
