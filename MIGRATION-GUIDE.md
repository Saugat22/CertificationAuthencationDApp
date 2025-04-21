# Migration Guide: Server-Centric to Client-Centric Architecture

This guide explains the changes made to migrate from a server-centric architecture to a client-centric architecture for the Certificate Authentication DApp.

## Architectural Changes

### Previous Architecture (Server-Centric)

- Frontend (React) sent requests to an Express.js server
- Server connected to the blockchain using ethers.js
- Server signed and executed blockchain transactions
- All certificates were issued from the server's wallet address
- Users could not use their own wallets for blockchain interactions

### New Architecture (Client-Centric)

- Frontend (React) connects directly to the blockchain using Web3.js
- MetaMask is used for transaction signing
- Users sign transactions with their own wallets
- Certificates are issued from users' own addresses
- Server becomes optional and only provides non-blockchain functionality

## Running in Client-Only Mode

You can now run the application without the server:

```
npm run client-only
```

This will start only the React frontend, which will directly interact with the blockchain through MetaMask.

## Connection to MetaMask

The application now requires MetaMask to:

1. Connect your wallet
2. Sign blockchain transactions
3. Pay gas fees for operations

Each certificate will be:
- Issued by the connected wallet address
- Only revocable by the same wallet address that issued it

## Certificate Ownership

In the new architecture:

- Certificate ownership is tied to the Ethereum address that issued it
- Only the address that issued the certificate can revoke it
- You need to be connected with the same MetaMask account to manage your issued certificates

## Server Role

The server is still available but is now optional. If you want to run with the server:

```
npm run dev
```

The server can be useful for:
- Serving static files
- Logging/monitoring
- Optional backend functionality

## API Compatibility Layer

We've maintained the previous API interface as a compatibility layer. The `api.js` file now:

- Has the same method signatures as before
- Internally redirects all calls to direct blockchain interactions
- No longer makes server requests

This allows existing code to work without modifications while still using the new client-centric architecture.

## Smart Contract

The smart contract itself has not changed. It continues to:

- Store certificate data
- Track the issuer of each certificate
- Allow only the issuer to revoke certificates
- Provide verification functionality 