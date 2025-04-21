const CertificationAuthentication = artifacts.require("CertificationAuthentication");
const { expectRevert } = require('@openzeppelin/test-helpers');

contract("CertificationAuthentication", accounts => {
  const [owner, issuer1, issuer2, student1] = accounts;
  let certAuth;

  beforeEach(async () => {
    certAuth = await CertificationAuthentication.new({ from: owner });
  });

  describe("Deployment", () => {
    it("should set the deployer as owner", async () => {
      const contractOwner = await certAuth.owner();
      assert.equal(contractOwner, owner, "Owner not correctly set");
    });

    it("should set the owner as an authorized issuer", async () => {
      const isAuthorized = await certAuth.isAuthorizedIssuer(owner);
      assert.equal(isAuthorized, true, "Owner should be an authorized issuer");
    });
  });

  describe("Issuer Management", () => {
    it("should allow owner to authorize new issuers", async () => {
      await certAuth.authorizeIssuer(issuer1, { from: owner });
      const isAuthorized = await certAuth.isAuthorizedIssuer(issuer1);
      assert.equal(isAuthorized, true, "Issuer1 should be authorized");
    });

    it("should not allow non-owners to authorize issuers", async () => {
      await expectRevert(
        certAuth.authorizeIssuer(issuer2, { from: issuer1 }),
        "Only the owner can perform this action"
      );
    });

    it("should allow owner to revoke issuers", async () => {
      await certAuth.authorizeIssuer(issuer1, { from: owner });
      await certAuth.revokeIssuer(issuer1, { from: owner });
      const isAuthorized = await certAuth.isAuthorizedIssuer(issuer1);
      assert.equal(isAuthorized, false, "Issuer1 should be revoked");
    });
  });

  describe("Certificate Management", () => {
    const certId = "CERT-2023-001";
    const studentName = "John Doe";
    const courseName = "Blockchain Development";
    const issueDate = "2023-11-01";

    it("should allow authorized issuers to issue certificates", async () => {
      await certAuth.authorizeIssuer(issuer1, { from: owner });
      await certAuth.issueCertificate(certId, studentName, courseName, issueDate, { from: issuer1 });
      
      const isValid = await certAuth.verifyCertificate(certId);
      assert.equal(isValid, true, "Certificate should be valid");
    });

    it("should not allow unauthorized users to issue certificates", async () => {
      await expectRevert(
        certAuth.issueCertificate(certId, studentName, courseName, issueDate, { from: student1 }),
        "Not authorized to issue certificates"
      );
    });

    it("should allow retrieving certificate details", async () => {
      await certAuth.issueCertificate(certId, studentName, courseName, issueDate, { from: owner });
      
      const [id, name, course, date, valid, issuer] = await certAuth.getCertificateDetails(certId);
      assert.equal(id, certId, "Certificate ID mismatch");
      assert.equal(name, studentName, "Student name mismatch");
      assert.equal(course, courseName, "Course name mismatch");
      assert.equal(date, issueDate, "Issue date mismatch");
      assert.equal(valid, true, "Certificate should be valid");
      assert.equal(issuer, owner, "Issuer mismatch");
    });

    it("should allow issuer to revoke certificates", async () => {
      await certAuth.authorizeIssuer(issuer1, { from: owner });
      await certAuth.issueCertificate(certId, studentName, courseName, issueDate, { from: issuer1 });
      
      await certAuth.revokeCertificate(certId, { from: issuer1 });
      const isValid = await certAuth.verifyCertificate(certId);
      assert.equal(isValid, false, "Certificate should be revoked");
    });

    it("should allow owner to revoke any certificate", async () => {
      await certAuth.authorizeIssuer(issuer1, { from: owner });
      await certAuth.issueCertificate(certId, studentName, courseName, issueDate, { from: issuer1 });
      
      await certAuth.revokeCertificate(certId, { from: owner });
      const isValid = await certAuth.verifyCertificate(certId);
      assert.equal(isValid, false, "Certificate should be revoked");
    });
  });
}); 