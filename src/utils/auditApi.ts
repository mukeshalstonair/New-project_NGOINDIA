const API_BASE_URL = 'http://localhost/NGO-India/backend';

export interface AuditLogData {
  user_id?: number;
  action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'ROLE_CHANGE' | 'UPLOAD' | 'TEXT_CHANGE';
  action_description: string;
  entity_name: string;
  entity_id?: string;
  previous_values?: any;
  new_values?: any;
  text_content?: string;
  image_data?: any;
  ip_address: string;
  user_agent?: string;
}

export interface AuditLogFilters {
  user_id?: string;
  action_type?: string;
  entity_name?: string;
  date_from?: string;
  date_to?: string;
}

export const auditApi = {
  // Record an audit event
  recordEvent: async (data: AuditLogData): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/audit_trail_api.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'record',
          data: {
            ...data,
            ip_address: await getClientIP(),
            user_agent: navigator.userAgent
          }
        })
      });
      
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to record audit event:', error);
      return false;
    }
  },

  // Get audit logs with filters and pagination
  getLogs: async (filters: AuditLogFilters = {}, page: number = 1, limit: number = 50) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await fetch(`${API_BASE_URL}/audit_trail_api.php?${params}`);
      const result = await response.json();
      
      if (result.success) {
        return {
          logs: result.data,
          pagination: result.pagination
        };
      }
      
      throw new Error('Failed to fetch logs');
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      throw error;
    }
  },

  // Get a specific audit log by ID
  getLogById: async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/audit_trail_api.php?id=${id}`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      
      throw new Error('Failed to fetch log details');
    } catch (error) {
      console.error('Failed to fetch log details:', error);
      throw error;
    }
  },

  // Export logs
  exportLogs: (filters: AuditLogFilters = {}, format: 'csv' | 'json' = 'csv') => {
    const params = new URLSearchParams({
      format,
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
    });

    window.open(`${API_BASE_URL}/export_audit_logs.php?${params}`, '_blank');
  }
};

// Helper function to get client IP (simplified)
async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}

// Helper function to automatically log common actions
export const logAction = {
  create: (entityName: string, entityId: string, newValues: any, userId?: number) => {
    return auditApi.recordEvent({
      user_id: userId,
      action_type: 'CREATE',
      action_description: `Created new ${entityName}`,
      entity_name: entityName,
      entity_id: entityId,
      new_values: newValues,
      ip_address: 'auto' // Will be replaced by actual IP
    });
  },

  update: (entityName: string, entityId: string, previousValues: any, newValues: any, userId?: number) => {
    return auditApi.recordEvent({
      user_id: userId,
      action_type: 'UPDATE',
      action_description: `Updated ${entityName}`,
      entity_name: entityName,
      entity_id: entityId,
      previous_values: previousValues,
      new_values: newValues,
      ip_address: 'auto'
    });
  },

  delete: (entityName: string, entityId: string, previousValues: any, userId?: number) => {
    return auditApi.recordEvent({
      user_id: userId,
      action_type: 'DELETE',
      action_description: `Deleted ${entityName}`,
      entity_name: entityName,
      entity_id: entityId,
      previous_values: previousValues,
      ip_address: 'auto'
    });
  },

  login: (userId: number) => {
    return auditApi.recordEvent({
      user_id: userId,
      action_type: 'LOGIN',
      action_description: 'User logged in',
      entity_name: 'user_session',
      ip_address: 'auto'
    });
  },

  logout: (userId: number) => {
    return auditApi.recordEvent({
      user_id: userId,
      action_type: 'LOGOUT',
      action_description: 'User logged out',
      entity_name: 'user_session',
      ip_address: 'auto'
    });
  },

  textChange: (entityName: string, entityId: string, fieldName: string, oldText: string, newText: string, userId?: number) => {
    const textDiff = {
      field: fieldName,
      old_length: oldText.length,
      new_length: newText.length,
      char_diff: newText.length - oldText.length,
      words_added: newText.split(' ').length - oldText.split(' ').length
    };

    return auditApi.recordEvent({
      user_id: userId,
      action_type: 'TEXT_CHANGE',
      action_description: `Text changed in ${fieldName} for ${entityName}`,
      entity_name: entityName,
      entity_id: entityId,
      previous_values: { text: oldText },
      new_values: { text: newText },
      text_content: JSON.stringify(textDiff),
      ip_address: 'auto'
    });
  },

  imageUpload: (entityName: string, entityId: string, imagePath: string, imageInfo: any, userId?: number) => {
    const imageData = {
      file_path: imagePath,
      file_size: imageInfo.size,
      file_type: imageInfo.type,
      dimensions: imageInfo.dimensions,
      upload_time: new Date().toISOString()
    };

    return auditApi.recordEvent({
      user_id: userId,
      action_type: 'UPLOAD',
      action_description: `Image uploaded for ${entityName}`,
      entity_name: entityName,
      entity_id: entityId,
      new_values: { image_path: imagePath },
      image_data: imageData,
      ip_address: 'auto'
    });
  },

  imageChange: (entityName: string, entityId: string, oldImagePath: string, newImagePath: string, userId?: number) => {
    const imageData = {
      old_image: oldImagePath,
      new_image: newImagePath,
      change_time: new Date().toISOString()
    };

    return auditApi.recordEvent({
      user_id: userId,
      action_type: 'UPDATE',
      action_description: `Image changed for ${entityName}`,
      entity_name: entityName,
      entity_id: entityId,
      previous_values: { image_path: oldImagePath },
      new_values: { image_path: newImagePath },
      image_data: imageData,
      ip_address: 'auto'
    });
  }
};