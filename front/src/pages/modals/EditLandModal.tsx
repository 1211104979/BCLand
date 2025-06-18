// src/modals/EditLandModal.tsx
import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Contract } from "ethers";
import { ethers } from "ethers";

interface Property {
  id: string;
  titleNumber: string;
  owner: string;
  ownerAddress: string;
  location: string;
  coordinates: string;
  area: string;
  propertyType: "Residential" | "Commercial" | "Agricultural" | "Industrial";
  registrationDate: string;
  lastTransfer: string;
  status: "Active" | "ForSale" | "Approved" | "PendingApproval";
  blockchainHash: string;
  surveyNumber: string;
  marketValue: string;
  encumbrances: string[];
  metadataCID: string;
}

interface EditLandModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  contract: Contract | null;
  reloadLands: () => void;
}

const statusToEnum = (status: Property["status"]): number => {
  const map: Record<Property["status"], number> = {
    Active: 0,
    ForSale: 1,
    PendingApproval: 2,
    Approved: 3,
  };
  return map[status];
};

export const RM_PER_ETH = 4000;

const EditLandModal: React.FC<EditLandModalProps> = ({
  isOpen,
  onClose,
  property,
  contract,
  reloadLands,
}) => {
  const [newStatus, setNewStatus] = useState<Property["status"]>("Active");
  const [newPrice, setNewPrice] = useState<string>("");

  if (!property) return null;

  const handleSave = async () => {
    if (!contract) return;

    try {
      const landId = BigInt(property.id);

      // Convert RM to ETH then to wei
      const ethValue = parseFloat(newPrice) / RM_PER_ETH;
      const priceWei = ethers.parseEther(ethValue.toString());

      // Call single smart contract function
      const tx = await contract.updateLandDetails(
        landId,
        statusToEnum(newStatus),
        priceWei
      );

      await tx.wait();
      await reloadLands();
      onClose();
    } catch (err) {
      console.error("Failed to update land details:", err);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Edit Property #{property.id}
          </Dialog.Title>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={newStatus}
                onChange={(e) =>
                  setNewStatus(e.target.value as Property["status"])
                }
              >
                <option value="Active">Active</option>
                <option value="ForSale">ForSale</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Market Value (RM)
              </label>
              <input
                type="number"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default EditLandModal;
