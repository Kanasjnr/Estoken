# Estoken: Real Estate Tokenization Platform

<!-- ![Estoken Logo](https://placeholder.com/path-to-your-logo.png) -->

Estoken is a comprehensive blockchain-based real estate investment platform that democratizes property ownership through fractional tokenization. Built on Base Sepolia, Estoken transforms traditional real estate investment by enabling anyone to own, trade, and earn from property assets through NFT-backed fractional shares.

## 🏢 What is Estoken?

Estoken is a decentralized application (dApp) that bridges the gap between traditional real estate and modern blockchain technology. Our platform allows users to:

- **Invest in Premium Properties** with as little capital as desired through fractional ownership
- **Own Property NFTs** that represent real shares in actual real estate assets
- **Earn Passive Income** through automated rental income distribution
- **Trade Property Shares** on our integrated secondary marketplace
- **Monitor Investments** through comprehensive analytics and portfolio management tools

## 🔧 Core Architecture

### Smart Contract Infrastructure

- **RealEstateToken.sol**: Main tokenization contract that handles property fractional ownership, share trading, and NFT minting
- **KYCManager.sol**: Compliance management system ensuring regulatory adherence through automated KYC/AML verification
- **PropertyAutomation.sol**: Automated property management including rental collection, maintenance scheduling, and income distribution powered by Chainlink Automation
- **RealEstateOracle.sol**: Real-time property valuation system using Chainlink Functions to fetch data from RentCast API and other real estate data providers

### Chainlink Integrations

- **Chainlink Functions**: Serverless compute platform that connects to RentCast API to fetch real-time property valuations, market data, and property records
- **Chainlink Automation**: Time-based and condition-based automation that:
  - Automatically triggers property valuation updates every 24 hours
  - Manages property maintenance schedules
  - Handles rental income collection and distribution
  - Monitors property performance metrics

### Key Components

1. **Property Tokenization Engine**: Converts real estate assets into tradeable NFT shares
2. **Investment Dashboard**: Real-time portfolio tracking, performance analytics, and income monitoring
3. **Automated Income Distribution**: Smart contract-powered rental income and dividend payments
4. **Secondary Marketplace**: Peer-to-peer trading platform for property NFTs
5. **Oracle Integration**: Live property valuation updates via Chainlink Functions connecting to RentCast and external real estate APIs
6. **Compliance System**: Integrated KYC/AML verification for regulatory compliance

## ✨ Platform Features

### For Investors
- **Fractional Property Ownership**: Buy shares of premium properties starting from minimal amounts
- **NFT Portfolio Management**: View and manage your property NFTs with detailed analytics
- **Automated Earnings**: Receive rental income and dividends directly to your wallet
- **Secondary Trading**: Buy and sell property shares on our integrated marketplace
- **Real-time Valuation**: Track property values with live data from RentCast API via Chainlink Functions
- **Investment Analytics**: Comprehensive performance tracking and ROI calculations
- **Notification System**: Stay updated with investment alerts, income distributions, and market opportunities
- **Property Search & Discovery**: Advanced filtering and search capabilities to find investment opportunities

### For Property Owners
- **Property Tokenization**: Convert your real estate into tradeable digital assets
- **Automated Management**: Chainlink Automation-powered rent collection and distribution
- **Liquidity Access**: Raise capital by selling fractional ownership of your properties
- **Transparent Operations**: All transactions and income distributions recorded on-chain

### For the Platform
- **Regulatory Compliance**: Built-in KYC/AML verification system
- **Chainlink Oracle Integration**: Real-time property valuation using Chainlink Functions to fetch data from RentCast and external real estate APIs
- **Automated Operations**: Smart contract automation for all platform processes
- **Secure Infrastructure**: Built on Base Sepolia for enhanced security and efficiency

## 🎯 How It Works

1. **KYC Verification**: Users complete identity verification to access the platform
2. **Property Listing**: Property owners list their assets on the platform after verification
3. **Tokenization**: Properties are divided into fractional shares represented as NFTs
4. **Investment Discovery**: Users browse and search properties using advanced filtering tools
5. **Share Purchase**: Users buy property shares using cryptocurrency
6. **NFT Minting**: Ownership shares are represented as transferable NFTs in user wallets
7. **Automated Management**: Chainlink Automation handles rent collection and property maintenance
8. **Income Distribution**: Rental income and dividends are automatically distributed to NFT holders
9. **Trading**: NFT shares can be traded on the integrated secondary marketplace
10. **Portfolio Tracking**: Users monitor their investments through the comprehensive dashboard with real-time analytics

## 💰 Revenue Streams

- **Rental Income**: Automated distribution of property rental income to token holders
- **Capital Appreciation**: Benefit from property value increases through live data from RentCast API via Chainlink Functions
- **Dividend Payments**: Receive additional returns from property-generated profits
- **Secondary Market Trading**: Trade property NFTs for potential capital gains

## 🔐 Security & Compliance

- **KYC/AML Integration**: Mandatory identity verification for all platform users
- **Smart Contract Audits**: Thoroughly tested and audited smart contract infrastructure
- **Regulatory Compliance**: Adherence to real estate and financial regulations
- **Oracle Security**: Tamper-proof property valuation through decentralized oracles
- **Automated Notifications**: Real-time alerts for investment opportunities, income distributions, and portfolio changes
- **Property Automation**: Chainlink Automation-based property management with automated maintenance and rental collection

## 🛠 Technologies Used

### Blockchain & Smart Contracts
- **Solidity**: Smart contract development
- **Hardhat**: Development framework and testing environment
- **Base Sepolia**: Ethereum Layer 2 testnet for development and testing
- **Chainlink Functions**: Serverless platform for fetching real estate data from RentCast API
- **Chainlink Automation**: Automated property management and valuation updates

### Frontend & User Interface
- **React.js**: Modern, responsive user interface
- **TypeScript**: Type-safe development environment
- **Tailwind CSS**: Utility-first CSS framework for styling

### Integration & APIs
- **External Data Integration**: RentCast API integration via Chainlink Functions for real-time property valuations
- **Automated Notifications**: Real-time alerts and notification system
- **Property Management**: Chainlink Automation for rental collection and maintenance scheduling

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/estoken.git
   cd estoken
   ```

2. Install contract dependencies:
   ```bash
   cd contract
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

4. Compile smart contracts:
   ```bash
   cd ../contract
   npx hardhat compile
   ```

5. Deploy contracts (ensure you have Base Sepolia network configured):
   ```bash
   npx hardhat run scripts/deploy-core.ts --network baseSepolia
   ```

## 🚀 Usage

1. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:5173`

3. Connect your Base-compatible wallet (MetaMask, etc.)

4. Complete KYC verification to access all platform features

5. Start investing in tokenized real estate properties!

## 🎯 Platform Benefits

### For Individual Investors
- **Low Entry Barrier**: Invest in premium properties with minimal capital
- **Diversification**: Spread investments across multiple properties and locations
- **Liquidity**: Trade property shares anytime on the secondary market
- **Passive Income**: Earn rental income without property management responsibilities

### For Real Estate Market
- **Increased Accessibility**: Opens property investment to a broader audience
- **Enhanced Liquidity**: Traditionally illiquid real estate becomes tradeable
- **Transparent Operations**: All transactions recorded immutably on blockchain
- **Global Reach**: Enable international investment in local real estate markets

## 🤝 Contributing

We welcome contributions to Estoken! Please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request


## 📞 Contact

For any queries or support, please contact us at:

- **Email**: estoken22@gmail.com
- **Documentation**: [Coming Soon]

---

Built with ❤️ by the Estoken Team

*Democratizing Real Estate Investment Through Blockchain Innovation*
