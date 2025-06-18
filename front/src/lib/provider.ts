// ========== ここから：src/lib/provider.ts ==========
import { ethers } from "ethers";

const RPC_URL = import.meta.env.VITE_RPC_URL || "";

export function getLocalhostProvider(): ethers.JsonRpcProvider {
  if (!RPC_URL) {
    throw new Error("VITE_RPC_URL が設定されていません。");
  }
  // ethers v6 では providers.JsonRpcProvider →  ethers.JsonRpcProvider
  return new ethers.JsonRpcProvider(RPC_URL);
}

/**
 * MetaMask（window.ethereum）と連携するための BrowserProvider + Signer を返す
 * ethers v6 では Web3Provider の代わりに BrowserProvider を使います
 */
export async function getWeb3ProviderAndSigner():
  Promise<{ provider: ethers.BrowserProvider; signer: ethers.JsonRpcSigner } | null> {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    // v6 では ethers.providers.Web3Provider ではなく ethers.BrowserProvider
    const web3Provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer        = await web3Provider.getSigner();
    return { provider: web3Provider, signer };
  }
  return null;
}
// ========== ここまで ==========
