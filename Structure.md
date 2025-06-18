land-ownership-dapp/
├── contracts/                       # Hardhat Smart Contracts
│   ├── contracts/                  # Solidity contracts
│   ├── ignition/modules/                    # Deployment & interaction scripts
│   ├── test/                       # Contract unit tests
│   ├── hardhat.config.ts           # Hardhat config with plugins
│   └── package.json                # Separate package if needed
│
├── frontend/                        # React + Vite frontend
│   ├── public/                     # Static files (index.html, manifest)
│   ├── src/
│   │   ├── assets/                 # Images, SVGs, etc.
│   │   ├── components/            # Reusable UI components
│   │   ├── features/              # Domain modules (land, user, admin)
│   │   ├── layout/                # Layout components (navbar, sidebar)
│   │   ├── pages/                 # Route-level pages
│   │   ├── services/              # Blockchain interaction (ethers.js)
│   │   ├── hooks/                 # Custom hooks
│   │   ├── routes/                # React Router setup
│   │   ├── icons/                 # lucide-react exports
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── .gitignore
├── README.md
├── package.json                    # Root (optional for scripts)
└── tsconfig.json                   # Shared TS config if using workspaces