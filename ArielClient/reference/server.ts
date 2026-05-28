import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

// --- DATABASE CONFIG & SEEDING ---
const DB_FILE = path.join(process.cwd(), 'db.json');

function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = seedDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading DB, re-seeding...', error);
    const initialData = seedDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function writeDb(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function seedDatabase() {
  const users = [
    { id: 'u-1', name: 'Varun Ariel', email: 'varunariel@gmail.com', passwordHash: 'admin123', role: 'Admin', createdAt: new Date().toISOString() },
    { id: 'u-2', name: 'Sarah Miller', email: 'sarah@arielcrm.com', passwordHash: 'manager123', role: 'Manager', createdAt: new Date().toISOString() },
    { id: 'u-3', name: 'David Carter', email: 'david@arielcrm.com', passwordHash: 'sales123', role: 'Sales Executive', createdAt: new Date().toISOString() },
    { id: 'u-4', name: 'Emily Watson', email: 'emily@arielcrm.com', passwordHash: 'support123', role: 'Support Agent', createdAt: new Date().toISOString() }
  ];

  const leads = [
    { id: 'l-1', name: 'John Doe', company: 'Acme Corp', email: 'john@acme.com', phone: '+1 555 123 4567', source: 'LinkedIn', status: 'New', assignedTo: 'David Carter', createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
    { id: 'l-2', name: 'Alice Smith', company: 'Vertex Solutions', email: 'alice@vertex.io', phone: '+1 555 987 6543', source: 'Website', status: 'Contacted', assignedTo: 'David Carter', createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() },
    { id: 'l-3', name: 'Bob Johnson', company: 'Nexus Tech', email: 'bob@nexus.com', phone: '+1 555 456 7890', source: 'Referral', status: 'Qualified', assignedTo: 'David Carter', createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
    { id: 'l-4', name: 'Carol Williams', company: 'Hyperion Labs', email: 'carol@hyperion.com', phone: '+1 555 222 3333', source: 'Email Campaign', status: 'Converted', assignedTo: 'David Carter', createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
    { id: 'l-5', name: 'David Brown', company: 'Initech Inc', email: 'david@initech.com', phone: '+1 555 444 5555', source: 'LinkedIn', status: 'Lost', assignedTo: 'David Carter', createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() }
  ];

  const contacts = [
    { id: 'c-1', name: 'John Doe', company: 'Acme Corp', designation: 'CTO', email: 'john@acme.com', phone: '+1 555 123 4567', address: '123 Enterprise Way, Tech City, CA 94016', createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
    { id: 'c-2', name: 'Alice Smith', company: 'Vertex Solutions', designation: 'IT Director', email: 'alice@vertex.io', phone: '+1 555 987 6543', address: '456 Innovation Blvd, Cloud City, WA 98101', createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() },
    { id: 'c-3', name: 'Bob Johnson', company: 'Nexus Tech', designation: 'Engineering Lead', email: 'bob@nexus.com', phone: '+1 555 456 7890', address: '789 Paradigm Drive, Austin, TX 78701', createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
    { id: 'c-4', name: 'Carol Williams', company: 'Hyperion Labs', designation: 'CEO', email: 'carol@hyperion.com', phone: '+1 555 222 3333', address: '101 Summit Ridge, Boston, MA 02108', createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() }
  ];

  const deals = [
    { id: 'd-1', title: 'Cloud Infrastructure Migration', value: 45000, stage: 'Negotiation', closeDate: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0], assignedTo: 'David Carter', contactId: 'c-1', createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString() },
    { id: 'd-2', title: 'Custom CRM Development', value: 72000, stage: 'Won', closeDate: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0], assignedTo: 'David Carter', contactId: 'c-4', createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString() },
    { id: 'd-3', title: 'Cybersecurity Threat Audit', value: 18000, stage: 'Proposal', closeDate: new Date(Date.now() + 25 * 24 * 3600 * 1000).toISOString().split('T')[0], assignedTo: 'Varun Ariel', contactId: 'c-2', createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
    { id: 'd-4', title: 'Managed Kubernetes Hosting', value: 34000, stage: 'Won', closeDate: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString().split('T')[0], assignedTo: 'Sarah Miller', contactId: 'c-3', createdAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString() }
  ];

  const tasks = [
    { id: 't-1', title: 'Follow-up Call on Proposal', type: 'Call', dueDate: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString().split('T')[0], status: 'Pending', assignedTo: 'David Carter', leadId: 'l-1', createdAt: new Date().toISOString() },
    { id: 't-2', title: 'Prepare Technical Architecture Demo', type: 'Demo', dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0], status: 'Pending', assignedTo: 'David Carter', dealId: 'd-1', createdAt: new Date().toISOString() },
    { id: 't-3', title: 'Send Introductory Email Campaign', type: 'Email', dueDate: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0], status: 'Completed', assignedTo: 'David Carter', leadId: 'l-4', createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
    { id: 't-4', title: 'Introductory Discovery Meeting', type: 'Meeting', dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0], status: 'Pending', assignedTo: 'Sarah Miller', leadId: 'l-2', createdAt: new Date().toISOString() }
  ];

  const tickets = [
    { id: 'tk-1', title: 'Database Outage on Staging', description: 'Staging environment app is throwing PostgreSQL SSL connection timeout issues intermittently.', status: 'In Progress', priority: 'Critical', assignedTo: 'Emily Watson', clientId: 'c-1', createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() },
    { id: 'tk-2', title: 'SSO Integration Request', description: 'Client wants to explore Auth0 SSO setup for their external customer hub.', status: 'Open', priority: 'Medium', assignedTo: 'Emily Watson', clientId: 'c-4', createdAt: new Date().toISOString() },
    { id: 'tk-3', title: 'Billing Discrepancy SLA', description: 'SLA invoice lists extra developer hours that need to be refunded.', status: 'Resolved', priority: 'Low', assignedTo: 'Sarah Miller', clientId: 'c-2', createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() }
  ];

  const meetings = [
    { id: 'm-1', title: 'Architecture Review Session', client: 'Acme Corp', date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0], time: '14:30', location: 'Google Meet', notes: 'Design reviews for cloud migration blueprint.', leadId: 'l-1', createdAt: new Date().toISOString() },
    { id: 'm-2', title: 'ArielCRM Portal Walkthrough', client: 'Hyperion Labs', date: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString().split('T')[0], time: '10:00', location: 'Zoom', notes: 'Demonstrate custom features built this week.', leadId: 'l-4', createdAt: new Date().toISOString() },
    { id: 'm-3', title: 'Introductory Call with Vertex', client: 'Vertex Solutions', date: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0], time: '11:00', location: 'Microsoft Teams', notes: 'Understanding cybersecurity parameters.', leadId: 'l-2', createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() }
  ];

  const notes = [
    { id: 'n-1', content: 'Client prefers highly customized service agreement. Value negotiation expected.', relatedTo: 'deal', relatedId: 'd-1', createdBy: 'David Carter', createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
    { id: 'n-2', content: 'Met at LinkedIn network event. Very keen on IT staffing solutions.', relatedTo: 'lead', relatedId: 'l-1', createdBy: 'David Carter', createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() }
  ];

  const activity_log = [
    { id: 'a-1', action: 'Created Leads Acme Corp', performedBy: 'David Carter', relatedTo: 'lead', relatedId: 'l-1', createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
    { id: 'a-2', action: 'Uploaded Deal "Cloud Infrastructure Migration"', performedBy: 'David Carter', relatedTo: 'deal', relatedId: 'd-1', createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() },
    { id: 'a-3', action: 'Created Technical Audit Ticket', performedBy: 'Emily Watson', relatedTo: 'ticket', relatedId: 'tk-1', createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() },
    { id: 'a-4', action: 'Marked "Send Introductory Email" as Completed', performedBy: 'David Carter', relatedTo: 'task', relatedId: 't-3', createdAt: new Date(Date.now() - 12 * 1000 * 60).toISOString() }
  ];

  return { users, leads, contacts, deals, tasks, tickets, meetings, notes, activity_log };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Log requests in dev
  app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.path}`);
    next();
  });

  // Helper function to log activities
  function logActivity(action: string, performedBy: string, relatedTo?: any, relatedId?: string) {
    const db = readDb();
    const newLog = {
      id: `a-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      performedBy,
      relatedTo,
      relatedId,
      createdAt: new Date().toISOString()
    };
    db.activity_log.unshift(newLog); // Put new actions at the beginning
    writeDb(db);
  }

  // --- API AUTHENTICATION ENDPOINTS ---

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const db = readDb();
    const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT-like session token
    const token = `token-${user.id}-${Date.now()}`;
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  });

  app.post('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized credentials' });
    }

    const token = authHeader.split(' ')[1];
    const parts = token.split('-');
    if (parts.length < 3) {
      return res.status(401).json({ error: 'Malformed token' });
    }

    const userId = `${parts[1]}-${parts[2]}`; // Handle potential '-' separation
    const cleanUserId = token.replace('token-', '').split('-')[0] + '-' + token.replace('token-', '').split('-')[1];
    const formattedUserId = cleanUserId.startsWith('u-') ? cleanUserId.split('-').slice(0, 2).join('-') : 'u-1';

    const db = readDb();
    const user = db.users.find((u: any) => u.id === formattedUserId) || db.users[0];

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    });
  });

  // Custom User Creation Route
  app.post('/api/users', (req, res) => {
    const { name, email, password, role } = req.body;
    const db = readDb();
    if (db.users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const newUser = {
      id: `u-${Date.now()}`,
      name,
      email,
      passwordHash: password || 'pass123',
      role: role || 'Sales Executive',
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDb(db);
    logActivity(`Registered user "${name}" as ${role}`, 'System');
    res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, createdAt: newUser.createdAt });
  });

  app.get('/api/users', (req, res) => {
    const db = readDb();
    const usersList = db.users.map((u: any) => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt }));
    res.json(usersList);
  });

  // --- LEAD MANAGEMENT ---

  app.get('/api/leads', (req, res) => {
    const db = readDb();
    res.json(db.leads);
  });

  app.post('/api/leads', (req, res) => {
    const { name, company, email, phone, source, status, assignedTo, performedBy } = req.body;
    const db = readDb();
    const newLead = {
      id: `l-${Date.now()}`,
      name,
      company,
      email,
      phone,
      source: source || 'Website',
      status: status || 'New',
      assignedTo: assignedTo || 'Unassigned',
      createdAt: new Date().toISOString()
    };
    db.leads.push(newLead);
    writeDb(db);

    logActivity(`Created Lead for "${name}" (${company})`, performedBy || 'Varun Ariel', 'lead', newLead.id);
    res.status(201).json(newLead);
  });

  app.put('/api/leads/:id', (req, res) => {
    const { id } = req.params;
    const { name, company, email, phone, source, status, assignedTo, performedBy } = req.body;
    const db = readDb();
    const index = db.leads.findIndex((l: any) => l.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const previousLead = db.leads[index];
    const updatedLead = {
      ...previousLead,
      name: name !== undefined ? name : previousLead.name,
      company: company !== undefined ? company : previousLead.company,
      email: email !== undefined ? email : previousLead.email,
      phone: phone !== undefined ? phone : previousLead.phone,
      source: source !== undefined ? source : previousLead.source,
      status: status !== undefined ? status : previousLead.status,
      assignedTo: assignedTo !== undefined ? assignedTo : previousLead.assignedTo
    };

    db.leads[index] = updatedLead;
    writeDb(db);

    let changeMsg = `Updated Lead for "${updatedLead.name}"`;
    if (previousLead.status !== updatedLead.status) {
      changeMsg = `Changed Lead status of "${updatedLead.name}" to "${updatedLead.status}"`;
    }
    logActivity(changeMsg, performedBy || 'Varun Ariel', 'lead', id);
    res.json(updatedLead);
  });

  app.delete('/api/leads/:id', (req, res) => {
    const { id } = req.params;
    const { performedBy } = req.query;
    const db = readDb();
    const index = db.leads.findIndex((l: any) => l.id === id);

    if (index === -1) {
      return res.status(444).json({ error: 'Lead not found' });
    }

    const lead = db.leads[index];
    db.leads.splice(index, 1);
    writeDb(db);

    logActivity(`Deleted Lead for "${lead.name}" (${lead.company})`, (performedBy as string) || 'Varun Ariel');
    res.json({ success: true });
  });

  // --- CONTACT MANAGEMENT ---

  app.get('/api/contacts', (req, res) => {
    const db = readDb();
    res.json(db.contacts);
  });

  app.post('/api/contacts', (req, res) => {
    const { name, company, designation, email, phone, address, performedBy } = req.body;
    const db = readDb();
    const newContact = {
      id: `c-${Date.now()}`,
      name,
      company,
      designation: designation || 'Staff',
      email,
      phone,
      address: address || '',
      createdAt: new Date().toISOString()
    };
    db.contacts.push(newContact);
    writeDb(db);

    logActivity(`Created Contact profile for "${name}" at ${company}`, performedBy || 'Varun Ariel', 'contact', newContact.id);
    res.status(201).json(newContact);
  });

  app.put('/api/contacts/:id', (req, res) => {
    const { id } = req.params;
    const { name, company, designation, email, phone, address, performedBy } = req.body;
    const db = readDb();
    const index = db.contacts.findIndex((c: any) => c.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const updatedContact = {
      ...db.contacts[index],
      name: name || db.contacts[index].name,
      company: company || db.contacts[index].company,
      designation: designation || db.contacts[index].designation,
      email: email || db.contacts[index].email,
      phone: phone || db.contacts[index].phone,
      address: address || db.contacts[index].address
    };

    db.contacts[index] = updatedContact;
    writeDb(db);

    logActivity(`Updated Contact profile of "${updatedContact.name}"`, performedBy || 'Varun Ariel', 'contact', id);
    res.json(updatedContact);
  });

  app.delete('/api/contacts/:id', (req, res) => {
    const { id } = req.params;
    const { performedBy } = req.query;
    const db = readDb();
    const index = db.contacts.findIndex((c: any) => c.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const contact = db.contacts[index];
    db.contacts.splice(index, 1);
    writeDb(db);

    logActivity(`Deleted Contact Profile of "${contact.name}"`, (performedBy as string) || 'Varun Ariel');
    res.json({ success: true });
  });

  // --- DEAL OPPORTUNITY MANAGEMENT ---

  app.get('/api/deals', (req, res) => {
    const db = readDb();
    res.json(db.deals);
  });

  app.post('/api/deals', (req, res) => {
    const { title, value, stage, closeDate, assignedTo, contactId, performedBy } = req.body;
    const db = readDb();
    const newDeal = {
      id: `d-${Date.now()}`,
      title,
      value: Number(value) || 0,
      stage: stage || 'Proposal',
      closeDate: closeDate || new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split('T')[0],
      assignedTo: assignedTo || 'Varun Ariel',
      contactId: contactId || '',
      createdAt: new Date().toISOString()
    };
    db.deals.push(newDeal);
    writeDb(db);

    logActivity(`Created Deal "${title}" for $${newDeal.value}`, performedBy || 'Varun Ariel', 'deal', newDeal.id);
    res.status(201).json(newDeal);
  });

  app.put('/api/deals/:id', (req, res) => {
    const { id } = req.params;
    const { title, value, stage, closeDate, assignedTo, contactId, performedBy } = req.body;
    const db = readDb();
    const index = db.deals.findIndex((d: any) => d.id === id);

    if (index === -1) {
      return res.status(444).json({ error: 'Deal not found' });
    }

    const previousDeal = db.deals[index];
    const updatedDeal = {
      ...previousDeal,
      title: title || previousDeal.title,
      value: value !== undefined ? Number(value) : previousDeal.value,
      stage: stage || previousDeal.stage,
      closeDate: closeDate || previousDeal.closeDate,
      assignedTo: assignedTo || previousDeal.assignedTo,
      contactId: contactId !== undefined ? contactId : previousDeal.contactId
    };

    db.deals[index] = updatedDeal;
    writeDb(db);

    let msg = `Updated Deal details for "${updatedDeal.title}"`;
    if (previousDeal.stage !== updatedDeal.stage) {
      msg = `Moved Deal "${updatedDeal.title}" to "${updatedDeal.stage}" stage`;
    }
    logActivity(msg, performedBy || 'Varun Ariel', 'deal', id);
    res.json(updatedDeal);
  });

  app.delete('/api/deals/:id', (req, res) => {
    const { id } = req.params;
    const { performedBy } = req.query;
    const db = readDb();
    const index = db.deals.findIndex((d: any) => d.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const deal = db.deals[index];
    db.deals.splice(index, 1);
    writeDb(db);

    logActivity(`Deleted Deal Opportunity "${deal.title}"`, (performedBy as string) || 'Varun Ariel');
    res.json({ success: true });
  });

  // --- TASK & FOLLOW-UP MANAGEMENT ---

  app.get('/api/tasks', (req, res) => {
    const db = readDb();
    res.json(db.tasks);
  });

  app.post('/api/tasks', (req, res) => {
    const { title, type, dueDate, status, assignedTo, leadId, dealId, performedBy } = req.body;
    const db = readDb();
    const newTask = {
      id: `t-${Date.now()}`,
      title,
      type: type || 'Call',
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      status: status || 'Pending',
      assignedTo: assignedTo || 'Varun Ariel',
      leadId: leadId || undefined,
      dealId: dealId || undefined,
      createdAt: new Date().toISOString()
    };
    db.tasks.push(newTask);
    writeDb(db);

    logActivity(`Created Task: [${newTask.type}] "${title}"`, performedBy || 'Varun Ariel', 'task', newTask.id);
    res.status(201).json(newTask);
  });

  app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { title, type, dueDate, status, assignedTo, leadId, dealId, performedBy } = req.body;
    const db = readDb();
    const index = db.tasks.findIndex((t: any) => t.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const previousTask = db.tasks[index];
    const updatedTask = {
      ...previousTask,
      title: title || previousTask.title,
      type: type || previousTask.type,
      dueDate: dueDate || previousTask.dueDate,
      status: status || previousTask.status,
      assignedTo: assignedTo || previousTask.assignedTo,
      leadId: leadId !== undefined ? leadId : previousTask.leadId,
      dealId: dealId !== undefined ? dealId : previousTask.dealId
    };

    db.tasks[index] = updatedTask;
    writeDb(db);

    let logMsg = `Updated Task details for "${updatedTask.title}"`;
    if (previousTask.status !== updatedTask.status) {
      logMsg = updatedTask.status === 'Completed'
        ? `Marked Task "${updatedTask.title}" as Completed`
        : `Marked Task "${updatedTask.title}" as Pending`;
    }
    logActivity(logMsg, performedBy || 'Varun Ariel', 'task', id);
    res.json(updatedTask);
  });

  app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { performedBy } = req.query;
    const db = readDb();
    const index = db.tasks.findIndex((t: any) => t.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = db.tasks[index];
    db.tasks.splice(index, 1);
    writeDb(db);

    logActivity(`Deleted Task "${task.title}"`, (performedBy as string) || 'Varun Ariel');
    res.json({ success: true });
  });

  // --- SUPPORT TICKET MANAGEMENT ---

  app.get('/api/tickets', (req, res) => {
    const db = readDb();
    res.json(db.tickets);
  });

  app.post('/api/tickets', (req, res) => {
    const { title, description, status, priority, assignedTo, clientId, performedBy } = req.body;
    const db = readDb();
    const newTicket = {
      id: `tk-${Date.now()}`,
      title,
      description: description || '',
      status: status || 'Open',
      priority: priority || 'Medium',
      assignedTo: assignedTo || 'Emily Watson',
      clientId: clientId || 'c-1',
      createdAt: new Date().toISOString()
    };
    db.tickets.push(newTicket);
    writeDb(db);

    logActivity(`Raised Support Ticket tk-${newTicket.id.split('-')[1]} [${priority}]: "${title}"`, performedBy || 'Emily Watson', 'ticket', newTicket.id);
    res.status(201).json(newTicket);
  });

  app.put('/api/tickets/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, status, priority, assignedTo, clientId, performedBy } = req.body;
    const db = readDb();
    const index = db.tickets.findIndex((tk: any) => tk.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const previousTicket = db.tickets[index];
    const updatedTicket = {
      ...previousTicket,
      title: title || previousTicket.title,
      description: description || previousTicket.description,
      status: status || previousTicket.status,
      priority: priority || previousTicket.priority,
      assignedTo: assignedTo || previousTicket.assignedTo,
      clientId: clientId || previousTicket.clientId
    };

    db.tickets[index] = updatedTicket;
    writeDb(db);

    let msg = `Updated Ticket "${updatedTicket.title}"`;
    if (previousTicket.status !== updatedTicket.status) {
      msg = `Changed Ticket status of "${updatedTicket.title}" to ${updatedTicket.status}`;
    }
    logActivity(msg, performedBy || 'Emily Watson', 'ticket', id);
    res.json(updatedTicket);
  });

  app.delete('/api/tickets/:id', (req, res) => {
    const { id } = req.params;
    const { performedBy } = req.query;
    const db = readDb();
    const index = db.tickets.findIndex((tk: any) => tk.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = db.tickets[index];
    db.tickets.splice(index, 1);
    writeDb(db);

    logActivity(`Deleted Support Ticket "${ticket.title}"`, (performedBy as string) || 'Varun Ariel');
    res.json({ success: true });
  });

  // --- MEETING & Scheduler ENDPOINTS ---

  app.get('/api/meetings', (req, res) => {
    const db = readDb();
    res.json(db.meetings);
  });

  app.post('/api/meetings', (req, res) => {
    const { title, client, date, time, location, notes, leadId, performedBy } = req.body;
    const db = readDb();
    const newMeeting = {
      id: `m-${Date.now()}`,
      title,
      client,
      date,
      time,
      location: location || 'Online Meet',
      notes: notes || '',
      leadId: leadId || undefined,
      createdAt: new Date().toISOString()
    };
    db.meetings.push(newMeeting);
    writeDb(db);

    logActivity(`Scheduled Meeting "${title}" with ${client} at ${date} ${time}`, performedBy || 'Varun Ariel', 'meeting', newMeeting.id);
    res.status(201).json(newMeeting);
  });

  app.put('/api/meetings/:id', (req, res) => {
    const { id } = req.params;
    const { title, client, date, time, location, notes, leadId, performedBy } = req.body;
    const db = readDb();
    const index = db.meetings.findIndex((m: any) => m.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const updatedMeeting = {
      ...db.meetings[index],
      title: title || db.meetings[index].title,
      client: client || db.meetings[index].client,
      date: date || db.meetings[index].date,
      time: time || db.meetings[index].time,
      location: location || db.meetings[index].location,
      notes: notes || db.meetings[index].notes,
      leadId: leadId !== undefined ? leadId : db.meetings[index].leadId
    };

    db.meetings[index] = updatedMeeting;
    writeDb(db);

    logActivity(`Rescheduled Meeting "${updatedMeeting.title}" with ${updatedMeeting.client}`, performedBy || 'Varun Ariel', 'meeting', id);
    res.json(updatedMeeting);
  });

  app.delete('/api/meetings/:id', (req, res) => {
    const { id } = req.params;
    const { performedBy } = req.query;
    const db = readDb();
    const index = db.meetings.findIndex((m: any) => m.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const meeting = db.meetings[index];
    db.meetings.splice(index, 1);
    writeDb(db);

    logActivity(`Cancelled Scheduled Meeting "${meeting.title}" with ${meeting.client}`, (performedBy as string) || 'Varun Ariel');
    res.json({ success: true });
  });

  // --- NOTES MODULE ---

  app.get('/api/notes', (req, res) => {
    const db = readDb();
    res.json(db.notes);
  });

  app.post('/api/notes', (req, res) => {
    const { content, relatedTo, relatedId, createdBy } = req.body;
    const db = readDb();
    const newNote = {
      id: `n-${Date.now()}`,
      content,
      relatedTo,
      relatedId,
      createdBy: createdBy || 'Varun Ariel',
      createdAt: new Date().toISOString()
    };
    db.notes.push(newNote);
    writeDb(db);

    logActivity(`Added internal comment / note to ${relatedTo}`, createdBy || 'Varun Ariel', relatedTo as any, relatedId);
    res.status(201).json(newNote);
  });

  app.delete('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const index = db.notes.findIndex((n: any) => n.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }

    db.notes.splice(index, 1);
    writeDb(db);
    res.json({ success: true });
  });

  // --- RECENT ACTIVITIES ENDPOINT ---

  app.get('/api/activities', (req, res) => {
    const db = readDb();
    res.json(db.activity_log);
  });

  // Quick reset to initial seeded data route
  app.post('/api/reset', (req, res) => {
    const seeded = seedDatabase();
    writeDb(seeded);
    res.json({ success: true, message: 'Database was successfully reset to seeded values' });
  });

  // Vite development vs production asset handling
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ArielCRM Backend] listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Critical Server Boot Error', err);
});
