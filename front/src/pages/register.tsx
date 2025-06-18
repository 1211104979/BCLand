// ========== ここから：src/pages/RegistrationPage.tsx ==========
import React, { useState } from "react";
import {
  Wallet,
  Mail,
  User,
  Building,
  MapPin,
  Shield,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { connectAccount, registerUserWithCID } from "../lib/contracts";

// Types
interface FormData {
  // Account Info
  email: string;

  // Personal Info
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

type FormErrors = {
  [K in keyof FormData]?: string;
};

interface MetaMaskAccount {
  address: string;
  balance: string;
}

const RegistrationPage: React.FC = () => {
  // ── 1. フォーム入力用の state ──
  const [formData, setFormData] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  const navigate = useNavigate();
  // MetaMask 接続後の情報を保持する state
  const [metaMaskAccount, setMetaMaskAccount] =
    useState<MetaMaskAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // バリデーションエラーを保持する state
  const [errors, setErrors] = useState<FormErrors>({});

  // フォームの送信中フラグ
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 複数ステップ対応用（今回は使っていないが定義だけ残しておく）
  const [currentStep] = useState(1);

  // ── MetaMask がインストールされているかをチェック ──
  const isMetaMaskInstalled = () => {
    return (
      typeof window !== "undefined" &&
      typeof (window as any).ethereum !== "undefined"
    );
  };

  // ── MetaMask と接続し、ウォレットアドレスと残高を state にセット ──
  const connectMetaMask = async () => {
    console.log("▶▶ connectMetaMask が呼ばれました");
    if (!isMetaMaskInstalled()) {
      console.log("🔥 MetaMask がブラウザに見つかりません");
      alert("Please install MetaMask to continue");
      return;
    }
    console.log("✅ MetaMask はインストールされています");

    setIsConnecting(true);
    console.log('🕒 setIsConnecting(true) を実行 → UI は "Connecting…" になる');

    try {
      const ethereum = (window as any).ethereum;
      console.log("🔑 window.ethereum:", ethereum);

      console.log("👛 eth_requestAccounts を呼び出します...");
      const accounts: string[] = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("👛 eth_requestAccounts の戻り → accounts:", accounts);

      if (accounts.length > 0) {
        console.log(`👛 接続されたアドレス: ${accounts[0]}`);

        console.log("💰 eth_getBalance を呼び出します...");
        const balanceHex: string = await ethereum.request({
          method: "eth_getBalance",
          params: [accounts[0], "latest"],
        });
        console.log("💰 eth_getBalance の戻り → balanceHex:", balanceHex);

        const balanceInEther = (
          parseInt(balanceHex, 16) / Math.pow(10, 18)
        ).toFixed(4);
        console.log(`💰 残高（ETH 単位）: ${balanceInEther}`);

        setMetaMaskAccount({
          address: accounts[0],
          balance: balanceInEther,
        });
        console.log("✅ setMetaMaskAccount に保存しました");
      } else {
        console.log("🚫 accounts.length が 0 だったので接続できなかった");
      }
    } catch (error) {
      console.error("❌ Error connecting to MetaMask:", error);
      alert("Failed to connect to MetaMask. Please try again.");
    } finally {
      console.log("🔚 finally ブロック内: setIsConnecting(false) を実行します");
      setIsConnecting(false);
    }
  };

  // ── 2. フォームバリデーション ──
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Required fields validation
    const requiredFields: (keyof FormData)[] = [
      "firstName",
      "lastName",
      "phoneNumber",
    ];
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${field
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── 3. フォーム送信時のハンドラ ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ① バリデーションチェック
    if (!validateForm()) {
      alert("Please fix the errors in the form");
      return;
    }

    // ② MetaMask 接続チェック
    if (!metaMaskAccount) {
      alert("Please connect your MetaMask wallet");
      return;
    }

    setIsSubmitting(true);
    try {
      // まずローカルでフォームの中身をまとめておく
      const registrationData = {
        ...formData,
        walletAddress: metaMaskAccount.address,
        registrationDate: new Date().toISOString(),
      };

      // ③ connectAccount() を呼び出して「Signer付きContract・userAddress」を取得
      const res = await connectAccount();
      if (!res) {
        throw new Error("MetaMask connection failed or permission denied");
      }
      const { contract, userAddress } = res;

      // ④ registerUserWithCID を呼び出す（IPFS へ送ったあと、on‐chain に書き込む）
      const tx = await registerUserWithCID(contract, userAddress, {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
      });
      await tx.wait(); // マイニング完了を待機

      console.log("Registration data:", registrationData);
      alert("Registration successful!");
      navigate('/login');
    } catch (error: any) {
      console.error("Registration error:", error);
      alert("Registration failed: " + error.reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Building className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Government Land Management System
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Register for secure access to the blockchain-based land management
            platform.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              1
            </div>
            <div
              className={`w-16 h-1 mx-2 ${
                currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 2
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              2
            </div>
            <div
              className={`w-16 h-1 mx-2 ${
                currentStep >= 3 ? "bg-blue-600" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 3
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              3
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* MetaMask Connection */}
          <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Wallet className="w-5 h-5 mr-2 text-orange-600" />
              Connect Your Wallet
            </h3>

            {!metaMaskAccount ? (
              <button
                type="button"
                onClick={connectMetaMask}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
              >
                {isConnecting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <Wallet className="w-5 h-5 mr-2" />
                )}
                {isConnecting ? "Connecting..." : "Connect MetaMask Wallet"}
              </button>
            ) : (
              <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Wallet Connected
                    </p>
                    <p className="text-sm text-gray-600">
                      {metaMaskAccount.address.slice(0, 6)}...
                      {metaMaskAccount.address.slice(-4)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Balance</p>
                  <p className="font-medium">{metaMaskAccount.balance} ETH</p>
                </div>
              </div>
            )}
          </div>

          {/* Account Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-blue-600" />
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-green-600" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.firstName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.lastName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.lastName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phoneNumber ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="(555) 123-4567"
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start">
              <Shield className="w-6 h-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">
                  Security & Verification Notice
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • Your registration will undergo manual verification by our
                    security team
                  </li>
                  <li>
                    • All government credentials will be cross-verified with
                    official databases
                  </li>
                  <li>
                    • Your wallet address will be linked to your government
                    identity
                  </li>
                  <li>
                    • Access will be granted only after successful verification
                    (2-3 business days)
                  </li>
                  <li>
                    • You will receive email notifications about your
                    registration status
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign in here
              </a>
            </p>

            <button
              type="submit"
              disabled={isSubmitting || !metaMaskAccount}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center ${
                isSubmitting || !metaMaskAccount
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Registering...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Register Account
                </>
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Need help with registration?{" "}
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Contact Support
              </a>{" "}
              or call (555) 123-LAND
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            This system is for authorized government personnel only.
            Unauthorized access is prohibited and may result in prosecution.
          </p>
          <p className="mt-2">
            © 2025 Government Land Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
