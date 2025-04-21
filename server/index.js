require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

// Read contract artifacts
const contractPath = path.join(__dirname, '../build/contracts/CertificationAuthentication.json');
const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Connect to local blockchain (Ganache)
let provider;
let contract;

// Helper function to extract user-friendly error messages
const extractErrorMessage = (error) => {
  // Create a mapping of technical errors to user-friendly messages
  const errorMap = {
    "Certificate doesn't exist": "Certificate not found",
    "Certificate ID already exists": "Certificate already exists",
    "Certificate already revoked": "Certificate already revoked"
  };
  
  // Extract error message from various error formats
  let technicalError = '';
  
  // Check if it's a blockchain revert error
  if (error.message && error.message.includes('revert')) {
    const revertReason = error.message.split('revert ')[1];
    if (revertReason) {
      technicalError = revertReason;
    }
  }
  
  // Check for specific error types
  if (error.code === 'UNPREDICTABLE_GAS_LIMIT' && error.error && error.error.error && error.error.error.data) {
    if (error.error.error.data.reason) {
      technicalError = error.error.error.data.reason;
    }
  }
  
  // Check for nested error objects
  if (error.error && error.error.body) {
    try {
      const bodyError = JSON.parse(error.error.body);
      if (bodyError.error && bodyError.error.message) {
        const message = bodyError.error.message;
        if (message.includes('revert')) {
          technicalError = message.split('revert ')[1];
        }
      }
    } catch (e) {
      // JSON parsing failed, continue with default handling
    }
  }
  
  // Return user-friendly message if available, otherwise technical error
  return errorMap[technicalError] || technicalError || 'Operation failed';
};

const connectToBlockchain = async () => {
  try {
    console.log('Attempting to connect to blockchain...');
    
    // Connect to Ganache - ethers v5 syntax
    //Use the environment variable
    provider = new ethers.providers.JsonRpcProvider(`http://127.0.0.1:${process.env.GANACHE_PORT || 7545}`);
    console.log('Provider created');
    
    // Get network info
    const network = await provider.getNetwork();
    console.log(`Connected to network: ${network.name}, chainId: ${network.chainId}`);
    
    // Get accounts
    const accounts = await provider.listAccounts();
    console.log(`Found ${accounts.length} accounts`);
    
    // Use the first account as signer
    const signer = provider.getSigner(accounts[0]);
    const signerAddress = await signer.getAddress();
    console.log(`Using signer with address: ${signerAddress}`);
    
    // Check if contract is deployed
    const networkIds = Object.keys(contractJson.networks);
    if (networkIds.length === 0) {
      throw new Error('Contract not deployed. Run truffle migrate first');
    }
    
    // Get contract address
    const networkId = networkIds[0];
    const contractAddress = contractJson.networks[networkId].address;
    console.log(`Contract address: ${contractAddress}`);
    
    // Create contract instance
    contract = new ethers.Contract(
      contractAddress,
      contractJson.abi,
      signer
    );
    
    console.log('Contract instance created');
    
    // Test contract connection with a simple view function
    try {
      const owner = await contract.owner();
      console.log(`Contract owner: ${owner}`);
    } catch (error) {
      console.error('Error testing contract connection:', error);
    }
    
    return true;
  } catch (error) {
    console.error('Error connecting to blockchain:', error);
    return false;
  }
};

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', blockchain: provider ? 'Connected' : 'Disconnected' });
});

