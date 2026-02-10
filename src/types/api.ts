// Backend API Type Definitions

// Core Types
export interface State {
  id: number
  name: string
  code: string
  created_at: string
  updated_at: string
}

export interface CustomerType {
  id: number
  name: string
  description?: string
  discount_rate: number
  credit_limit: number
  credit_days: number
  payment_terms?: string
  requires_approval: boolean
  is_active: boolean
  customers_count?: number
  created_at: string
  updated_at: string
}

export interface PaymentType {
  id: number
  name: string
  description?: string
  requires_credit_check: boolean
  is_active: boolean
  customers_count?: number
  created_at: string
  updated_at: string
}

export interface ExpenseType {
  id: number
  name: string
  description?: string
  category: 'operational' | 'administrative' | 'marketing' | 'maintenance' | 'utilities' | 'transport' | 'other'
  requires_approval: boolean
  approval_limit?: number
  account_code?: string
  is_tax_deductible: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

// Customer Types
export interface Customer {
  id: number
  name?: string
  email?: string
  phone?: string
  alt_phone?: string
  customer_type?: number
  customer_type_name?: string
  payment_type?: number
  payment_type_name?: string
  customer_code: string
  old_reference_id?: string
  address?: string
  city?: string
  state?: number
  state_name?: string
  postal_code?: string
  business_name?: string
  tax_id?: string
  registration_number?: string
  credit_limit: number
  current_balance: number
  total_spent: number
  payment_terms?: string
  contact_person?: string
  contact_person_phone?: string
  contact_person_email?: string
  status: 'active' | 'inactive' | 'suspended' | 'blacklisted'
  is_verified: boolean
  verification_date?: string
  verified_by?: number
  preferred_delivery_method: 'pickup' | 'delivery' | 'both'
  created_by?: number
  created_by_name?: string
  created_at: string
  updated_at: string
  notes?: string
}

export interface CustomerFormData {
  name?: string
  email?: string
  phone?: string
  alt_phone?: string
  customer_type?: number
  payment_type?: number
  old_reference_id?: string
  address?: string
  city?: string
  state?: number
  postal_code?: string
  business_name?: string
  tax_id?: string
  registration_number?: string
  credit_limit?: number
  current_balance?: number
  payment_terms?: string
  contact_person?: string
  contact_person_phone?: string
  contact_person_email?: string
  status?: 'active' | 'inactive' | 'suspended' | 'blacklisted'
  preferred_delivery_method?: 'pickup' | 'delivery' | 'both'
  notes?: string
}

export interface CustomerTransaction {
  id: number
  customer: number
  customer_name?: string
  transaction_type: 'sale' | 'payment' | 'credit' | 'debit' | 'adjustment' | 'refund'
  reference_number: string
  reference_type: 'invoice' | 'receipt' | 'order' | 'adjustment' | 'refund'
  reference_id?: number
  amount: number
  balance_before: number
  balance_after: number
  payment_method?: 'cash' | 'bank_transfer' | 'cheque' | 'card' | 'mobile_money' | 'other'
  payment_reference?: string
  description: string
  notes?: string
  status: 'pending' | 'completed' | 'cancelled' | 'failed'
  created_by: number
  created_by_name?: string
  approved_by?: number
  created_at: string
  approved_at?: string
}

// Product Types
export interface Product {
  id: number
  name: string
  code: string
  description?: string
  category: 'fuel' | 'lubricant' | 'additive' | 'service' | 'equipment' | 'other' | 'engine_oil'
  subcategory?: string
  brand?: string
  viscosity_grade?: string
  api_grade?: string | null
  sae_grade?: string | null
  package_sizes?: any[]
  bulk_size?: string | null
  retail_size?: string | null
  unit_of_measure: 'liters' | 'gallons' | 'kilograms' | 'pieces' | 'meters' | 'hours'
  density?: number | null
  viscosity?: number | null
  flash_point?: string | null
  hazmat_class?: string | null
  safety_notes?: string | null
  cost_price: number
  bulk_selling_price?: number
  bulk_minimum_quantity?: number
  retail_selling_price?: number
  retail_markup_percentage?: number
  direct_sales_price?: number
  minimum_selling_price?: number | null
  tax_rate: number
  tax_inclusive: boolean
  track_inventory: boolean
  minimum_stock_level: number
  maximum_stock_level?: number | null
  reorder_point?: number | null
  reorder_quantity?: number | null
  image?: string | null
  specification_sheet?: string | null
  safety_data_sheet?: string | null
  is_active: boolean
  is_sellable: boolean
  is_purchasable: boolean
  is_service: boolean
  requires_batch_tracking: boolean
  shelf_life_days?: number | null
  primary_supplier?: string | null
  supplier_code?: string | null
  supplier_notes?: string | null
  created_by?: number
  created_at: string
  updated_at: string
}

export interface ProductFormData {
  name: string
  description?: string
  category: 'fuel' | 'lubricant' | 'additive' | 'service' | 'equipment' | 'other'
  subcategory?: string
  brand?: string
  unit_of_measure: 'liters' | 'gallons' | 'kilograms' | 'pieces' | 'meters' | 'hours'
  cost_price: number
  direct_sales_price: number
  retail_sales_price?: number
  tax_rate: number
  tax_inclusive: boolean
  track_inventory: boolean
  minimum_stock_level: number
  maximum_stock_level?: number
  reorder_point?: number
  is_active: boolean
  is_sellable: boolean
  is_purchasable: boolean
  primary_supplier?: string
}

// Service Types
export interface Service {
  id: number
  name: string
  code: string
  description?: string
  category: 'oil_change' | 'car_wash' | 'tire_service' | 'battery_service' | 'brake_service' | 'engine_service' | 'ac_service' | 'diagnostic' | 'other'
  base_price: number
  minimum_price?: number
  maximum_price?: number
  estimated_duration: string
  maximum_daily_capacity: number
  requires_appointment: boolean
  requires_special_equipment: boolean
  equipment_notes?: string
  requires_certification: boolean
  certification_notes?: string
  tax_rate: number
  tax_inclusive: boolean
  is_active: boolean
  is_seasonal: boolean
  created_by?: number
  created_at: string
  updated_at: string
}

// Inventory Types
export interface Warehouse {
  id: number
  name: string
  code: string
  location: number
  manager?: number
  phone?: string
  email?: string
  total_capacity: number
  available_capacity: number
  warehouse_type: 'main' | 'distribution' | 'retail' | 'lubebay' | 'substore'
  has_fire_suppression: boolean
  has_spill_containment: boolean
  safety_certification?: string
  is_active: boolean
  is_receiving_enabled: boolean
  is_shipping_enabled: boolean
  is_temperature_controlled: boolean
  min_temperature?: number
  max_temperature?: number
  created_at: string
  updated_at: string
}

export interface WarehouseInventory {
  id: number
  warehouse: number
  product: number
  quantity_on_hand: number
  quantity_reserved: number
  quantity_available: number
  average_cost: number
  total_cost_value: number
  bin_location?: string
  zone?: string
  minimum_level?: number
  maximum_level?: number
  reorder_point?: number
  last_received?: string
  last_issued?: string
  last_counted?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StockTransaction {
  id: number
  transaction_number: string
  transaction_type: 'receipt' | 'issue' | 'transfer_out' | 'transfer_in' | 'adjustment' | 'return' | 'loss' | 'cycle_count'
  product: number
  warehouse: number
  quantity: number
  unit_cost: number
  total_cost: number
  quantity_before: number
  quantity_after: number
  reference_type?: 'purchase_order' | 'sales_order' | 'transfer_order' | 'adjustment' | 'return' | 'manual'
  reference_id?: number
  reference_number?: string
  reason?: string
  notes?: string
  batch_number?: string
  created_by: number
  approved_by?: number
  status: 'pending' | 'approved' | 'completed' | 'cancelled'
  created_at: string
  approved_at?: string
}

export interface StockTransfer {
  id: number
  transfer_number: string
  from_warehouse: number
  to_warehouse: number
  transfer_date: string
  expected_date?: string
  reason: string
  status: 'draft' | 'pending' | 'approved' | 'in_transit' | 'partially_received' | 'completed' | 'cancelled'
  requested_by: number
  approved_by?: number
  shipped_by?: number
  received_by?: number
  created_at: string
  approved_at?: string
  shipped_at?: string
  received_at?: string
  carrier?: string
  tracking_number?: string
  transport_cost?: number
  notes?: string
}

// Order Types
export interface PRF {
  id: number
  prf_number: string
  title: string
  description?: string
  department: string
  purpose: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  delivery_location: number | null
  expected_delivery_date: string
  estimated_total: number | string
  budget_code?: string | null
  status: 'draft' | 'pending_review' | 'reviewed' | 'pending_approval' | 'approved' | 'rejected' | 'partially_fulfilled' | 'fulfilled' | 'cancelled'
  requested_by: number
  requested_by_name?: string
  reviewer?: number | null
  reviewer_name?: string | null
  reviewed_by?: number | null
  reviewed_by_name?: string | null
  reviewed_at?: string | null
  approver?: number | null
  approver_name?: string | null
  approved_by?: number | null
  approved_by_name?: string | null
  approved_at?: string | null
  rejected_at?: string | null
  approval_notes?: string | null
  rejection_reason?: string | null
  created_at: string
  submitted_at?: string | null
  items?: PRFItem[]
  total_items?: number
  // Additional fields for specific PRF types
  client_type?: string | null
  client_id?: number | null
  order_snapshot?: any
  order_total?: number | null
  customer_name?: string | null
  total_lodged?: number
  outstanding_balance?: number
  lodgements?: any[]
}

export interface PRFItem {
  id: number
  prf?: number
  product: number
  product_name?: string
  product_code?: string
  quantity_requested: number | string
  unit_price_estimate: number | string
  total_estimate: number | string
  quantity_approved: number | string
  quantity_fulfilled: number | string
  specifications?: string | null
  preferred_supplier?: string | null
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled'
}

export interface PRO {
  id: number
  pro_number: string
  title: string
  description?: string
  prf?: number
  supplier: string
  supplier_contact?: string
  supplier_email?: string
  supplier_phone?: string
  delivery_address: string
  delivery_location: number
  expected_delivery_date: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  payment_terms: string
  payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'credit'
  status: 'draft' | 'sent' | 'confirmed' | 'partially_delivered' | 'delivered' | 'cancelled'
  delivery_status: 'pending' | 'partial' | 'completed'
  created_by: number
  approved_by?: number
  created_at: string
  sent_at?: string
  confirmed_at?: string
  delivered_at?: string
  notes?: string
  terms_conditions?: string
}

export interface SalesOrder {
  id: number
  order_number: string
  customer: number
  order_date: string
  delivery_date: string
  delivery_address?: string
  delivery_warehouse: number
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'card' | 'credit' | 'mobile_money'
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue'
  status: 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
  fulfillment_status: 'pending' | 'partial' | 'completed'
  created_by: number
  approved_by?: number
  confirmed_at?: string
  shipped_at?: string
  delivered_at?: string
  notes?: string
  special_instructions?: string
}

// Account Types
export interface Account {
  id: number
  account_code: string
  account_name: string
  description?: string
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  account_category: string
  parent_account?: number
  level: number
  is_active: boolean
  is_system_account: boolean
  normal_balance: 'debit' | 'credit'
  current_balance: number
  opening_balance: number
  full_name?: string
  created_at: string
  updated_at: string
}

export interface JournalEntry {
  id: number
  entry_number: string
  entry_date: string
  description: string
  reference_type: 'sales' | 'purchase' | 'payment' | 'receipt' | 'transfer' | 'adjustment' | 'opening_balance' | 'closing' | 'manual'
  reference_number?: string
  total_debits: number
  total_credits: number
  status: 'draft' | 'posted' | 'reversed'
  is_balanced?: boolean
  created_by: number
  approved_by?: number
  created_at: string
  posted_at?: string
  transactions?: AccountTransaction[]
}

export interface AccountTransaction {
  id: number
  transaction_number: string
  journal_entry: number
  account: number
  amount: number
  entry_type: 'debit' | 'credit'
  description: string
  reference_type?: string
  reference_id?: number
  notes?: string
  created_at: string
}

export interface Expense {
  id: number
  expense_number: string
  expense_type: number
  expense_type_name?: string
  description: string
  amount: number
  expense_date: string
  payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'card' | 'petty_cash'
  vendor_name?: string
  vendor_contact?: string
  invoice_number?: string
  account: number
  journal_entry?: number
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  created_by: number
  approved_by?: number
  created_at: string
  approved_at?: string
  paid_at?: string
  notes?: string
  receipt_image?: string
}

export interface Payment {
  id: number
  payment_number: string
  payment_type: 'incoming' | 'outgoing'
  amount: number
  payment_date: string
  payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'card' | 'mobile_money' | 'other'
  reference_type: 'customer_payment' | 'supplier_payment' | 'expense_payment' | 'loan_payment' | 'other'
  reference_number?: string
  customer?: number
  customer_name?: string
  supplier_name?: string
  bank_account?: string
  cheque_number?: string
  transaction_reference?: string
  description: string
  notes?: string
  journal_entry?: number
  status: 'pending' | 'cleared' | 'bounced' | 'cancelled'
  created_by: number
  verified_by?: number
  created_at: string
  cleared_at?: string
}

// Notification Types
export type NotificationType = 'system' | 'order' | 'payment' | 'inventory' | 'alert' | 'reminder' | 'task' | 'message' | 'promotion'
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'
export type NotificationStatus = 'unread' | 'read' | 'archived'

export interface Notification {
  id: number
  user: number
  sender?: number
  sender_name?: string
  title: string
  message: string
  notification_type: NotificationType
  priority: NotificationPriority
  status: NotificationStatus
  reference_type?: string
  reference_id?: string
  action_url?: string
  metadata?: Record<string, any>
  read_at?: string
  created_at: string
  updated_at: string
}

export interface NotificationPreference {
  id: number
  user: number
  notifications_enabled: boolean
  email_notifications: boolean
  sms_notifications: boolean
  push_notifications: boolean
  type_preferences: Record<string, boolean>
  quiet_hours_enabled: boolean
  quiet_hours_start?: string
  quiet_hours_end?: string
  digest_enabled: boolean
  digest_time?: string
  created_at: string
  updated_at: string
}

export interface NotificationTemplate {
  id: number
  code: string
  name: string
  description?: string
  notification_type: NotificationType
  title_template: string
  message_template: string
  action_url_template?: string
  default_priority: NotificationPriority
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UnreadCount {
  total: number
  by_type: Record<string, number>
  by_priority: Record<string, number>
}

export interface NotificationStats {
  total: number
  unread: number
  read: number
  archived: number
  by_type: Record<string, number>
  by_priority: Record<string, number>
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Audit Log Types
export interface AuditLog {
  id: number
  user: number | null
  user_email: string
  user_name: string
  action: string
  action_display: string
  timestamp: string
  target_model: string
  target_id: string
  ip_address: string | null
  user_agent: string
  details: AuditLogDetails
  success: boolean
  error_message: string
}

export interface AuditLogDetails {
  changes?: Record<string, { old: any; new: any }>
  created_fields?: Record<string, any>
  deleted_representation?: string
  deleted_data?: Record<string, any>
  updated_fields?: string[]
  [key: string]: any
}

export interface AuditLogDetail extends AuditLog {
  formatted_changes: {
    field: string
    old_value: any
    new_value: any
  }[]
}

export interface AuditAction {
  value: string
  label: string
}

export interface AuditLogStats {
  actions_by_type: { action: string; count: number }[]
  actions_by_model: { target_model: string; count: number }[]
  daily_activity: { date: string; count: number }[]
  failed_actions_count: number
  total_logs_30_days: number
}
