import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-task-follow-up',
  imports: [CommonModule, FormsModule],

  templateUrl: './task-follow-up.component.html',
  styleUrl: './task-follow-up.component.css',
})


export class TasksFollowupsComponent {

  activeTab: 'pending' | 'completed' | 'all' = 'all';

  teamMembers : any[] = [];
  leads : any[] = [] ;
  deals : any[] = [];

  tasks = [
    {
      id: 1,
      title: 'Follow-up Call on Proposal',
      type: 'CALL',
      dueDate: '2026-05-29',
      lead: 'John Doe (Acme Corp)',
      rep: 'David Carter',
      completed: false,
    },

    {
      id: 2,
      title: 'Prepare Technical Architecture Demo',
      type: 'DEMO',
      dueDate: '2026-05-31',
      lead: 'Cloud Infrastructure Migration',
      rep: 'David Carter',
      completed: true,
    },

    {
      id: 3,
      title: 'Send Introductory Email Campaign',
      type: 'EMAIL',
      dueDate: '2026-05-27',
      lead: 'Carol Williams (Hyperion Labs)',
      rep: 'David Carter',
      completed: true,
    },

    {
      id: 4,
      title: 'Introductory Discovery Meeting',
      type: 'MEETING',
      dueDate: '2026-05-30',
      lead: 'Alice Smith (Vertex Solutions)',
      rep: 'Sarah Miller',
      completed: true,
    },
  ];

  showCreateModal = false;
  newTask: any = { leadId: null, dealId: null };

  closeModal(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showCreateModal = false;
    }
  }

  submitTask(): void {
    this.showCreateModal = false;
    this.newTask = { leadId: null, dealId: null };
  }

  filteredTasks() {

    if (this.activeTab === 'pending') {
      return this.tasks.filter((t) => !t.completed);
    }

    if (this.activeTab === 'completed') {
      return this.tasks.filter((t) => t.completed);
    }

    return this.tasks;
  }

  toggleTask(task: any) {
    task.completed = !task.completed;
  }

  deleteTask(id: number) {
    this.tasks = this.tasks.filter((t) => t.id !== id);
  }

  addTask() {

    const title = prompt('Enter task title');

    if (!title) return;

    this.tasks.unshift({
      id: Date.now(),
      title,
      type: 'CALL',
      dueDate: '2026-06-01',
      lead: 'New Client',
      rep: 'David Carter',
      completed: false,
    });
  }

}