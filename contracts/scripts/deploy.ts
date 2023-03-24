import { ethers } from 'hardhat';  
import * as fs from 'fs';
import { Publius, PubliusFactory } from '../typechain-types';

type ContractName =
    | 'PubliusImpl'
    | 'PubliusFactory'

interface Contract {
    network: string;
    address: string;
}
async function deployPublius() {

    const [deployer, author] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();

    // Deploy the implementation contract
    const Publius = await ethers.getContractFactory('Publius');
    const publiusInstance = await Publius.deploy() as Publius;
    await publiusInstance.deployed();

    // Deploy the factory contract, which will also deploy the Beacon contract
    const PubliusFactory = await ethers.getContractFactory('PubliusFactory');
    const factory = await PubliusFactory.deploy(publiusInstance.address) as PubliusFactory;
    await factory.deployed();

    
    const contracts: Record<ContractName, Contract> = ({
        PubliusImpl: {
            network: network.name === 'unknown' ? 'hardhat' : network.name,
            address: publiusInstance.address,
        },
        PubliusFactory: {
            network: network.name === 'unknown' ? 'hardhat' : network.name,
            address: factory.address,
        }
    });

    // Stringify the Contracts Map and output to the "addresses" file
    try {
    fs.writeFileSync(
        `${network.name === 'unknown' ? 'hardhat' : network.name}-contract-info.json`,
        JSON.stringify(contracts, null, 2), 
        'utf-8');
    } catch (err) {
    console.error(err);
    }
}

deployPublius();