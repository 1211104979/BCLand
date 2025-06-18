// ========== ここから：GovLand/src/lib/contracts.ts ==========
import { ethers, Contract } from "ethers";
import lighthouse from "@lighthouse-web3/sdk";     // ← 追加
import { getWeb3ProviderAndSigner } from "./provider";
import LandRegistryABI from "../../../block/artifacts/contracts/LandRegistry.sol/LandRegistry.json";
import kavach from '@lighthouse-web3/kavach';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS!;
export const RM_PER_ETH = 4000;

export interface YourLand {
  landId: string;
  status: number;
  titleNumber: string;
  landType: string;
  username: string;
  priceRM: string;
  area: string;
  geranCid: string;
  geranUrl: string;
  timestamp: string;
  owner: string;  
  metadataCID: string;    
}

/**
 * MetaMask の接続と、Signer つきの Contract をまとめて返す関数
 * v6 では TransactionResponse が ethers.TransactionResponse になっている点に注意
 */
export async function connectAccount(): Promise<{
  signer: ethers.JsonRpcSigner;
  contract: Contract;
  userAddress: string;
} | null> {
  const ws = await getWeb3ProviderAndSigner();
  if (!ws) return null;

  // v6 では getAddress() も await 必須
  const userAddress = await ws.signer.getAddress();

  // Contract の第3引数に Signer を渡せば「write 可能な Contract」
  const contract = new Contract(
    CONTRACT_ADDRESS,
    LandRegistryABI.abi,
    ws.signer
  );

  return { signer: ws.signer, contract, userAddress };
}

/**
 * 既存のユーザーかを roles() でチェックして、未登録なら selfRegisterUser()
 * v6 では ethers.TransactionResponse を返す
 */
// export async function registerUser(
//   contract: Contract,
//   userAddress: string
// ): Promise<ethers.TransactionResponse> {
//   const roleBN = await contract.roles(userAddress);
//   if (roleBN.toString() !== "0") {
//     throw new Error("Already registered as user");
//   }
//   // selfRegisterUser() を実行してトランザクションを返す
//   const tx: ethers.TransactionResponse = await contract.selfRegisterUser();
//   return tx;
// }

export async function registerUserWithCID(
  contract: Contract,
  userAddress: string,
  userData: {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }
): Promise<ethers.TransactionResponse> {
  // 1) 事前に roles[userAddress] をチェックしておく（Solidity の require と重複するがフロントでもチェックしておく）
  const roleBN = await contract.roles(userAddress);
  if (roleBN.toString() !== "0") {
    // すでに Role.User や Role.Staff 扱いなら、登録を中断
    throw new Error("Already registered as user");
  }

  // 2) ユーザー情報を JSON にまとめて IPFS (Lighthouse) にアップロードする
  // ──────────────────────────────────────────────────────────
  // ここでは userData を文字列化し Blob → File オブジェクトに変換してアップする
  const jsonString = JSON.stringify(userData);
  const blob = new Blob([jsonString], { type: "application/json" });
  const file = new File([blob], "user_metadata.json");
  // Lighthouse SDK の upload() を呼び出し。第二引数には VITE_LIGHTHOUSE_API_KEY! を渡す
  const uploadResponse = await lighthouse.upload(
    [file],
    import.meta.env.VITE_LIGHTHOUSE_API_KEY!
  );
  // uploadResponse.data.Hash に IPFS の CID が入っている
  const cid: string = uploadResponse.data.Hash;
  // ──────────────────────────────────────────────────────────

  // 3) IPFS の CID を引数にして、Solidity の registerUserWithCID() を呼び出す
  //    ここで「require(roles[msg.sender] == Role.None)」が通れば、トランザクション成功
  const tx: ethers.TransactionResponse = await contract.registerUserWithCID(cid);
  return tx;
}


