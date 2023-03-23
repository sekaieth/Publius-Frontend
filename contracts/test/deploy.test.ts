import { ethers, network, upgrades } from "hardhat";
import { expect } from 'chai';
import { Publius, PubliusBeacon, PubliusFactory } from '../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';


describe('Test Publius Deployment', () => {
    let publius: Publius;
    let deployer: SignerWithAddress;
    let author: SignerWithAddress;
    let publicationName: string;
    let publicationCoverImage: string;
    let factory: PubliusFactory;

  beforeEach(async () => {
      publicationName = 'Test Publication';
      publicationCoverImage = "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true";
      [deployer, author] = await ethers.getSigners();

      // Deploy the implementation contract
      const Publius = await ethers.getContractFactory('Publius');
      const publiusInstance = await Publius.deploy();
      await publiusInstance.deployed();

      // Deploy the factory contract, which will also deploy the Beacon contract
      const PubliusFactory = await ethers.getContractFactory('PubliusFactory');
      factory = await PubliusFactory.deploy(publiusInstance.address) as PubliusFactory;
      await factory.deployed();

      // Deploy the first publication
      const deployPublication = await factory.createPublication(1, author.address, "sekaieth", publicationName, publicationCoverImage);
      await deployPublication.wait();

      publius = await ethers.getContractAt('Publius', await factory.getPublicationAddress(1)) as Publius;

  });

  describe('initialize', () => {
    it('sets the correct publication name, author, and cover image', async () => {
      expect(await publius.publicationName()).to.equal(publicationName);
      expect(await publius.publicationAuthor()).to.equal(author.address);
      expect(await publius.publicationCoverImage()).to.equal(publicationCoverImage);
    });

    it('reverts if the contract is already initialized', async () => {
      await expect(publius.initialize(1, author.address, "s3kai.eth", publicationName, publicationCoverImage)).to.be.revertedWith(
        'Initializable: contract is already initialized'
      );
    });

    it('sets the correct owner of the contract', async () => {
      expect(await publius.owner()).to.equal(author.address);
    });

    it("factory contract deploys new proxies", async () => {
      factory.createPublication(2, author.address, "s3kai.eth", "Publication 2", "TEST IMAGE2");
      expect(await factory.getPublicationAddress(2)).to.not.equal(await factory.getPublicationAddress(1));

      const publius2 = await ethers.getContractAt('Publius', await factory.getPublicationAddress(2)) as Publius;
      expect(await publius2.publicationId()).to.equal(2);
      expect(await publius2.publicationName()).to.equal("Publication 2");
      expect(await publius2.publicationAuthor()).to.equal(author.address);
      expect(await publius2.publicationCoverImage()).to.equal("TEST IMAGE2");
    });
  });
});