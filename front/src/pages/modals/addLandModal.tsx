import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";
import { listingLand } from "../../lib/contracts"; // adjust path as needed

interface AddLandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (formData: FormData) => void;
}

export default function AddLandModal({
  isOpen,
  onClose,
}: AddLandModalProps) {
  // ■ AuthContext からウォレットアドレスとユーザー名を取得
  const { address: walletAddress, userName } = useAuth();

  // ■ フォーム項目の state
  const [titleNumber, setTitleNumber] = useState("");
  const [landType, setLandType] = useState(""); // 例: "Freehold" or "Leasehold"
  const [priceRM, setPriceRM] = useState("");
  const [landFile, setLandFile] = useState<File | null>(null);

  // ■ 登録中フラグ
  const [isLoading, setIsLoading] = useState(false);

  // ■ モーダルを開いたらリセット
  useEffect(() => {
    if (isOpen) {
      setTitleNumber("");
      setLandType("");
      setPriceRM("");
      setLandFile(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  // ■ ファイル選択ハンドラー
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setLandFile(e.target.files[0]);
    }
  };

  // ■ Submit ボタン押下時に listingLand() を呼び出す
  const handleSubmit = async () => {
    if (
      !titleNumber.trim() ||
      !landType ||
      !priceRM.trim() ||
      !landFile
    ) {
      alert("Please fill in（Title, Type, NRIC, Price, Geran File）");
      return;
    }

    setIsLoading(true);

    try {
      // listingLand: IPFS アップロード＋コントラクト登録
      // ※ userName を渡す場合は、listingLand のシグネチャを調整してください
      const tx = await listingLand(
        titleNumber.trim(),
        landType,
        priceRM.trim(),
        landFile,
        userName || ""
      );
      console.log("▶ Transaction Hash:", tx.hash);

      await tx.wait();
      alert("✅ Land Successfully registered");
      onClose();
    } catch (err: any) {
      console.error("listingLand エラー:", err);
      alert("❌ AnError Occur During Registration: " + (err.message || err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => isLoading || onClose()}>
        {/* 背景オーバーレイ */}
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
                <Dialog.Title className="text-2xl font-semibold text-gray-900">
                  Register Your Land To Sell
                </Dialog.Title>

                <div className="mt-6 space-y-5">
                  {/* 1. Title Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Title Number
                    </label>
                    <input
                      type="text"
                      placeholder="ex: TN-2024-001234"
                      value={titleNumber}
                      onChange={(e) => setTitleNumber(e.target.value)}
                      disabled={isLoading}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* 2. Land Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Land Type
                    </label>
                    <select
                      value={landType}
                      onChange={(e) => setLandType(e.target.value)}
                      disabled={isLoading}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="" disabled>
                        -- Select Type --
                      </option>
                      <option value="Freehold">Freehold (Hak Milik)</option>
                      <option value="Leasehold">Leasehold (Pajakan)</option>
                    </select>
                  </div>

                  {/* 3. User Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      User Name
                    </label>
                    <input
                      type="text"
                      value={userName ?? "Not Available"}
                      readOnly
                      disabled
                      className="mt-1 block w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none"
                    />
                  </div>

                  {/* 5. Price (RM) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Price (RM)
                    </label>
                    <input
                      type="number"
                      placeholder="ex: 450000"
                      value={priceRM}
                      onChange={(e) => setPriceRM(e.target.value)}
                      disabled={isLoading}
                      className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* 6. Wallet Address（読み取り専用） */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Wallet Address
                    </label>
                    <input
                      type="text"
                      value={walletAddress || "Not Connected"}
                      readOnly
                      className="mt-1 block w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none"
                    />
                  </div>

                  {/* 7. Upload Geran Tanah */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Upload Geran Tanah (PDF / Image)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      disabled={isLoading}
                      className="mt-1 block w-full text-sm text-gray-600 file:border file:rounded file:bg-white file:px-3 file:py-1 file:text-sm"
                    />
                    {landFile && (
                      <p className="mt-2 text-xs text-gray-500">
                        Selected file: {landFile.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Cancel / Submit ボタン */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-gray-300 text-gray-800 hover:bg-gray-400"
                    onClick={() => !isLoading && onClose()}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg text-white ${
                      isLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    onClick={handleSubmit}
                    disabled={
                      isLoading ||
                      !titleNumber.trim() ||
                      !landType ||
                      !priceRM.trim() ||
                      !landFile
                    }
                  >
                    {isLoading ? "Registering..." : "Submit"}
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
