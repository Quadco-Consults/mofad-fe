'use client'

import { useState } from 'react'
import { Search, Plus, Eye, Edit, Trash2, Clock, CheckCircle, AlertCircle, DollarSign, Building } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'

interface Lodgement {
  id: string
  lodgementId: string
  accountId: string
  accountName: string
  date: string
  depositor: string
  depositSlipNumber: string
  amount: number
  currency: string
  bankBranch: string
  tellerName?: string
  description: string
  status: 'pending' | 'verified' | 'rejected'
  verifiedBy?: string
  verificationDate?: string
  rejectionReason?: string
  lodgedBy: string
  customerReference?: string
  attachments: string[]
}

const mockLodgements: Lodgement[] = [
  {
    id: '1',
    lodgementId: 'LDG-001234',
    accountId: 'ACC-001',
    accountName: 'MOFAD Energy Solutions - Operations',
    date: '2024-12-16T14:30:00Z',
    depositor: 'Conoil Petroleum Ltd',
    depositSlipNumber: 'DS-FBN-001234',
    amount: 15750000,
    currency: 'NGN',
    bankBranch: 'First Bank Victoria Island',
    tellerName: 'Mrs. Adunni Oluwaseun',
    description: 'Payment for Invoice INV-001234 - Bulk lubricant purchase',
    status: 'verified',
    verifiedBy: 'Finance Manager',
    verificationDate: '2024-12-16T16:45:00Z',
    lodgedBy: 'Customer',
    customerReference: 'CON-PAY-001234',
    attachments: ['deposit_slip_001234.pdf', 'payment_advice_001234.pdf']
  },
  {
    id: '2',
    lodgementId: 'LDG-001235',
    accountId: 'ACC-001',
    accountName: 'MOFAD Energy Solutions - Operations',
    date: '2024-12-15T11:20:00Z',
    depositor: 'MRS Oil Nigeria Plc',
    depositSlipNumber: 'DS-UBA-001235',
    amount: 8900000,
    currency: 'NGN',
    bankBranch: 'UBA Ikeja Branch',
    tellerName: 'Mr. Chukwuma Okafor',
    description: 'Partial payment for outstanding invoices',
    status: 'pending',
    lodgedBy: 'Sales Representative',
    customerReference: 'MRS-PAY-001235',
    attachments: ['deposit_slip_001235.pdf']
  },
  {
    id: '3',
    lodgementId: 'LDG-001236',
    accountId: 'ACC-003',
    accountName: 'MOFAD Energy Solutions - Savings',
    date: '2024-12-14T09:15:00Z',
    depositor: 'MOFAD Energy Solutions',
    depositSlipNumber: 'DS-GTB-001236',
    amount: 25000000,
    currency: 'NGN',
    bankBranch: 'GTB Lagos Island',
    tellerName: 'Mrs. Blessing Adeyemi',
    description: 'Transfer from operations account to savings',
    status: 'verified',
    verifiedBy: 'CFO',
    verificationDate: '2024-12-14T10:30:00Z',
    lodgedBy: 'Finance Department',
    attachments: ['internal_transfer_001236.pdf']
  },
  {
    id: '4',
    lodgementId: 'LDG-001237',
    accountId: 'ACC-004',
    accountName: 'MOFAD Energy Solutions - USD Operations',
    date: '2024-12-13T15:45:00Z',
    depositor: 'Global Energy Partners LLC',
    depositSlipNumber: 'DS-ZEN-001237',
    amount: 45000,
    currency: 'USD',
    bankBranch: 'Zenith Bank Victoria Island',
    tellerName: 'Mr. Ibrahim Hassan',
    description: 'Advance payment for international procurement',
    status: 'verified',
    verifiedBy: 'Treasury Manager',
    verificationDate: '2024-12-13T17:20:00Z',
    lodgedBy: 'Customer',
    customerReference: 'GEP-ADV-001237',
    attachments: ['fx_deposit_slip_001237.pdf', 'swift_advice_001237.pdf']
  },
  {
    id: '5',
    lodgementId: 'LDG-001238',
    accountId: 'ACC-001',
    accountName: 'MOFAD Energy Solutions - Operations',
    date: '2024-12-12T16:30:00Z',
    depositor: 'Oando Marketing Plc',
    depositSlipNumber: 'DS-ACC-001238',
    amount: 12500000,
    currency: 'NGN',
    bankBranch: 'Access Bank Apapa',
    description: 'Payment for marine lubricants supply',
    status: 'rejected',
    rejectionReason: 'Deposit slip amount does not match lodged amount',
    lodgedBy: 'Sales Representative',
    customerReference: 'OAN-PAY-001238',
    attachments: ['deposit_slip_001238.pdf']
  },
  {
    id: '6',
    lodgementId: 'LDG-001239',
    accountId: 'ACC-002',
    accountName: 'MOFAD Energy Solutions - Payroll',
    date: '2024-12-11T13:10:00Z',
    depositor: 'MOFAD Energy Solutions',
    depositSlipNumber: 'DS-STL-001239',
    amount: 5000000,
    currency: 'NGN',
    bankBranch: 'Sterling Bank Surulere',
    tellerName: 'Mrs. Funmi Adebayo',
    description: 'Monthly payroll funding transfer',
    status: 'verified',
    verifiedBy: 'HR Manager',
    verificationDate: '2024-12-11T14:25:00Z',
    lodgedBy: 'HR Department',
    attachments: ['payroll_transfer_001239.pdf']
  },
  {
    id: '7',
    lodgementId: 'LDG-001240',
    accountId: 'ACC-006',
    accountName: 'MOFAD Energy Solutions - Petty Cash',
    date: '2024-12-10T10:40:00Z',
    depositor: 'Petty Cash Officer',
    depositSlipNumber: 'DS-FBN-001240',
    amount: 750000,
    currency: 'NGN',
    bankBranch: 'First Bank Surulere',
    tellerName: 'Mr. Adebola Ogundimu',
    description: 'Petty cash replenishment from operations',
    status: 'pending',
    lodgedBy: 'Admin Officer',
    attachments: ['petty_cash_slip_001240.pdf']
  }
]

