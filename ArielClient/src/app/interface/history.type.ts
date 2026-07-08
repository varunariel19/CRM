import { UserSummary } from "../core/types/auth.type";

export interface HistoryResponseDto {
  id: string;
  entityName: string;
  entityId: string;
  entityDisplayName?: string;
  title: string;
  actionType: string;
  revertType: string;
  diffData?: string;
  affectedFields?: string;
  previousState?: string;
  updatedState?: string;
  isReverted: boolean;
  revertedAt?: string;
  status: string;
  source: string;
  ipAddress?: string;
  correlationId?: string;
  initiatedAt: string;
 commitedBy : UserSummary;
}

export interface PaginatedHistoryDto {
  items: HistoryResponseDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface HistoryFilterDto {
  page?: number;
  pageSize?: number;
  actionType?: string;
  isReverted?: boolean;
  from?: string;
  to?: string;
}
