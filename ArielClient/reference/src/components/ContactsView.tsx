/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building, Mail, Phone, MapPin, Search, Plus, Edit2, Trash2, 
  UserCheck, Briefcase, FileText, Send, X, Clipboard
} from 'lucide-react';
import { Contact, Note } from '../types';

interface ContactsViewProps {
  contacts: Contact[];
  notes: Note[];
  activeUser: { name: string };
  onAddContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => void;
  onUpdateContact: (id: string, updates: Partial<Contact>) => void;
  onDeleteContact: (id: string) => void;
  onAddNote: (note: Omit<Note, 'id' | 'createdAt'>) => void;
}

export default function ContactsView({
  contacts,
  notes,
  activeUser,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  onAddNote
}: ContactsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(contacts[0] || null);

  // Contact Creation Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Note entry state
  const [noteContent, setNoteContent] = useState('');

  const handleOpenForm = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setName(contact.name);
      setCompany(contact.company);
      setDesignation(contact.designation);
      setEmail(contact.email);
      setPhone(contact.phone);
      setAddress(contact.address);
    } else {
      setEditingContact(null);
      setName('');
      setCompany('');
      setDesignation('Staff');
      setEmail('');
      setPhone('');
      setAddress('');
    }
    setIsFormOpen(true);
  };

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company || !email) return;

    if (editingContact) {
      onUpdateContact(editingContact.id, { name, company, designation, email, phone, address });
      setSelectedContact({ ...editingContact, name, company, designation, email, phone, address });
    } else {
      onAddContact({ name, company, designation, email, phone, address });
    }
    setIsFormOpen(false);
  };

  const handlePostNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !noteContent.trim()) return;

    onAddNote({
      content: noteContent.trim(),
      relatedTo: 'contact',
      relatedId: selectedContact.id,
      createdBy: activeUser.name
    });
    setNoteContent('');
  };

  // Filters
  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Active notes for this contact
  const activeContactNotes = notes.filter(n => n.relatedTo === 'contact' && n.relatedId === (selectedContact?.id || ''));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left List Pane */}
      <div className="lg:col-span-1 flex flex-col space-y-4 bg-white rounded-xl p-4 border border-slate-200 shadow-xs h-[650px]">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800">Clients directory ({filteredContacts.length})</h3>
          <button
            onClick={() => handleOpenForm()}
            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold"
            id="register-contact-btn"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients, company name..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Directory Items List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">No client records found.</div>
          ) : (
            filteredContacts.map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedContact(c)}
                id={`contact-item-${c.id}`}
                className={`p-3 rounded-lg border text-left cursor-pointer transition ${
                  selectedContact?.id === c.id 
                    ? 'bg-blue-50/60 border-blue-200 ring-1 ring-blue-100' 
                    : 'bg-white border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between">
                  <p className="font-bold text-slate-700 text-xs truncate max-w-[150px]">{c.name}</p>
                  <span className="text-[10px] text-slate-400 font-mono italic">{c.id.split('-')[1] || c.id}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium truncate mt-1 flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-slate-400" />
                  {c.designation} at <span className="font-semibold text-slate-600">{c.company}</span>
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Detailed Overview Frame */}
      <div className="lg:col-span-2 flex flex-col bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden h-[650px]">
        {selectedContact ? (
          <div className="flex-1 flex flex-col divide-y divide-slate-100">
            {/* Header / Client Card */}
            <div className="p-6 bg-slate-50/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-blue-100 text-blue-600 rounded-full">
                    <UserCheck className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">{selectedContact.name}</h2>
                    <p className="text-xs text-slate-500 font-semibold">{selectedContact.designation} — {selectedContact.company}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleOpenForm(selectedContact)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition"
                  id="edit-contact-btn"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit File</span>
                </button>
                <button
                  onClick={() => {
                    onDeleteContact(selectedContact.id);
                    setSelectedContact(contacts.find(c => c.id !== selectedContact.id) || null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                  id="del-contact-btn"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Profile Info Columns */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Corporate Contacts</h4>
                <div className="space-y-2.5 text-xs text-slate-600 font-medium">
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <a href={`mailto:${selectedContact.email}`} className="hover:underline font-semibold text-blue-600">{selectedContact.email}</a>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{selectedContact.phone || 'N/A'}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Corporate HQ Address</h4>
                <div className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed font-semibold">
                  <MapPin className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                  <span>{selectedContact.address || 'No registered physical office in client archive.'}</span>
                </div>
              </div>
            </div>

            {/* Internal Collaborative Notes list */}
            <div className="p-6 flex-1 flex flex-col bg-slate-50/20">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Clipboard className="w-4 h-4 text-slate-400" />
                Internal Contact History & Shared Notes
              </h4>

              {/* Notes Grid Display */}
              <div className="flex-1 overflow-y-auto space-y-3 max-h-[220px] pr-2 mb-4 bg-white p-3 rounded-lg border border-slate-150">
                {activeContactNotes.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No notes written yet. Submit comments below to coordinate client deliverables.
                  </div>
                ) : (
                  activeContactNotes.map(note => (
                    <div key={note.id} className="p-2.5 bg-slate-50 hover:bg-slate-100/50 rounded-lg border border-slate-100 text-xs">
                      <p className="text-slate-700 leading-relaxed leading-normal">{note.content}</p>
                      <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1.5 font-medium">
                        <span>Staff: {note.createdBy}</span>
                        <span>{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Enter Note Textbox Form */}
              <form onSubmit={handlePostNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type an internal note regarding client communication..."
                  className="flex-1 p-2.5 bg-white border border-slate-200 rounded-lg text-xs leading-normal"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  id="note-input"
                />
                <button
                  type="submit"
                  className="px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center cursor-pointer transition"
                  id="post-note-btn"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <UserCheck className="w-12 h-12 text-slate-300 stroke-1 mb-2" />
            <p className="text-sm font-medium">Select a client on the left pane to view corporate profile details.</p>
          </div>
        )}
      </div>

      {/* Modal form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">
                {editingContact ? 'Edit Corporate Profile' : 'Register Corporate Key Player'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitContact} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Company *</label>
                <input
                  type="text"
                  required
                  placeholder="Acme Corp"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Green"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Corporate Designation</label>
                <input
                  type="text"
                  placeholder="e.g. IT Purchasing Director"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="rachel@acme.com"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 555-0100"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Physical Address</label>
                <textarea
                  placeholder="e.g. Suite 400, 100 Broadway, NY 10005"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none h-16 resize-none"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
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
                  id="save-contact-btn"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