function LodgementsPage() {
  const [lodgements] = useState<Lodgement[]>(mockLodgements)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [accountFilter, setAccountFilter] = useState<string>('all')
  const [depositorFilter, setDepositorFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [selectedLodgement, setSelectedLodgement] = useState<Lodgement | null>(null)

  const accounts = Array.from(new Set(lodgements.map(l => l.accountName)))
  const depositors = Array.from(new Set(lodgements.map(l => l.depositor)))

  const filteredLodgements = lodgements.filter(lodgement => {
    const matchesSearch = lodgement.lodgementId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lodgement.depositor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lodgement.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || lodgement.status === statusFilter
    const matchesAccount = accountFilter === 'all' || lodgement.accountName === accountFilter
    const matchesDepositor = depositorFilter === 'all' || lodgement.depositor === depositorFilter

    return matchesSearch && matchesStatus && matchesAccount && matchesDepositor
  })

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      }).format(amount)
    }
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'rejected': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      verified: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  // Calculate summary stats
  const totalLodgements = lodgements.length
  const verifiedLodgements = lodgements.filter(l => l.status === 'verified').length
  const pendingLodgements = lodgements.filter(l => l.status === 'pending').length
  const totalAmount = lodgements.filter(l => l.status === 'verified' && l.currency === 'NGN').reduce((sum, l) => sum + l.amount, 0)

  const handleView = (lodgement: Lodgement) => {
    setSelectedLodgement(lodgement)
    setShowViewModal(true)
  }

  const handleVerify = (lodgement: Lodgement) => {
    setSelectedLodgement(lodgement)
    setShowVerifyModal(true)
  }

  const handleEdit = (lodgement: Lodgement) => {
    setSelectedLodgement(lodgement)
    // Show edit modal logic here
  }

  const handleDelete = (lodgementId: string) => {
    if (confirm('Are you sure you want to delete this lodgement record?')) {
      console.log('Deleting lodgement:', lodgementId)
    }
  }

  const handleVerifySubmit = (action: 'verify' | 'reject', reason?: string) => {
    if (selectedLodgement) {
      console.log(`${action} lodgement:`, selectedLodgement.lodgementId, reason)
      setShowVerifyModal(false)
      setSelectedLodgement(null)
    }
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Account Lodgements</h1>
            <p className="text-gray-600">Monitor and verify all cash deposits and bank lodgements</p>
          </div>
          <Button className="mofad-btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Record Lodgement
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Lodgements</p>
                <p className="text-2xl font-bold text-gray-900">{totalLodgements}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">{verifiedLodgements}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Verification</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingLodgements}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Verified</p>
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search lodgements..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
          >
            <option value="all">All Accounts</option>
            {accounts.map(account => (
              <option key={account} value={account}>{account}</option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={depositorFilter}
            onChange={(e) => setDepositorFilter(e.target.value)}
          >
            <option value="all">All Depositors</option>
            {depositors.map(depositor => (
              <option key={depositor} value={depositor}>{depositor}</option>
            ))}
          </select>

          <Button variant="outline">
            Generate Report
          </Button>
        </div>

        {/* Lodgements Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredLodgements.map((lodgement) => (
            <div key={lodgement.id} className="mofad-card">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{lodgement.lodgementId}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(lodgement.status)}`}>
                      {getStatusIcon(lodgement.status)}
                      <span className="ml-1">{lodgement.status.charAt(0).toUpperCase() + lodgement.status.slice(1)}</span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{lodgement.description}</p>
                  <div className="text-xs text-gray-500">
                    Slip: {lodgement.depositSlipNumber} | {formatDateTime(lodgement.date)}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleView(lodgement)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {lodgement.status === 'pending' && (
                    <Button variant="ghost" size="sm" onClick={() => handleVerify(lodgement)}>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(lodgement)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(lodgement.id)} className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Amount */}
              <div className="text-center p-4 bg-primary-50 rounded-lg mb-4">
                <div className="text-3xl font-bold text-primary-900 mb-1">
                  {formatCurrency(lodgement.amount, lodgement.currency)}
                </div>
                <div className="text-sm text-primary-700">Lodgement Amount</div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Depositor</span>
                  <span className="font-medium text-gray-900">{lodgement.depositor}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Account</span>
                  <span className="font-medium text-gray-900">{lodgement.accountName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bank Branch</span>
                  <span className="font-medium text-gray-900">{lodgement.bankBranch}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Lodged By</span>
                  <span className="font-medium text-gray-900">{lodgement.lodgedBy}</span>
                </div>
                {lodgement.tellerName && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Teller</span>
                    <span className="font-medium text-gray-900">{lodgement.tellerName}</span>
                  </div>
                )}
              </div>

              {/* Verification Info */}
              {lodgement.status === 'verified' && lodgement.verifiedBy && (
                <div className="p-3 bg-green-50 rounded-lg mb-4">
                  <div className="text-sm text-green-800">
                    Verified by {lodgement.verifiedBy} on {formatDateTime(lodgement.verificationDate!)}
                  </div>
                </div>
              )}

              {lodgement.status === 'rejected' && (
                <div className="p-3 bg-red-50 rounded-lg mb-4">
                  <div className="text-sm text-red-800">
                    <strong>Rejected:</strong> {lodgement.rejectionReason}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {lodgement.attachments.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Attachments ({lodgement.attachments.length})</div>
                  <div className="flex flex-wrap gap-1">
                    {lodgement.attachments.map((attachment, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {attachment}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <Button variant="outline" className="flex-1">
                  View Details
                </Button>
                {lodgement.status === 'pending' && (
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                    Verify
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredLodgements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No lodgements found matching your criteria.</p>
          </div>
        )}

        {/* Add Lodgement Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Record New Lodgement</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      <option>Select Account</option>
                      <option>MOFAD Energy - Operations</option>
                      <option>MOFAD Energy - Savings</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Depositor</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      <option>NGN</option>
                      <option>USD</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Slip Number</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Branch</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" rows={3}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                  <input type="file" multiple className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button className="mofad-btn-primary">Record Lodgement</Button>
              </div>
            </div>
          </div>
        )}

        {/* Verify Lodgement Modal */}
        {showVerifyModal && selectedLodgement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Verify Lodgement</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Lodgement ID</div>
                  <div className="font-medium">{selectedLodgement.lodgementId}</div>
                  <div className="text-sm text-gray-600 mt-2">Amount</div>
                  <div className="font-bold text-lg">{formatCurrency(selectedLodgement.amount, selectedLodgement.currency)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verification Notes</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    placeholder="Add any verification notes..."
                  ></textarea>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowVerifyModal(false)}>Cancel</Button>
                <Button
                  variant="outline"
                  onClick={() => handleVerifySubmit('reject')}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleVerifySubmit('verify')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Verify
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default LodgementsPage