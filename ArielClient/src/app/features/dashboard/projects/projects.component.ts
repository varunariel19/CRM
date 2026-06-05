import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ProjectMember {
  id: number;
  name: string;
  role: string;
  avatar: string;
  initials: string;
}

export interface ProjectDocument {
  id: number;
  name: string;
  type: 'pdf' | 'doc' | 'xls' | 'img' | 'other';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'on-hold' | 'completed' | 'planning';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  startDate: string;
  deadline: string;
  client: string;
  budget: string;
  tags: string[];
  members: ProjectMember[];
  documents: ProjectDocument[];
  tasksTotal: number;
  tasksCompleted: number;
  color: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {

  searchQuery = signal('');
  filterStatus = signal('all');
  filterPriority = signal('all');
  selectedProject = signal<Project | null>(null);
  activeTab = signal<'overview' | 'members' | 'documents' | 'activity'>('overview');
  isModalOpen = signal(false);

  projects = signal<Project[]>([
    {
      id: 1,
      title: 'CRM Platform Redesign',
      description: 'Complete overhaul of the customer relationship management platform with modern UI/UX, improved performance, and new features including AI-driven insights and automation workflows.',
      status: 'active',
      priority: 'critical',
      progress: 68,
      startDate: 'Jan 15, 2025',
      deadline: 'Aug 30, 2025',
      client: 'Internal',
      budget: '$120,000',
      tags: ['Design', 'Development', 'AI'],
      members: [
        { id: 1, name: 'Arjun Sharma', role: 'Project Lead', avatar: '', initials: 'AS' },
        { id: 2, name: 'Priya Nair', role: 'UI/UX Designer', avatar: '', initials: 'PN' },
        { id: 3, name: 'Rahul Mehta', role: 'Backend Dev', avatar: '', initials: 'RM' },
        { id: 4, name: 'Sneha Kapoor', role: 'Frontend Dev', avatar: '', initials: 'SK' },
        { id: 5, name: 'Vikram Das', role: 'QA Engineer', avatar: '', initials: 'VD' },
      ],
      documents: [
        { id: 1, name: 'Project Brief.pdf', type: 'pdf', size: '2.4 MB', uploadedBy: 'Arjun Sharma', uploadedAt: 'Jan 16, 2025' },
        { id: 2, name: 'Design Mockups.fig', type: 'img', size: '18.2 MB', uploadedBy: 'Priya Nair', uploadedAt: 'Feb 3, 2025' },
        { id: 3, name: 'Tech Spec.docx', type: 'doc', size: '540 KB', uploadedBy: 'Rahul Mehta', uploadedAt: 'Feb 10, 2025' },
      ],
      tasksTotal: 84,
      tasksCompleted: 57,
      color: '#2563eb'
    },
    {
      id: 2,
      title: 'Mobile App – Customer Portal',
      description: 'Native mobile application for customers to track orders, raise tickets, manage their profile, and interact with support agents in real-time.',
      status: 'active',
      priority: 'high',
      progress: 42,
      startDate: 'Mar 1, 2025',
      deadline: 'Oct 15, 2025',
      client: 'RetailCorp Ltd.',
      budget: '$85,000',
      tags: ['Mobile', 'iOS', 'Android'],
      members: [
        { id: 1, name: 'Kavya Reddy', role: 'Project Manager', avatar: '', initials: 'KR' },
        { id: 2, name: 'Amit Joshi', role: 'iOS Developer', avatar: '', initials: 'AJ' },
        { id: 3, name: 'Meera Singh', role: 'Android Dev', avatar: '', initials: 'MS' },
        { id: 4, name: 'Tarun Verma', role: 'API Engineer', avatar: '', initials: 'TV' },
      ],
      documents: [
        { id: 1, name: 'App Wireframes.pdf', type: 'pdf', size: '5.1 MB', uploadedBy: 'Kavya Reddy', uploadedAt: 'Mar 5, 2025' },
        { id: 2, name: 'API Contracts.xls', type: 'xls', size: '320 KB', uploadedBy: 'Tarun Verma', uploadedAt: 'Mar 12, 2025' },
      ],
      tasksTotal: 62,
      tasksCompleted: 26,
      color: '#7c3aed'
    },
    {
      id: 3,
      title: 'Data Analytics Dashboard',
      description: 'Executive-level analytics dashboard with real-time KPI monitoring, customizable widgets, and automated weekly reports delivered via email.',
      status: 'planning',
      priority: 'medium',
      progress: 12,
      startDate: 'May 20, 2025',
      deadline: 'Dec 1, 2025',
      client: 'FinEdge Solutions',
      budget: '$55,000',
      tags: ['Analytics', 'BI', 'Reports'],
      members: [
        { id: 1, name: 'Neha Gupta', role: 'Business Analyst', avatar: '', initials: 'NG' },
        { id: 2, name: 'Ravi Kumar', role: 'Data Engineer', avatar: '', initials: 'RK' },
        { id: 3, name: 'Deepa Pillai', role: 'Frontend Dev', avatar: '', initials: 'DP' },
      ],
      documents: [
        { id: 1, name: 'Requirements.docx', type: 'doc', size: '890 KB', uploadedBy: 'Neha Gupta', uploadedAt: 'May 22, 2025' },
      ],
      tasksTotal: 40,
      tasksCompleted: 5,
      color: '#059669'
    },
    {
      id: 4,
      title: 'Legacy System Migration',
      description: 'Migration of legacy on-premise infrastructure to AWS cloud with zero downtime strategy, data integrity validation, and rollback planning.',
      status: 'on-hold',
      priority: 'high',
      progress: 29,
      startDate: 'Nov 10, 2024',
      deadline: 'Sep 30, 2025',
      client: 'Internal',
      budget: '$200,000',
      tags: ['Cloud', 'AWS', 'DevOps'],
      members: [
        { id: 1, name: 'Suresh Nambiar', role: 'Architect', avatar: '', initials: 'SN' },
        { id: 2, name: 'Pooja Bhat', role: 'DevOps Engineer', avatar: '', initials: 'PB' },
        { id: 3, name: 'Kiran Rao', role: 'DB Admin', avatar: '', initials: 'KR' },
        { id: 4, name: 'Anand Mohan', role: 'Backend Dev', avatar: '', initials: 'AM' },
        { id: 5, name: 'Lakshmi R.', role: 'QA Lead', avatar: '', initials: 'LR' },
        { id: 6, name: 'Sanjay Patel', role: 'Security Eng.', avatar: '', initials: 'SP' },
      ],
      documents: [
        { id: 1, name: 'Migration Plan.pdf', type: 'pdf', size: '3.7 MB', uploadedBy: 'Suresh Nambiar', uploadedAt: 'Nov 15, 2024' },
        { id: 2, name: 'Risk Assessment.docx', type: 'doc', size: '1.2 MB', uploadedBy: 'Suresh Nambiar', uploadedAt: 'Nov 18, 2024' },
        { id: 3, name: 'Cost Breakdown.xls', type: 'xls', size: '210 KB', uploadedBy: 'Pooja Bhat', uploadedAt: 'Dec 1, 2024' },
        { id: 4, name: 'Architecture Diagram.pdf', type: 'pdf', size: '4.4 MB', uploadedBy: 'Suresh Nambiar', uploadedAt: 'Dec 8, 2024' },
      ],
      tasksTotal: 110,
      tasksCompleted: 32,
      color: '#d97706'
    },
    {
      id: 5,
      title: 'Email Marketing Automation',
      description: 'Build automated email campaign system with segmentation, A/B testing, drip sequences, and detailed open/click analytics.',
      status: 'completed',
      priority: 'medium',
      progress: 100,
      startDate: 'Sep 1, 2024',
      deadline: 'Feb 28, 2025',
      client: 'BrandBoost Agency',
      budget: '$38,000',
      tags: ['Marketing', 'Automation', 'Email'],
      members: [
        { id: 1, name: 'Divya Menon', role: 'Project Manager', avatar: '', initials: 'DM' },
        { id: 2, name: 'Rohan Seth', role: 'Full Stack Dev', avatar: '', initials: 'RS' },
        { id: 3, name: 'Aisha Khan', role: 'Content Strategist', avatar: '', initials: 'AK' },
      ],
      documents: [
        { id: 1, name: 'Campaign Templates.zip', type: 'other', size: '12 MB', uploadedBy: 'Aisha Khan', uploadedAt: 'Sep 20, 2024' },
        { id: 2, name: 'Final Report.pdf', type: 'pdf', size: '1.8 MB', uploadedBy: 'Divya Menon', uploadedAt: 'Mar 1, 2025' },
      ],
      tasksTotal: 48,
      tasksCompleted: 48,
      color: '#db2777'
    },
    {
      id: 6,
      title: 'E-Commerce Platform v2',
      description: 'Second-generation e-commerce platform with headless architecture, advanced product filtering, multi-currency support, and integrated payment gateways.',
      status: 'active',
      priority: 'critical',
      progress: 55,
      startDate: 'Feb 10, 2025',
      deadline: 'Nov 30, 2025',
      client: 'ShopSmart Inc.',
      budget: '$165,000',
      tags: ['E-Commerce', 'Payments', 'Headless'],
      members: [
        { id: 1, name: 'Gaurav Tiwari', role: 'Tech Lead', avatar: '', initials: 'GT' },
        { id: 2, name: 'Swati Iyer', role: 'Frontend Dev', avatar: '', initials: 'SI' },
        { id: 3, name: 'Nikhil Bajaj', role: 'Backend Dev', avatar: '', initials: 'NB' },
        { id: 4, name: 'Ritika Shah', role: 'Product Designer', avatar: '', initials: 'RS' },
      ],
      documents: [
        { id: 1, name: 'Product Roadmap.pdf', type: 'pdf', size: '2.9 MB', uploadedBy: 'Gaurav Tiwari', uploadedAt: 'Feb 12, 2025' },
        { id: 2, name: 'UI Kit.fig', type: 'img', size: '22.5 MB', uploadedBy: 'Ritika Shah', uploadedAt: 'Feb 28, 2025' },
        { id: 3, name: 'DB Schema.xls', type: 'xls', size: '480 KB', uploadedBy: 'Nikhil Bajaj', uploadedAt: 'Mar 5, 2025' },
      ],
      tasksTotal: 130,
      tasksCompleted: 71,
      color: '#0891b2'
    }
  ]);

  filteredProjects = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const s = this.filterStatus();
    const p = this.filterPriority();
    return this.projects().filter(proj => {
      const matchSearch = proj.title.toLowerCase().includes(q) || proj.client.toLowerCase().includes(q) || proj.tags.some(t => t.toLowerCase().includes(q));
      const matchStatus = s === 'all' || proj.status === s;
      const matchPriority = p === 'all' || proj.priority === p;
      return matchSearch && matchStatus && matchPriority;
    });
  });

  statusCounts = computed(() => {
    const all = this.projects();
    return {
      total: all.length,
      active: all.filter(p => p.status === 'active').length,
      planning: all.filter(p => p.status === 'planning').length,
      onHold: all.filter(p => p.status === 'on-hold').length,
      completed: all.filter(p => p.status === 'completed').length,
    };
  });

  openProject(project: Project) {
    this.selectedProject.set(project);
    this.activeTab.set('overview');
    this.isModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedProject.set(null);
    document.body.style.overflow = '';
  }

  setTab(tab: 'overview' | 'members' | 'documents' | 'activity') {
    this.activeTab.set(tab);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'active': 'status-active',
      'on-hold': 'status-hold',
      'completed': 'status-completed',
      'planning': 'status-planning'
    };
    return map[status] || '';
  }

  getPriorityClass(priority: string): string {
    const map: Record<string, string> = {
      'low': 'priority-low',
      'medium': 'priority-medium',
      'high': 'priority-high',
      'critical': 'priority-critical'
    };
    return map[priority] || '';
  }

  getDocIcon(type: string): string {
    const map: Record<string, string> = {
      'pdf': '📄',
      'doc': '📝',
      'xls': '📊',
      'img': '🖼️',
      'other': '📦'
    };
    return map[type] || '📄';
  }

  getDaysLeft(deadline: string): number {
    const d = new Date(deadline);
    const today = new Date();
    return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  formatDaysLeft(deadline: string): string {
    const days = this.getDaysLeft(deadline);
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'Due today';
    return `${days}d left`;
  }

  isOverdue(deadline: string): boolean {
    return this.getDaysLeft(deadline) < 0;
  }

  getProgressColor(progress: number, status: string): string {
    if (status === 'completed') return '#059669';
    if (progress < 25) return '#ef4444';
    if (progress < 60) return '#f59e0b';
    return '#2563eb';
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }
}