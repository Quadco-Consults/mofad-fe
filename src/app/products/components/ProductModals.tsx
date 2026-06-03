import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface ProductModalsProps {
  showDeleteModal: boolean
  showBulkDeleteModal: boolean
  selectedProductName?: string
  selectedCount: number
  isDeleting: boolean
  isBulkDeleting: boolean
  onDeleteConfirm: () => void
  onBulkDeleteConfirm: () => void
  onDeleteCancel: () => void
  onBulkDeleteCancel: () => void
}

export function ProductModals({
  showDeleteModal,
  showBulkDeleteModal,
  selectedProductName,
  selectedCount,
  isDeleting,
  isBulkDeleting,
  onDeleteConfirm,
  onBulkDeleteConfirm,
  onDeleteCancel,
  onBulkDeleteCancel,
}: ProductModalsProps) {
  return (
    <>
      {/* Delete Single Product Modal */}
      <ConfirmDialog
        open={showDeleteModal}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProductName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={onDeleteConfirm}
        onCancel={onDeleteCancel}
        isLoading={isDeleting}
      />

      {/* Bulk Delete Modal */}
      <ConfirmDialog
        open={showBulkDeleteModal}
        title="Delete Multiple Products"
        message={`Are you sure you want to delete ${selectedCount} product${
          selectedCount > 1 ? 's' : ''
        }? This action cannot be undone.`}
        confirmText={`Delete ${selectedCount} Product${selectedCount > 1 ? 's' : ''}`}
        cancelText="Cancel"
        variant="danger"
        onConfirm={onBulkDeleteConfirm}
        onCancel={onBulkDeleteCancel}
        isLoading={isBulkDeleting}
      />
    </>
  )
}
