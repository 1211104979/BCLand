import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'

interface TransactionRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: FormData) => void
}

export default function TransactionRequestModal({
  isOpen,
  onClose,
  onSubmit,
}: TransactionRequestModalProps) {
  const [transactionType, setTransactionType] = useState('')
  const [landId, setLandId] = useState('')
  const [description, setDescription] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProofFile(e.target.files[0])
    }
  }

  const handleSubmit = () => {
    const formData = new FormData()
    formData.append('transactionType', transactionType)
    formData.append('landId', landId)
    formData.append('description', description)
    if (proofFile) {
      formData.append('proofFile', proofFile)
    }
    onSubmit(formData)
    onClose()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
              <Dialog.Title className="text-lg font-medium text-gray-900">
                New Land Transaction Request
              </Dialog.Title>

              <div className="mt-4 space-y-3">
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Select Transaction Type</option>
                  <option value="ChangeOwnership">Change of Ownership</option>
                  <option value="PutForSale">Put for Sale</option>
                  <option value="Lease">Lease</option>
                  <option value="Dispute">Dispute</option>
                </select>

                <input
                  type="text"
                  placeholder="Land ID / Title Number"
                  value={landId}
                  onChange={(e) => setLandId(e.target.value)}
                  className="w-full border p-2 rounded"
                />

                <textarea
                  placeholder="Description or Notes"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border p-2 rounded resize-none"
                  rows={4}
                />

                <label className="block">
                  <span className="text-gray-700">Upload Proof Document</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:border file:border-gray-300 file:rounded file:bg-white file:px-3 file:py-1 file:text-sm"
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleSubmit}
                >
                  Submit Request
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
