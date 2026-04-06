// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {PokemonCard} from "../src/PokemonCard.sol";
import {IERC2981} from "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract PokemonCardTest is Test {
    PokemonCard public nft;
    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);

    function setUp() public {
        vm.prank(owner);
        nft = new PokemonCard();
    }

    function test_MintCard() public {
        PokemonCard.PokemonCardData memory data = PokemonCard.PokemonCardData({
            name: "Charizard",
            rarity: "Ultra Rare",
            series: 1,
            cardNumber: 4
        });

        vm.prank(owner);
        nft.mintCard(user1, "ipfs://charizard-uri", data);

        assertEq(nft.ownerOf(0), user1);
        assertEq(nft.tokenURI(0), "ipfs://charizard-uri");
        
        (string memory name, string memory rarity, uint256 series, uint256 cardNumber) = nft.cardData(0);
        assertEq(name, "Charizard");
        assertEq(rarity, "Ultra Rare");
        assertEq(series, 1);
        assertEq(cardNumber, 4);
    }

    function test_MintCard_RevertIfNotOwner() public {
        PokemonCard.PokemonCardData memory data = PokemonCard.PokemonCardData({
            name: "Pikachu",
            rarity: "Common",
            series: 1,
            cardNumber: 25
        });

        vm.prank(user1);
        vm.expectRevert();
        nft.mintCard(user2, "ipfs://uri", data);
    }

    function test_BatchMintCard() public {
        address[] memory tos = new address[](2);
        tos[0] = user1;
        tos[1] = user2;

        string[] memory uris = new string[](2);
        uris[0] = "ipfs://uri1";
        uris[1] = "ipfs://uri2";

        PokemonCard.PokemonCardData memory data1 = PokemonCard.PokemonCardData("Venusaur", "Rare", 1, 3);
        PokemonCard.PokemonCardData memory data2 = PokemonCard.PokemonCardData("Blastoise", "Rare", 1, 9);
        
        PokemonCard.PokemonCardData[] memory datas = new PokemonCard.PokemonCardData[](2);
        datas[0] = data1;
        datas[1] = data2;

        vm.prank(owner);
        nft.batchMintCard(tos, uris, datas);

        assertEq(nft.ownerOf(0), user1);
        assertEq(nft.ownerOf(1), user2);
        
        (string memory name1,,,) = nft.cardData(0);
        assertEq(name1, "Venusaur");
        
        (string memory name2,,,) = nft.cardData(1);
        assertEq(name2, "Blastoise");
    }

    function test_RoyaltyInfo() public {
        PokemonCard.PokemonCardData memory data = PokemonCard.PokemonCardData("Mewtwo", "Promo", 1, 150);
        
        vm.prank(owner);
        nft.mintCard(user1, "ipfs://uri", data);

        (address receiver, uint256 royaltyAmount) = nft.royaltyInfo(0, 10000);
        
        // Default royalty is 5% = 500 bps
        assertEq(receiver, owner);
        assertEq(royaltyAmount, 500);
    }

    function test_TransferCard() public {
        PokemonCard.PokemonCardData memory data = PokemonCard.PokemonCardData("Gengar", "Rare", 1, 94);
        
        vm.prank(owner);
        nft.mintCard(user1, "ipfs://uri", data);

        vm.prank(user1);
        nft.transferFrom(user1, user2, 0);

        assertEq(nft.ownerOf(0), user2);
    }

    function test_SupportsInterface() public {
        // ERC721
        assertTrue(nft.supportsInterface(0x80ac58cd));
        // ERC2981
        assertTrue(nft.supportsInterface(0x2a55205a));
    }
}