// --- ここから registerLandWithCID ---
// Solidity 側には以下のような関数がある想定：
// function registerLandWithCID(string memory cid) external onlyRegisteredUser { … }
// export async function registerLandWithCID(
//   contract: Contract,
//   userAddress: string,
//   cid: string
// ): Promise<ethers.TransactionResponse> {
//   // 1) 事前に roles[userAddress] をチェック
//   const roleBN = await contract.roles(userAddress);
//   if (roleBN.toString() !== "1") {
//     // Role.User でないならリバート
//     throw new Error("User is not registered");
//   }

//   // 2) コントラクトの registerLandWithCID 関数を呼び、トランザクションを return
//   const tx: ethers.TransactionResponse = await contract.registerLandWithCID(cid);
//   return tx;
// }
// --- ここまで registerLandWithCID ---

/**
 * 土地を登録する: 
 *  1) roles() で User かをチェック
 *  2) Lighthouse に JSON をアップ → CID を取得
 *  3) コントラクトの registerLand(to, cid) を実行
 *
 * v6 では TransactionResponse が ethers.TransactionResponse
 */
// export async function registerLand(
//   contract: Contract,
//   userAddress: string,
//   landAddress: string,
//   description: string
// ): Promise<ethers.TransactionResponse> {
//   // 1) User 権限かチェック
//   const roleBN = await contract.roles(userAddress);
//   if (roleBN.toString() !== "1") {
//     throw new Error("User is not registered");
//   }

//   // 2) Lighthouse 経由でメタデータを IPFS にアップロード
//   const metadata = { address: landAddress, description };
//   const blob     = new Blob([JSON.stringify(metadata)], { type: "application/json" });
//   const file     = new File([blob], "land_metadata.json");

//   const uploadResponse = await lighthouse.upload(
//     [file],
//     import.meta.env.VITE_LIGHTHOUSE_API_KEY!
//   );
//   const cid = uploadResponse.data.Hash;

//   // 3) コントラクトの registerLand() を呼び出し
//   const tx: ethers.TransactionResponse = await contract.registerLand(userAddress, cid);
//   return tx;
// }

export async function getMyLands(
  contract: Contract,
  userAddress: string
): Promise<
  { landId: string; status: number; address: string; description: string }[]
> {
  // 1) コントラクトの getOwnedLands() を呼び出し
  const landIds: bigint[] = await contract.getOwnedLands(userAddress);

  // 2) 取得した landId ごとにメタデータをフェッチするプロミスを生成
  const fetchPromises = landIds.map(async (id) => {
    // コントラクトから (Land, owner) を返す getLand() を呼び出す
    // ※ Land 型には status, metadataCID が含まれているものとする
    const [landOnchain, owner, publicCID] = await contract.getLand(id);

    console.log("Public CID:", publicCID);

    // オンチェーン上の status は enum の数値
    const statusCode: number = landOnchain.status;
    // メタデータとして保存している CID（文字列）
    const cid: string = landOnchain.metadataCID;

    // 3) IPFS のゲートウェイ一覧（必要に応じて他のゲートウェイも追加可）
    const gateways = [
      `https://gateway.lighthouse.storage/ipfs/${publicCID}`,
    ];

    let jsonMeta:
      | { address: string; description: string }
      | null = null;

    // 4) ゲートウェイを順番に試行してメタデータをフェッチ
    for (const gatewayURL of gateways) {
      try {
        const resp = await fetch(gatewayURL, { cache: "no-store" });
        if (resp.ok) {
          jsonMeta = await resp.json();
          break;
        }
      } catch (e) {
        console.warn(`IPFS fetch failed at ${gatewayURL}: ${(e as Error).message}`);
      }
    }

    // 5) 万一フェッチできなかった場合はエラーメッセージを埋め込む
    if (!jsonMeta) {
      return {
        landId: id.toString(),
        status: statusCode,
        address: "N/A",
        description: "Unable to load metadata",
      };
    }

    // 6) 正常フェッチできた場合は、返すオブジェクトに住所と説明を入れる
    return {
      landId: id.toString(),
      status: statusCode,
      address: jsonMeta.address,
      description: jsonMeta.description,
    };
  });

  // 7) 全件並列で待機して結果を返す
  const myLands = await Promise.all(fetchPromises);
  return myLands;
}
// ========== ここまで ==========

