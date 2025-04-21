const fs = require('fs');
const path = require('path');

// Read the deployed contract address from the build artifacts
const getContractAddress = () => {
  try {
    // Read the contract artifact
    const artifactPath = path.join(__dirname, '../build/contracts/CertificationAuthentication.json');
    const contractArtifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    // Get the network ids from the artifact
    const networkIds = Object.keys(contractArtifact.networks);
    
    if (networkIds.length === 0) {
      throw new Error('Contract is not deployed yet. Please run `truffle migrate` first.');
    }
    
    // Get the last deployed contract address
    const networkId = networkIds[networkIds.length - 1];
    const contractAddress = contractArtifact.networks[networkId].address;
    
    return contractAddress;
  } catch (error) {
    console.error('Error getting contract address:', error);
    return null;
  }
};

// Update the contractConfig.js file with the new address
const updateContractConfig = () => {
  try {
    const contractAddress = getContractAddress();
    
    if (!contractAddress) {
      console.error('Failed to get contract address. Config file not updated.');
      return;
    }
    
    const configPath = path.join(__dirname, '../client/src/contractConfig.js');
    
    // Read the current config file
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Replace the FALLBACK_ADDRESS value with the new contract address
    configContent = configContent.replace(
      /const FALLBACK_ADDRESS = ['"]0x[0-9a-fA-F]+['"]/,
      `const FALLBACK_ADDRESS = '${contractAddress}'`
    );
    
    // Write the updated config back to the file
    fs.writeFileSync(configPath, configContent);
    
    console.log(`Contract config updated with address: ${contractAddress}`);
  } catch (error) {
    console.error('Error updating contract config:', error);
  }
};

// Run the update
updateContractConfig(); 