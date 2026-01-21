'use client'

import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  PieChart as PieChartIcon,
  BarChart3,
  FileSpreadsheet,
  Percent,
  Activity,
  X
} from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'

interface BudgetItem {
  id: string
  category: string
  subcategory: string
  budgetedAmount: number
  actualAmount: number
  variance: number
  variancePercentage: number
  department: string
  period: string
  lastUpdated: string
  status: 'on-track' | 'over-budget' | 'under-budget' | 'at-risk'
  notes?: string
}

interface BudgetCategory {
  name: string
  budgeted: number
  actual: number
  variance: number
  color: string
}

const mockBudgetData: BudgetItem[] = [
  {
    id: '1',
    category: 'Petroleum Products',
    subcategory: 'PMS Purchase',
    budgetedAmount: 5000000000,
    actualAmount: 4800000000,
    variance: -200000000,
    variancePercentage: -4.0,
    department: 'Supply Chain',
    period: '2024-01',
    lastUpdated: '2024-01-15T10:30:00Z',
    status: 'under-budget'
  },
  {
    id: '2',
    category: 'Petroleum Products',
    subcategory: 'AGO Purchase',
    budgetedAmount: 3500000000,
    actualAmount: 3750000000,
    variance: 250000000,
    variancePercentage: 7.1,
    department: 'Supply Chain',
    period: '2024-01',
    lastUpdated: '2024-01-15T10:30:00Z',
    status: 'over-budget'
  },
  {
    id: '3',
    category: 'Operations',
    subcategory: 'Transportation',
    budgetedAmount: 850000000,
    actualAmount: 920000000,
    variance: 70000000,
    variancePercentage: 8.2,
    department: 'Logistics',
    period: '2024-01',
    lastUpdated: '2024-01-15T10:30:00Z',
    status: 'over-budget'
  },
  {
    id: '4',
    category: 'Operations',
    subcategory: 'Maintenance',
    budgetedAmount: 450000000,
    actualAmount: 380000000,
    variance: -70000000,
    variancePercentage: -15.6,
    department: 'Operations',
    period: '2024-01',
    lastUpdated: '2024-01-15T10:30:00Z',
    status: 'under-budget'
  },
  {
    id: '5',
    category: 'Personnel',
    subcategory: 'Salaries & Benefits',
    budgetedAmount: 280000000,
    actualAmount: 280000000,
    variance: 0,
    variancePercentage: 0,
    department: 'Human Resources',
    period: '2024-01',
    lastUpdated: '2024-01-15T10:30:00Z',
    status: 'on-track'
  },
  {
    id: '6',
    category: 'Administrative',
    subcategory: 'Utilities',
    budgetedAmount: 125000000,
    actualAmount: 145000000,
    variance: 20000000,
    variancePercentage: 16.0,
    department: 'Administration',
    period: '2024-01',
    lastUpdated: '2024-01-15T10:30:00Z',
    status: 'at-risk'
  },
  {
    id: '7',
    category: 'Marketing',
    subcategory: 'Advertising & Promotion',
    budgetedAmount: 180000000,
    actualAmount: 165000000,
    variance: -15000000,
    variancePercentage: -8.3,
    department: 'Marketing',
    period: '2024-01',
    lastUpdated: '2024-01-15T10:30:00Z',
    status: 'under-budget'
  },
  {
    id: '8',
    category: 'Technology',
    subcategory: 'IT Infrastructure',
    budgetedAmount: 95000000,
    actualAmount: 105000000,
    variance: 10000000,
    variancePercentage: 10.5,
    department: 'IT',
    period: '2024-01',
    lastUpdated: '2024-01-15T10:30:00Z',
    status: 'over-budget'
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'on-track':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'under-budget':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'over-budget':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'at-risk':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'on-track':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'under-budget':
      return <TrendingDown className="h-4 w-4 text-blue-600" />
    case 'over-budget':
      return <TrendingUp className="h-4 w-4 text-red-600" />
    case 'at-risk':
      return <AlertTriangle className="h-4 w-4 text-orange-600" />
    default:
      return <Activity className="h-4 w-4 text-gray-600" />
  }
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6']

export default function BudgetPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewType, setViewType] = useState<'table' | 'chart' | 'summary'>('table')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Get unique categories and departments for filters
  const categories = Array.from(new Set(mockBudgetData.map(item => item.category)))
  const departments = Array.from(new Set(mockBudgetData.map(item => item.department)))

  // Filter budget data
  const filteredBudgetData = mockBudgetData.filter(item => {
    const matchesSearch = item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    const matchesDepartment = departmentFilter === 'all' || item.department === departmentFilter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter

    return matchesSearch && matchesCategory && matchesDepartment && matchesStatus
  })

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const totalBudgeted = filteredBudgetData.reduce((sum, item) => sum + item.budgetedAmount, 0)
    const totalActual = filteredBudgetData.reduce((sum, item) => sum + item.actualAmount, 0)
    const totalVariance = totalActual - totalBudgeted
    const variancePercentage = totalBudgeted > 0 ? (totalVariance / totalBudgeted) * 100 : 0

    const onTrackCount = filteredBudgetData.filter(item => item.status === 'on-track').length
    const overBudgetCount = filteredBudgetData.filter(item => item.status === 'over-budget').length
    const underBudgetCount = filteredBudgetData.filter(item => item.status === 'under-budget').length
    const atRiskCount = filteredBudgetData.filter(item => item.status === 'at-risk').length

    return {
      totalBudgeted,
      totalActual,
      totalVariance,
      variancePercentage,
      onTrackCount,
      overBudgetCount,
      underBudgetCount,
      atRiskCount
    }
  }, [filteredBudgetData])

  // Prepare chart data
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, BudgetCategory>()

    filteredBudgetData.forEach(item => {
      if (categoryMap.has(item.category)) {
        const existing = categoryMap.get(item.category)!
        existing.budgeted += item.budgetedAmount
        existing.actual += item.actualAmount
        existing.variance += item.variance
      } else {
        categoryMap.set(item.category, {
          name: item.category,
          budgeted: item.budgetedAmount,
          actual: item.actualAmount,
          variance: item.variance,
          color: COLORS[categoryMap.size % COLORS.length]
        })
      }
    })

    return Array.from(categoryMap.values())
  }, [filteredBudgetData])

  const pieChartData = categoryData.map(item => ({
    name: item.name,
    value: item.budgeted,
    color: item.color
  }))

  const CreateBudgetModal = () => {
    const [formData, setFormData] = useState({
      category: '',
      subcategory: '',
      budgetedAmount: '',
      department: '',
      notes: ''
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      // Handle budget creation
      console.log('Creating budget item:', formData)
      setShowCreateModal(false)
      setFormData({
        category: '',
        subcategory: '',
        budgetedAmount: '',
        department: '',
        notes: ''
      })
    }

    if (!showCreateModal) return null

    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Create Budget Item</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateModal(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                required
              >
                <option value="">Select Category</option>
                <option value="Petroleum Products">Petroleum Products</option>
                <option value="Operations">Operations</option>
                <option value="Personnel">Personnel</option>
                <option value="Administrative">Administrative</option>
                <option value="Marketing">Marketing</option>
                <option value="Technology">Technology</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.subcategory}
                onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                placeholder="Enter subcategory"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budgeted Amount (₦)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.budgetedAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, budgetedAmount: e.target.value }))}
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                required
              >
                <option value="">Select Department</option>
                <option value="Supply Chain">Supply Chain</option>
                <option value="Logistics">Logistics</option>
                <option value="Operations">Operations</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Administration">Administration</option>
                <option value="Marketing">Marketing</option>
                <option value="IT">IT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 mofad-btn-primary">
                Create Budget Item
              </Button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Budget Management</h1>
            <p className="text-muted-foreground">Track budget allocation, spending, and variance analysis</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="mofad-btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Budget
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Budgeted</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(summaryMetrics.totalBudgeted)}</p>
                </div>
                <Target className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Actual</p>
                  <p className="text-2xl font-bold text-secondary">{formatCurrency(summaryMetrics.totalActual)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-secondary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Variance</p>
                  <p className={`text-2xl font-bold ${summaryMetrics.totalVariance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(Math.abs(summaryMetrics.totalVariance))}
                  </p>
                  <p className={`text-xs ${summaryMetrics.variancePercentage >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {summaryMetrics.variancePercentage >= 0 ? '+' : ''}{summaryMetrics.variancePercentage.toFixed(1)}%
                  </p>
                </div>
                {summaryMetrics.totalVariance >= 0 ? (
                  <TrendingUp className="w-8 h-8 text-red-600/60" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-green-600/60" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Budget Items</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-green-600">{summaryMetrics.onTrackCount} on-track</span>
                    <span className="text-sm text-red-600">{summaryMetrics.overBudgetCount} over</span>
                  </div>
                </div>
                <Activity className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={viewType === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewType('table')}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Table
            </Button>
            <Button
              variant={viewType === 'chart' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewType('chart')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Charts
            </Button>
            <Button
              variant={viewType === 'summary' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewType('summary')}
            >
              <PieChartIcon className="w-4 h-4 mr-2" />
              Summary
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search budget items..."
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  {departments.map(department => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>

                <select
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="on-track">On Track</option>
                  <option value="under-budget">Under Budget</option>
                  <option value="over-budget">Over Budget</option>
                  <option value="at-risk">At Risk</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content based on view type */}
        {viewType === 'table' && (
          <Card>
            <CardContent className="p-0">
              {filteredBudgetData.length === 0 ? (
                <div className="p-12 text-center">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No budget items found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Budgeted</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Actual</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-900">Variance</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredBudgetData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{item.category}</div>
                              <div className="text-sm text-gray-500">{item.subcategory}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-900">{item.department}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-medium text-gray-900">{formatCurrency(item.budgetedAmount)}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-medium text-gray-900">{formatCurrency(item.actualAmount)}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div>
                              <span className={`font-medium ${item.variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {item.variance >= 0 ? '+' : ''}{formatCurrency(item.variance)}
                              </span>
                              <div className={`text-xs ${item.variancePercentage >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {item.variancePercentage >= 0 ? '+' : ''}{item.variancePercentage.toFixed(1)}%
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {getStatusIcon(item.status)}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status || 'unknown')}`}>
                                {(item.status || 'Unknown').charAt(0).toUpperCase() + (item.status || 'unknown').slice(1).replace('-', ' ')}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex gap-1 justify-center">
                              <Button variant="ghost" size="sm" title="View Details">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Edit Budget">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Delete Budget">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {viewType === 'chart' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget vs Actual by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `₦${(value / 1000000).toFixed(0)}M`} />
                    <Tooltip formatter={(value: any) => [formatCurrency(value), ""]} />
                    <Legend />
                    <Bar dataKey="budgeted" name="Budgeted" fill="#3B82F6" />
                    <Bar dataKey="actual" name="Actual" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Variance by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `₦${(value / 1000000).toFixed(0)}M`} />
                    <Tooltip formatter={(value: any) => [formatCurrency(value), ""]} />
                    <Legend />
                    <Bar dataKey="variance" name="Variance" fill={(entry: any) => entry.variance >= 0 ? "#EF4444" : "#10B981"} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {viewType === 'summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Distribution by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [formatCurrency(value), ""]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{formatCurrency(category.budgeted)}</div>
                        <div className={`text-sm ${category.variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {category.variance >= 0 ? '+' : ''}{((category.variance / category.budgeted) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <CreateBudgetModal />
      </div>
    </AppLayout>
  )
}