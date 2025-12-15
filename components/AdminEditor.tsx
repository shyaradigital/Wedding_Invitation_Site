'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Admin {
  id: string
  email: string
  createdAt: string
}

interface AdminEditorProps {
  currentAdminId: string | null
}

export default function AdminEditor({ currentAdminId }: AdminEditorProps) {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [changingPasswordFor, setChangingPasswordFor] = useState<Admin | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/admins', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setAdmins(data.admins || [])
      } else {
        setError('Failed to fetch admins')
      }
    } catch (err) {
      console.error('Error fetching admins:', err)
      setError('Failed to fetch admins')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ email: '', password: '' })
    setEditingAdmin(null)
    setShowCreateForm(false)
    setError(null)
    setSuccess(null)
  }

  const resetPasswordForm = () => {
    setPasswordData({ password: '', confirmPassword: '' })
    setChangingPasswordFor(null)
    setError(null)
    setSuccess(null)
  }

  const handleCreateAdmin = async () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      setError(null)
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Admin created successfully')
        resetForm()
        fetchAdmins()
      } else {
        setError(data.error || 'Failed to create admin')
      }
    } catch (err) {
      console.error('Error creating admin:', err)
      setError('Failed to create admin')
    }
  }

  const handleUpdateAdmin = async () => {
    if (!editingAdmin || !formData.email) {
      setError('Email is required')
      return
    }

    try {
      setError(null)
      const response = await fetch(`/api/admin/admins/${editingAdmin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ email: formData.email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Admin updated successfully')
        resetForm()
        fetchAdmins()
      } else {
        setError(data.error || 'Failed to update admin')
      }
    } catch (err) {
      console.error('Error updating admin:', err)
      setError('Failed to update admin')
    }
  }

  const handleDeleteAdmin = async (admin: Admin) => {
    if (!confirm(`Are you sure you want to delete admin "${admin.email}"?`)) {
      return
    }

    try {
      setError(null)
      const response = await fetch(`/api/admin/admins/${admin.id}`, {
        method: 'DELETE',
        cache: 'no-store',
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Admin deleted successfully')
        fetchAdmins()
      } else {
        setError(data.error || 'Failed to delete admin')
      }
    } catch (err) {
      console.error('Error deleting admin:', err)
      setError('Failed to delete admin')
    }
  }

  const handleChangePassword = async () => {
    if (!changingPasswordFor) return

    if (!passwordData.password || !passwordData.confirmPassword) {
      setError('Password and confirmation are required')
      return
    }

    if (passwordData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      setError(null)
      const response = await fetch(`/api/admin/admins/${changingPasswordFor.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ password: passwordData.password }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Password changed successfully')
        resetPasswordForm()
      } else {
        setError(data.error || 'Failed to change password')
      }
    } catch (err) {
      console.error('Error changing password:', err)
      setError('Failed to change password')
    }
  }

  const startEdit = (admin: Admin) => {
    setEditingAdmin(admin)
    setFormData({ email: admin.email, password: '' })
    setShowCreateForm(true)
    setError(null)
    setSuccess(null)
  }

  const startPasswordChange = (admin: Admin) => {
    setChangingPasswordFor(admin)
    setPasswordData({ password: '', confirmPassword: '' })
    setError(null)
    setSuccess(null)
  }

  // Auto-hide success/error messages
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null)
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-display text-wedding-navy">Admin Management</h2>
        <button
          onClick={() => {
            resetForm()
            setShowCreateForm(true)
          }}
          className="bg-wedding-gold text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors font-semibold"
        >
          + Add Admin
        </button>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg"
          >
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <h3 className="text-xl font-display text-wedding-navy mb-4">
              {editingAdmin ? 'Edit Admin' : 'Create New Admin'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="admin@example.com"
                />
              </div>
              {!editingAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Minimum 6 characters"
                  />
                </div>
              )}
              <div className="flex gap-4">
                <button
                  onClick={editingAdmin ? handleUpdateAdmin : handleCreateAdmin}
                  className="bg-wedding-gold text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  {editingAdmin ? 'Save Changes' : 'Create'}
                </button>
                <button
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {changingPasswordFor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={resetPasswordForm}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-display text-wedding-navy mb-4">
                Change Password for {changingPasswordFor.email}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleChangePassword}
                    className="bg-wedding-gold text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={resetPasswordForm}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admins List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading admins...</div>
        ) : admins.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No admins found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-wedding-navy uppercase tracking-wider border-b-2 border-gray-200">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-wedding-navy uppercase tracking-wider border-b-2 border-gray-200">
                    Created At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-wedding-navy uppercase tracking-wider border-b-2 border-gray-200">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-wedding-navy uppercase tracking-wider border-b-2 border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{admin.email}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {currentAdminId === admin.id ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-wedding-gold/20 text-wedding-navy">
                          Current User
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEdit(admin)}
                          className="text-wedding-gold hover:text-wedding-gold/80 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => startPasswordChange(admin)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Change Password
                        </button>
                        {currentAdminId !== admin.id && (
                          <button
                            onClick={() => handleDeleteAdmin(admin)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