// ここから追加する新しい関数。既存コードは変更していません。

/**
 * getUserMetadata(address)
 *  コントラクトの userMetadataCID マッピングから CID を取得し、
 *  Lighthouse の IPFS ゲートウェイを経由してメタデータ JSON をフェッチして返す
 */
export async function getUserMetadata(userAddress: string): Promise<any> {
  // コントラクトへの接続を確立
  const ws = await connectAccount()
  if (!ws) {
    throw new Error("connectAccount() に失敗しました")
  }
  const { contract } = ws

  // ① Solidity の mapping(address => string) userMetadataCID を参照
  const cid: string = await contract.userMetadataCID(userAddress)
  if (!cid || cid.trim().length === 0) {
    throw new Error(`アドレス ${userAddress} に対応するメタデータCIDが見つかりません`)
  }

  // ② Lighthouse のゲートウェイ URL を構築
  const gatewayUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`

  // ③ fetch で IPFS 上の JSON を取得
  const response = await fetch(gatewayUrl)
  if (!response.ok) {
    throw new Error(`IPFS からのフェッチに失敗しました: ${response.status}`)
  }
  const metadata = await response.json()

  return metadata
}
// ========== ここまで ==========
// ────────── 変更後：src/lib/contracts.ts ──────────


/**
 * listingLand:
 *  1) Geran ファイルを IPFS(Lighthouse) にアップロードして geranCid を取得
 *  2) メタデータ(JSON) を IPFS にアップロードして metadataCid を取得
 *  3) コントラクトの registerLand(userAddress, metadataCid) を呼び出す
 */
export async function listingLand(
  titleNumber: string,
  landType: string,
  priceRM: string,
  geranFile: File,
  username: string
): Promise<import("ethers").TransactionResponse> {  // 1) MetaMask に接続して contract, userAddress を取得
  const ws = await connectAccount();
  if (!ws) {
    throw new Error("MetaMask 接続に失敗しました。");
  }
  const { contract, userAddress, signer } = ws;

  const challenge = (await kavach.getAuthMessage(userAddress)).message!;
  const signature = await signer.signMessage(challenge);

  // 2) Geran ファイルを Lighthouse(IPFS) にアップロードし、geranCid を取得
  const uploadCertResp = await lighthouse.uploadEncrypted(
    [geranFile],
    import.meta.env.VITE_LIGHTHOUSE_API_KEY!,
    userAddress,
    signature
  );
  const geranCid: string = uploadCertResp.data[0].Hash;

  // 3) メタデータオブジェクトを作成 (area はモック)
  const metadataObj = {
    titleNumber,
    landType,
    username,
    priceRM,
    area: "100 m2",
    geranCid,
    timestamp: new Date().toISOString(),
  };

  // 4) JSON → Blob → File に変換し、メタデータを Lighthouse にアップロード
  const jsonString = JSON.stringify(metadataObj);
  const blob = new Blob([jsonString], { type: "application/json" });
  const metaFile = new File([blob], "land_listing_metadata.json");

  const uploadMetaResp = await lighthouse.upload(
    [metaFile],
    import.meta.env.VITE_LIGHTHOUSE_API_KEY!
  );
  const publicCid: string = uploadMetaResp.data.Hash;

  // 5) RM → ETH (Wei) に変換
  //    (ここでは priceRM を「ETH 表記」として parseEther)
const rmValue = parseFloat(priceRM);
  const ethValue = rmValue / RM_PER_ETH;
  if (ethValue <= 0) throw new Error("Price must be at least MYR 4000");

  // 小数点以下を文字列化して parseEther
  const priceWei = ethers.parseEther(ethValue.toString());
  // 6) Solidity の新 registerLand(address to, string metadataCID, uint256 priceWei) を呼び出し
  const tx = await contract.registerLand(
    userAddress,
    geranCid,
    publicCid,
    priceWei
  );
    console.log("Transfer to Contract Public CID:", publicCid);


  return tx;

}


export async function getYourLands(
  contract: Contract,
  userAddress: string
): Promise<YourLand[]> {
  // 1) 「自身がオーナーの landId の配列」を取得
  const landIds: bigint[] = await contract.getOwnedLands(userAddress);

  const fetchPromises = landIds.map(async (idBigint) => {
    const id = idBigint.toString();

    // getLand は (Land, owner) を返す想定
    const [
      landOnchain,
      ownerAddr,
      publicCID
    ]: [
      { landId: bigint; status: number; metadataCID: string },
      string,
      string
    ] = await contract.getLand(idBigint);

    const { status: statusCode, metadataCID } = landOnchain;

    // IPFS metadata fetch
    let jsonMeta: {
      titleNumber: string;
      landType: string;
      username: string;
      priceRM: string;
      area: string;
      geranCid: string;
      timestamp: string;
    } | null = null;

    try {
      const resp = await fetch(
        `https://gateway.lighthouse.storage/ipfs/${publicCID}`,
        { cache: "no-store" }
      );
      if (resp.ok) jsonMeta = (await resp.json()) as any;
    } catch {}

    if (!jsonMeta) {
      return {
        landId: id,
        status: statusCode,
        titleNumber: "",
        landType: "",
        username: "",
        priceRM: "",
        area: "",
        geranCid: "",
        geranUrl: "",
        timestamp: "",
        owner: ownerAddr,
        metadataCID,
      };
    }

    const {
      titleNumber,
      landType,
      username,
      priceRM,
      area,
      geranCid,
      timestamp,
    } = jsonMeta;

    return {
      landId: id,
      status: statusCode,
      titleNumber,
      landType,
      username,
      priceRM,
      area,
      geranCid,
      geranUrl: `https://gateway.lighthouse.storage/ipfs/${geranCid}`,
      timestamp,
      owner: ownerAddr,
      metadataCID,
    };
  });

  return Promise.all(fetchPromises);
}

