/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Filter, Mail, Phone, Building,
  User, CheckCircle, ExternalLink, X, ShieldAlert
} from 'lucide-react';
import { Lead, LeadSource, LeadStatus, User as AppUser } from '../types';

interface LeadsViewProps {
  leads: Lead[];
  users: AppUser[];
  activeUser: AppUser;
  onAddLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  onUpdateLead: (id: string, updates: Partial<Lead>) => void;
  onDeleteLead: (id: string) => void;
}

export default function LeadsView({
  leads,
  users,
  activeUser,
  onAddLead,
  onUpdateLead,
  onDeleteLead
}: LeadsViewProps) {
  // Query Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<string>('All');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState<LeadSource>('Website');
  const [status, setStatus] = useState<LeadStatus>('New');
  const [assignedTo, setAssignedTo] = useState('');

  // Form handling
  const handleOpenNewForm = () => {
    setEditingLeadId(null);
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setSource('Website');
    setStatus('New');
    // Default assignment to the first sales executive or the active executive
    const defaults = users.find(u => u.role === 'Sales Executive' || u.role === 'Admin');
    setAssignedTo(defaults ? defaults.name : activeUser.name);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setName(lead.name);
    setCompany(lead.company);
    setEmail(lead.email);
    setPhone(lead.phone);
    setSource(lead.source);
    setStatus(lead.status);
    setAssignedTo(lead.assignedTo);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company) return;

    if (editingLeadId) {
      onUpdateLead(editingLeadId, { name, company, email, phone, source, status, assignedTo });
    } else {
      onAddLead({ name, company, email, phone, source, status, assignedTo });
    }
    setIsFormOpen(false);
  };

  // Perform Filters
  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
    const matchesSource = sourceFilter === 'All' || l.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const availableExecutives = users.filter(u => u.role === 'Sales Executive' || u.role === 'Admin' || u.role === 'Manager');

  return (
    <div className="space-y-6">
      {/* Search & Actions Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center p-4 bg-white rounded-xl border border-slate-200 shadow-xs gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads name, company, email..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="lead-search-input"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            id="lead-status-filter"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>

          <select
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            id="lead-source-filter"
          >
            <option value="All">All Sources</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Email Campaign">Email Campaign</option>
          </select>

          <button
            onClick={handleOpenNewForm}
            id="add-lead-btn"
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Lead</span>
          </button>
        </div>
      </div>

      {/* Main Leads Directory List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="p-4">Prospect / Company</th>
                <th className="p-4">Contact Methods</th>
                <th className="p-4">Source</th>
                <th className="p-4">CRM Status State</th>
                <th className="p-4">Assignee</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No leads match your filter parameters.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition">
                    {/* Name / Co */}
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          {lead.name}
                        </p>
                        <p className="text-slate-400 font-medium inline-flex items-center gap-1 mt-0.5">
                          <Building className="w-3.5 h-3.5 text-slate-300" />
                          {lead.company}
                        </p>
                      </div>
                    </td>

                    {/* Email / Ph */}
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{lead.phone || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Source */}
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 font-semibold rounded text-[10px]">
                        {lead.source}
                      </span>
                    </td>

                    {/* Status Toggle Box */}
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                        <select
                          className={`font-bold text-[10px] uppercase tracking-wide rounded-md px-2 py-1 border focus:outline-none w-28 ${
                            lead.status === 'New' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            lead.status === 'Contacted' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            lead.status === 'Qualified' ? 'bg-violet-50 text-violet-700 border-violet-200' :
                            lead.status === 'Converted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            'bg-slate-50 text-slate-500 border-slate-200'
                          }`}
                          value={lead.status}
                          onChange={(e) => onUpdateLead(lead.id, { status: e.target.value as LeadStatus })}
                          id={`lead-${lead.id}-status-sel`}
                        >
                          <option value="New">🔵 New</option>
                          <option value="Contacted">🟡 Contacted</option>
                          <option value="Qualified">🟣 Qualified</option>
                          <option value="Converted">🟢 Converted</option>
                          <option value="Lost">🔴 Lost</option>
                        </select>
                        <span className="text-[9px] text-slate-400 pl-1 font-mono">
                          Date: {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>

                    {/* Assignee Selection */}
                    <td className="p-4">
                      <div className="flex items-center space-x-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <select
                          className="bg-transparent text-slate-700 hover:bg-slate-50 border-0 hover:border rounded-md px-1.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={lead.assignedTo}
                          onChange={(e) => onUpdateLead(lead.id, { assignedTo: e.target.value })}
                          id={`lead-${lead.id}-assign-sel`}
                        >
                          {availableExecutives.map(exec => (
                            <option key={exec.id} value={exec.name}>{exec.name}</option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditForm(lead)}
                          className="p-1 px-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded"
                          title="Edit Lead"
                          id={`edit-lead-${lead.id}-btn`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteLead(lead.id)}
                          className="p-1 px-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete Lead"
                          id={`del-lead-${lead.id}-btn`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800" id="form-title">
                {editingLeadId ? 'Modify Lead File' : 'Onboard New Lead Opportunity'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Company / Enterprise *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Initech Corp"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  id="form-company"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Primary Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  id="form-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@firm.com"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="form-email"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 555-0199"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    id="form-phone"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Source Pipeline</label>
                  <select
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={source}
                    onChange={(e) => setSource(e.target.value as LeadSource)}
                    id="form-source"
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Email Campaign">Email Campaign</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Assigned Representative</label>
                  <select
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    id="form-assignee"
                  >
                    {availableExecutives.map(e => (
                      <option key={e.id} value={e.name}>{e.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {editingLeadId && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Lead status</label>
                  <select
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-800"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as LeadStatus)}
                    id="form-status"
                  >
                    <option value="New">🆕 New Opportunity</option>
                    <option value="Contacted">📞 Contacted Outreach</option>
                    <option value="Qualified">🎯 Qualified Interest</option>
                    <option value="Converted">🤝 Converted Deal</option>
                    <option value="Lost">🚫 Lost Prospect</option>
                  </select>
                </div>
              )}

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
                  id="submit-form-btn"
                >
                  {editingLeadId ? 'Update Information' : 'Register Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
