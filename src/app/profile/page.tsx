'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api-client'
import { AccountStats } from '@/types'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Settings,
  Camera,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Lock,
  UserCheck,
  Award,
  Clock,
  Activity,
  Upload,
  Image as ImageIcon,
  Trash2,
  RotateCw,
  Loader2
} from 'lucide-react'

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

interface ProfileFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  bio: string
}

const EMPTY_PROFILE: ProfileFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  country: '',
  bio: '',
}

// "inventory.view_warehouse" -> { module: 'Inventory', label: 'View warehouse' }
const MODULE_LABELS: Record<string, string> = {
  authentication: 'Users & Access',
  authorization: 'Roles & Permissions',
  accounts: 'Accounts',
  carwash: 'Car Wash',
  core: 'System',
  customers: 'Customers',
  inventory: 'Inventory',
  lubebays: 'Lubebays',
  notifications: 'Notifications',
  orders: 'Orders',
  products: 'Products',
  reports: 'Reports',
  substores: 'Substores',
  suppliers: 'Suppliers',
}

const humanizeModule = (appLabel: string) =>
  MODULE_LABELS[appLabel] || appLabel.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())

const groupPermissions = (codenames: string[]) => {
  const groups = new Map<string, number>()
  codenames.forEach((codename) => {
    const [appLabel] = codename.split('.')
    if (!appLabel) return
    const label = humanizeModule(appLabel)
    groups.set(label, (groups.get(label) || 0) + 1)
  })
  return Array.from(groups.entries())
    .map(([module, count]) => ({ module, count }))
    .sort((a, b) => b.count - a.count || a.module.localeCompare(b.module))
}

