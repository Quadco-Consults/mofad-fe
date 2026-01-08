'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  ArrowLeft,
  Edit,
  Download,
  FileCheck,
  User,
  Building,
  Calendar,
  DollarSign,
  Package,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Printer,
  Share2,
} from 'lucide-react'

// Using the same interfaces as the memo system
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
  // Additional routing fields for memo format
  toRecipient?: string
  throughRecipient?: string
  mdApprover?: string
  cooApprover?: string
  mdApprovalDate?: string
  cooApprovalDate?: string
  mdSignature?: string
  cooSignature?: string
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

// Mock function to get memo by ID (in real app, this would be an API call)
const getMemoById = (id: string): Memo | null => {
  const mockMemo: Memo = {
    id: parseInt(id),
    memoNumber: `MEM/MOFAD/2025/${id.padStart(4, '0')}`,
    title: 'Purchase of Office Equipment for IT Department',
    memoType: 'Purchase Request',
    requestedBy: 'Adebayo Johnson',
    department: 'Information Technology',
    dateCreated: '2024-01-15',
    dateRequired: '2024-02-15',
    status: 'Approved',
    priority: 'High',
    purpose: 'Procurement of office equipment for new employees',
    justification: 'We need to purchase office equipment for the 5 new employees joining the IT department. This equipment is essential for their productivity and aligns with our Q1 expansion plans. The current equipment shortage is affecting productivity and we need to ensure all staff have adequate tools to perform their duties effectively.',
    items: [
      {
        id: 1,
        description: 'Dell OptiPlex Desktop Computer',
        quantity: 5,
        unit: 'Units',
        unitCost: 450000,
        totalCost: 2250000,
        vendor: 'Grand Concept Ltd',
        specifications: '8GB RAM, 256GB SSD, Intel i5 processor'
      },
      {
        id: 2,
        description: 'HP LaserJet Printer',
        quantity: 2,
        unit: 'Units',
        unitCost: 125000,
        totalCost: 250000,
        vendor: 'Office Plus Nigeria',
        specifications: 'Duplex printing, network capable'
      },
      {
        id: 3,
        description: 'Executive Office Chairs',
        quantity: 5,
        unit: 'Units',
        unitCost: 85000,
        totalCost: 425000,
        vendor: 'Corporate Supplies Co',
        specifications: 'Ergonomic, leather finish, height adjustable'
      }
    ],
    totalAmount: 2925000,
    requestedAmount: 2925000,
    approvedAmount: 2925000,
    reviewedBy: 'Ibrahim Musa',
    reviewDate: '2024-01-18',
    approvedBy: 'Ibrahim Musa',
    approvalDate: '2024-01-18',
    comments: [
      'Reviewed by Ibrahim Musa on 2024-01-18',
      'Approved for full amount of ₦2,925,000',
      'Please proceed with procurement through approved vendors.'
    ],
    linkedToPRO: true,
    proNumber: 'PRO-2024-0045',
    // Official memo routing
    toRecipient: 'Managing Director',
    throughRecipient: 'Chief Operating Officer',
    mdApprover: 'Dr. Fatima Ahmed',
    cooApprover: 'Ibrahim Musa',
    mdApprovalDate: '2024-01-20',
    cooApprovalDate: '2024-01-19',
    mdSignature: 'Dr. Fatima Ahmed',
    cooSignature: 'Ibrahim Musa'
  }

  return mockMemo
}

