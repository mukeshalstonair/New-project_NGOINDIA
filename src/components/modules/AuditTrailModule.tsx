import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Calendar, User, Activity, RefreshCw } from 'lucide-react';

interface AuditLog {
  log_id: number;
  user_id: number | null;
  action_type: string;
  action_description: string;
  entity_name: string;
  entity_id: string | null;
  previous_values: any;
  new_values: any;
  text_content: string | null;
  image_data: any;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}

interface Filters {
  user_id: string;
  action_type: string;
  entity_name: string;
  date_from: string;
  date_to: string;
}

export function AuditTrailModule() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    user_id: '',
    action_type: '',
    entity_name: '',
    date_from: '',
    date_to: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await fetch(`http://localhost/NGO-India/backend/audit_trail_api.php?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setLogs(result.data);
        setPagination(prev => ({ ...prev, ...result.pagination }));
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, filters]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const exportLogs = (format: 'csv' | 'json') => {
    const params = new URLSearchParams({
      format,
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
    });
    window.open(`http://localhost/NGO-India/backend/export_audit_logs.php?${params}`, '_blank');
  };

  const viewLogDetails = async (logId: number) => {
    try {
      const response = await fetch(`http://localhost/NGO-India/backend/audit_trail_api.php?id=${logId}`);
      const result = await response.json();
      
      if (result.success) {
        setSelectedLog(result.data);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching log details:', error);
    }
  };

  const getActionTypeColor = (actionType: string) => {
    const colors = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
      LOGIN: 'bg-purple-100 text-purple-800',
      LOGOUT: 'bg-gray-100 text-gray-800',
      ROLE_CHANGE: 'bg-orange-100 text-orange-800',
      UPLOAD: 'bg-indigo-100 text-indigo-800',
      TEXT_CHANGE: 'bg-yellow-100 text-yellow-800'
    };
    return colors[actionType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Activity className="w-7 h-7 text-orange-500" />
            Audit Trail
          </h1>
          <p className="text-gray-600">Monitor all system activities and changes</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => exportLogs('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={() => exportLogs('json')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Download className="w-4 h-4" />
            JSON
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-orange-500" />
          <h2 className="font-semibold text-gray-900">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input
              type="text"
              value={filters.user_id}
              onChange={(e) => handleFilterChange('user_id', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
              placeholder="Enter user ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
            <select
              value={filters.action_type}
              onChange={(e) => handleFilterChange('action_type', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="ROLE_CHANGE">Role Change</option>
              <option value="UPLOAD">Upload</option>
              <option value="TEXT_CHANGE">Text Change</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity</label>
            <select
              value={filters.entity_name}
              onChange={(e) => handleFilterChange('entity_name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Entities</option>
              <option value="donors">Donors</option>
              <option value="donations">Donations</option>
              <option value="projects">Projects</option>
              <option value="campaigns">Campaigns</option>
              <option value="users">Users</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No audit logs found</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{log.log_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {log.user_id || 'System'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionTypeColor(log.action_type)}`}>
                        {log.action_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{log.entity_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{log.action_description}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{log.ip_address}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => viewLogDetails(log.log_id)}
                        className="text-orange-600 hover:text-orange-900 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                disabled={pagination.page === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                  <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setPagination(prev => ({ ...prev, page }))}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pagination.page
                            ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Log Details */}
      {showModal && selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Audit Log Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Log ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.log_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.user_id || 'System'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Action Type</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionTypeColor(selectedLog.action_type)}`}>
                      {selectedLog.action_type}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Entity</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.entity_name}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.action_description}</p>
                </div>
                
                {selectedLog.previous_values && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Previous Values</label>
                    <pre className="mt-1 text-sm text-gray-900 bg-gray-100 p-3 rounded overflow-auto max-h-40">
                      {JSON.stringify(JSON.parse(selectedLog.previous_values), null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedLog.new_values && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">New Values</label>
                    <pre className="mt-1 text-sm text-gray-900 bg-gray-100 p-3 rounded overflow-auto max-h-40">
                      {JSON.stringify(JSON.parse(selectedLog.new_values), null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedLog.text_content && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Text Changes</label>
                    <div className="mt-1 text-sm text-gray-900 bg-yellow-50 p-3 rounded border border-yellow-200">
                      {(() => {
                        try {
                          const textData = JSON.parse(selectedLog.text_content);
                          return (
                            <div className="space-y-2">
                              <p><strong>Field:</strong> {textData.field}</p>
                              <p><strong>Character Change:</strong> {textData.char_diff > 0 ? '+' : ''}{textData.char_diff}</p>
                              <p><strong>Word Change:</strong> {textData.words_added > 0 ? '+' : ''}{textData.words_added}</p>
                              <p><strong>Similarity:</strong> {textData.similarity_percent}%</p>
                            </div>
                          );
                        } catch {
                          return <p>{selectedLog.text_content}</p>;
                        }
                      })()} 
                    </div>
                  </div>
                )}
                
                {selectedLog.image_data && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image Information</label>
                    <div className="mt-1 text-sm text-gray-900 bg-blue-50 p-3 rounded border border-blue-200">
                      {(() => {
                        try {
                          const imageData = JSON.parse(selectedLog.image_data);
                          return (
                            <div className="space-y-2">
                              {imageData.file_path && <p><strong>File Path:</strong> {imageData.file_path}</p>}
                              {imageData.file_size && <p><strong>File Size:</strong> {(imageData.file_size / 1024).toFixed(2)} KB</p>}
                              {imageData.file_type && <p><strong>File Type:</strong> {imageData.file_type}</p>}
                              {imageData.dimensions && <p><strong>Dimensions:</strong> {imageData.dimensions}</p>}
                              {imageData.old_image && <p><strong>Old Image:</strong> {imageData.old_image}</p>}
                              {imageData.new_image && <p><strong>New Image:</strong> {imageData.new_image}</p>}
                            </div>
                          );
                        } catch {
                          return <pre>{selectedLog.image_data}</pre>;
                        }
                      })()} 
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
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
}