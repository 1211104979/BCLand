// src/pages/Properties.tsx
import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Edit3,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Landmark,
  Home,
  ShoppingCart,
} from "lucide-react";
import AddLandModal from "../modals/addLandModal";
import BuyLandModal from "../modals/BuyLandModal";

// ethers v6 の BrowserProvider と Contract 型をインポート
import { Contract, BrowserProvider } from "ethers";
// 作成済みの fetchAllLands 関数をインポート
import {
  fetchAllLands,
  requestToBuyLand,
  approvePurchase,
  getSaleInfo,
  handleViewGrant
} from "../../lib/contracts";
// ABI ファイルと AuthContext もインポート
import LandRegistryABI from "../../../../block/artifacts/contracts/LandRegistry.sol/LandRegistry.json";
import { useAuth } from "../../AuthContext";

// .env からコントラクトアドレスを読み込む
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

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
  status: "Active" | "Disputed" | "ForSale" | "Sold" | "PendingApproval";
  blockchainHash: string;
  surveyNumber: string;
  marketValue: string;
  encumbrances: string[];
  metadataCID: string;
}

const statusConfig = {
  Active: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    description: "Property verified and registered on blockchain",
  },
  Disputed: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
    description: "Awaiting verification and blockchain registration",
  },
  ForSale: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Eye,
    description: "Under review by land registration authorities",
  },
  Sold: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertTriangle,
    description: "Property ownership or boundaries under dispute",
  },
  PendingApproval: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertTriangle,
    description: "Property ownership or boundaries under dispute",
  },
};

const propertyTypeConfig = {
  Residential: { color: "text-blue-600", icon: Home },
  Commercial: { color: "text-green-600", icon: Shield },
  Agricultural: { color: "text-yellow-600", icon: MapPin },
  Industrial: { color: "text-purple-600", icon: Shield },
};

