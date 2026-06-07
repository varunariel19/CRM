INSERT INTO access_levels (id, name , access_level)
VALUES
(NEWID(), 'Admin Level' , 100),
(NEWID(), 'Manager Level' , 80),
(NEWID(), 'Business Level' , 60),
(NEWID(), 'Resource Level' , 50),
(NEWID(), 'Viewer Level' , 10);

	
INSERT INTO permissions (id, code, description)
VALUES

-- Dashboard
(NEWID(), 'Dashboard.View', 'Access and view analytics dashboard with charts and performance metrics'),

-- Leads
(NEWID(), 'Leads.View', 'View lead list, details, and associated contact information'),
(NEWID(), 'Leads.Create', 'Add new leads with contact details and source information'),
(NEWID(), 'Leads.Edit', 'Update lead details, status, and assignment information'),
(NEWID(), 'Leads.Delete', 'Permanently remove leads from the system'),

-- Customers
(NEWID(), 'Customers.View', 'View customer profiles, history, and account details'),
(NEWID(), 'Customers.Create', 'Register new customers with full profile and contact information'),
(NEWID(), 'Customers.Edit', 'Modify existing customer profile and contact information'),
(NEWID(), 'Customers.Delete', 'Permanently remove customer records from the system'),

-- Deals
(NEWID(), 'Deals.View', 'View deal pipeline, deal details, and associated customer information'),
(NEWID(), 'Deals.Create', 'Create new deals and link them to customers or leads'),
(NEWID(), 'Deals.Edit', 'Update deal value, stage, status, and associated information'),
(NEWID(), 'Deals.Delete', 'Permanently remove deal records from the pipeline'),

-- Tasks
(NEWID(), 'Tasks.View', 'View assigned and all tasks with due dates and priority levels'),
(NEWID(), 'Tasks.Create', 'Create new tasks and assign them to team members with deadlines'),
(NEWID(), 'Tasks.Edit', 'Update task details, status, assignee, and due dates'),
(NEWID(), 'Tasks.Delete', 'Permanently remove tasks from the system'),

-- Tickets
(NEWID(), 'Tickets.View', 'View support tickets, status updates, and customer issue details'),
(NEWID(), 'Tickets.Create', 'Raise new support tickets on behalf of customers or internally'),
(NEWID(), 'Tickets.Edit', 'Update ticket status, priority, category, and assigned agent'),
(NEWID(), 'Tickets.Delete', 'Permanently remove support ticket records from the system'),

-- Appointments
(NEWID(), 'Appointments.View', 'View scheduled appointments, attendees, and calendar entries'),
(NEWID(), 'Appointments.Create', 'Schedule new appointments and assign participants and time slots'),
(NEWID(), 'Appointments.Edit', 'Reschedule or update appointment details and participant information'),

-- Projects
(NEWID(), 'Projects.View', 'View project details, progress, milestones, and team assignments'),
(NEWID(), 'Projects.Create', 'Create new projects with goals, timelines, and team members'),
(NEWID(), 'Projects.Edit', 'Update project details, status, deadlines, and assigned members'),
(NEWID(), 'Projects.Delete', 'Permanently remove project records and associated data'),

-- Team Members
(NEWID(), 'TeamMembers.View', 'View team member profiles, roles, and contact information'),
(NEWID(), 'TeamMembers.Create', 'Add new team members and assign roles and access permissions'),
(NEWID(), 'TeamMembers.Edit', 'Update team member profile, role, and permission assignments'),
(NEWID(), 'TeamMembers.Delete', 'Permanently remove team member accounts from the system'),

-- Audit
(NEWID(), 'AuditHistory.View', 'View detailed audit logs of user actions, changes, and system events');



INSERT INTO access_level_permissions (id, access_level_id, permission_id) VALUES

