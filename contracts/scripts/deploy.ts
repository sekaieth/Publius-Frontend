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
            network: "scroll",
            address: publiusInstance.address,
        },
        PubliusFactory: {
            network: "scroll",
            address: factory.address,
        }
    });

    console.log(`Publius Implemenatation Block Explorer URL: https://blockscout.scroll.io/address/${publiusInstance.address}`)
    console.log(`PubliusFactory Block explorer URL: https://blockscout.scroll.io/address/${factory.address}`);

    // Stringify the Contracts Map and output to the "addresses" file
    try {
    fs.writeFileSync(
        `scroll-contract-info.json`,
        JSON.stringify(contracts, null, 2), 
        'utf-8');
    } catch (err) {
    console.error(err);
    }
}

deployPublius();