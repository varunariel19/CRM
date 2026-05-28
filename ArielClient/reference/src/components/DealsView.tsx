/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, Plus, Edit2, Trash2, ShieldCheck, Mail, Calendar, 
  ChevronRight, ChevronLeft, Building, User, DollarSign, X
} from 'lucide-react';
import { Deal, DealStage, Contact, User as AppUser } from '../types';

interface DealsViewProps {
  deals: Deal[];
  contacts: Contact[];
  users: AppUser[];
  onAddDeal: (deal: Omit<Deal, 'id' | 'createdAt'>) => void;
  onUpdateDeal: (id: string, updates: Partial<Deal>) => void;
  onDeleteDeal: (id: string) => void;
}

const STAGES: DealStage[] = ['Proposal', 'Negotiation', 'Won', 'Lost'];

const STAGE_COLORS: Record<DealStage, { bg: string, text: string, border: string, dot: string }> = {
  Proposal: { bg: 'bg-blue-50/60', text: 'text-blue-700', border: 'border-blue-150', dot: 'bg-blue-500' },
  Negotiation: { bg: 'bg-amber-50/60', text: 'text-amber-700', border: 'border-amber-150', dot: 'bg-amber-500' },
  Won: { bg: 'bg-emerald-50/60', text: 'text-emerald-700', border: 'border-emerald-150', dot: 'bg-emerald-500' },
  Lost: { bg: 'bg-red-50/60', text: 'text-red-700', border: 'border-red-150', dot: 'bg-red-500' }
};

export default function DealsView({
  deals,
  contacts,
  users,
  onAddDeal,
  onUpdateDeal,
  onDeleteDeal
}: DealsViewProps) {
  // Form overlay
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState<DealStage>('Proposal');
  const [closeDate, setCloseDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [contactId, setContactId] = useState('');

  const handleOpenForm = (deal?: Deal) => {
    if (deal) {
      setEditingDeal(deal);
      setTitle(deal.title);
      setValue(deal.value.toString());
      setStage(deal.stage);
      setCloseDate(deal.closeDate);
      setAssignedTo(deal.assignedTo);
      setContactId(deal.contactId);
    } else {
      setEditingDeal(null);
      setTitle('');
      setValue('15000');
      setStage('Proposal');
      setCloseDate(new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0]);
      setAssignedTo(users[0]?.name || 'Varun Ariel');
      setContactId(contacts[0]?.id || '');
    }
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !value) return;

    const numValue = parseFloat(value) || 0;
    const dealData = { title, value: numValue, stage, closeDate, assignedTo, contactId };

    if (editingDeal) {
      onUpdateDeal(editingDeal.id, dealData);
    } else {
      onAddDeal(dealData);
    }
    setIsFormOpen(false);
  };

  // Shift deal stage helper inline
  const handleMoveStage = (dealId: string, currentStage: DealStage, direction: 'left' | 'right') => {
    const currentIndex = STAGES.indexOf(currentStage);
    let nextIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;
    
    if (nextIndex >= 0 && nextIndex < STAGES.length) {
      onUpdateDeal(dealId, { stage: STAGES[nextIndex] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Kanban Header Controls */}
      <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Active Sales Value Pipeline
          </h2>
          <p className="text-xs text-slate-400 mt-1">Reflects current technical services contract pipeline values.</p>
        </div>

        <button
          onClick={() => handleOpenForm()}
          id="create-deal-btn"
          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Opportunity Deal</span>
        </button>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAGES.map((columnStage) => {
          const stageDeals = deals.filter(d => d.stage === columnStage);
          const stageDealsVal = stageDeals.reduce((sum, d) => sum + d.value, 0);
          const colorStyles = STAGE_COLORS[columnStage];

          return (
            <div 
              key={columnStage} 
              className={`flex flex-col bg-slate-50 rounded-xl border border-slate-200 overflow-hidden h-[540px]`}
            >
              {/* Column Header */}
              <div className="p-3 bg-white border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${colorStyles.dot}`}></span>
                  <span className="font-bold text-slate-700 text-xs uppercase tracking-wide">{columnStage}</span>
                  <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {stageDeals.length}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800">${stageDealsVal.toLocaleString()}</span>
                </div>
              </div>

              {/* Deals Cards Area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {stageDeals.length === 0 ? (
                  <div className="text-center py-20 text-[11px] text-slate-400 font-medium italic">
                    No deals here.
                  </div>
                ) : (
                  stageDeals.map(deal => {
                    const linkedContact = contacts.find(c => c.id === deal.contactId);
                    
                    return (
                      <div 
                        key={deal.id}
                        className="bg-white p-3.5 rounded-lg border border-slate-200/80 hover:border-slate-350 shadow-xs hover:shadow-sm transition-all duration-150 space-y-3 relative group"
                        id={`deal-card-${deal.id}`}
                      >
                        {/* Title block */}
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-bold text-xs text-slate-800 line-clamp-2 leading-relaxed">
                              {deal.title}
                            </span>
                          </div>
                          {linkedContact && (
                            <p className="text-[10px] text-slate-400 font-medium inline-flex items-center gap-1 mt-1">
                              <Building className="w-3 h-3" />
                              {linkedContact.company}
                            </p>
                          )}
                        </div>

                        {/* Value & Actions */}
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                          <div>
                            <span className="text-[9px] text-slate-400 font-mono block uppercase">Contract Worth</span>
                            <span className="text-sm font-extrabold text-blue-600">${deal.value.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-mono block text-right">Target Close</span>
                            <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {deal.closeDate}
                            </span>
                          </div>
                        </div>

                        {/* Assignee & movement Controls */}
                        <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1.5 ">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-350" />
                            <span className="font-semibold text-slate-500">{deal.assignedTo}</span>
                          </div>

                          {/* Quick movement overlay */}
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleOpenForm(deal)}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded"
                              title="Edit Deal"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleMoveStage(deal.id, deal.stage, 'left')}
                              disabled={columnStage === 'Proposal'}
                              className="p-1 disabled:opacity-30 hover:bg-slate-150 text-slate-500 rounded cursor-pointer"
                              title="Previous stage"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveStage(deal.id, deal.stage, 'right')}
                              disabled={columnStage === 'Lost'}
                              className="p-1 disabled:opacity-30 hover:bg-slate-150 text-slate-500 rounded cursor-pointer"
                              title="Advance stage"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">
                {editingDeal ? 'Update Contract Opportunity' : 'Create Sales Venture Deal'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Proposed Architecture Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Cloud Outpost Setup"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Opportunity Value ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="45000"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Target Close Date</label>
                  <input
                    type="date"
                    required
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={closeDate}
                    onChange={(e) => setCloseDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Key Customer Contact</label>
                  <select
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                    value={contactId}
                    onChange={(e) => setContactId(e.target.value)}
                  >
                    <option value="">-- Associate Contact --</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Lead Representative</label>
                  <select
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-700"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {editingDeal && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Deal Stage Stage</label>
                  <select
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none font-bold"
                    value={stage}
                    onChange={(e) => setStage(e.target.value as DealStage)}
                  >
                    <option value="Proposal">Proposal</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
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
                  id="save-deal-btn"
                >
                  {editingDeal ? 'Update Parameters' : 'Launch Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