-- Admin (all permissions)
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', '1F97AAD5-4C41-4762-AFBA-D27804A61086'), -- Dashboard.View
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', '4DC7CC42-84AF-47B5-9665-9CA62CD1A97E'), -- Leads.View
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', '1237AE3D-1FC4-4FC5-BB28-297949AD2AC9'), -- Leads.Create
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', 'C648AE19-05E5-4324-BF86-F24DAC1DEB17'), -- Leads.Edit
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', '29C4E9E8-46BF-4158-8648-66A313F84F24'), -- Leads.Delete
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', 'A6986C3D-EE60-4A95-9236-5FA3F8EEA890'), -- Customers.View
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', '69AB287A-4D89-4466-82B9-CA1AFBADD5B5'), -- Customers.Create
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', '8A61BFD1-397A-4C28-9A3D-04E57875EDA7'), -- Customers.Edit
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', '57AA5737-8555-4918-B14D-5B8F275EA92D'), -- Customers.Delete
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', 'A751D405-B1DB-4537-8852-0DE6AA9C7B1E'), -- Deals.View
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', 'F72F2FC3-AAFD-4728-B521-C6AEA67F02D9'), -- Deals.Create
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', '80E66B5B-66F7-4614-8E4D-8B7C6410C4E4'), -- Deals.Edit
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', 'BB201656-00F7-4F16-997A-1F5EC58BDDD5'), -- Deals.Delete
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', '7002F164-89E3-4390-B9B4-0F9B90F398E2'), -- Projects.View
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', 'D40E61E6-9504-424C-AA51-F487EF8AD84F'), -- Projects.Create
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', 'DA5A3185-6321-4D8B-B65D-4FDCC937FA48'), -- Projects.Edit
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', 'A01E0FBA-8121-4E6D-A1F5-03C8A82E72EF'), -- Projects.Delete
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', '9996352E-DCD6-4D63-A376-959A0A3D076D'), -- Tasks.View
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', '4E3AFF73-08ED-4193-AD93-1D06304845A2'), -- Tasks.Create
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', '5B9EA68E-E672-4F31-A2A5-6BD25FE30C3A'), -- Tasks.Edit
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', '56D9002A-4B90-43B5-AA8F-285927B14532'), -- Tasks.Delete
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', '0FA06E3F-801D-476E-9529-082D23A23FEC'), -- Tickets.View
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', '2E7F3F8D-2B2D-4B17-8703-626A04FF79EB'), -- Tickets.Create
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', '2F265A10-9475-48D6-8C45-3E9756417804'), -- Tickets.Edit
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', 'A0A45241-914A-487A-9B2C-AFBE5ECA40FD'), -- Tickets.Delete
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', '6FE65976-34EA-4A46-901F-A14BB0008819'), -- Appointments.View
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', 'F38FF352-1C3E-4FA0-AC8E-2021AE2F783D'), -- Appointments.Create
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', 'AB2BD0AE-D27A-44F1-9DEA-8E8CC2B8A408'), -- Appointments.Edit
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', '31E72071-ED50-4D70-BD4F-ACA513467A64'), -- TeamMembers.View
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', '925C50FF-9287-4A46-8510-A45D879AD11E'), -- TeamMembers.Create
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', '6BAD902C-EC2D-4C9A-A09C-FA728BEF5A31'), -- TeamMembers.Edit
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', '10810D7C-BC67-4E43-84CB-A88296C943F2'), -- TeamMembers.Delete
(NEWID(), '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2', '476C7034-0BAE-4CD9-B96E-508A56E2F250'), -- AuditHistory.View

