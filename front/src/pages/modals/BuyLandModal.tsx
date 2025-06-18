// src/components/BuyLandModal.tsx
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { RM_PER_ETH, requestToBuyLand } from "../../lib/contracts"; // ← ここで requestToBuyLand をインポート
import { useAuth } from "../../AuthContext";

interface BuyLandModalProps {
  isOpen: boolean;
  onClose: () => void;
  landId: string;
  priceRM: string;
  onSubmit: (formData: FormData) => void; // ← これを追加
}

export default function BuyLandModal({
  isOpen,
  onClose,
  landId,
  priceRM,
}: BuyLandModalProps) {
  const { address: walletAddress, userName } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // RM → ETH に換算
  const rmValue = parseFloat(priceRM.replace(/[^0-9.]/g, ""));
  const ethValue = (rmValue / RM_PER_ETH).toFixed(6);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const receipt = await requestToBuyLand(landId, priceRM);
      await receipt.wait(); // wait for tx to be mined
      onClose();
      window.location.reload(); // or trigger re-fetch of properties
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to purchase");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* 背景 */}
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
        {/* モーダル本体 */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <Dialog.Title className="text-xl font-semibold text-gray-900">
                  Purchase Land
                </Dialog.Title>

                <div className="mt-4 space-y-4">
                  {/* 各表示部分は省略しません */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Land ID
                    </label>
                    <p className="mt-1 text-gray-800">{landId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Price (MYR)
                    </label>
                    <p className="mt-1 text-gray-800">{priceRM}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Price (ETH){" "}
                      <span className="text-xs text-gray-500">
                        (1 ETH = RM {RM_PER_ETH})
                      </span>
                    </label>
                    <p className="mt-1 text-gray-800">{ethValue}</p>
                  </div>
                  {/* Buyer Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Your Name
                    </label>
                    <p className="mt-1 text-gray-800">{userName || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Your Wallet Address
                    </label>
                    <p className="mt-1 text-gray-800 truncate">
                      {walletAddress || "—"}
                    </p>
                  </div>
                </div>

                {error && (
                  <p className="mt-2 text-sm text-red-600">Error: {error}</p>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg text-white ${
                      isLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Confirm Purchase"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