export default function MemoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [memo, setMemo] = useState<Memo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      // Simulate loading
      setTimeout(() => {
        const memoData = getMemoById(params.id as string)
        setMemo(memoData)
        setIsLoading(false)
      }, 500)
    }
  }, [params.id])

  const handlePrint = () => {
    window.print()
  }

  const handleEdit = () => {
    router.push(`/admin/memo/${params.id}/edit`)
  }

  const handleCreatePRO = () => {
    if (memo) {
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

      const searchParams = new URLSearchParams({
        fromMemo: 'true',
        memoData: JSON.stringify(memoData)
      })

      router.push(`/orders/pro/create?${searchParams.toString()}`)
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!memo) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Memo Not Found</h1>
          <Button onClick={() => router.push('/admin/memo')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Memos
          </Button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Actions - Only visible on screen, not in print */}
        <div className="print:hidden flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push('/admin/memo')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Memos
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{memo.title}</h1>
              <p className="text-gray-600">{memo.memoNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handlePrint} variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            {(memo.status === 'Draft' || memo.status === 'Rejected') && (
              <Button onClick={handleEdit} variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            {memo.status === 'Approved' && !memo.linkedToPRO && (
              <Button onClick={handleCreatePRO} className="bg-green-600 hover:bg-green-700">
                <ArrowRight className="w-4 h-4 mr-2" />
                Create PRO
              </Button>
            )}
          </div>
        </div>

        {/* Official MOFAD Memo Document */}
        <Card className="bg-white">
          <CardContent className="p-8 print:p-6">

            {/* MOFAD Header with Logo */}
            <div className="text-center mb-8 border-b-2 border-gray-200 pb-6">
              <div className="flex justify-center items-center mb-4">
                {/* MOFAD Logo */}
                <div className="bg-white/95 p-2 rounded-xl shadow-lg backdrop-blur-sm mr-4">
                  <img
                    src="/modah_logo-removebg-preview.png"
                    alt="MOFAD Energy Solutions"
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <div className="text-left">
                  <h1 className="text-2xl font-bold text-gray-900">MOFAD ENERGY SOLUTIONS LIMITED</h1>
                  <p className="text-lg text-gray-700">ENERGY SOLUTIONS COMPANY</p>
                  <p className="text-sm text-gray-600">Nigeria</p>
                </div>
              </div>

              <div className="bg-blue-50 py-3 px-6 rounded-lg">
                <h2 className="text-xl font-bold text-blue-800 uppercase">INTERNAL MEMORANDUM</h2>
              </div>
            </div>

            {/* Memo Routing Information */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div className="border-b border-gray-300 pb-2">
                  <div className="flex">
                    <span className="font-bold text-gray-700 w-20">TO:</span>
                    <span className="text-gray-900">{memo.toRecipient}</span>
                  </div>
                </div>

                <div className="border-b border-gray-300 pb-2">
                  <div className="flex">
                    <span className="font-bold text-gray-700 w-20">THROUGH:</span>
                    <span className="text-gray-900">{memo.throughRecipient}</span>
                  </div>
                </div>

                <div className="border-b border-gray-300 pb-2">
                  <div className="flex">
                    <span className="font-bold text-gray-700 w-20">FROM:</span>
                    <span className="text-gray-900">{memo.requestedBy}, {memo.department}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-b border-gray-300 pb-2">
                  <div className="flex">
                    <span className="font-bold text-gray-700 w-16">DATE:</span>
                    <span className="text-gray-900">{new Date(memo.dateCreated).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>

                <div className="border-b border-gray-300 pb-2">
                  <div className="flex">
                    <span className="font-bold text-gray-700 w-16">REF NO:</span>
                    <span className="text-gray-900">{memo.memoNumber}</span>
                  </div>
                </div>

                <div className="border-b border-gray-300 pb-2">
                  <div className="flex items-center">
                    <span className="font-bold text-gray-700 w-16">STATUS:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(memo.status)}`}>
                      {memo.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subject */}
            <div className="mb-6">
              <div className="border-b-2 border-gray-400 pb-2">
                <div className="flex">
                  <span className="font-bold text-gray-700 text-lg w-24">SUBJECT:</span>
                  <span className="text-gray-900 font-semibold text-lg uppercase">{memo.title}</span>
                </div>
              </div>
            </div>

            {/* Memo Body */}
            <div className="mb-8">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-800 leading-relaxed mb-4">
                  {memo.justification}
                </p>

                {memo.items && memo.items.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">DETAILS OF REQUEST:</h4>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">S/N</th>
                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Description</th>
                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Qty</th>
                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Unit</th>
                            <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Unit Cost (₦)</th>
                            <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Total Cost (₦)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {memo.items.map((item, index) => (
                            <tr key={item.id}>
                              <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                              <td className="border border-gray-300 px-4 py-2">
                                <div>
                                  <div className="font-medium">{item.description}</div>
                                  {item.specifications && (
                                    <div className="text-sm text-gray-600">{item.specifications}</div>
                                  )}
                                </div>
                              </td>
                              <td className="border border-gray-300 px-4 py-2">{item.quantity}</td>
                              <td className="border border-gray-300 px-4 py-2">{item.unit}</td>
                              <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(item.unitCost)}</td>
                              <td className="border border-gray-300 px-4 py-2 text-right font-medium">{formatCurrency(item.totalCost)}</td>
                            </tr>
                          ))}
                          <tr className="bg-gray-50 font-bold">
                            <td colSpan={5} className="border border-gray-300 px-4 py-3 text-right">TOTAL AMOUNT:</td>
                            <td className="border border-gray-300 px-4 py-3 text-right text-lg">{formatCurrency(memo.totalAmount)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <p className="text-gray-800 mt-6">
                  I respectfully request your approval for the above request as it is urgently needed for the effective operation of our department.
                </p>

                <p className="text-gray-800 mt-4">
                  Thank you for your anticipated cooperation.
                </p>
              </div>
            </div>

            {/* Request Details Summary */}
            <div className="bg-blue-50 p-4 rounded-lg mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-blue-800">Required Date:</span>
                  <span className="ml-2 text-blue-900">{new Date(memo.dateRequired).toLocaleDateString('en-GB')}</span>
                </div>
                <div>
                  <span className="font-semibold text-blue-800">Priority:</span>
                  <span className="ml-2 text-blue-900 font-medium">{memo.priority}</span>
                </div>
                <div>
                  <span className="font-semibold text-blue-800">Total Amount:</span>
                  <span className="ml-2 text-blue-900 font-bold text-lg">{formatCurrency(memo.totalAmount)}</span>
                </div>
                <div>
                  <span className="font-semibold text-blue-800">Department:</span>
                  <span className="ml-2 text-blue-900">{memo.department}</span>
                </div>
              </div>
            </div>

            {/* Approval Section */}
            <div className="border-t-2 border-gray-300 pt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6 uppercase">APPROVALS</h3>

              <div className="grid grid-cols-2 gap-8">
                {/* COO Approval */}
                <div className="border border-gray-300 p-6 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-4">CHIEF OPERATING OFFICER (COO)</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{memo.cooApprover || '____________________'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{memo.cooApprovalDate ? new Date(memo.cooApprovalDate).toLocaleDateString('en-GB') : '____________________'}</span>
                    </div>
                    <div className="mt-6">
                      <span className="text-gray-600">Signature:</span>
                      <div className="mt-2 h-16 border-b border-gray-400 flex items-end">
                        {memo.cooSignature && (
                          <span className="font-bold text-lg text-blue-700">{memo.cooSignature}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* MD Approval */}
                <div className="border border-gray-300 p-6 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-4">MANAGING DIRECTOR (MD)</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{memo.mdApprover || '____________________'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{memo.mdApprovalDate ? new Date(memo.mdApprovalDate).toLocaleDateString('en-GB') : '____________________'}</span>
                    </div>
                    <div className="mt-6">
                      <span className="text-gray-600">Signature:</span>
                      <div className="mt-2 h-16 border-b border-gray-400 flex items-end">
                        {memo.mdSignature && (
                          <span className="font-bold text-lg text-blue-700">{memo.mdSignature}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                This memo is generated electronically by MOFAD Energy Solutions Limited Management System
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Document ID: {memo.memoNumber} | Generated on {new Date().toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                © 2025 MOFAD Energy Solutions Limited
              </p>
            </div>

          </CardContent>
        </Card>

        {/* Additional Information - Only visible on screen */}
        <div className="print:hidden">
          {memo.comments.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Comments & Notes
                </h3>
                <div className="space-y-2">
                  {memo.comments.map((comment, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-800">{comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {memo.linkedToPRO && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  PRO Integration
                </h3>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-800">
                    This memo has been linked to Purchase Order: <strong>{memo.proNumber}</strong>
                  </p>
                  <Button
                    variant="outline"
                    className="mt-2 border-green-300 text-green-700 hover:bg-green-100"
                    onClick={() => router.push(`/orders/pro/${memo.proNumber?.split('-')[2]}`)}
                  >
                    View Purchase Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  )
}