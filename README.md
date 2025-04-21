# Certificate Authentication DApp

A blockchain-based decentralized application for issuing, verifying, and managing digital certificates with a dark-themed UI.

## Features

- Issue digital certificates on the Ethereum blockchain
- Verify certificate authenticity and view detailed information
- View certificates in a printable format
- Revoke certificates when necessary
- Role-based access control for certificate issuers
- Owner-only management of authorized issuers
- Manual contract address management for deployment

## Technology Stack

- **Blockchain**: Ethereum (using Truffle & Ganache for development)
- **Smart Contracts**: Solidity 0.8.0+
- **Frontend**: React with custom dark theme UI
- **Backend**: Node.js with Express
- **Web3 Integration**: Web3.js
- **Styling**: Custom Dracula-inspired theme

## Prerequisites

- Node.js (v14+ recommended)
- npm 
- Ganache (for local blockchain)
- MetaMask browser extension
- Truffle (for contract compilation and deployment)

## Installation

1. Clone the repository:
   ```
   git clone  <repository-url>
  

2. Install dependencies:
   ```
   npm install
   cd client
   npm install
   cd ..
   ```

3. Start Ganache:
   - Open Ganache and create a new workspace
   - Ensure it's running on port 7545 (or update the truffle-config.js file with your port)

4. Configure MetaMask:
   - Connect MetaMask to your Ganache instance (usually http://localhost:7545)
   - Import the first account from Ganache using the private key (this will be the admin account)

5. Deploy smart contracts:
   ```
   npm run compile
   npm run migrate
   ```

6. Update contract address:
   ```
   truffle networks
   ```
   Copy the new contract address and update it in client/src/contractConfig.js

7. Start the application:
   ```
   npm run dev
   ```

## Usage

1. **Connect Wallet**: Click the "Connect Wallet" button to connect your MetaMask wallet
2. **Issue Certificates**: Use the Issue Certificate page to create new certificates (requires authorized issuer or owner)
3. **Verify Certificates**: Use the Verify Certificate page to check authenticity of any certificate
4. **View Certificates**: View detailed information and a printable version of certificates
5. **Revoke Certificates**: Certificates can be revoked by their issuer or the contract owner
6. **Manage Issuers**: The contract owner can authorize or revoke issuer privileges

## Project Structure

- `/contracts`: Solidity smart contracts
  - `CertificationAuthentication.sol`: Main contract for certificate management
- `/migrations`: Truffle migration scripts
- `/test`: Smart contract tests
- `/client`: React frontend application
  - `/src/components`: React components for each page/feature
  - `/src/contractConfig.js`: Contract address and ABI configuration
- `/server`: Express backend server
- `/scripts`: Utility scripts

## Contract Redeployment

After making changes to the smart contract:

1. Run `truffle migrate --reset` to redeploy the contract
2. Run `truffle networks` to get the new contract address
3. Manually update the DEPLOYED_ADDRESS in client/src/contractConfig.js
4. Restart the application with `npm run dev`

## Admin Access

- The account that deploys the contract becomes the owner/admin
- Only the owner can authorize or revoke other issuers
- After redeployment, make sure you're using the same account in MetaMask that was used for deployment

## License

ISC

## Testing

Run the test suite: 
