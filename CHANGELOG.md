# Changelog

## Version 2.0.0 - Client-Centric Architecture

### Added
- Direct blockchain interaction from frontend using Web3.js
- MetaMask integration for transaction signing
- New `contractConfig.js` file for central contract configuration
- Script to update contract address after deployment
- Client-only execution mode with `npm run client-only` command
- Comprehensive migration guide in MIGRATION-GUIDE.md
- Updated README.md with new architecture documentation

### Changed
- Rewrote `api.js` to be a compatibility layer over web3Service
- Modified components to properly interact with MetaMask
- Updated package.json with new scripts

### Maintained
- Original server functionality (optional)
- Smart contract code
- UI/UX design
- Component structure

## Version 1.0.0 - Initial Release

### Features
- Certificate issuance via server
- Certificate verification
- Certificate viewing
- Certificate revocation
- Server-centric blockchain interaction using ethers.js 