-- Manager
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', '1F97AAD5-4C41-4762-AFBA-D27804A61086'), -- Dashboard.View
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', '4DC7CC42-84AF-47B5-9665-9CA62CD1A97E'), -- Leads.View
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', '1237AE3D-1FC4-4FC5-BB28-297949AD2AC9'), -- Leads.Create
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', 'C648AE19-05E5-4324-BF86-F24DAC1DEB17'), -- Leads.Edit
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', '29C4E9E8-46BF-4158-8648-66A313F84F24'), -- Leads.Delete
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', 'A6986C3D-EE60-4A95-9236-5FA3F8EEA890'), -- Customers.View
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', '69AB287A-4D89-4466-82B9-CA1AFBADD5B5'), -- Customers.Create
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', '8A61BFD1-397A-4C28-9A3D-04E57875EDA7'), -- Customers.Edit
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', '57AA5737-8555-4918-B14D-5B8F275EA92D'), -- Customers.Delete
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', 'A751D405-B1DB-4537-8852-0DE6AA9C7B1E'), -- Deals.View
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', 'F72F2FC3-AAFD-4728-B521-C6AEA67F02D9'), -- Deals.Create
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', '80E66B5B-66F7-4614-8E4D-8B7C6410C4E4'), -- Deals.Edit
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', 'BB201656-00F7-4F16-997A-1F5EC58BDDD5'), -- Deals.Delete
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', '7002F164-89E3-4390-B9B4-0F9B90F398E2'), -- Projects.View
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', 'D40E61E6-9504-424C-AA51-F487EF8AD84F'), -- Projects.Create
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', 'DA5A3185-6321-4D8B-B65D-4FDCC937FA48'), -- Projects.Edit
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', 'A01E0FBA-8121-4E6D-A1F5-03C8A82E72EF'), -- Projects.Delete
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', '9996352E-DCD6-4D63-A376-959A0A3D076D'), -- Tasks.View
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', '4E3AFF73-08ED-4193-AD93-1D06304845A2'), -- Tasks.Create
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', '5B9EA68E-E672-4F31-A2A5-6BD25FE30C3A'), -- Tasks.Edit
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', '56D9002A-4B90-43B5-AA8F-285927B14532'), -- Tasks.Delete
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', '0FA06E3F-801D-476E-9529-082D23A23FEC'), -- Tickets.View
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', '2E7F3F8D-2B2D-4B17-8703-626A04FF79EB'), -- Tickets.Create
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', '2F265A10-9475-48D6-8C45-3E9756417804'), -- Tickets.Edit
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', 'A0A45241-914A-487A-9B2C-AFBE5ECA40FD'), -- Tickets.Delete
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', '6FE65976-34EA-4A46-901F-A14BB0008819'), -- Appointments.View
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', 'F38FF352-1C3E-4FA0-AC8E-2021AE2F783D'), -- Appointments.Create
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', 'AB2BD0AE-D27A-44F1-9DEA-8E8CC2B8A408'), -- Appointments.Edit
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', '31E72071-ED50-4D70-BD4F-ACA513467A64'), -- TeamMembers.View
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', '6BAD902C-EC2D-4C9A-A09C-FA728BEF5A31'), -- TeamMembers.Edit
(NEWID(), 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE', '476C7034-0BAE-4CD9-B96E-508A56E2F250'), -- AuditHistory.View

-- Business
(NEWID(), '210B7994-69BA-4138-B5AB-8A1497A4EE47', '1F97AAD5-4C41-4762-AFBA-D27804A61086'), -- Dashboard.View
(NEWID(), '210B7994-69BA-4138-B5AB-8A1497A4EE47', '4DC7CC42-84AF-47B5-9665-9CA62CD1A97E'), -- Leads.View
(NEWID(), '210B7994-69BA-4138-B5AB-8A1497A4EE47', '1237AE3D-1FC4-4FC5-BB28-297949AD2AC9'), -- Leads.Create
(NEWID(), '210B7994-69BA-4138-B5AB-8A1497A4EE47', 'C648AE19-05E5-4324-BF86-F24DAC1DEB17'), -- Leads.Edit
(NEWID(), '210B7994-69BA-4138-B5AB-8A1497A4EE47', 'A6986C3D-EE60-4A95-9236-5FA3F8EEA890'), -- Customers.View
(NEWID(), '210B7994-69BA-4138-B5AB-8A1497A4EE47', '69AB287A-4D89-4466-82B9-CA1AFBADD5B5'), -- Customers.Create
(NEWID(), '210B7994-69BA-4138-B5AB-8A1497A4EE47', '8A61BFD1-397A-4C28-9A3D-04E57875EDA7'), -- Customers.Edit
(NEWID(), '210B7994-69BA-4138-B5AB-8A1497A4EE47', 'A751D405-B1DB-4537-8852-0DE6AA9C7B1E'), -- Deals.View
(NEWID(), '210B7994-69BA-4138-B5AB-8A1497A4EE47', 'F72F2FC3-AAFD-4728-B521-C6AEA67F02D9'), -- Deals.Create
(NEWID(), '210B7994-69BA-4138-B5AB-8A1497A4EE47', '80E66B5B-66F7-4614-8E4D-8B7C6410C4E4'), -- Deals.Edit
(NEWID(), '210B7994-69BA-4138-B5AB-8A1497A4EE47', '9996352E-DCD6-4D63-A376-959A0A3D076D'), -- Tasks.View
(NEWID(), '210B7994-69BA-4138-B5AB-8A1497A4EE47', '4E3AFF73-08ED-4193-AD93-1D06304845A2'), -- Tasks.Create
(NEWID(), '210B7994-69BA-4138-B5AB-8A1497A4EE47', '5B9EA68E-E672-4F31-A2A5-6BD25FE30C3A'), -- Tasks.Edit
(NEWID(), '210B7994-69BA-4138-B5AB-8A1497A4EE47', '6FE65976-34EA-4A46-901F-A14BB0008819'), -- Appointments.View
(NEWID(), '210B7994-69BA-4138-B5AB-8A1497A4EE47', 'F38FF352-1C3E-4FA0-AC8E-2021AE2F783D'), -- Appointments.Create
(NEWID(), '210B7994-69BA-4138-B5AB-8A1497A4EE47', 'AB2BD0AE-D27A-44F1-9DEA-8E8CC2B8A408'), -- Appointments.Edit

-- Resource
(NEWID(), '37C1BB7F-188C-40DE-9169-FB714428B422', '1F97AAD5-4C41-4762-AFBA-D27804A61086'), -- Dashboard.View
(NEWID(), '37C1BB7F-188C-40DE-9169-FB714428B422', '7002F164-89E3-4390-B9B4-0F9B90F398E2'), -- Projects.View
(NEWID(), '37C1BB7F-188C-40DE-9169-FB714428B422', 'DA5A3185-6321-4D8B-B65D-4FDCC937FA48'), -- Projects.Edit
(NEWID(), '37C1BB7F-188C-40DE-9169-FB714428B422', '9996352E-DCD6-4D63-A376-959A0A3D076D'), -- Tasks.View
(NEWID(), '37C1BB7F-188C-40DE-9169-FB714428B422', '4E3AFF73-08ED-4193-AD93-1D06304845A2'), -- Tasks.Create
(NEWID(), '37C1BB7F-188C-40DE-9169-FB714428B422', '5B9EA68E-E672-4F31-A2A5-6BD25FE30C3A'), -- Tasks.Edit
(NEWID(), '37C1BB7F-188C-40DE-9169-FB714428B422', '6FE65976-34EA-4A46-901F-A14BB0008819'), -- Appointments.View

-- Viewer
(NEWID(), '15F41A7C-AD15-4FA5-A882-C783374AF9D4', '1F97AAD5-4C41-4762-AFBA-D27804A61086'), -- Dashboard.View
(NEWID(), '15F41A7C-AD15-4FA5-A882-C783374AF9D4', '4DC7CC42-84AF-47B5-9665-9CA62CD1A97E'), -- Leads.View
(NEWID(), '15F41A7C-AD15-4FA5-A882-C783374AF9D4', 'A6986C3D-EE60-4A95-9236-5FA3F8EEA890'), -- Customers.View
(NEWID(), '15F41A7C-AD15-4FA5-A882-C783374AF9D4', 'A751D405-B1DB-4537-8852-0DE6AA9C7B1E'), -- Deals.View
(NEWID(), '15F41A7C-AD15-4FA5-A882-C783374AF9D4', '9996352E-DCD6-4D63-A376-959A0A3D076D'), -- Tasks.View
(NEWID(), '15F41A7C-AD15-4FA5-A882-C783374AF9D4', '0FA06E3F-801D-476E-9529-082D23A23FEC'), -- Tickets.View
(NEWID(), '15F41A7C-AD15-4FA5-A882-C783374AF9D4', '6FE65976-34EA-4A46-901F-A14BB0008819'), -- Appointments.View
(NEWID(), '15F41A7C-AD15-4FA5-A882-C783374AF9D4', '7002F164-89E3-4390-B9B4-0F9B90F398E2'); -- Projects.View



-- Departments
DECLARE @BizMgmt UNIQUEIDENTIFIER = NEWID();
DECLARE @Dev UNIQUEIDENTIFIER = NEWID();
DECLARE @Design UNIQUEIDENTIFIER = NEWID();
DECLARE @ProjMgmt UNIQUEIDENTIFIER = NEWID();
DECLARE @Support UNIQUEIDENTIFIER = NEWID();
DECLARE @HR UNIQUEIDENTIFIER = NEWID();
DECLARE @Admin UNIQUEIDENTIFIER = NEWID();

INSERT INTO departments (id, name) VALUES
(@BizMgmt, 'Business Management'),
(@Dev, 'Development'),
(@Design, 'Design'),
(@ProjMgmt, 'Project Management'),
(@Support, 'Support'),
(@HR, 'Human Resources'),
(@Admin, 'Administration');

-- Designations
INSERT INTO designations (id, name, department_id) VALUES
-- Business Management
(NEWID(), 'BDE', @BizMgmt),
(NEWID(), 'Senior BDE', @BizMgmt),
(NEWID(), 'Business Development Manager', @BizMgmt),
(NEWID(), 'Director Business Development', @BizMgmt),
(NEWID(), 'Sales Executive', @BizMgmt),
(NEWID(), 'Sales Manager', @BizMgmt),
(NEWID(), 'Account Manager', @BizMgmt),

-- Development
(NEWID(), 'Software Engineer', @Dev),
(NEWID(), 'Senior Software Engineer', @Dev),
(NEWID(), 'Lead Developer', @Dev),
(NEWID(), 'Tech Lead', @Dev),
(NEWID(), 'Engineering Manager', @Dev),
(NEWID(), 'QA Engineer', @Dev),
(NEWID(), 'Senior QA Engineer', @Dev),
(NEWID(), 'DevOps Engineer', @Dev),

-- Design
(NEWID(), 'UI/UX Designer', @Design),
(NEWID(), 'Senior UI/UX Designer', @Design),
(NEWID(), 'Graphic Designer', @Design),
(NEWID(), 'Design Lead', @Design),

-- Project Management
(NEWID(), 'Project Coordinator', @ProjMgmt),
(NEWID(), 'Project Manager', @ProjMgmt),
(NEWID(), 'Senior Project Manager', @ProjMgmt),
(NEWID(), 'Program Manager', @ProjMgmt),

-- Support
(NEWID(), 'Support Executive', @Support),
(NEWID(), 'Senior Support Executive', @Support),
(NEWID(), 'Support Manager', @Support),
(NEWID(), 'Customer Success Executive', @Support),
(NEWID(), 'Customer Success Manager', @Support),

-- Human Resources
(NEWID(), 'Recruiter', @HR),
(NEWID(), 'Talent Acquisition Specialist', @HR),
(NEWID(), 'HR Executive', @HR),
(NEWID(), 'Senior HR Executive', @HR),
(NEWID(), 'HR Manager', @HR),

-- Administration
(NEWID(), 'Administrator', @Admin),
(NEWID(), 'Operations Executive', @Admin),
(NEWID(), 'Operations Manager', @Admin);




select *from access_levels;
select *from permissions;
select *from access_level_permissions;
select *from departments;
select *from designations;
select *from users;



UPDATE access_levels
SET access_level = 100
WHERE Id = '9D8BD8D7-E1E3-4781-94AD-ECA5B83695F2'; -- Admin Level

UPDATE access_levels
SET access_level = 70
WHERE Id = 'DA3709C3-23F8-4F08-8C8D-5610D9BAEECE'; -- Manager Level

UPDATE access_levels
SET access_level = 50
WHERE Id = '37C1BB7F-188C-40DE-9169-FB714428B422'; -- Resource Level

UPDATE access_levels
SET access_level = 40
WHERE Id = '210B7994-69BA-4138-B5AB-8A1497A4EE47'; -- Business Level

UPDATE access_levels
SET access_level = 10
WHERE Id = '15F41A7C-AD15-4FA5-A882-C783374AF9D4'; -- Viewer Level






























