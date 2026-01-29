'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Download,
  X
} from 'lucide-react'

interface Expense {
  id: number
  expenseName: string
  requestedBy: string
  expenseType: string
  amount: number
  requestedDate: string
  approvalStatus: 'pending' | 'approved' | 'declined'
  approvedBy: string | null
}

const mockExpenses: Expense[] = [
  {
    id: 1,
    expenseName: 'Office Supply Purchase',
    requestedBy: 'Ahmad Ibrahim',
    expenseType: 'Stationery',
    amount: 45000,
    requestedDate: '2024-01-20',
    approvalStatus: 'approved',
    approvedBy: 'Muhammad Ilu'
  },
  {
    id: 2,
    expenseName: 'Fuel Reimbursement',
    requestedBy: 'Fatima Usman',
    expenseType: 'Transportation',
    amount: 25000,
    requestedDate: '2024-01-22',
    approvalStatus: 'pending',
    approvedBy: null
  },
  {
    id: 3,
    expenseName: 'Equipment Maintenance',
    requestedBy: 'Musa Garba',
    expenseType: 'Maintenance',
    amount: 75000,
    requestedDate: '2024-01-18',
    approvalStatus: 'approved',
    approvedBy: 'Ahmad Musa'
  },
  {
    id: 4,
    expenseName: 'Client Meeting Expenses',
    requestedBy: 'Aisha Mohammed',
    expenseType: 'Entertainment',
    amount: 35000,
    requestedDate: '2024-01-25',
    approvalStatus: 'declined',
    approvedBy: 'Muhammad Ilu'
  },
  {
    id: 5,
    expenseName: 'Software License',
    requestedBy: 'Ibrahim Yusuf',
    expenseType: 'Technology',
    amount: 120000,
    requestedDate: '2024-01-21',
    approvalStatus: 'approved',
    approvedBy: 'Ahmad Musa'
  },
  {
    id: 6,
    expenseName: 'Training Workshop',
    requestedBy: 'Halima Bello',
    expenseType: 'Training',
    amount: 85000,
    requestedDate: '2024-01-23',
    approvalStatus: 'pending',
    approvedBy: null
  }
]

export default function ExpensesPage() {
  const [expenses] = useState<Expense[]>(mockExpenses)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [showPendingModal, setShowPendingModal] = useState(false)
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)

  const itemsPerPage = 10

  // Filter expenses based on search term
  const filteredExpenses = expenses.filter(expense =>
    expense.expenseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.expenseType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate pagination
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage)
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium"

    switch (status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800 border border-green-200`
      case 'pending':
        return `${baseClasses} bg-amber-100 text-amber-800 border border-amber-200`
      case 'declined':
        return `${baseClasses} bg-red-100 text-red-800 border border-red-200`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`
    }
  }

  const handleApprove = (expense: Expense) => {
    setSelectedExpense(expense)
    setShowSuccessModal(true)
  }

  const handleDecline = (expense: Expense) => {
    setSelectedExpense(expense)
    setShowDeclineModal(true)
  }

  const showPendingExpenses = () => {
    setShowPendingModal(true)
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Expenses Management</h1>
            <p className="text-gray-600">Track and manage company expenses and approvals</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={showPendingExpenses}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Pending Expenses
            </button>
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Expenses
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-orange-500 to-amber-500">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Expense Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Requested by</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Expense Type</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Requested Date</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white">Approval Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Approved By</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedExpenses.map((expense, index) => (
                  <tr key={expense.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{expense.expenseName}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{expense.requestedBy}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {expense.expenseType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{formatDate(expense.requestedDate)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={getStatusBadge(expense.approvalStatus)}>
                        {expense.approvalStatus.charAt(0).toUpperCase() + expense.approvalStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{expense.approvedBy || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {expense.approvalStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(expense)}
                              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDecline(expense)}
                              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                              title="Decline"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length} expenses
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Success!</h2>
            <p className="text-gray-600 mb-6">
              {selectedExpense?.expenseName} has been successfully approved.
            </p>
            <button
              onClick={() => {
                setShowSuccessModal(false)
                setSelectedExpense(null)
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Decline Expense</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to decline &quot;{selectedExpense?.expenseName}&quot;?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeclineModal(false)
                  setSelectedExpense(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeclineModal(false)
                  setSelectedExpense(null)
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Lubebay Expenses Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Pending Lubebay Expenses</h2>
              <button
                onClick={() => setShowPendingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                {expenses.filter(exp => exp.approvalStatus === 'pending').map((expense) => (
                  <div key={expense.id} className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{expense.expenseName}</h3>
                        <p className="text-sm text-gray-600 mb-2">Requested by {expense.requestedBy}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Type: {expense.expenseType}</span>
                          <span>Amount: {formatCurrency(expense.amount)}</span>
                          <span>Date: {formatDate(expense.requestedDate)}</span>
                        </div>
                      </div>
                      <span className={getStatusBadge(expense.approvalStatus)}>
                        Pending
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New Expense</h2>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expense Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter expense name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expense Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                  <option value="">Select expense type</option>
                  <option value="stationery">Stationery</option>
                  <option value="transportation">Transportation</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="technology">Technology</option>
                  <option value="training">Training</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows={3}
                  placeholder="Enter expense description"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}