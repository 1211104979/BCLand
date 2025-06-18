// ========== ここから GovLand/vite-env.d.ts ==========

// ここに「VITE_○○」で始まる環境変数をすべて型宣言しておきます。
// 追加したい環境変数ごとに readonly プロパティを追加してください。

interface ImportMetaEnv {
  readonly VITE_LAND_REGISTRY_ADDRESS: string;
  readonly VITE_LIGHTHOUSE_API_KEY: string;  //<-- ここを追記

  // 必要であれば他にも VITE_ で始まる環境変数をここに追加
  // readonly VITE_RPC_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
// ========== ここまで GovLand/vite-env.d.ts ==========
