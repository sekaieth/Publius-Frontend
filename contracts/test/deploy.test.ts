import { ethers, network, upgrades } from "hardhat";
import { expect } from 'chai';
import { Publius } from '../typechain-types';
import { Signer } from "ethers";



describe('Test Publius Deployment', () => {
  let publius: Publius;
  let author: string;
  let publicationName: string;
  let publicationCoverImage: string;


  beforeEach(async () => {
    publicationName = 'Test Publication';
    publicationCoverImage = "https://github.com/sekaieth/Publius/blob/main/Publius-Transparent-White.png?raw=true" 
    const signers = await ethers.getSigners();
    author = signers[1].address;
    const Publius = await ethers.getContractFactory('Publius');
    publius = await upgrades.deployProxy(Publius, [ 
      author, 
      'Test Publication', 
      publicationCoverImage 
    ]) as Publius;
    await publius.deployed();
  });

  describe('initialize', () => {
    it('sets the correct publication name, author, and cover image', async () => {
      expect(await publius.publicationName()).to.equal(publicationName);
      expect(await publius.publicationAuthor()).to.equal(author);
      expect(await publius.publicationCoverImage()).to.equal(publicationCoverImage);
    });

    it('reverts if the contract is already initialized', async () => {
      await expect(publius.initialize(author, 'My Publication', publicationCoverImage)).to.be.revertedWith(
        'Initializable: contract is already initialized'
      );
    });

    it('sets the correct owner of the contract', async () => {
      expect(await publius.owner()).to.equal(author);
    });

    it('reverts if the owner is not the author', async () => {
      await expect(publius.addPage(1, "test page", "test page content")).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });
  });
});