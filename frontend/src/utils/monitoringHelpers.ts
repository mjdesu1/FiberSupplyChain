/**
 * Monitoring Helper Functions
 * Utility functions for monitoring operations
 */

import { MonitoringRecord, MonitoringStats, MonitoringFilters } from '../types/monitoring';

/**
 * Generate unique monitoring ID
 */
export const generateMonitoringId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `MON-${timestamp}-${random}`;
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format date for input field
 */
export const formatDateForInput = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

/**
 * Calculate days until next monitoring
 */
export const daysUntilMonitoring = (nextDate: string): number => {
  const next = new Date(nextDate);
  const today = new Date();
  
  // Normalize both dates to start of day for accurate comparison
  next.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = next.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if monitoring is overdue
 */
export const isOverdue = (nextDate: string | null | undefined): boolean => {
  if (!nextDate) return false;
  const days = daysUntilMonitoring(nextDate);
  return days < 0;
};

/**
 * Check if monitoring is upcoming (within 30 days and not overdue)
 */
export const isUpcoming = (nextDate: string | null | undefined): boolean => {
  if (!nextDate) return false;
  const days = daysUntilMonitoring(nextDate);
  return days >= 0;
};

/**
 * Get status badge color based on farm condition
 */
export const getConditionColor = (condition: string): string => {
  switch (condition) {
    case 'Healthy':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    case 'Needs Support':
      return 'bg-amber-100 text-amber-700 border-amber-300';
    case 'Damaged':
      return 'bg-red-100 text-red-700 border-red-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

/**
 * Get status badge color based on growth stage
 */
export const getGrowthStageColor = (stage: string): string => {
  switch (stage) {
    case 'Land Preparation':
    case 'Planting':
      return 'bg-blue-100 text-blue-700';
    case 'Seedling':
    case 'Vegetative':
      return 'bg-green-100 text-green-700';
    case 'Mature':
    case 'Ready for Harvest':
      return 'bg-purple-100 text-purple-700';
    case 'Harvesting':
    case 'Post-Harvest':
      return 'bg-orange-100 text-orange-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

/**
 * Calculate monitoring statistics
 * Uses latest record per farmer for upcoming/overdue counts
 */
export const calculateStats = (records: MonitoringRecord[]): MonitoringStats => {
  // Get latest Ongoing records per farmer for accurate upcoming/overdue counts
  const latestRecords = getLatestRecordPerFarmer(records);
  
  const stats: MonitoringStats = {
    totalMonitoring: records.length,
    healthyFarms: 0,
    needsSupport: 0,
    damagedFarms: 0,
    upcomingMonitoring: 0,
    overdueMonitoring: 0
  };

  // Count conditions from latest records only
  latestRecords.forEach(record => {
    if (record.farmCondition === 'Healthy') stats.healthyFarms++;
    if (record.farmCondition === 'Needs Support') stats.needsSupport++;
    if (record.farmCondition === 'Damaged') stats.damagedFarms++;
  });

  // Count upcoming and overdue from latest records only
  stats.upcomingMonitoring = getUpcomingMonitoring(records).length;
  stats.overdueMonitoring = getOverdueMonitoring(records).length;

  return stats;
};

/**
 * Filter monitoring records
 */
export const filterRecords = (
  records: MonitoringRecord[],
  filters: MonitoringFilters
): MonitoringRecord[] => {
  return records.filter(record => {
    // Date range filter
    if (filters.dateFrom && record.dateOfVisit < filters.dateFrom) return false;
    if (filters.dateTo && record.dateOfVisit > filters.dateTo) return false;

    // Farmer filter
    if (filters.farmerId && record.farmerId !== filters.farmerId) return false;

    // Condition filter
    if (filters.farmCondition && record.farmCondition !== filters.farmCondition) return false;

    // Growth stage filter
    if (filters.growthStage && record.growthStage !== filters.growthStage) return false;

    // Monitored by filter
    if (filters.monitoredBy && record.monitoredBy !== filters.monitoredBy) return false;

    return true;
  });
};

/**
 * Sort records by date (newest first)
 */
export const sortByDate = (records: MonitoringRecord[]): MonitoringRecord[] => {
  return [...records].sort((a, b) => 
    new Date(b.dateOfVisit).getTime() - new Date(a.dateOfVisit).getTime()
  );
};

/**
 * Get latest monitoring record per farmer
 * Returns only the most recent record for each farmer
 */
export const getLatestRecordPerFarmer = (records: MonitoringRecord[]): MonitoringRecord[] => {
  const farmerMap = new Map<string, MonitoringRecord>();
  
  records.forEach(record => {
    // Only consider Ongoing records
    if ((record as any).status !== 'Ongoing') return;
    
    const existing = farmerMap.get(record.farmerId);
    if (!existing || new Date(record.dateOfVisit) > new Date(existing.dateOfVisit)) {
      farmerMap.set(record.farmerId, record);
    }
  });
  
  return Array.from(farmerMap.values());
};

/**
 * Get upcoming monitoring records
 * Only shows the latest Ongoing record per farmer with future next_monitoring_date
 */
export const getUpcomingMonitoring = (records: MonitoringRecord[]): MonitoringRecord[] => {
  console.log('🔍 getUpcomingMonitoring: Input records:', records.length);
  
  // Get only latest Ongoing record per farmer
  const latestRecords = getLatestRecordPerFarmer(records);
  console.log('🔍 Latest records per farmer:', latestRecords.length);
  
  const upcoming = latestRecords
    .filter(record => {
      // Must have a next monitoring date and it must be in the future
      const hasDate = !!record.nextMonitoringDate;
      const isUpcomingDate = hasDate && isUpcoming(record.nextMonitoringDate);
      console.log(`  Record ${record.monitoringId}: hasDate=${hasDate}, nextDate=${record.nextMonitoringDate}, isUpcoming=${isUpcomingDate}`);
      return hasDate && isUpcomingDate;
    })
    .sort((a, b) => 
      new Date(a.nextMonitoringDate).getTime() - new Date(b.nextMonitoringDate).getTime()
    );
  
  console.log('✅ getUpcomingMonitoring: Returning', upcoming.length, 'records');
  return upcoming;
};

/**
 * Get overdue monitoring records
 * Only shows the latest Ongoing record per farmer that is overdue
 */
export const getOverdueMonitoring = (records: MonitoringRecord[]): MonitoringRecord[] => {
  console.log('🔍 getOverdueMonitoring: Input records:', records.length);
  
  // Get only latest Ongoing record per farmer
  const latestRecords = getLatestRecordPerFarmer(records);
  console.log('🔍 Latest records per farmer:', latestRecords.length);
  
  const overdue = latestRecords
    .filter(record => {
      // Must have a next monitoring date and it must be in the past
      const hasDate = !!record.nextMonitoringDate;
      const isOverdueDate = hasDate && isOverdue(record.nextMonitoringDate);
      console.log(`  Record ${record.monitoringId}: hasDate=${hasDate}, nextDate=${record.nextMonitoringDate}, isOverdue=${isOverdueDate}`);
      return hasDate && isOverdueDate;
    })
    .sort((a, b) => 
      new Date(a.nextMonitoringDate).getTime() - new Date(b.nextMonitoringDate).getTime()
    );
  
  console.log('✅ getOverdueMonitoring: Returning', overdue.length, 'records');
  return overdue;
};

/**
 * Validate monitoring form data
 */
export const validateMonitoringForm = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.dateOfVisit) errors.push('Date of visit is required');
  if (!data.monitoredBy) errors.push('Monitored by is required');
  if (!data.farmerName) errors.push('Farmer name is required');
  if (!data.farmCondition) errors.push('Farm condition is required');
  if (!data.growthStage) errors.push('Growth stage is required');
  if (!data.actionsTaken || data.actionsTaken.trim() === '') {
    errors.push('Actions taken is required');
  }
  if (!data.recommendations || data.recommendations.trim() === '') {
    errors.push('Recommendations is required');
  }
  
  // Only require next monitoring date if status is not Completed (i.e., not a final visit)
  if (data.status !== 'Completed' && !data.nextMonitoringDate) {
    errors.push('Next monitoring date is required');
  }

  // Validate date logic only if next monitoring date is provided
  if (data.dateOfVisit && data.nextMonitoringDate) {
    const visitDate = new Date(data.dateOfVisit);
    const nextDate = new Date(data.nextMonitoringDate);
    if (nextDate <= visitDate) {
      errors.push('Next monitoring date must be after the visit date');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Export monitoring records to CSV
 */
export const exportToCSV = (records: MonitoringRecord[]): string => {
  const headers = [
    'Monitoring ID',
    'Date of Visit',
    'Monitored By',
    'Farmer Name',
    'Association',
    'Farm Condition',
    'Growth Stage',
    'Issues Observed',
    'Actions Taken',
    'Recommendations',
    'Next Monitoring Date'
  ];

  const rows = records.map(record => [
    record.monitoringId,
    formatDate(record.dateOfVisit),
    record.monitoredBy,
    record.farmerName,
    record.associationName || 'N/A',
    record.farmCondition,
    record.growthStage,
    record.issuesObserved.join('; '),
    record.actionsTaken,
    record.recommendations,
    formatDate(record.nextMonitoringDate)
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
};

/**
 * Download CSV file
 */
export const downloadCSV = (records: MonitoringRecord[], filename: string = 'monitoring-records.csv'): void => {
  const csv = exportToCSV(records);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
