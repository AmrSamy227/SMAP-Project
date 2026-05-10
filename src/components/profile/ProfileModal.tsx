import React, { useState, useEffect } from 'react';
import { X, Edit2, Save } from 'lucide-react';
import { profileApi, UserWithProfile } from '../../lib/api/profileApi';
import { useLanguage } from '../../lib/i18n/LanguageContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { t, isRTL, locale } = useLanguage();
  const [profile, setProfile] = useState<UserWithProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [editData, setEditData] = useState({
    phone: '',
    full_name: '',
    blood_type: '',
    height: '',
    weight: '',
    known_allergies: '',
    chronic_conditions: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await profileApi.getCurrentUserWithProfile();
      setProfile(data);
      if (data) {
        setEditData({
          phone: data.phone || '',
          full_name: data.full_name || '',
          blood_type: data.profile?.blood_type || '',
          height: data.profile?.height || '',
          weight: data.profile?.weight || '',
          known_allergies: data.profile?.known_allergies || '',
          chronic_conditions: data.profile?.chronic_conditions || '',
          emergency_contact_name: data.profile?.emergency_contact_name || '',
          emergency_contact_phone: data.profile?.emergency_contact_phone || '',
        });
      }
      setError('');
    } catch (err) {
      setError('Failed to load profile');
      console.error('[v0] Error loading profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (profile?.profile) {
        await profileApi.updateUserProfile({
          blood_type: editData.blood_type,
          height: editData.height,
          weight: editData.weight,
          known_allergies: editData.known_allergies,
          chronic_conditions: editData.chronic_conditions,
          emergency_contact_name: editData.emergency_contact_name,
          emergency_contact_phone: editData.emergency_contact_phone,
        });
      }
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsEditing(false);
      await loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto ${isRTL ? 'rtl' : ''}`}>
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">My Profile</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
              {successMessage}
            </div>
          )}

          {isLoading && !profile ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-cyan-200 border-t-cyan-600 rounded-full"></div>
            </div>
          ) : profile ? (
            <>
              {/* Avatar */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold">
                  {profile.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{profile.full_name}</p>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                  <p className="text-gray-900 font-medium">{profile.email}</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                      dir="ltr"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.phone}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</label>
                  <p className="text-gray-900 font-medium capitalize">{profile.role}</p>
                </div>
              </div>

              {/* Profile Section - Only for users */}
              {profile.role === 'user' && profile.profile && (
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <h3 className="font-semibold text-gray-900">Medical Information</h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Blood Type</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.blood_type}
                          onChange={(e) => setEditData({ ...editData, blood_type: e.target.value })}
                          placeholder="e.g., O+"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{profile.profile.blood_type || '—'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gender</label>
                      <p className="text-gray-900 font-medium capitalize">{profile.profile.gender}</p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Height (cm)</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.height}
                          onChange={(e) => setEditData({ ...editData, height: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{profile.profile.height || '—'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Weight (kg)</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.weight}
                          onChange={(e) => setEditData({ ...editData, weight: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{profile.profile.weight || '—'}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Allergies</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.known_allergies}
                        onChange={(e) => setEditData({ ...editData, known_allergies: e.target.value })}
                        placeholder="e.g., Penicillin"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profile.profile.known_allergies || '—'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Chronic Conditions</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.chronic_conditions}
                        onChange={(e) => setEditData({ ...editData, chronic_conditions: e.target.value })}
                        placeholder="e.g., Diabetes"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profile.profile.chronic_conditions || '—'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Emergency Contact</label>
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editData.emergency_contact_name}
                          onChange={(e) => setEditData({ ...editData, emergency_contact_name: e.target.value })}
                          placeholder="Name"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <input
                          type="tel"
                          value={editData.emergency_contact_phone}
                          onChange={(e) => setEditData({ ...editData, emergency_contact_phone: e.target.value })}
                          placeholder="Phone"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          dir="ltr"
                        />
                      </div>
                    ) : (
                      <div className="text-sm text-gray-900">
                        <p className="font-medium">{profile.profile.emergency_contact_name || '—'}</p>
                        <p className="text-gray-600">{profile.profile.emergency_contact_phone || '—'}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Clinic Section - Only for clinics */}
              {profile.role === 'clinic' && profile.clinic && (
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <h3 className="font-semibold text-gray-900">Clinic Information</h3>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Clinic Name</label>
                    <p className="text-gray-900 font-medium">{profile.clinic.name}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</label>
                    <p className="text-gray-900 font-medium">{profile.clinic.address}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Clinic Phone</label>
                    <p className="text-gray-900 font-medium">{profile.clinic.phone}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Clinic Email</label>
                    <p className="text-gray-900 font-medium">{profile.clinic.email}</p>
                  </div>
                </div>
              )}
            </>
          ) : null}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700 transition-colors font-medium"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
