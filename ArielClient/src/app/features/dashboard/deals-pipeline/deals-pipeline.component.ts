import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-deals-pipeline',
  imports: [CommonModule],

  templateUrl: './deals-pipeline.component.html',
  styleUrl: './deals-pipeline.component.css',
})

export class DealsPipelineComponent {

  draggedDeal: any = null;
  draggedFrom = '';

  columns = [
    {
      key: 'proposal',
      title: 'PROPOSAL',
      color: '#2563eb',
      deals: [
        {
          id: 1,
          title: 'Custom CRM Development',
          company: 'Hyperion Labs',
          value: 72000,
          closeDate: '2026-05-27',
          owner: 'David Carter',
        },
      ],
    },

    {
      key: 'negotiation',
      title: 'NEGOTIATION',
      color: '#f59e0b',
      deals: [],
    },

    {
      key: 'won',
      title: 'WON',
      color: '#10b981',
      deals: [
        {
          id: 2,
          title: 'Cybersecurity Threat Audit',
          company: 'Vertex Solutions',
          value: 18000,
          closeDate: '2026-06-22',
          owner: 'Varun Ariel',
        },
        {
          id: 3,
          title: 'Managed Kubernetes Hosting',
          company: 'Nexus Tech',
          value: 34000,
          closeDate: '2026-05-22',
          owner: 'Sarah Miller',
        },
      ],
    },

    {
      key: 'lost',
      title: 'LOST',
      color: '#ef4444',
      deals: [
        {
          id: 4,
          title: 'Cloud Infrastructure Migration',
          company: 'Acme Corp',
          value: 45000,
          closeDate: '2026-06-12',
          owner: 'David Carter',
        },
      ],
    },
  ];

  getTotal(deals: any[]) {
    return deals.reduce((sum, deal) => sum + deal.value, 0);
  }

  dragDeal(event: DragEvent, deal: any, columnKey: string) {

    this.draggedDeal = deal;
    this.draggedFrom = columnKey;

  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  dropDeal(event: DragEvent, targetColumn: string) {

    event.preventDefault();

    if (!this.draggedDeal) return;

    const source = this.columns.find(
      (c) => c.key === this.draggedFrom
    );

    const target = this.columns.find(
      (c) => c.key === targetColumn
    );

    if (!source || !target) return;

    source.deals = source.deals.filter(
      (d) => d.id !== this.draggedDeal.id
    );

    target.deals.push(this.draggedDeal);

    this.draggedDeal = null;
  }

  moveLeft(currentKey: string, deal: any) {

    const currentIndex = this.columns.findIndex(
      (c) => c.key === currentKey
    );

    if (currentIndex <= 0) return;

    this.moveDeal(
      currentKey,
      this.columns[currentIndex - 1].key,
      deal
    );
  }

  moveRight(currentKey: string, deal: any) {

    const currentIndex = this.columns.findIndex(
      (c) => c.key === currentKey
    );

    if (currentIndex >= this.columns.length - 1) return;

    this.moveDeal(
      currentKey,
      this.columns[currentIndex + 1].key,
      deal
    );
  }

  moveDeal(from: string, to: string, deal: any) {

    const source = this.columns.find((c) => c.key === from);
    const target = this.columns.find((c) => c.key === to);

    if (!source || !target) return;

    source.deals = source.deals.filter(
      (d) => d.id !== deal.id
    );

    target.deals.push(deal);
  }

  editDeal(deal: any) {

    const title = prompt(
      'Edit Deal Title',
      deal.title
    );

    if (title) {
      deal.title = title;
    }
  }

  createDeal() {

    const title = prompt('Deal title');

    if (!title) return;

    this.columns[0].deals.push({
      id: Date.now(),
      title,
      company: 'New Company',
      value: 10000,
      closeDate: '2026-08-10',
      owner: 'David Carter',
    });
  }

}