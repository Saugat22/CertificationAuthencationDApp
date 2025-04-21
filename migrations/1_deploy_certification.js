const CertificationAuthentication = artifacts.require("CertificationAuthentication");

module.exports = function(deployer) {
  deployer.deploy(CertificationAuthentication);
}; 