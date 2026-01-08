'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  Download,
  Upload,
  Eye,
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  Calendar,
  User,
  Building,
  MessageSquare,
  Send,
  ArrowRight,
  DollarSign,
  FileText,
  ShoppingCart,
  CreditCard,
  Plane,
  Car,
  Home,
  Briefcase,
} from 'lucide-react'

// Memo interfaces
interface MemoItem {
  id: number
  description: string
  quantity?: number
  unit?: string
  unitCost: number
  totalCost: number
  vendor?: string
  specifications?: string
}

interface Memo {
  id: number
  memoNumber: string
  title: string
  memoType: 'Purchase Request' | 'Funding Request' | 'Budget Approval' | 'Travel Request' | 'Equipment Purchase' | 'Service Request'
  requestedBy: string
  department: string
  dateCreated: string
  dateRequired: string
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Partially Approved' | 'Implemented' | 'Cancelled'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  purpose: string
  justification: string
  items?: MemoItem[]
  totalAmount: number
  requestedAmount?: number
  approvedAmount?: number
  reviewedBy?: string
  reviewDate?: string
  approvedBy?: string
  approvalDate?: string
  rejectionReason?: string
  comments: string[]
  attachments?: string[]
  linkedToPRO?: boolean
  proNumber?: string
}

// Mock data for memos
const generateMockMemos = (): Memo[] => {
  const departments = [
    'Human Resources',
    'Finance & Accounting',
    'Information Technology',
    'Operations',
    'Sales & Marketing',
    'Administration',
    'Security',
    'Procurement',
    'Legal',
    'Maintenance'
  ]

  const employees = [
    'Adebayo Johnson',
    'Fatima Usman',
    'Emeka Okafor',
    'Kemi Adebola',
    'Ibrahim Musa',
    'Grace Okoro',
    'Chinedu Okonkwo',
    'Aisha Bello',
    'Olumide Adeyemi',
    'Blessing Okafor',
    'Yusuf Hassan',
    'Chioma Nwankwo',
    'Ahmed Abdullahi',
    'Ngozi Eze'
  ]

  const approvers = [
    'Adebayo Johnson', // CEO
    'Fatima Usman',   // Finance Director
    'Ibrahim Musa',   // Operations Manager
    'Emeka Okafor',   // HR Director
  ]

  const memoTypes: Memo['memoType'][] = [
    'Purchase Request',
    'Funding Request',
    'Budget Approval',
    'Travel Request',
    'Equipment Purchase',
    'Service Request'
  ]

  const statuses: Memo['status'][] = [
    'Submitted', 'Under Review', 'Approved', 'Rejected', 'Partially Approved', 'Implemented', 'Cancelled'
  ]

  const priorities: Memo['priority'][] = ['Low', 'Medium', 'High', 'Critical']

  // Sample memo templates
  const sampleMemos = [
    {
      title: 'Office Equipment Purchase',
      type: 'Equipment Purchase',
      purpose: 'Procurement of office equipment for new employees',
      items: [
        { description: 'Dell OptiPlex Desktop Computer', quantity: 5, unit: 'Unit', unitCost: 450000 },
        { description: 'HP LaserJet Printer', quantity: 2, unit: 'Unit', unitCost: 125000 },
        { description: 'Office Chairs (Executive)', quantity: 5, unit: 'Unit', unitCost: 85000 }
      ]
    },
    {
      title: 'Training and Development Fund',
      type: 'Funding Request',
      purpose: 'Staff training and certification programs',
      amount: 2500000
    },
    {
      title: 'Vehicle Maintenance Services',
      type: 'Service Request',
      purpose: 'Quarterly maintenance for company vehicles',
      items: [
        { description: 'Engine Oil Change (All Vehicles)', quantity: 8, unit: 'Service', unitCost: 15000 },
        { description: 'Brake Pad Replacement', quantity: 3, unit: 'Service', unitCost: 25000 },
        { description: 'General Vehicle Inspection', quantity: 8, unit: 'Service', unitCost: 8000 }
      ]
    },
    {
      title: 'Business Travel Authorization',
      type: 'Travel Request',
      purpose: 'Conference attendance and client meetings',
      amount: 850000
    },
    {
      title: 'Marketing Campaign Budget',
      type: 'Budget Approval',
      purpose: 'Q2 marketing and advertising campaign',
      amount: 5000000
    },
    {
      title: 'Office Stationery Supplies',
      type: 'Purchase Request',
      purpose: 'Monthly office consumables and stationery',
      items: [
        { description: 'A4 Copy Paper', quantity: 50, unit: 'Ream', unitCost: 3500 },
        { description: 'Ballpoint Pens (Blue)', quantity: 20, unit: 'Box', unitCost: 2800 },
        { description: 'Stapler and Staples', quantity: 10, unit: 'Set', unitCost: 4500 }
      ]
    }
  ]

  const memos: Memo[] = []

  for (let i = 0; i < 35; i++) {
    const sampleMemo = sampleMemos[Math.floor(Math.random() * sampleMemos.length)]

    const dateCreated = new Date()
    dateCreated.setDate(dateCreated.getDate() - Math.random() * 45) // Random date in last 6 weeks

    const dateRequired = new Date(dateCreated)
    dateRequired.setDate(dateRequired.getDate() + Math.random() * 21 + 7) // 1-4 weeks from creation

    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const priority = priorities[Math.floor(Math.random() * priorities.length)]

    let totalAmount = 0
    let items: MemoItem[] | undefined

    // Calculate total amount based on memo type
    if (sampleMemo.items) {
      items = sampleMemo.items.map((item, index) => ({
        id: index + 1,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitCost: item.unitCost + Math.floor(Math.random() * item.unitCost * 0.2), // Add some variation
        totalCost: (item.quantity || 1) * (item.unitCost + Math.floor(Math.random() * item.unitCost * 0.2)),
        vendor: ['Grand Concept Ltd', 'Office Plus Nigeria', 'Corporate Supplies'][Math.floor(Math.random() * 3)],
        specifications: 'As per technical requirements document'
      }))
      totalAmount = items.reduce((sum, item) => sum + item.totalCost, 0)
    } else if (sampleMemo.amount) {
      totalAmount = sampleMemo.amount + Math.floor(Math.random() * sampleMemo.amount * 0.3) // Add variation
    }

    // Generate approval data based on status
    let reviewedBy, reviewDate, approvedBy, approvalDate, rejectionReason, approvedAmount

    if (['Under Review', 'Approved', 'Rejected', 'Partially Approved', 'Implemented'].includes(status)) {
      reviewedBy = approvers[Math.floor(Math.random() * approvers.length)]
      reviewDate = new Date(dateCreated.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }

    if (['Approved', 'Partially Approved', 'Implemented'].includes(status)) {
      approvedBy = reviewedBy
      approvalDate = reviewDate
      approvedAmount = status === 'Partially Approved' ? Math.floor(totalAmount * 0.7) : totalAmount
    }

    if (status === 'Rejected') {
      rejectionReason = [
        'Budget constraints for current fiscal period',
        'Insufficient supporting documentation',
        'Alternative cost-effective solution required',
        'Does not align with current strategic priorities',
        'Vendor selection process incomplete'
      ][Math.floor(Math.random() * 5)]
    }

    const comments = []
    if (status !== 'Submitted') {
      comments.push(`Reviewed by ${reviewedBy} on ${reviewDate}`)
      if (status === 'Approved') {
        comments.push(`Approved for full amount of ${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(totalAmount)}`)
      } else if (status === 'Partially Approved') {
        comments.push(`Partially approved for ${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(approvedAmount || 0)}`)
      } else if (status === 'Rejected') {
        comments.push(`Rejected: ${rejectionReason}`)
      }
    }

    const memo: Memo = {
      id: i + 1,
      memoNumber: `MEM-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
      title: `${sampleMemo.title} ${i > 15 ? `(${departments[Math.floor(Math.random() * departments.length)]})` : ''}`.trim(),
      memoType: sampleMemo.type as Memo['memoType'],
      requestedBy: employees[Math.floor(Math.random() * employees.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      dateCreated: dateCreated.toISOString().split('T')[0],
      dateRequired: dateRequired.toISOString().split('T')[0],
      status,
      priority,
      purpose: sampleMemo.purpose,
      justification: `This request is essential for ${sampleMemo.purpose.toLowerCase()} and will improve operational efficiency and productivity.`,
      items,
      totalAmount,
      requestedAmount: totalAmount,
      approvedAmount,
      reviewedBy,
      reviewDate,
      approvedBy,
      approvalDate,
      rejectionReason,
      comments,
      linkedToPRO: Math.random() > 0.7 && status === 'Approved',
      proNumber: Math.random() > 0.7 && status === 'Approved' ? `PRO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000) + 1).padStart(4, '0')}` : undefined
    }

    memos.push(memo)
  }

  return memos.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
}

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const getStatusColor = (status: Memo['status']) => {
  const colors = {
    'Draft': 'bg-gray-100 text-gray-800',
    'Submitted': 'bg-blue-100 text-blue-800',
    'Under Review': 'bg-yellow-100 text-yellow-800',
    'Approved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Partially Approved': 'bg-orange-100 text-orange-800',
    'Implemented': 'bg-emerald-100 text-emerald-800',
    'Cancelled': 'bg-gray-100 text-gray-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getPriorityColor = (priority: Memo['priority']) => {
  const colors = {
    'Low': 'bg-green-100 text-green-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-orange-100 text-orange-800',
    'Critical': 'bg-red-100 text-red-800'
  }
  return colors[priority] || 'bg-gray-100 text-gray-800'
}

const getStatusIcon = (status: Memo['status']) => {
  const icons = {
    'Draft': Edit,
    'Submitted': Send,
    'Under Review': Clock,
    'Approved': CheckCircle,
    'Rejected': XCircle,
    'Partially Approved': AlertTriangle,
    'Implemented': FileCheck,
    'Cancelled': XCircle
  }
  return icons[status] || Clock
}

const getMemoTypeIcon = (type: Memo['memoType']) => {
  const icons = {
    'Purchase Request': ShoppingCart,
    'Funding Request': CreditCard,
    'Budget Approval': DollarSign,
    'Travel Request': Plane,
    'Equipment Purchase': Building,
    'Service Request': Briefcase
  }
  return icons[type] || FileText
}

export default function MemoPage() {
  const router = useRouter()

  // State
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedMemos, setSelectedMemos] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)

  // Generate mock data
  const allMemos = useMemo(() => generateMockMemos(), [])

  // Filter memos
  const filteredMemos = useMemo(() => {
    let filtered = [...allMemos]

    if (searchTerm) {
      filtered = filtered.filter(memo =>
        memo.memoNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memo.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memo.purpose.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (typeFilter) {
      filtered = filtered.filter(memo => memo.memoType === typeFilter)
    }

    if (statusFilter) {
      filtered = filtered.filter(memo => memo.status === statusFilter)
    }

    if (priorityFilter) {
      filtered = filtered.filter(memo => memo.priority === priorityFilter)
    }

    if (departmentFilter) {
      filtered = filtered.filter(memo => memo.department === departmentFilter)
    }

    return filtered
  }, [allMemos, searchTerm, typeFilter, statusFilter, priorityFilter, departmentFilter])

  // Pagination
  const totalPages = Math.ceil(filteredMemos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentMemos = filteredMemos.slice(startIndex, startIndex + itemsPerPage)

  // Get unique values for filters
  const types = Array.from(new Set(allMemos.map(memo => memo.memoType)))
  const statuses = Array.from(new Set(allMemos.map(memo => memo.status)))
  const priorities = Array.from(new Set(allMemos.map(memo => memo.priority)))
  const departments = Array.from(new Set(allMemos.map(memo => memo.department)))

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalValue = allMemos.reduce((sum, memo) => sum + memo.totalAmount, 0)
    const pendingMemos = allMemos.filter(memo => ['Submitted', 'Under Review'].includes(memo.status)).length
    const approvedMemos = allMemos.filter(memo => memo.status === 'Approved').length
    const implementedMemos = allMemos.filter(memo => memo.status === 'Implemented').length
    const linkedToPRO = allMemos.filter(memo => memo.linkedToPRO).length

    return {
      totalMemos: allMemos.length,
      totalValue,
      pendingMemos,
      approvedMemos,
      implementedMemos,
      linkedToPRO
    }
  }, [allMemos])

  // Handle linking memo to PRO
  const handleLinkToPRO = (memo: Memo) => {
    // Prepare memo data to pass to PRO creation page
    const memoData = {
      memoId: memo.id,
      memoNumber: memo.memoNumber,
      title: memo.title,
      requestedBy: memo.requestedBy,
      department: memo.department,
      totalAmount: memo.totalAmount,
      items: memo.items || [],
      purpose: memo.purpose
    }

    // Navigate to PRO creation page with memo data as query parameters
    const searchParams = new URLSearchParams({
      fromMemo: 'true',
      memoData: JSON.stringify(memoData)
    })

    router.push(`/orders/pro/create?${searchParams.toString()}`)
  }

  // Handle viewing memo details
  const handleViewMemo = (memo: Memo) => {
    console.log('handleViewMemo called for memo:', memo.id)
    router.push(`/admin/memo/${memo.id}`)
  }

  // Handle editing memo
  const handleEditMemo = (memo: Memo) => {
    console.log('handleEditMemo called for memo:', memo.id, 'status:', memo.status)
    if (memo.status === 'Draft' || memo.status === 'Rejected') {
      router.push(`/admin/memo/${memo.id}/edit`)
    } else {
      alert('Only draft or rejected memos can be edited')
    }
  }

  // Handle deleting memo
  const handleDeleteMemo = (memo: Memo) => {
    console.log('handleDeleteMemo called for memo:', memo.id)
    if (memo.status !== 'Draft' && memo.status !== 'Rejected') {
      alert('Only draft or rejected memos can be deleted')
      return
    }

    if (confirm(`Are you sure you want to delete memo ${memo.memoNumber}? This action cannot be undone.`)) {
      // In a real app, this would be an API call
      alert('Memo deleted successfully!')
      // You would then refresh the memo list
    }
  }

  return (
    <AppLayout>
      <div className="space-y-8 pb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-2xl shadow-lg ring-1 ring-red-100">
                <FileCheck className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">Memo Management</h1>
                <p className="text-gray-600 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-red-500" />
                  Purchase requests, funding requests, and administrative approvals
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center hover:bg-gray-50"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              <Button
                variant="outline"
                className="flex items-center hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white flex items-center"
                onClick={() => {
                  console.log('New Memo button clicked, navigating to /admin/memo/create')
                  router.push('/admin/memo/create')
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Memo
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Memos</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalMemos}</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-full">
                  <FileText className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Total Value</p>
                  <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.totalValue)}</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-full">
                  <DollarSign className="w-6 h-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Pending</p>
                  <p className="text-3xl font-bold text-yellow-900">{stats.pendingMemos}</p>
                </div>
                <div className="p-3 bg-yellow-200 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Approved</p>
                  <p className="text-3xl font-bold text-green-900">{stats.approvedMemos}</p>
                </div>
                <div className="p-3 bg-green-200 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700">Implemented</p>
                  <p className="text-3xl font-bold text-emerald-900">{stats.implementedMemos}</p>
                </div>
                <div className="p-3 bg-emerald-200 rounded-full">
                  <FileCheck className="w-6 h-6 text-emerald-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-700">Linked to PRO</p>
                  <p className="text-3xl font-bold text-indigo-900">{stats.linkedToPRO}</p>
                </div>
                <div className="p-3 bg-indigo-200 rounded-full">
                  <ArrowRight className="w-6 h-6 text-indigo-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search memos..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="">All Priorities</option>
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map(department => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Memos Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Memo</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Requested By</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentMemos.map((memo) => {
                  const StatusIcon = getStatusIcon(memo.status)
                  const TypeIcon = getMemoTypeIcon(memo.memoType)

                  return (
                    <tr key={memo.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <TypeIcon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{memo.title}</div>
                            <div className="text-sm text-gray-500">{memo.memoNumber}</div>
                            <div className="text-xs text-blue-600">{new Date(memo.dateCreated).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{memo.memoType}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <User className="w-4 h-4 mr-1 text-gray-400" />
                            {memo.requestedBy}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Building className="w-4 h-4 mr-1 text-gray-400" />
                            {memo.department}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(memo.totalAmount)}</div>
                        <div className="text-xs text-gray-500">
                          Required: {new Date(memo.dateRequired).toLocaleDateString()}
                        </div>
                        {memo.linkedToPRO && (
                          <div className="text-xs text-green-600 font-medium">
                            Linked: {memo.proNumber}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(memo.priority)}`}>
                          {memo.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="w-4 h-4 text-gray-400" />
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(memo.status)}`}>
                            {memo.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-blue-50"
                            onClick={() => handleViewMemo(memo)}
                            title="View memo details"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-green-50"
                            onClick={() => handleEditMemo(memo)}
                            title="Edit memo"
                            disabled={memo.status !== 'Draft' && memo.status !== 'Rejected'}
                          >
                            <Edit className="w-4 h-4 text-green-600" />
                          </Button>
                          {(memo.status === 'Draft' || memo.status === 'Rejected') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-red-50"
                              onClick={() => handleDeleteMemo(memo)}
                              title="Delete memo"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                          {memo.status === 'Approved' && !memo.linkedToPRO && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-purple-50"
                              onClick={() => handleLinkToPRO(memo)}
                              title="Create PRO from this memo"
                            >
                              <ArrowRight className="w-4 h-4 text-purple-600" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredMemos.length)} of {filteredMemos.length} memos
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  )
}