const formatMonthYear = (value?: string | null) => {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (isNaN(date.getTime())) return 'Unknown'
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

const formatRelative = (value?: string | null) => {
  if (!value) return 'Never'
  const date = new Date(value)
  if (isNaN(date.getTime())) return 'Never'

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  const minutes = seconds / 60
  const hours = minutes / 60
  const days = hours / 24
  const months = days / 30
  const years = days / 365

  if (minutes < 60) return rtf.format(-Math.floor(minutes), 'minute')
  if (hours < 24) return rtf.format(-Math.floor(hours), 'hour')
  if (days < 30) return rtf.format(-Math.floor(days), 'day')
  if (months < 12) return rtf.format(-Math.floor(months), 'month')
  return rtf.format(-Math.floor(years), 'year')
}

const titleCase = (value?: string | null) =>
  value ? value.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : ''

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const { addToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [accountStats, setAccountStats] = useState<AccountStats | null>(null)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Profile picture states
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [showImageUploadModal, setShowImageUploadModal] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Signature states
  const [signatureImage, setSignatureImage] = useState<string | null>(null)
  const [isUploadingSignature, setIsUploadingSignature] = useState(false)
  const signatureInputRef = useRef<HTMLInputElement>(null)

  // Profile form - starts blank and is populated from the API below.
  const profileForm = useForm<ProfileFormData>({ defaultValues: EMPTY_PROFILE })

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  // The serializer returns absolute URLs, but fall back to resolving a
  // relative MEDIA path against the API host just in case.
  const resolveMediaUrl = (path?: string | null) => {
    if (!path) return null
    if (path.startsWith('http') || path.startsWith('data:')) return path
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1'
    return `${apiBase.replace('/api/v1', '')}${path}`
  }

  // Push a freshly-fetched user onto the form, the image previews and the
  // auth store so the sidebar/header pick up the same values.
  const applyUser = (fresh: any) => {
    profileForm.reset({
      firstName: fresh.first_name || '',
      lastName: fresh.last_name || '',
      email: fresh.email || '',
      phone: fresh.phone || '',
      address: fresh.address || '',
      city: fresh.city || '',
      state: fresh.state || '',
      country: fresh.country || '',
      bio: fresh.bio || '',
    })
    setProfileImage(resolveMediaUrl(fresh.avatar))
    setSignatureImage(resolveMediaUrl(fresh.signature))
    updateUser(fresh)
  }

  // Load the real profile + account statistics on mount
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const [fresh, stats] = await Promise.all([
          api.getUser(),
          api.getMyAccountStats().catch(() => null),
        ])
        if (cancelled) return
        applyUser(fresh)
        setAccountStats(stats)
      } catch (error: any) {
        if (cancelled) return
        addToast({
          type: 'error',
          title: 'Could not load profile',
          message: error?.message || 'Please refresh the page and try again.',
        })
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleProfileSave = async (data: ProfileFormData) => {
    setIsSavingProfile(true)
    try {
      const fresh = await api.updateMyProfile({
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        country: data.country.trim(),
        bio: data.bio.trim(),
      })
      applyUser(fresh)
      setIsEditing(false)
      addToast({ type: 'success', title: 'Profile updated', message: 'Your changes have been saved.' })
    } catch (error: any) {
      // The backend formatter already flattens field errors into `message`
      // (e.g. "email: user with this email address already exists.").
      addToast({
        type: 'error',
        title: 'Could not save profile',
        message: error?.message || 'Please try again.',
      })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handlePasswordChange = async (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      passwordForm.setError('confirmPassword', { message: 'Passwords do not match' })
      return
    }

    setIsSavingPassword(true)
    try {
      await api.changePassword(data.currentPassword, data.newPassword)
      setIsChangingPassword(false)
      passwordForm.reset()
      // Reflect the new "last changed" timestamp straight away.
      setAccountStats(await api.getMyAccountStats().catch(() => accountStats))
      addToast({ type: 'success', title: 'Password changed', message: 'Your password has been updated.' })
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Could not change password',
        message: error?.message || 'Check your current password and try again.',
      })
    } finally {
      setIsSavingPassword(false)
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  // Profile image handlers
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast({ type: 'error', title: 'Invalid file', message: 'Please select a valid image file.' })
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      addToast({ type: 'error', title: 'File too large', message: 'Profile pictures must be under 5MB.' })
      return
    }

    const previousImage = profileImage
    setIsUploadingImage(true)

    try {
      // Optimistic local preview while the upload is in flight
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfileImage(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)

      const fresh = await api.uploadMyProfileImage('avatar', file)
      applyUser(fresh)

      addToast({ type: 'success', title: 'Profile picture updated' })
      setShowImageUploadModal(false)
    } catch (error: any) {
      setProfileImage(previousImage) // Restore the previous image on error
      addToast({
        type: 'error',
        title: 'Upload failed',
        message: error?.message || 'Could not upload your profile picture.',
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Signature upload handler
  const handleSignatureUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast({ type: 'error', title: 'Invalid file', message: 'Please select a valid image file.' })
      return
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit for signatures
      addToast({ type: 'error', title: 'File too large', message: 'Signatures must be under 2MB.' })
      return
    }

    const previousSignature = signatureImage
    setIsUploadingSignature(true)

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setSignatureImage(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)

      const fresh = await api.uploadMyProfileImage('signature', file)
      applyUser(fresh)

      addToast({
        type: 'success',
        title: 'Signature updated',
        message: 'It will now appear on documents you sign.',
      })
    } catch (error: any) {
      setSignatureImage(previousSignature)
      addToast({
        type: 'error',
        title: 'Upload failed',
        message: error?.message || 'Could not upload your signature.',
      })
    } finally {
      setIsUploadingSignature(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
  }

  // Clearing an image has to reach the server too - wiping local state only
  // made the picture reappear on the next page load.
  const removeProfileImage = async () => {
    const previousImage = profileImage
    setIsUploadingImage(true)
    setProfileImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    try {
      const fresh = await api.removeMyProfileImage('avatar')
      applyUser(fresh)
      addToast({ type: 'success', title: 'Profile picture removed' })
      setShowImageUploadModal(false)
    } catch (error: any) {
      setProfileImage(previousImage)
      addToast({
        type: 'error',
        title: 'Could not remove picture',
        message: error?.message || 'Please try again.',
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  // Signature handlers
  const handleSignatureFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleSignatureUpload(file)
    }
  }

  const removeSignature = async () => {
    const previousSignature = signatureImage
    setIsUploadingSignature(true)
    setSignatureImage(null)
    if (signatureInputRef.current) {
      signatureInputRef.current.value = ''
    }

    try {
      const fresh = await api.removeMyProfileImage('signature')
      applyUser(fresh)
      addToast({ type: 'success', title: 'Signature removed' })
    } catch (error: any) {
      setSignatureImage(previousSignature)
      addToast({
        type: 'error',
        title: 'Could not remove signature',
        message: error?.message || 'Please try again.',
      })
    } finally {
      setIsUploadingSignature(false)
    }
  }

  const openSignatureDialog = () => {
    signatureInputRef.current?.click()
  }

  // Everything below comes from /auth/users/me/ and /auth/users/me/stats/
  const displayName = [profileForm.watch('firstName'), profileForm.watch('lastName')]
    .filter(Boolean)
    .join(' ')
    .trim()

  const roleLabel = accountStats?.role_display || titleCase(user?.role) || 'No role assigned'
  const departmentLabel = accountStats?.department || user?.department || 'No department'
  const permissionGroups = groupPermissions(user?.permission_codenames || [])
  const permissionCount = accountStats?.permission_count ?? (user?.permission_codenames?.length || 0)
  const isVerified = Boolean(user?.is_active)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-30 translate-y-30"></div>
          </div>

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 overflow-hidden">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 lg:w-16 lg:h-16 text-white" />
                )}
              </div>

              {/* Upload Button */}
              <button
                onClick={() => setShowImageUploadModal(true)}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                title="Change profile picture"
              >
                <Camera className="w-5 h-5" />
              </button>

              {/* Remove Image Button */}
              {profileImage && (
                <button
                  onClick={removeProfileImage}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                  title="Remove profile picture"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Upload Progress Overlay */}
              {isUploadingImage && (
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <RotateCw className="w-6 h-6 text-white animate-spin" />
                    <span className="text-xs text-white font-medium">Uploading...</span>
                  </div>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl lg:text-4xl font-bold">
                  {isLoading ? 'Loading...' : (displayName || user?.email || 'Your profile')}
                </h1>
                {isVerified && (
                  <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    <UserCheck className="w-4 h-4" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                )}
              </div>
              <p className="text-white/90 text-lg">{roleLabel} • {departmentLabel}</p>
              <div className="flex items-center gap-6 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatMonthYear(accountStats?.date_joined || user?.date_joined)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Last active {formatRelative(accountStats?.last_login || user?.last_login_datetime)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-medium hover:bg-white/90 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Edit3 className="w-5 h-5" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      // reset() restores the last values loaded from the API,
                      // since applyUser() re-seeds the form defaults.
                      profileForm.reset()
                    }}
                    disabled={isSavingProfile}
                    className="flex items-center gap-2 bg-white/20 text-white px-4 py-3 rounded-xl font-medium hover:bg-white/30 transition-colors duration-200 disabled:opacity-60"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                  <button
                    onClick={profileForm.handleSubmit(handleProfileSave)}
                    disabled={isSavingProfile}
                    className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-medium hover:bg-white/90 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSavingProfile
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <Save className="w-5 h-5" />}
                    {isSavingProfile ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Profile Information */}
          <div className="xl:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <User className="w-6 h-6 text-blue-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={profileForm.handleSubmit(handleProfileSave)} className="space-y-4">
                  {/* Name Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">First Name</label>
                      <input
                        {...profileForm.register('firstName')}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        {...profileForm.register('lastName')}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors duration-200"
                      />
                    </div>
                  </div>

                  {/* Contact Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          {...profileForm.register('email')}
                          disabled={!isEditing}
                          type="email"
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors duration-200"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          {...profileForm.register('phone')}
                          disabled={!isEditing}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        {...profileForm.register('address')}
                        disabled={!isEditing}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors duration-200"
                      />
                    </div>
                  </div>

                  {/* Location Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">City</label>
                      <input
                        {...profileForm.register('city')}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">State</label>
                      <input
                        {...profileForm.register('state')}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Country</label>
                      <input
                        {...profileForm.register('country')}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors duration-200"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                      {...profileForm.register('bio')}
                      disabled={!isEditing}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors duration-200 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Shield className="w-6 h-6 text-green-600" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isChangingPassword ? (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Lock className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Password</h3>
                        <p className="text-sm text-gray-500">
                          {accountStats?.password_changed_at
                            ? `Last changed ${formatRelative(accountStats.password_changed_at)}`
                            : 'Never changed'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Change Password
                    </button>
                  </div>
                ) : (
                  <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Current Password</label>
                      <div className="relative">
                        <input
                          {...passwordForm.register('currentPassword')}
                          type={showPasswords.current ? 'text' : 'password'}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">New Password</label>
                      <div className="relative">
                        <input
                          {...passwordForm.register('newPassword')}
                          type={showPasswords.new ? 'text' : 'password'}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                      <div className="relative">
                        <input
                          {...passwordForm.register('confirmPassword')}
                          type={showPasswords.confirm ? 'text' : 'password'}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-600">
                          {passwordForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={isSavingPassword}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSavingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isSavingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                      <button
                        type="button"
                        disabled={isSavingPassword}
                        onClick={() => {
                          setIsChangingPassword(false)
                          passwordForm.reset()
                        }}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors duration-200 disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Picture & Signature Uploads */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <ImageIcon className="w-6 h-6 text-blue-600" />
                  Profile Media
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture Section */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Profile Picture
                  </label>
                  <div className="relative group">
                    <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Click to upload photo</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setShowImageUploadModal(true)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center"
                    >
                      <div className="text-center text-white">
                        <Camera className="w-8 h-8 mx-auto mb-2" />
                        <span className="text-sm font-medium">Change Photo</span>
                      </div>
                    </button>
                  </div>
                  {profileImage && (
                    <button
                      onClick={removeProfileImage}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove Photo
                    </button>
                  )}
                </div>

                {/* Signature Section */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Digital Signature
                  </label>
                  <div className="relative group">
                    <div className="w-full h-32 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-indigo-300">
                      {signatureImage ? (
                        <img
                          src={signatureImage}
                          alt="Signature"
                          className="max-w-full max-h-full object-contain p-2"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <Edit3 className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                          <p className="text-sm text-indigo-600 font-medium">Upload Signature</p>
                          <p className="text-xs text-indigo-400 mt-1">PNG, JPG up to 2MB</p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={openSignatureDialog}
                      disabled={isUploadingSignature}
                      className="absolute inset-0 bg-indigo-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center disabled:cursor-not-allowed"
                    >
                      <div className="text-center text-white">
                        {isUploadingSignature ? (
                          <>
                            <RotateCw className="w-7 h-7 mx-auto mb-2 animate-spin" />
                            <span className="text-sm font-medium">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-7 h-7 mx-auto mb-2" />
                            <span className="text-sm font-medium">{signatureImage ? 'Change' : 'Upload'} Signature</span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                  {signatureImage && !isUploadingSignature && (
                    <button
                      onClick={removeSignature}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove Signature
                    </button>
                  )}
                  <input
                    ref={signatureInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureFileSelect}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 flex items-start gap-1">
                    <span className="text-amber-500">💡</span>
                    <span>Your signature will appear on PDFs when you approve or sign documents (like DocuSign)</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Account Stats */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Activity className="w-6 h-6 text-purple-600" />
                  Account Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-700">Total Logins</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">
                    {accountStats ? accountStats.total_logins.toLocaleString() : '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-700">Member Since</span>
                  </div>
                  <span className="text-sm font-medium text-blue-600">
                    {formatMonthYear(accountStats?.date_joined || user?.date_joined)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-700">Last Login</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    {formatRelative(accountStats?.last_login || user?.last_login_datetime)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-amber-600" />
                    <span className="font-medium text-gray-700">Permissions</span>
                  </div>
                  <span className="text-lg font-bold text-amber-600">{permissionCount}</span>
                </div>
              </CardContent>
            </Card>

            {/* Role & Permissions */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Award className="w-6 h-6 text-amber-600" />
                  Role & Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-amber-900">{roleLabel}</h3>
                      <p className="text-sm text-amber-700">{departmentLabel}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">
                    Module Access {permissionCount > 0 && (
                      <span className="text-sm font-normal text-gray-500">({permissionCount} permissions)</span>
                    )}
                  </h4>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {permissionGroups.length > 0 ? (
                      permissionGroups.map((group) => (
                        <div key={group.module} className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 min-w-0">
                            <UserCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate">{group.module}</span>
                          </div>
                          <span className="text-xs font-medium text-gray-500 flex-shrink-0">{group.count}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 p-2">
                        {isLoading ? 'Loading permissions...' : 'No permissions assigned yet.'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Settings className="w-6 h-6 text-gray-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Account Settings</span>
                </button>

                <button className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Privacy Settings</span>
                </button>

                <button className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <Activity className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Activity Log</span>
                </button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Image Upload Modal */}
        {showImageUploadModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload Profile Picture</h3>
                <p className="text-gray-600">Choose a new profile picture to personalize your account</p>
              </div>

              {/* Drag & Drop Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
                  dragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={openFileDialog}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drop your image here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports JPG, PNG, GIF up to 5MB
                </p>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Current Image Preview */}
              {profileImage && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">Current Picture:</p>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <img
                      src={profileImage}
                      alt="Current profile"
                      className="w-16 h-16 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Profile Picture</p>
                      <p className="text-sm text-gray-500">Current image</p>
                    </div>
                    <button
                      onClick={removeProfileImage}
                      className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors duration-200"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Guidelines */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <h4 className="font-medium text-blue-900 mb-2">Image Guidelines:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Square images work best (1:1 ratio)</li>
                  <li>• Minimum resolution: 200x200 pixels</li>
                  <li>• Maximum file size: 5MB</li>
                  <li>• Supported formats: JPG, PNG, GIF</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-8">
                <button
                  onClick={() => setShowImageUploadModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={openFileDialog}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Choose File
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}