export async function fetchAllLands(
  contract: Contract
): Promise<YourLand[]> {
  // 1) すべての landId を取得
  const landIds: bigint[] = await contract.getAllLandIds();

  const fetchPromises = landIds.map(async (idBigint) => {
    const id = idBigint.toString();

    // getLand は (Land, owner) を返す想定
    const [
      landOnchain,
      ownerAddr,
      publicCID
    ]: [
      { landId: bigint; status: number; metadataCID: string },
      string,
      string
    ] = await contract.getLand(idBigint);

    console.log("Fetched from Contract Public CID:", publicCID);

    const { status: statusCode, metadataCID } = landOnchain;

    // IPFS metadata fetch
    let jsonMeta: {
      titleNumber: string;
      landType: string;
      nric: string;
      username: string;
      priceRM: string;
      area: string;
      geranCid: string;
      timestamp: string;
    } | null = null;

    try {
      const resp = await fetch(
        `https://gateway.lighthouse.storage/ipfs/${publicCID}`,
        { cache: "no-store" }
      );
      console.log(`https://gateway.lighthouse.storage/ipfs/${publicCID}`);
      if (resp.ok) jsonMeta = (await resp.json()) as any;
    } catch {}

    if (!jsonMeta) {
      return {
        landId: id,
        status: statusCode,
        titleNumber: "",
        landType: "",
        username: "",
        priceRM: "",
        area: "",
        geranCid: "",
        geranUrl: "",
        timestamp: "",
        owner: ownerAddr,
        metadataCID,
      };
    }

    const {
      titleNumber,
      landType,
      username,
      priceRM,
      area,
      geranCid,
      timestamp,
    } = jsonMeta;

    return {
      landId: id,
      status: statusCode,
      titleNumber,
      landType,
      username,
      priceRM,
      area,
      geranCid,
      geranUrl: `https://gateway.lighthouse.storage/ipfs/${geranCid}`,
      timestamp,
      owner: ownerAddr,
      metadataCID,
    };
  });

  return Promise.all(fetchPromises);
}

