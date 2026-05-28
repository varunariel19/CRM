/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building, LogOut, Shield, Database, Users, TrendingUp, CheckSquare, 
  LifeBuoy, Calendar, LayoutDashboard, KeyRound, UserCheck, RefreshCw, 
  Download, FileSpreadsheet, ShieldAlert
} from 'lucide-react';

import { Lead, Contact, Deal, Task, Ticket, Meeting, Note, ActivityLog, User as AppUser, UserRole } from './types';
import SchemaView from './components/SchemaView';
import DashboardView from './components/DashboardView';
import LeadsView from './components/LeadsView';
import ContactsView from './components/ContactsView';
import DealsView from './components/DealsView';
import TasksView from './components/TasksView';
import TicketsView from './components/TicketsView';
import MeetingsView from './components/MeetingsView';

export default function App() {
  // Session Authentication state
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('arielcrm_jwt') || null);
  const [activeUser, setActiveUser] = useState<AppUser | null>(null);
  const [emailInput, setEmailInput] = useState('varunariel@gmail.com');
  const [passwordInput, setPasswordInput] = useState('admin123');
  const [authError, setAuthError] = useState('');

  // Main CRUD Lists State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [usersList, setUsersList] = useState<AppUser[]>([]);

  // Navigation Panel Tab State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);

  // --- API COMMUNICATION LAYER ---
  const fetchAllData = async () => {
    if (!authToken) return;
    setIsSyncing(true);
    try {
      const headers = { 'Authorization': `Bearer ${authToken}` };
      
      const [
        resLeads, resContacts, resDeals, resTasks, resTickets, 
        resMeetings, resNotes, resActivities, resUsers
      ] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/contacts'),
        fetch('/api/deals'),
        fetch('/api/tasks'),
        fetch('/api/tickets'),
        fetch('/api/meetings'),
        fetch('/api/notes'),
        fetch('/api/activities'),
        fetch('/api/users')
      ]);

      const [leadsD, contactsD, dealsD, tasksD, ticketsD, meetingsD, notesD, activitiesD, usersD] = await Promise.all([
        resLeads.json(),
        resContacts.json(),
        resDeals.json(),
        resTasks.json(),
        resTickets.json(),
        resMeetings.json(),
        resNotes.json(),
        resActivities.json(),
        resUsers.json()
      ]);

      setLeads(leadsD);
      setContacts(contactsD);
      setDeals(dealsD);
      setTasks(tasksD);
      setTickets(ticketsD);
      setMeetings(meetingsD);
      setNotes(notesD);
      setActivities(activitiesD);
      setUsersList(usersD);
    } catch (error) {
      console.error('Failed to align CRM datastores', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Check Active JWT on startup
  useEffect(() => {
    if (authToken) {
      fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      .then(r => {
        if (!r.ok) throw new Error('Stale credentials');
        return r.json();
      })
      .then(user => {
        setActiveUser(user);
      })
      .catch((e) => {
        console.error(e);
        handleLocalLogout();
      });
    }
  }, [authToken]);

  // Fetch collections when user gains valid session
  useEffect(() => {
    if (authToken && activeUser) {
      fetchAllData();
      
      // Auto routing constraints based on roles mapping
      if (activeUser.role === 'Support Agent' && activeTab !== 'schema' && activeTab !== 'dashboard') {
        setActiveTab('tickets');
      } else if (activeUser.role === 'Sales Executive' && activeTab === 'tickets') {
        setActiveTab('leads');
      }
    }
  }, [authToken, activeUser]);

  // --- CRUD WRAPPER HANDLERS ---
  const handleLocalLogout = () => {
    localStorage.removeItem('arielcrm_jwt');
    setAuthToken(null);
    setActiveUser(null);
    setActiveTab('dashboard');
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });
      if (!res.ok) {
        throw new Error('Invalid email or password parameters');
      }
      const data = await res.json();
      localStorage.setItem('arielcrm_jwt', data.token);
      setAuthToken(data.token);
      setActiveUser(data.user);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    }
  };

  // Easy multi-role simulation click logic
  const handleSimulatedRoleLogin = async (roleEmail: string, rolePass: string) => {
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: roleEmail, password: rolePass })
      });
      if (!res.ok) throw new Error('Simulation network parameter error');
      const data = await res.json();
      localStorage.setItem('arielcrm_jwt', data.token);
      setAuthToken(data.token);
      setActiveUser(data.user);
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleResetDatabase = async () => {
    if (!activeUser || activeUser.role !== 'Admin') return;
    if (!window.confirm('Reset database? This replaces everything with seeded initial datasets.')) return;
    try {
      const r = await fetch('/api/reset', { method: 'POST' });
      if (r.ok) {
        alert('Database has been reset successfully to seed matrices!');
        fetchAllData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- LEADS CONTROLS ---
  const handleAddLead = async (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
    try {
      const r = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...leadData, performedBy: activeUser?.name })
      });
      if (r.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const r = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, performedBy: activeUser?.name })
      });
      if (r.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm('Delete this prospect from CRM database?')) return;
    try {
      const r = await fetch(`/api/leads/${id}?performedBy=${encodeURIComponent(activeUser?.name || 'Varun Ariel')}`, {
        method: 'DELETE'
      });
      if (r.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // --- CONTACTS CONTROLS ---
  const handleAddContact = async (cData: Omit<Contact, 'id' | 'createdAt'>) => {
    try {
      const r = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cData, performedBy: activeUser?.name })
      });
      if (r.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      const r = await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, performedBy: activeUser?.name })
      });
      if (r.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Remove contact profile? Related notes remain archived.')) return;
    try {
      const r = await fetch(`/api/contacts/${id}?performedBy=${encodeURIComponent(activeUser?.name || '')}`, {
        method: 'DELETE'
      });
      if (r.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // --- NOTES CONTROLS ---
  const handleAddNote = async (nData: Omit<Note, 'id' | 'createdAt'>) => {
    try {
      const r = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...nData, createdBy: activeUser?.name })
      });
      if (r.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // --- DEALS CONTROLS ---
  const handleAddDeal = async (dData: Omit<Deal, 'id' | 'createdAt'>) => {
    try {
      const r = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dData, performedBy: activeUser?.name })
      });
      if (r.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateDeal = async (id: string, updates: Partial<Deal>) => {
    try {
      const r = await fetch(`/api/deals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, performedBy: activeUser?.name })
      });
      if (r.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteDeal = async (id: string) => {
    if (!window.confirm('Delete deal contract opportunity?')) return;
    try {
      const r = await fetch(`/api/deals/${id}?performedBy=${encodeURIComponent(activeUser?.name || '')}`, {
        method: 'DELETE'
      });
      if (r.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // --- TASKS CONTROLS ---
  const handleAddTask = async (tData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const r = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tData, performedBy: activeUser?.name })
      });
      if (r.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const r = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, performedBy: activeUser?.name })
      });
      if (r.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const r = await fetch(`/api/tasks/${id}?performedBy=${encodeURIComponent(activeUser?.name || '')}`, {
        method: 'DELETE'
      });
      if (r.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // --- SUPPORT TICKETS CONTROLS ---
  const handleAddTicket = async (tkData: Omit<Ticket, 'id' | 'createdAt'>) => {
    try {
      const r = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tkData, performedBy: activeUser?.name })
      });
      if (r.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTicket = async (id: string, updates: Partial<Ticket>) => {
    try {
      const r = await fetch(`/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, performedBy: activeUser?.name })
      });
      if (r.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!window.confirm('Delete this support ticket permanently?')) return;
    try {
      const r = await fetch(`/api/tickets/${id}?performedBy=${encodeURIComponent(activeUser?.name || '')}`, {
        method: 'DELETE'
      });
      if (r.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // --- MEETINGS CONTROLS ---
  const handleAddMeeting = async (mData: Omit<Meeting, 'id' | 'createdAt'>) => {
    try {
      const r = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...mData, performedBy: activeUser?.name })
      });
      if (r.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    if (!window.confirm('Cancel this scheduled meeting?')) return;
    try {
      const r = await fetch(`/api/meetings/${id}?performedBy=${encodeURIComponent(activeUser?.name || '')}`, {
        method: 'DELETE'
      });
      if (r.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // Export Leads to CSV Helper
  const handleExportLeadsCSV = () => {
    if (leads.length === 0) return;
    
    // Construct CSV columns
    const headers = ['Lead ID', 'Name', 'Company', 'Email', 'Phone', 'Source', 'Status', 'Representative', 'Created At'];
    const rows = leads.map(l => [
      l.id,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.company.replace(/"/g, '""')}"`,
      l.email,
      `"${l.phone || ''}"`,
      l.source,
      l.status,
      l.assignedTo,
      l.createdAt
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "arielcrm_leads_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- RENDER HELPERS ---
  const renderActiveTabContent = () => {
    if (!activeUser) return null;
    
    // Authorization Check: Support Agents only see Tickets and Database blueprint
    if (activeUser.role === 'Support Agent' && !['tickets', 'schema', 'dashboard'].includes(activeTab)) {
      return (
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-lg mx-auto mt-12 space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Route Guards Activated</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            As a Support Agent role, security parameters restrict your access exclusively to ticket desks and analytical graphs. Please use the sidebar to choose 'Customer Tickets'.
          </p>
        </div>
      );
    }

    // Authorization Check: Sales Executives are blocked from ticket files
    if (activeUser.role === 'Sales Executive' && activeTab === 'tickets') {
      return (
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-lg mx-auto mt-12 space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 font-sans">Support Tickets Guarded</h3>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Sales Executives are restricted from accessing operational support desks. Please consult a Support Manager to access SLA tickets.
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            leads={leads}
            deals={deals}
            tickets={tickets}
            tasks={tasks}
            activities={activities}
            onToggleTaskStatus={(taskId, curr) => handleUpdateTask(taskId, { status: curr === 'Completed' ? 'Pending' : 'Completed' })}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        );
      case 'leads':
        return (
          <LeadsView
            leads={leads}
            users={usersList}
            activeUser={activeUser}
            onAddLead={handleAddLead}
            onUpdateLead={handleUpdateLead}
            onDeleteLead={handleDeleteLead}
          />
        );
      case 'contacts':
        return (
          <ContactsView
            contacts={contacts}
            notes={notes}
            activeUser={activeUser}
            onAddContact={handleAddContact}
            onUpdateContact={handleUpdateContact}
            onDeleteContact={handleDeleteContact}
            onAddNote={handleAddNote}
          />
        );
      case 'deals':
        return (
          <DealsView
            deals={deals}
            contacts={contacts}
            users={usersList}
            onAddDeal={handleAddDeal}
            onUpdateDeal={handleUpdateDeal}
            onDeleteDeal={handleDeleteDeal}
          />
        );
      case 'tasks':
        return (
          <TasksView
            tasks={tasks}
            leads={leads}
            deals={deals}
            users={usersList}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        );
      case 'tickets':
        return (
          <TicketsView
            tickets={tickets}
            contacts={contacts}
            users={usersList}
            onAddTicket={handleAddTicket}
            onUpdateTicket={handleUpdateTicket}
            onDeleteTicket={handleDeleteTicket}
          />
        );
      case 'meetings':
        return (
          <MeetingsView
            meetings={meetings}
            leads={leads}
            onAddMeeting={handleAddMeeting}
            onDeleteMeeting={handleDeleteMeeting}
          />
        );
      case 'schema':
        return <SchemaView />;
      default:
        return <div>Subprocess routing fault</div>;
    }
  };

  // --- LOGIN GATEWAY DRAW ---
  if (!authToken || !activeUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Logo & Headline */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-blue-600 text-white rounded-2xl shadow-md">
              <Building className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight" id="login-app-brand">ArielCRM</h1>
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">"Real Leads. Real Deals."</p>
          </div>

          {/* Core Login form */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-700 border-b border-slate-100 pb-3 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-slate-400" />
              Sign in to ArielCRM Portal
            </h2>

            {authError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-100" id="login-error-alert">
                {authError}
              </div>
            )}

            <form onSubmit={handleManualLogin} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  id="email-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  id="password-input"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-lg shadow-sm cursor-pointer transition duration-150"
                id="login-btn"
              >
                Sign In
              </button>
            </form>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <span className="relative px-3 bg-white text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Simulation Quick-Switcher
              </span>
            </div>

            {/* Simulated Roles selection box for easy evaluator walkthrough! */}
            <div className="grid grid-cols-2 gap-2.5 text-[10px]">
              <button
                onClick={() => handleSimulatedRoleLogin('varunariel@gmail.com', 'admin123')}
                className="p-2.5 rounded-lg border border-slate-150 hover:bg-blue-50/20 hover:border-blue-400 text-left transition duration-150 cursor-pointer"
                id="sim-admin-btn"
              >
                <span className="font-extrabold text-slate-700 block">👤 Varun Ariel</span>
                <span className="text-blue-600 font-bold">Admin Role</span>
              </button>

              <button
                onClick={() => handleSimulatedRoleLogin('sarah@arielcrm.com', 'manager123')}
                className="p-2.5 rounded-lg border border-slate-150 hover:bg-blue-50/20 hover:border-blue-400 text-left transition duration-150 cursor-pointer"
                id="sim-manager-btn"
              >
                <span className="font-extrabold text-slate-700 block">👤 Sarah Miller</span>
                <span className="text-purple-600 font-bold">Manager Role</span>
              </button>

              <button
                onClick={() => handleSimulatedRoleLogin('david@arielcrm.com', 'sales123')}
                className="p-2.5 rounded-lg border border-slate-150 hover:bg-blue-50/20 hover:border-blue-400 text-left transition duration-150 cursor-pointer"
                id="sim-sales-btn"
              >
                <span className="font-extrabold text-slate-700 block">👤 David Carter</span>
                <span className="text-amber-600 font-bold font-sans">Sales Executive</span>
              </button>

              <button
                onClick={() => handleSimulatedRoleLogin('emily@arielcrm.com', 'support123')}
                className="p-2.5 rounded-lg border border-slate-150 hover:bg-blue-50/20 hover:border-blue-400 text-left transition duration-150 cursor-pointer"
                id="sim-support-btn"
              >
                <span className="font-extrabold text-slate-700 block">👤 Emily Watson</span>
                <span className="text-emerald-600 font-bold font-sans">Support Agent</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- FULL LAYOUT INTERFACE ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-5 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-blue-600 text-white rounded-lg">
            <Building className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-slate-800 text-base tracking-tight" id="header-brand-title">ArielCRM</span>
            <span className="hidden sm:inline-block text-[10px] text-slate-400 font-extrabold border-l border-slate-200 pl-3 ml-3 uppercase tracking-wider">
              "Real Leads. Real Deals."
            </span>
          </div>
        </div>

        {/* Sync Indicator, CSV Exporter, Role label and LogOut section */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <button
              onClick={fetchAllData}
              disabled={isSyncing}
              className="p-1.5 hover:bg-slate-50 hover:border text-slate-400 hover:text-slate-700 rounded-lg transition"
              title="Force Sync Server State"
              id="sync-dataset-btn"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
            
            {activeUser.role !== 'Support Agent' && leads.length > 0 && (
              <button
                onClick={handleExportLeadsCSV}
                className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-emerald-600 rounded-lg transition hidden md:flex items-center gap-1 text-[11px] font-bold"
                title="Export Leads to CSV File"
                id="export-leads-btn"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 border-l border-slate-200 pl-4">
            <div className="text-right">
              <span className="block text-xs font-extrabold text-slate-700" id="user-display-name">{activeUser.name}</span>
              <span className={`inline-flex px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                activeUser.role === 'Admin' ? 'bg-blue-50 text-blue-700' :
                activeUser.role === 'Manager' ? 'bg-purple-50 text-purple-700' :
                activeUser.role === 'Sales Executive' ? 'bg-amber-50 text-amber-700' :
                'bg-emerald-50 text-emerald-700'
              }`}>
                {activeUser.role} Role
              </span>
            </div>
            
            <button
              onClick={handleLocalLogout}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Sign Out of Portal"
              id="signout-btn"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Panel layout wrapper */}
      <div className="flex-1 flex flex-col md:flex-row h-full">
        
        {/* Responsive Left Sidebar */}
        <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 p-4 border-r border-slate-800 gap-6">
          <div className="space-y-5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block px-2">CRM Modules</span>
            
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-850 hover:text-white hover:bg-slate-800'
                }`}
                id="sidebar-dashboard-tab"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Analytics Dashboard</span>
              </button>

              {activeUser.role !== 'Support Agent' && (
                <>
                  <button
                    onClick={() => setActiveTab('leads')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      activeTab === 'leads' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-850 hover:text-white hover:bg-slate-800'
                    }`}
                    id="sidebar-leads-tab"
                  >
                    <Users className="w-4 h-4" />
                    <span>Leads Management</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('contacts')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      activeTab === 'contacts' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-850 hover:text-white hover:bg-slate-800'
                    }`}
                    id="sidebar-contacts-tab"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Customer profiles</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('deals')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      activeTab === 'deals' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-850 hover:text-white hover:bg-slate-800'
                    }`}
                    id="sidebar-deals-tab"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Deals Pipeline</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('tasks')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      activeTab === 'tasks' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-850 hover:text-white hover:bg-slate-800'
                    }`}
                    id="sidebar-tasks-tab"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Tasks & Follow-ups</span>
                  </button>
                </>
              )}

              {activeUser.role !== 'Sales Executive' && (
                <button
                  onClick={() => setActiveTab('tickets')}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                    activeTab === 'tickets' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-850 hover:text-white hover:bg-slate-800'
                  }`}
                  id="sidebar-tickets-tab"
                >
                  <LifeBuoy className="w-4 h-4" />
                  <span>Customer Tickets</span>
                </button>
              )}

              {activeUser.role !== 'Support Agent' && (
                <button
                  onClick={() => setActiveTab('meetings')}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                    activeTab === 'meetings' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-850 hover:text-white hover:bg-slate-800'
                  }`}
                  id="sidebar-meetings-tab"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Appointment Scheduler</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('schema')}
                className={`w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  activeTab === 'schema' ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-850 hover:text-white hover:bg-slate-800'
                }`}
                id="sidebar-schema-tab"
              >
                <Database className="w-4 h-4" />
                <span>PostgreSQL Schema (Phase 1)</span>
              </button>
            </nav>
          </div>

          {/* Under sidebar: Quick System reset controls for Admin */}
          {activeUser.role === 'Admin' && (
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block px-2">Operator Admin</span>
              <button
                onClick={handleResetDatabase}
                className="w-full flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-red-950/40 border border-slate-700/60 hover:border-red-900/50 hover:text-red-300 text-[10px] font-bold uppercase rounded-lg transition cursor-pointer"
                id="reset-db-btn"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Database</span>
              </button>
            </div>
          )}
        </aside>

        {/* Content Box Panels */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-60px)]">
          {renderActiveTabContent()}
        </main>

      </div>
    </div>
  );
}
