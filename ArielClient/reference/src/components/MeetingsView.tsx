/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, Clock, Video, MapPin, Plus, Trash2, X, Clipboard, 
  ExternalLink, CheckCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Meeting, Lead } from '../types';

interface MeetingsViewProps {
  meetings: Meeting[];
  leads: Lead[];
  onAddMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt'>) => void;
  onDeleteMeeting: (id: string) => void;
}

export default function MeetingsView({
  meetings,
  leads,
  onAddMeeting,
  onDeleteMeeting
}: MeetingsViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('Google Meet');
  const [notes, setNotes] = useState('');
  const [leadId, setLeadId] = useState('');

  const [selectedDay, setSelectedDay] = useState<string>(new Date().toISOString().split('T')[0]);

  // Construct some standard calendar days for simple mock view
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // Draw 14 simulated calendar cells starting from 4 days ago to maintain visual density
  const calendarDays = Array.from({ length: 14 }).map((_, i) => {
    const day = new Date();
    day.setDate(today.getDate() - 4 + i);
    return day.toISOString().split('T')[0];
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !client || !date || !time) return;

    onAddMeeting({
      title,
      client,
      date,
      time,
      location,
      notes,
      leadId: leadId || undefined
    });
    setIsFormOpen(false);
  };

  const handleOpenForm = (dayPreset?: string) => {
    setTitle('');
    setClient('');
    setDate(dayPreset || new Date().toISOString().split('T')[0]);
    setTime('10:00');
    setLocation('Google Meet');
    setNotes('');
    setLeadId('');
    setIsFormOpen(true);
  };

  // Get meetings for the active day selected
  const activeDayMeetings = meetings.filter(m => m.date === selectedDay);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Calendar Strip Box (Left Side) */}
      <div className="lg:col-span-1 bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col h-[580px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Agenda Grid Calendar
          </h3>
          <button
            onClick={() => handleOpenForm(selectedDay)}
            id="scheduler-add-btn"
            className="p-1 px-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book</span>
          </button>
        </div>

        {/* Info label */}
        <p className="text-[11px] text-slate-400 mb-4">Select a target date slot to filter scheduled conference sessions below:</p>

        {/* 14 Day Grid Strip */}
        <div className="grid grid-cols-2 gap-2 flex-1 overflow-y-auto pr-1">
          {calendarDays.map((dayStr) => {
            const hasMeeting = meetings.some(m => m.date === dayStr);
            const dateObj = new Date(dayStr);
            const dayNum = dateObj.getDate();
            const dayName = dateObj.toLocaleDateString([], { weekday: 'short' });
            const monthName = dateObj.toLocaleDateString([], { month: 'short' });

            return (
              <div
                key={dayStr}
                onClick={() => setSelectedDay(dayStr)}
                className={`p-3 rounded-lg border text-left cursor-pointer transition relative flex flex-col justify-between ${
                  selectedDay === dayStr 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs' 
                    : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-700'
                }`}
                id={`cal-day-${dayStr}`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-bold tracking-wider uppercase ${
                    selectedDay === dayStr ? 'text-blue-100' : 'text-slate-400'
                  }`}>
                    {dayName}, {monthName}
                  </span>
                  {hasMeeting && (
                    <span className={`w-2 h-2 rounded-full ${
                      selectedDay === dayStr ? 'bg-white' : 'bg-blue-600'
                    }`}></span>
                  )}
                </div>
                <div className="text-xl font-extrabold mt-2 leading-none">{dayNum}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agenda Detail Cards List Frame (Right Side) */}
      <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col h-[580px]">
        {/* Title */}
        <div className="border-b border-slate-100 pb-3 flex justify-between items-center mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              Meetings slated for: <span className="text-blue-600">{new Date(selectedDay).toLocaleDateString([], { dateStyle: 'full' })}</span>
            </h4>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{activeDayMeetings.length} sessions booked on this date.</p>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeDayMeetings.length === 0 ? (
            <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-2">
              <Calendar className="w-12 h-12 text-slate-200" />
              <p className="text-xs font-semibold leading-relaxed">No scheduled meetings logged for {selectedDay}.</p>
              <button
                onClick={() => handleOpenForm(selectedDay)}
                className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Schedule an appointment slot
              </button>
            </div>
          ) : (
            activeDayMeetings.map(meet => (
              <div 
                key={meet.id}
                id={`meeting-card-${meet.id}`}
                className="p-4 bg-slate-50 border border-slate-150 hover:border-slate-350 rounded-xl transition duration-150 relative space-y-3"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-blue-105 text-blue-650 font-bold border border-blue-100 rounded px-1.5 py-0.5 bg-blue-50 text-blue-600 uppercase font-mono tracking-wider">
                      Booked Session
                    </span>
                    <h5 className="text-sm font-bold text-slate-800 pt-1 leading-normal">{meet.title}</h5>
                  </div>

                  <button
                    onClick={() => onDeleteMeeting(meet.id)}
                    className="p-1 px-1.5 text-slate-300 hover:text-red-500 rounded transition"
                    id={`del-meet-${meet.id}-btn`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Meet coords */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Time: {meet.time}
                  </span>
                  
                  <span className="flex items-center gap-1 bg-indigo-50/70 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100">
                    <Video className="w-4 h-4" />
                    Channel: {meet.location}
                  </span>

                  <span className="text-slate-400">•</span>

                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-200 border rounded px-1.5 py-0.5 leading-none">
                    Client: {meet.client}
                  </span>
                </div>

                {/* Notes log */}
                {meet.notes && (
                  <div className="p-2.5 bg-white border border-slate-100 rounded-lg text-xs text-slate-600 leading-relaxed font-semibold">
                    <span className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Agenda parameters</span>
                    {meet.notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Appointment form overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-sm w-full overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Schedule Client Conference</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Proposed Target Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Service SLA Kickoff Session"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Company / client Target *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corporation"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Session Target Location</label>
                <select
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none bg-white font-medium"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="Google Meet">🔵 Google Meet Conference</option>
                  <option value="Zoom">🟢 Zoom Video Call</option>
                  <option value="Microsoft Teams">🟣 Microsoft Teams</option>
                  <option value="On-Site Client HQ">🏢 Physical Office (HQ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 font-sans">Corporate Agenda / Notes</label>
                <textarea
                  placeholder="Draft introductory guidelines or core coordinates of this appointment..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none h-16 resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  id="save-meet-btn"
                >
                  Schedule Meet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
