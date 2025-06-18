// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract LandRegistry is ERC721URIStorage, Ownable {
    using Strings for uint256;

    // Roles for access control
    enum Role { None, User, Staff }
    // Status of each land parcel
    enum LandStatus { Active, ForSale, Pending_Approval, Sold, Disputed }

    struct Land {
        uint256 landId;
        LandStatus status;
        string metadataCID;
    }

    // string[] private _listofPublicCIDs = new string[](0); 

    uint256 private _tokenIdCounter = 1;

    // --- Existing mappings ---
    mapping(address => string) public userMetadataCID;
    mapping(address => Role) public roles;
    mapping(uint256 => Land) public lands;
    mapping(address => uint256[]) public ownerToLandIds;
    mapping(uint256 => string) public landToPublicCID;

    // --- New mappings for sale workflow ---
    mapping(uint256 => uint256) public landPrices;    // listing price in wei
    mapping(uint256 => address) public pendingBuyer;  // buyer address placeholder

    // --- Events ---
    event UserRegistered(address indexed user, string metadataCID);
    event LandRegistered(uint256 indexed landId, address indexed owner, string metadataCID);
    event LandStatusUpdated(uint256 indexed landId, LandStatus newStatus);
    event LandListed(uint256 indexed landId, uint256 priceWei);
    event PurchaseRequested(uint256 indexed landId, address indexed buyer);
    event LandOwnershipTransferred(uint256 indexed landId, address indexed newOwner);

    constructor() ERC721("GovLand", "MLN") Ownable(msg.sender) {}

    modifier onlyRegisteredUser() {
        require(roles[msg.sender] == Role.User, "Only registered users permitted");
        _;
    }

    function addPublicCID(uint256 landId, string memory cid) internal {
        landToPublicCID[landId] = cid;
    }

    function getPublicCID(uint256 landId) internal view returns (string memory) {
        return landToPublicCID[landId];
    }

    /// @notice Register a new user with off-chain metadata CID
    function registerUserWithCID(string memory cid) external {
        require(roles[msg.sender] == Role.None, "Already registered");
        roles[msg.sender] = Role.User;
        userMetadataCID[msg.sender] = cid;
        emit UserRegistered(msg.sender, cid);
    }

    /// @notice Self-register without metadata
    function selfRegisterUser() external {
        require(roles[msg.sender] == Role.None, "Already registered");
        roles[msg.sender] = Role.User;
        emit UserRegistered(msg.sender, "");
    }

    /// @notice Mint a new land token AND automatically list it for sale
    /// @param to           the address receiving the minted NFT
    /// @param metadataCID  IPFS CID for initial metadata
    /// @param priceWei     listing price in wei
    function registerLand(
        address to,
        string memory metadataCID,
        string memory publicCID,
        uint256 priceWei
    ) external onlyRegisteredUser {
        uint256 newId = _tokenIdCounter++;
        _safeMint(to, newId);

        // Initialize land record as ForSale
        lands[newId] = Land(newId, LandStatus.ForSale, metadataCID);
        ownerToLandIds[to].push(newId);
        addPublicCID(newId, publicCID);
        emit LandRegistered(newId, to, metadataCID);

        // Set listing price and emit listing event
        landPrices[newId] = priceWei;
        emit LandStatusUpdated(newId, LandStatus.ForSale);
        emit LandListed(newId, priceWei);
    }

    /// @notice Update the on-chain status of a land
    function updateLandStatus(uint256 landId, LandStatus newStatus) external onlyRegisteredUser {
        require(_existsToken(landId), "Land not found");
        require(ownerOf(landId) == msg.sender, "Only owner can update status");
        lands[landId].status = newStatus;
        emit LandStatusUpdated(landId, newStatus);
    }

    /// @notice Buyer requests to purchase by sending exact ETH
    function requestToBuy(uint256 landId) external payable onlyRegisteredUser {
        require(lands[landId].status == LandStatus.ForSale, "Land not for sale");
        require(msg.value == landPrices[landId], "Incorrect payment amount");

        pendingBuyer[landId] = msg.sender;
        lands[landId].status = LandStatus.Pending_Approval;

        emit LandStatusUpdated(landId, LandStatus.Pending_Approval);
        emit PurchaseRequested(landId, msg.sender);
    }

    /// @dev Internal helper to remove a landId from an owner's list
    function _removeLandFromOwner(address owner, uint256 landId) internal {
        uint256[] storage list = ownerToLandIds[owner];
        for (uint256 i = 0; i < list.length; i++) {
            if (list[i] == landId) {
                list[i] = list[list.length - 1];
                list.pop();
                return;
            }
        }
    }

    /// @notice Approve sale, transfer ownership, update metadata, and release funds
    function transferLandOwnership(
        uint256 landId,
        address newOwner
        // string calldata newMetadataCID
    ) external onlyRegisteredUser {
        address seller = ownerOf(landId);
        require(seller == msg.sender, "Only owner can approve transfer");
        require(pendingBuyer[landId] == newOwner, "Buyer mismatch");

        // Update owner-to-land mapping
        _removeLandFromOwner(seller, landId);
        ownerToLandIds[newOwner].push(landId);

        // Transfer the NFT
        _transfer(seller, newOwner, landId);

        // Update metadata CID
        // lands[landId].metadataCID = newMetadataCID;
        // _setTokenURI(landId, newMetadataCID);

        // Set status to Sold
        lands[landId].status = LandStatus.Sold;
        emit LandStatusUpdated(landId, LandStatus.Sold);

        // Capture price and reset sale state
        uint256 price = landPrices[landId];
        pendingBuyer[landId] = address(0);
        landPrices[landId] = 0;

        // Payout seller
        payable(seller).transfer(price);

        emit LandOwnershipTransferred(landId, newOwner);
    }


    /// @notice Return token URI pointing to IPFS CID
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_existsToken(tokenId), "Token does not exist");
        return string(abi.encodePacked("ipfs://", lands[tokenId].metadataCID));
    }

    function _existsToken(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address ow = ownerOf(tokenId);
        return (spender == ow || getApproved(tokenId) == spender || isApprovedForAll(ow, spender));
    }

    /// @notice Fetch land data and current owner
    function getLand(uint256 landId) external view returns (Land memory land, address owner, string memory publicCID) {
        require(_existsToken(landId), "Land does not exist");
        return (lands[landId], ownerOf(landId), getPublicCID(landId));

    }

    /// @notice List all land IDs owned by `owner`
    function getOwnedLands(address owner) external view returns (uint256[] memory) {
        return ownerToLandIds[owner];
    }

    /// @notice Return all minted land IDs
    function getAllLandIds() external view returns (uint256[] memory) {
        uint256 total = _tokenIdCounter - 1;
        uint256[] memory ids = new uint256[](total);
        for (uint256 i = 0; i < total; i++) {
            ids[i] = i + 1;
        }
        return ids;
    }
}
