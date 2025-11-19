import React, { useState } from 'react';
import { ArrowLeft, IndianRupee, Upload, FileText } from 'lucide-react';
import { useDashboard } from '../../contexts/DashboardContext';
import { logAction } from '../../utils/auditApi';

export function AddDonation() {
  const { addDonation } = useDashboard();
  const [formData, setFormData] = useState({
    donorName: '',
    donorEmail: '',
    amount: '',
    donationType: 'Individual',
    purpose: '',
    notes: ''
  });
  const [originalNotes, setOriginalNotes] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Try to add donor to backend first
      const response = await fetch('http://localhost/NGO-India/backend/add_donor_api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donorName: formData.donorName,
          donorEmail: formData.donorEmail,
          amount: parseFloat(formData.amount),
          donationType: formData.donationType,
          purpose: formData.purpose,
          notes: formData.notes,
          userId: 1 // Replace with actual user ID from auth context
        })
      });
      
      const result = await response.json();
      if (result.success) {
        // Log text changes if notes were modified
        if (originalNotes !== formData.notes && originalNotes) {
          await logAction.textChange('donors', result.id.toString(), 'notes', originalNotes, formData.notes, 1);
        }
        
        // Log image upload if image was attached
        if (attachedImage) {
          await logAction.imageUpload('donors', result.id.toString(), attachedImage, {
            size: 0, // Would be actual file size
            type: 'image/jpeg', // Would be actual file type
            dimensions: '800x600' // Would be actual dimensions
          }, 1);
        }
        
        alert('Donor added successfully to database!');
      } else {
        console.log('Backend failed, using local storage:', result.message);
      }
    } catch (error) {
      console.error('Backend error, using local storage:', error);
    }
    
    // Always add to local context as fallback
    addDonation({
      donor: formData.donorName,
      amount: parseFloat(formData.amount),
      date: new Date().toISOString().split('T')[0],
      type: formData.donationType === 'Grant' ? 'recurring' : 'one-time'
    });
    
    alert('Donation added successfully!');
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setAttachedImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNotesChange = (value: string) => {
    if (!originalNotes && formData.notes) {
      setOriginalNotes(formData.notes);
    }
    setFormData({ ...formData, notes: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => window.location.href = '/'} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-orange-600 flex items-center gap-3">
              <IndianRupee className="w-8 h-8 text-orange-500" />
              Add New Donation
            </h1>
            <p className="text-orange-500">Record a new donation with complete details</p>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-orange-900 mb-3">Instructions</h2>
          <ul className="text-orange-800 space-y-2 text-sm">
            <li>• Fill in all required fields marked with asterisk (*)</li>
            <li>• For corporate donations, please provide company details</li>
            <li>• All donations will be acknowledged with a receipt</li>
            <li>• Tax exemption certificates will be issued as per 80G guidelines</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-orange-600 mb-2">Donor Name *</label>
              <input
                type="text"
                value={formData.donorName}
                onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 hover:border-orange-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-orange-600 mb-2">Email Address</label>
              <input
                type="email"
                value={formData.donorEmail}
                onChange={(e) => setFormData({ ...formData, donorEmail: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 hover:border-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-orange-600 mb-2">Amount (₹) *</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 hover:border-orange-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-orange-600 mb-2">Donor Type</label>
              <select
                value={formData.donationType}
                onChange={(e) => setFormData({ ...formData, donationType: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 hover:border-orange-400"
              >
                <option value="Individual">Individual</option>
                <option value="Corporate">Corporate</option>
                <option value="Grant">Grant/Foundation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-orange-600 mb-2">Purpose</label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 hover:border-orange-400"
              >
                <option value="">General Fund</option>
                <option value="Education">Education Programs</option>
                <option value="Healthcare">Healthcare Initiatives</option>
                <option value="Rural Development">Rural Development</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-orange-600 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Notes (Text changes are audited)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 hover:border-orange-400"
                rows={3}
                placeholder="Enter any additional notes about this donation..."
              />
              {originalNotes && originalNotes !== formData.notes && (
                <p className="text-xs text-yellow-600 mt-1">
                  ⚠️ Text changes will be logged in audit trail
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-orange-600 mb-2">
                <Upload className="w-4 h-4 inline mr-1" />
                Attach Document/Image (Uploads are audited)
              </label>
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleImageUpload}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 hover:border-orange-400"
              />
              {attachedImage && (
                <div className="mt-2">
                  <p className="text-xs text-green-600">✓ File attached - upload will be logged in audit trail</p>
                  {attachedImage.startsWith('data:image') && (
                    <img src={attachedImage} alt="Preview" className="mt-2 max-w-xs max-h-32 object-cover rounded" />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button type="button" onClick={() => window.location.href = '/'} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              Add Donation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDonation;