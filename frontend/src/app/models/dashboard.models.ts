export interface DashboardStats {
  pendingCount: number;
  draftCount: number;
  completedCount: number;
  totalCount: number;
}

export interface StatCard {
  label: string;
  value: number;
  icon: string;
  type: 'primary' | 'warning' | 'success' | 'info';
}