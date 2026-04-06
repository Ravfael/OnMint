// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {PokemonCard} from "../src/PokemonCard.sol";
import {PokemonMarketplace} from "../src/PokemonMarketplace.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        address deployerAddress = vm.addr(deployerPrivateKey);

        console.log("Deploying with Address:", deployerAddress);

        vm.startBroadcast(deployerPrivateKey);

        PokemonCard nft = new PokemonCard();
        console.log("PokemonCard deployed to:", address(nft));
        
        PokemonMarketplace marketplace = new PokemonMarketplace(address(nft));
        console.log("PokemonMarketplace deployed to:", address(marketplace));

        vm.stopBroadcast();
    }
}