// Issue Certificate
app.post('/api/certificates', async (req, res) => {
  try {
    const { id, studentName, courseName, issueDate } = req.body;
    
    if (!id || !studentName || !courseName || !issueDate) {
      return res.status(400).json({ error: 'Missing required certificate fields' });
    }
    
    if (!contract) {
      const connected = await connectToBlockchain();
      if (!connected) {
        return res.status(500).json({ error: 'Failed to connect to blockchain' });
      }
    }
    
    console.log(`Issuing certificate: ID=${id}, Student=${studentName}, Course=${courseName}`);
    
    // Issue the certificate using the contract
    const tx = await contract.issueCertificate(id, studentName, courseName, issueDate);
    console.log(`Transaction hash: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    
    res.status(201).json({
      success: true,
      message: 'Certificate issued successfully',
      txHash: tx.hash
    });
  } catch (error) {
    console.error('Error issuing certificate:', error);
    
    const errorMessage = extractErrorMessage(error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to issue certificate',
      error: errorMessage
    });
  }
});

// Verify Certificate
app.get('/api/certificates/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!contract) {
      const connected = await connectToBlockchain();
      if (!connected) {
        return res.status(500).json({ error: 'Failed to connect to blockchain' });
      }
    }
    
    console.log(`Verifying certificate: ID=${id}`);
    const isValid = await contract.verifyCertificate(id);
    console.log(`Certificate validity: ${isValid}`);
    
    res.json({
      success: true,
      isValid
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    
    const errorMessage = extractErrorMessage(error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to verify certificate',
      error: errorMessage
    });
  }
});

// Get Certificate Details
app.get('/api/certificates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Request received to get certificate details for ID: ${id}`);
    
    if (!contract) {
      const connected = await connectToBlockchain();
      if (!connected) {
        console.log('Failed to connect to blockchain when fetching certificate');
        return res.status(500).json({ error: 'Failed to connect to blockchain' });
      }
    }
    
    console.log(`Calling blockchain to get details for certificate ID: ${id}`);
    try {
      const details = await contract.getCertificateDetails(id);
      console.log('Certificate details retrieved from blockchain:', details);
      
      // Destructure the results array
      const [certId, studentName, courseName, issueDate, isValid, issuer] = details;
      
      console.log('Parsed certificate details:');
      console.log('- ID:', certId);
      console.log('- Student:', studentName);
      console.log('- Course:', courseName);
      console.log('- Issue Date:', issueDate);
      console.log('- Is Valid:', isValid);
      console.log('- Issuer:', issuer);
      
      res.json({
        success: true,
        certificate: {
          id: certId,
          studentName,
          courseName,
          issueDate,
          isValid,
          issuer
        }
      });
    } catch (error) {
      console.error(`Error getting certificate details from blockchain: ${error.message}`);
      console.error(error);
      return res.status(404).json({
        success: false,
        message: 'Failed to get certificate details',
        error: 'Certificate not found'
      });
    }
  } catch (error) {
    console.error('Error in /api/certificates/:id endpoint:', error);
    
    const errorMessage = extractErrorMessage(error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificate details',
      error: errorMessage
    });
  }
});

// Revoke Certificate
app.put('/api/certificates/:id/revoke', async (req, res) => {
  try {
    const { id } = req.params;
    const { userAddress } = req.body;
    
    if (!contract) {
      const connected = await connectToBlockchain();
      if (!connected) {
        return res.status(500).json({ error: 'Failed to connect to blockchain' });
      }
    }
    
    console.log(`Revoking certificate: ID=${id}`);
    
    // Check if certificate exists 
    try {
      const details = await contract.getCertificateDetails(id);
      // Check if user is the issuer
      const issuer = details[5]; // Get issuer address from details
      
      if (issuer.toLowerCase() !== userAddress.toLowerCase()) {
        return res.status(403).json({
          success: false,
          message: 'Failed to revoke certificate',
          error: 'Only the issuer can revoke certificates'
        });
      }
      
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Failed to revoke certificate',
        error: 'Certificate not found'
      });
    }
    
    // Revoke the certificate
    const tx = await contract.revokeCertificate(id);
    console.log(`Transaction hash: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
    
    res.json({
      success: true,
      message: 'Certificate revoked successfully',
      txHash: tx.hash
    });
  } catch (error) {
    console.error('Error revoking certificate:', error);
    
    const errorMessage = extractErrorMessage(error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to revoke certificate',
      error: errorMessage
    });
  }
});

// Serve React frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Initialize server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  const connected = await connectToBlockchain();
  console.log(`Blockchain connection: ${connected ? 'Successful' : 'Failed'}`);
}); 