export default function Properties() {
  // AuthContext からアドレス取得
  const { address } = useAuth();
  const [saleInfo, setSaleInfo] = useState<
    Record<string, { priceWei: bigint; pendingBuyer: string }>
  >({});


  const [isGrantOpen, setIsGrantOpen] = useState(false);
  const [grantUrl, setGrantUrl] = useState<string>("");



  // 全土地情報を保持する state
  const [properties, setProperties] = useState<Property[]>([]);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedBuyLandId, setSelectedBuyLandId] = useState<string>("");
  const [selectedBuyPrice, setSelectedBuyPrice] = useState<string>("");

  // 検索・フィルタ用 state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Property["status"] | "All">(
    "All"
  );
  const [typeFilter, setTypeFilter] = useState<
    Property["propertyType"] | "All"
  >("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );

  // コントラクトインスタンスを保持する state
  const [contract, setContract] = useState<Contract | null>(null);

  const loadAllLands = async () => {
    if (!contract) return;
    try {
      const fetched = await fetchAllLands(contract);

      const statusMap: Record<number, Property["status"]> = {
        0: "Active",
        1: "ForSale",
        2: "PendingApproval",
        3: "Sold",
        4: "Disputed",
      };

      const merged: Property[] = fetched.map((landData) => ({
        id: landData.landId.toString(),
        titleNumber: landData.titleNumber || "",
        owner: landData.username || "",
        ownerAddress: landData.owner || "",
        location: "",
        coordinates: "",
        area: landData.area || "",
        propertyType: [
          "Residential",
          "Commercial",
          "Agricultural",
          "Industrial",
        ].includes(landData.landType)
          ? (landData.landType as Property["propertyType"])
          : "Residential",
        registrationDate: landData.timestamp || "",
        lastTransfer: "",
        status: statusMap[Number(landData.status)] ?? "Active", // Correct enum match
        blockchainHash: "",
        surveyNumber: "",
        marketValue: landData.priceRM || "",
        encumbrances: [],
        metadataCID: landData.metadataCID || "",
      }));

      setProperties(merged);

      const infoMap: Record<
        string,
        { priceWei: bigint; pendingBuyer: string }
      > = {};
      for (const p of merged) {
        try {
          infoMap[p.id] = await getSaleInfo(p.id);
        } catch (err) {
          console.error(`getSaleInfo failed for id=${p.id}:`, err);
        }
      }

      setSaleInfo(infoMap);
      console.log("saleInfo map:", infoMap);
    } catch {
      setProperties([]);
      setSaleInfo({});
    }
  };

  // 2. Kick it off when `contract` becomes available
  useEffect(() => {
    if (contract) loadAllLands();
  }, [contract]);

  // 3. Initialize contract (unchanged)
  useEffect(() => {
    async function init() {
      if (!address || !window.ethereum) return;
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setContract(new Contract(CONTRACT_ADDRESS, LandRegistryABI.abi, signer));
    }
    init();
  }, [address]);

  // fetchAllLands を呼び出し、マッピング
  useEffect(() => {
    if (!contract) {
      // コントラクトがまだセットされていないときは空一覧表示
      setProperties([]);
      return;
    }
    loadAllLands();
  }, [contract]);

  // 検索・フィルタ後の配列を作成
  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.titleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || property.status === statusFilter;
    const matchesType =
      typeFilter === "All" || property.propertyType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAddLand = (formData: FormData) => {
    console.log("Form data submitted:", formData);
  };

  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
  };

  const PropertyModal = ({
    property,
    onClose,
  }: {
    property: Property;
    onClose: () => void;
  }) => {
    const StatusIcon = statusConfig[property.status].icon;
    const TypeIcon = propertyTypeConfig[property.propertyType].icon;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Property Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="p-6 space-y-6">
            {/* Status & Type */}
            <div className="flex items-center space-x-3">
              <span
                className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${
                  statusConfig[property.status].color
                }`}
              >
                <StatusIcon className="w-4 h-4 mr-2" />
                {property.status}
              </span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  propertyTypeConfig[property.propertyType].color
                }`}
              >
                <TypeIcon className="w-4 h-4 mr-2" />
                {property.propertyType}
              </span>
            </div>

            {/* 情報グリッド */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Title Number
                  </label>
                  <p className="text-lg font-mono text-gray-800">
                    {property.titleNumber}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Owner
                  </label>
                  <p className="text-gray-800">{property.owner || "—"}</p>
                  <p className="text-sm text-gray-600">
                    {property.ownerAddress || "—"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Area
                  </label>
                  <p className="text-gray-800">{property.area || "—"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Market Value
                  </label>
                  <p className="text-lg font-semibold text-green-600">
                    MYR {property.marketValue || "—"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Registration Date
                  </label>
                  <p className="text-gray-800">
                    {property.registrationDate
                      ? new Date(property.registrationDate).toLocaleDateString(
                          "en-MY"
                        )
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Blockchain Hash */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Blockchain Information
              </h3>
              <p className="text-xs font-mono text-gray-800 break-all">
                {property.blockchainHash || "—"}
              </p>
            </div>

            {/* Encumbrances */}
            {property.encumbrances.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Encumbrances
                </h3>
                <ul className="space-y-1">
                  {property.encumbrances.map((enc, index) => (
                    <li
                      key={index}
                      className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded"
                    >
                      {enc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={async () => {
              try {
                // call your imported helper
                const url = await handleViewGrant(property.metadataCID);
                // store the blob‐URL in state
                setGrantUrl(url);
                // show the PDF overlay
                setIsGrantOpen(true);
              } catch (err) {
                console.error("failed to load grant PDF:", err);
                alert("Could not load the land grant PDF.");
              }
            }}
          >
            View Land Grant
          </button>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[90%] mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Land Registration System
            </h1>
            <p className="text-gray-600">
              Government of Malaysia - Digital Land Registry
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Landmark className="w-4 h-4 mr-2" />
            Register Your Property
          </button>
        </div>
        <AddLandModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddLand}
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title number, owner, or location..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="All">All Status</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Disputed">Disputed</option>
              <option value="Transferred">Transferred</option>
            </select>
          </div>
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
            >
              <option value="All">All Types</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Agricultural">Agricultural</option>
              <option value="Industrial">Industrial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner Information
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProperties.map((property) => {
                console.log("ROw for ID ", property.id, saleInfo[property.id]);

                const StatusIcon = statusConfig[property.status].icon;
                const TypeIcon = propertyTypeConfig[property.propertyType].icon;

                return (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`p-2 rounded-full ${
                            propertyTypeConfig[property.propertyType].color
                          } bg-opacity-10`}
                        >
                          <TypeIcon
                            className={`h-5 w-5 ${
                              propertyTypeConfig[property.propertyType].color
                            }`}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {property.id || "—"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {property.propertyType}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {property.owner || "—"}
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {property.ownerAddress || "—"}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          statusConfig[property.status].color
                        }`}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {property.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {property.marketValue || "—"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {property.registrationDate
                          ? new Date(
                              property.registrationDate
                            ).toLocaleDateString("en-MY")
                          : "—"}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewProperty(property)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>

                      {address?.toLowerCase() ===
                      property.ownerAddress.toLowerCase() ? (
                        <>
                          {/* Edit button */}
                          <button className="text-indigo-600 hover:text-indigo-900 inline-flex items-center">
                            <Edit3 className="w-4 h-4 mr-1" />
                            Edit
                          </button>

                          {/* Approve button, shown if there’s a pending buyer */}
                          {address?.toLowerCase() ===
                            property.ownerAddress.toLowerCase() &&
                            saleInfo[property.id]?.pendingBuyer &&
                            saleInfo[property.id].pendingBuyer !==
                              "0x0000000000000000000000000000000000000000" &&
                            property.status !== "Sold" && (
                              <button
                                className="text-white bg-green-600 hover:bg-green-700 px-2 py-1 rounded inline-flex items-center"
                                onClick={async () => {
                                  const buyer =
                                    saleInfo[property.id].pendingBuyer;
                                  const metadataCID =
                                    property.metadataCID || ""; // Replace with correct CID
                                  const tx = await approvePurchase(
                                    property.id,
                                    buyer,
                                    metadataCID
                                  );
                                  await tx.wait();
                                  window.location.reload();
                                }}
                              >
                                <Shield className="w-4 h-4 mr-1" />
                                Approve
                              </button>
                            )}
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedBuyLandId(property.id);
                            setSelectedBuyPrice(property.marketValue);
                            setIsBuyModalOpen(true);
                            setSelectedProperty(null);
                          }}
                          className="text-green-600 hover:text-green-900 inline-flex items-center"
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Buy
                        </button>
                      )}

                      {property.status === "Disputed" && (
                        <button className="text-green-600 hover:text-green-900 inline-flex items-center">
                          <Shield className="w-4 h-4 mr-1" />
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Property Modal */}
      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}

      {isGrantOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg overflow-hidden w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setIsGrantOpen(false)}
            >
              ×
            </button>
            <iframe
              src={grantUrl}
              className="w-full h-[80vh] border-0"
              title="Land Grant PDF"
            />
          </div>
        </div>
      )}

      {/* BuyLandModal を画面にレンダー */}
      <BuyLandModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        landId={selectedBuyLandId}
        priceRM={selectedBuyPrice}
        onSubmit={async (formData: FormData) => {
          // 1) pull values from the form
          const id = formData.get("landId") as string;
          const price = formData.get("priceRM") as string;

          // 2) send the buy request on-chain
          const tx = await requestToBuyLand(id, price);
          // 3) wait for it to be mined
          await tx.wait();

          // 4) re-fetch all lands + saleInfo to pick up the new pendingBuyer
          await loadAllLands();

          // 5) close the modal
          setIsBuyModalOpen(false);
        }}
      />
    </div>
  );
}
