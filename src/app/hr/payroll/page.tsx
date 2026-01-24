'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatNumber } from '@/lib/utils'
import {
  Users,
  DollarSign,
  FileText,
  Calendar,
  Calculator,
  TrendingUp,
  Download,
  Plus,
  Settings,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Filter,
  Search,
  RefreshCw,
  UserCheck,
  Building,
  CreditCard
} from 'lucide-react'

interface PayrollRecord {
  id: string
  employee: {
    id: string
    name: string
    employeeId: string
    department: string
    position: string
  }
  payPeriod: string
  baseSalary: number
  allowances: number
  deductions: number
  overtime: number
  bonus: number
  netPay: number
  status: 'draft' | 'approved' | 'paid' | 'pending'
  payDate: string
}

interface PayrollSummary {
  totalEmployees: number
  totalGrossPay: number
  totalDeductions: number
  totalNetPay: number
  pendingApprovals: number
  processedPayrolls: number
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = 'orange' }: any) => {
  const colors = {
    orange: 'from-orange-500 to-orange-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600'
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' ? formatCurrency(value) : value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} text-white group-hover:scale-110 transition-transform`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className={`h-4 w-4 mr-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span className={trend > 0 ? 'text-green-600' : 'text-red-600'}>
              {Math.abs(trend)}% vs last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function PayrollPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-01')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: payrollData, isLoading, refetch } = useQuery({
    queryKey: ['payroll', selectedPeriod],
    queryFn: () => apiClient.get(`/hr/payroll?period=${selectedPeriod}`),
  })

  // Mock data for development
  const mockSummary: PayrollSummary = {
    totalEmployees: 284,
    totalGrossPay: 45600000,
    totalDeductions: 5400000,
    totalNetPay: 40200000,
    pendingApprovals: 12,
    processedPayrolls: 272
  }

  const mockPayrolls: PayrollRecord[] = [
    {
      id: '1',
      employee: {
        id: 'EMP001',
        name: 'John Adebayo',
        employeeId: 'MOFAD-001',
        department: 'Operations',
        position: 'Senior Technician'
      },
      payPeriod: '2024-01',
      baseSalary: 180000,
      allowances: 45000,
      deductions: 22500,
      overtime: 15000,
      bonus: 0,
      netPay: 217500,
      status: 'paid',
      payDate: '2024-01-31'
    },
    {
      id: '2',
      employee: {
        id: 'EMP002',
        name: 'Fatima Ibrahim',
        employeeId: 'MOFAD-002',
        department: 'Finance',
        position: 'Accountant'
      },
      payPeriod: '2024-01',
      baseSalary: 220000,
      allowances: 55000,
      deductions: 27500,
      overtime: 0,
      bonus: 25000,
      netPay: 272500,
      status: 'approved',
      payDate: '2024-01-31'
    },
    {
      id: '3',
      employee: {
        id: 'EMP003',
        name: 'Ahmed Musa',
        employeeId: 'MOFAD-003',
        department: 'Engineering',
        position: 'Project Manager'
      },
      payPeriod: '2024-01',
      baseSalary: 300000,
      allowances: 75000,
      deductions: 37500,
      overtime: 0,
      bonus: 50000,
      netPay: 387500,
      status: 'pending',
      payDate: '2024-01-31'
    }
  ]

  const filteredPayrolls = mockPayrolls.filter(payroll => {
    const matchesSearch = payroll.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payroll.employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || payroll.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payroll Management</h1>
            <p className="text-gray-600">Manage employee salaries, allowances, and deductions</p>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="2024-01">January 2024</option>
              <option value="2023-12">December 2023</option>
              <option value="2023-11">November 2023</option>
            </select>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Payroll
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Employees"
            value={mockSummary.totalEmployees}
            subtitle="Active employees"
            icon={Users}
            color="orange"
          />
          <MetricCard
            title="Gross Pay"
            value={mockSummary.totalGrossPay}
            subtitle="Before deductions"
            icon={DollarSign}
            color="blue"
            trend={8.2}
          />
          <MetricCard
            title="Total Deductions"
            value={mockSummary.totalDeductions}
            subtitle="Tax, pension, etc."
            icon={Calculator}
            color="purple"
            trend={-2.1}
          />
          <MetricCard
            title="Net Pay"
            value={mockSummary.totalNetPay}
            subtitle="Final amount"
            icon={CreditCard}
            color="green"
            trend={6.4}
          />
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-orange-600">{mockSummary.pendingApprovals}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processed</p>
                  <p className="text-2xl font-bold text-green-600">{mockSummary.processedPayrolls}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Next Pay Date</p>
                  <p className="text-lg font-bold text-gray-900">Jan 31, 2024</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payroll Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Payroll Records - {selectedPeriod}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Base Salary</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Allowances</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Deductions</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Net Pay</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayrolls.map((payroll) => (
                    <tr key={payroll.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{payroll.employee.name}</p>
                          <p className="text-sm text-gray-500">{payroll.employee.employeeId}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-gray-900">{payroll.employee.department}</p>
                          <p className="text-sm text-gray-500">{payroll.employee.position}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-medium">
                        {formatCurrency(payroll.baseSalary)}
                      </td>
                      <td className="py-4 px-4 text-right text-green-600 font-medium">
                        +{formatCurrency(payroll.allowances)}
                      </td>
                      <td className="py-4 px-4 text-right text-red-600 font-medium">
                        -{formatCurrency(payroll.deductions)}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-gray-900">
                        {formatCurrency(payroll.netPay)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <StatusBadge status={payroll.status} />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Quick Payroll Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <UserCheck className="h-6 w-6 mb-2" />
                Bulk Approve
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Calculator className="h-6 w-6 mb-2" />
                Calculate Taxes
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <FileText className="h-6 w-6 mb-2" />
                Generate Payslips
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Building className="h-6 w-6 mb-2" />
                Bank Transfer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}