/**
 * 1) Owner lists a land for sale at `priceRM`
 * 2) priceRM → ETH (via RM_PER_ETH) → Wei (bigint)
 * 3) call contract.listLandForSale(landId, priceWei)
 */
export async function listLandForSale(
  landId: string,
  priceRM: string
): Promise<ethers.TransactionResponse> {
  const ws = await connectAccount();
  if (!ws) throw new Error("MetaMask not connected");
  const { contract } = ws;

  const rmValue = parseFloat(priceRM);
  const ethValue = rmValue / RM_PER_ETH;
  if (ethValue <= 0) throw new Error("Price must be positive");

  // ethers.parseEther returns a bigint in v6
  const priceWei: bigint = ethers.parseEther(ethValue.toString());

  return await contract.listLandForSale(landId, priceWei);
}

/**
 * 1) Buyer requests to buy: sends exact ETH value
 * 2) call contract.requestToBuy(landId, { value: priceWei })
 */
export async function requestToBuyLand(
  landId: string,
  priceRM: string
): Promise<ethers.TransactionResponse> {
  const ws = await connectAccount();
  if (!ws) throw new Error("MetaMask not connected");
  const { contract } = ws;

  const rmValue = parseFloat(priceRM);
  const ethValue = rmValue / RM_PER_ETH;
  if (ethValue <= 0) throw new Error("Invalid price");

  const priceWei: bigint = ethers.parseEther(ethValue.toString());

  return await contract.requestToBuy(landId, { value: priceWei });
}


  // Sign Kavach challenge
  async function signAuthMessage(address: string, signer: ethers.Signer): Promise<string> {
    const authResp = await kavach.getAuthMessage(address);
    if (typeof authResp.message !== 'string') throw new Error('No Kavach auth challenge found');
    return signer.signMessage(authResp.message);
  }

/**
 * 1) Owner approves the purchase
 * 2) Transfers ownership on-chain to the buyer
 */
export async function approvePurchase(
  landId: string,
  buyerAddress: string,
  privateCID: string
): Promise<ethers.TransactionResponse> {
  const ws = await connectAccount();
  if (!ws) throw new Error("MetaMask not connected");
    const { contract, userAddress, signer } = ws;

  const signature = await signAuthMessage(userAddress, signer);
  const transferNFT: any = await kavach.transferOwnership(
    userAddress,
    privateCID,
    buyerAddress,
    signature,
    true
  );
  if (transferNFT.error) throw new Error(transferNFT.error);


  return await contract.transferLandOwnership(landId, buyerAddress);
}

/**
 * Fetch current sale info (price and pending buyer).
 * Solidity getters return `uint256` → v6 becomes `bigint`
 */
export async function getSaleInfo(
  landId: string
): Promise<{
  priceWei: bigint;
  pendingBuyer: string;
}> {
  const ws = await connectAccount();
  if (!ws) throw new Error("MetaMask not connected");
  const { contract } = ws;

  const priceWei: bigint = await contract.landPrices(landId); // Correct name
  const pendingBuyer: string = await contract.pendingBuyer(landId);
  return { priceWei, pendingBuyer };
}

export async function handleViewGrant(cid: string) {

   const ws = await connectAccount();
  if (!ws) throw new Error("MetaMask not connected");
    const {userAddress, signer } = ws;
  // 1) get your signed auth challenge
  const signature = await signAuthMessage(userAddress, signer);

  const keyObject = await lighthouse.fetchEncryptionKey(
    cid,
    userAddress,
    signature
  );

  if (!keyObject.data.key) {
    throw new Error("Encryption key not found for the given CID.");
  }

  // 2) decrypt via Lighthouse
  const decrypted = await lighthouse.decryptFile(cid, keyObject.data.key, "application/pdf");
  const url = URL.createObjectURL(decrypted);

  console.log("Decryption Success");

  return url;
}


