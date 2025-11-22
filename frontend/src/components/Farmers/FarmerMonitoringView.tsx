import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Eye,
  Leaf,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  X
} from 'lucide-react';
import { MonitoringRecord } from '../../types/monitoring';
import {
  formatDate,
  daysUntilMonitoring,
  getConditionColor,
  getGrowthStageColor
} from '../../utils/monitoringHelpers';

/**
 * Farmer Monitoring View
 * Allows farmers to view their own monitoring records from MAO visits
 */

const FarmerMonitoringView: React.FC = () => {
  const [records, setRecords] = useState<MonitoringRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<MonitoringRecord | null>(null);

  useEffect(() => {
    fetchMyMonitoringRecords();
  }, []);

  const fetchMyMonitoringRecords = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3001/api/farmers/monitoring', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch monitoring records');
      }

      const data = await response.json();
      console.log('Farmer monitoring records loaded:', data);
      
      // Map API response to MonitoringRecord format
      const mappedRecords: MonitoringRecord[] = data.records?.map((record: any) => ({
        monitoringId: record.monitoring_id,
        dateOfVisit: record.date_of_visit,
        monitoredBy: record.monitored_by,
        monitoredByRole: record.monitored_by_role,
        farmerId: record.farmer_id,
        farmerName: record.farmer_name,
        associationName: record.association_name,
        farmLocation: record.farm_location,
        farmCondition: record.farm_condition,
        growthStage: record.growth_stage,
        issuesObserved: record.issues_observed || [],
        otherIssues: record.other_issues,
        actionsTaken: record.actions_taken,
        recommendations: record.recommendations,
        nextMonitoringDate: record.next_monitoring_date,
        weatherCondition: record.weather_condition,
        estimatedYield: record.estimated_yield,
        remarks: record.remarks,
        photoUrls: record.photo_urls,
        createdAt: record.created_at,
        updatedAt: record.updated_at
      })) || [];

      setRecords(mappedRecords);
    } catch (error) {
      console.error('Error fetching monitoring records:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading monitoring records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-xl p-6 group hover:scale-105 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">Total</span>
            </div>
            <p className="text-4xl font-black text-white mb-1">{records.length}</p>
            <p className="text-emerald-100 text-sm font-medium">MAO Visits</p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-xl p-6 group hover:scale-105 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">Upcoming</span>
            </div>
            <p className="text-lg font-bold text-white mb-1">
              {records.length > 0 ? formatDate(records[0].nextMonitoringDate) : 'Not scheduled'}
            </p>
            <p className="text-blue-100 text-sm font-medium">Next Visit</p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-xl p-6 group hover:scale-105 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">Status</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              {records.length > 0 ? records[0].farmCondition : 'No data'}
            </p>
            <p className="text-green-100 text-sm font-medium">Farm Condition</p>
          </div>
        </div>
      </div>

      {/* Monitoring Records */}
      <div className="space-y-4">
        {records.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-20 text-center border-2 border-dashed border-gray-300">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No monitoring records yet</h3>
            <p className="text-gray-600 text-base">Your MAO visit records will appear here</p>
          </div>
        ) : (
          records.map((record) => (
            <div key={record.monitoringId} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-emerald-500 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <Leaf className="w-5 h-5 text-emerald-600" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">Farm Visit Report</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span>Officer:</span>
                          <span className="font-semibold text-gray-900">{record.monitoredBy}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block text-xs font-mono text-white bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 rounded-lg shadow-md">
                          {record.monitoringId}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Visit Date</p>
                        <p className="text-sm font-bold text-gray-900">{formatDate(record.dateOfVisit)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Farm Condition</p>
                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${getConditionColor(record.farmCondition)}`}>
                          {record.farmCondition}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Growth Stage</p>
                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${getGrowthStageColor(record.growthStage)}`}>
                          {record.growthStage}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Est. Yield</p>
                        <p className="text-sm font-bold text-gray-900">{record.estimatedYield || 'N/A'} kg</p>
                      </div>
                    </div>

                    {record.issuesObserved.length > 0 && (
                      <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800 font-bold mb-2 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Issues Observed
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {record.issuesObserved.map((issue, idx) => (
                            <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-md">
                              {issue}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg p-4 mb-4 shadow-md">
                      <p className="text-sm text-white font-bold mb-2 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Recommendations
                      </p>
                      <p className="text-sm text-white/95 leading-relaxed">{record.recommendations}</p>
                    </div>

                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-4 shadow-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-white/80 font-semibold mb-1">Next Monitoring</p>
                          <p className="text-lg font-bold text-white">
                            {formatDate(record.nextMonitoringDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs font-bold">
                            {daysUntilMonitoring(record.nextMonitoringDate) >= 0 
                              ? `${daysUntilMonitoring(record.nextMonitoringDate)} days`
                              : `${Math.abs(daysUntilMonitoring(record.nextMonitoringDate))} days overdue`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-2">
                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="flex-1 lg:flex-none px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-105"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Details Modal - Complete Information */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-2xl z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Complete Monitoring Report</h2>
                  <p className="text-emerald-100 text-sm">Full details of farm visit</p>
                </div>
                <button 
                  onClick={() => setSelectedRecord(null)} 
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Basic Information */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                  <Calendar className="w-5 h-5 mr-2 text-emerald-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1 font-semibold">Monitoring ID</p>
                    <p className="font-mono text-sm font-bold text-gray-900">{selectedRecord.monitoringId}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1 font-semibold">Date of Visit</p>
                    <p className="text-sm font-bold text-gray-900">{formatDate(selectedRecord.dateOfVisit)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1 font-semibold">Monitored By (Officer)</p>
                    <p className="text-sm font-bold text-gray-900">{selectedRecord.monitoredBy}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1 font-semibold">Farmer Name</p>
                    <p className="text-sm font-bold text-gray-900">{selectedRecord.farmerName}</p>
                  </div>
                  {selectedRecord.associationName && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1 font-semibold">Association</p>
                      <p className="text-sm font-bold text-gray-900">{selectedRecord.associationName}</p>
                    </div>
                  )}
                  {selectedRecord.farmLocation && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1 font-semibold">Farm Location</p>
                      <p className="text-sm font-bold text-gray-900">{selectedRecord.farmLocation}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Farm Assessment */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                  <Leaf className="w-5 h-5 mr-2 text-green-600" />
                  Farm Assessment
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-gray-500 mb-2 font-semibold">Farm Condition</p>
                    <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold ${getConditionColor(selectedRecord.farmCondition)}`}>
                      {selectedRecord.farmCondition}
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-gray-500 mb-2 font-semibold">Growth Stage</p>
                    <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold ${getGrowthStageColor(selectedRecord.growthStage)}`}>
                      {selectedRecord.growthStage}
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-gray-500 mb-1 font-semibold">Weather Condition</p>
                    <p className="text-sm font-bold text-gray-900">{selectedRecord.weatherCondition || 'N/A'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-gray-500 mb-1 font-semibold">Estimated Yield</p>
                    <p className="text-sm font-bold text-gray-900">{selectedRecord.estimatedYield ? `${selectedRecord.estimatedYield} kg` : 'N/A'}</p>
                  </div>
                </div>

                {/* Issues Observed */}
                {selectedRecord.issuesObserved && selectedRecord.issuesObserved.length > 0 && (
                  <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800 font-bold mb-3 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      Issues Observed
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecord.issuesObserved.map((issue, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-red-100 text-red-800 text-xs font-bold rounded-lg border border-red-300">
                          {issue}
                        </span>
                      ))}
                    </div>
                    {selectedRecord.otherIssues && (
                      <div className="mt-3 bg-white rounded-lg p-3 border border-red-200">
                        <p className="text-xs text-red-700 font-semibold mb-1">Other Issues</p>
                        <p className="text-sm text-gray-800">{selectedRecord.otherIssues}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions and Recommendations */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-5 shadow-lg">
                <h3 className="font-bold text-white mb-4 flex items-center text-lg">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Actions & Recommendations
                </h3>
                <div className="space-y-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm text-emerald-700 font-bold mb-2">Actions Taken</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedRecord.actionsTaken}</p>
                  </div>
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm text-emerald-700 font-bold mb-2">Recommendations</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedRecord.recommendations}</p>
                  </div>
                  {selectedRecord.remarks && (
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-sm text-emerald-700 font-bold mb-2">Additional Remarks</p>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedRecord.remarks}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Monitoring */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 shadow-lg">
                <h3 className="font-bold text-white mb-3 flex items-center text-lg">
                  <Calendar className="w-5 h-5 mr-2" />
                  Next Monitoring Schedule
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-100 mb-1">Scheduled Date</p>
                    <p className="text-2xl font-bold text-white">{formatDate(selectedRecord.nextMonitoringDate)}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white font-bold">
                      {daysUntilMonitoring(selectedRecord.nextMonitoringDate) >= 0 
                        ? `In ${daysUntilMonitoring(selectedRecord.nextMonitoringDate)} days`
                        : `${Math.abs(daysUntilMonitoring(selectedRecord.nextMonitoringDate))} days overdue`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              {(selectedRecord.createdAt || selectedRecord.updatedAt) && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-bold text-gray-700 mb-3 text-sm">Record Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {selectedRecord.createdAt && (
                      <div>
                        <p className="text-gray-500 mb-1">Created At</p>
                        <p className="text-gray-700 font-mono">{new Date(selectedRecord.createdAt).toLocaleString()}</p>
                      </div>
                    )}
                    {selectedRecord.updatedAt && (
                      <div>
                        <p className="text-gray-500 mb-1">Last Updated</p>
                        <p className="text-gray-700 font-mono">{new Date(selectedRecord.updatedAt).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all font-semibold shadow-md hover:shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerMonitoringView;
