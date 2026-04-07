// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Pokemon Card NFT Collection
/// @notice A contract for minting unique Pokemon cards as NFTs with royalty support
contract PokemonCard is ERC721URIStorage, ERC2981, Ownable {
    uint256 private _nextTokenId;
    uint96 public constant DEFAULT_ROYALTY_FEE = 500; // 5%

    /// @notice Custom error when the caller is not the owner
    error NotOwner();

    struct PokemonCardData {
        string name;
        string rarity;
        uint256 series;
        uint256 cardNumber;
    }

    mapping(uint256 => PokemonCardData) public cardData;

    /// @notice Emitted when a new Pokemon card is minted
    /// @param tokenId The ID of the minted token
    /// @param to The address receiving the minted token
    /// @param name The name of the Pokemon
    /// @param rarity The rarity of the card
    event CardMinted(uint256 indexed tokenId, address indexed to, string name, string rarity);

    /// @notice Constructor for PokemonCard
    constructor() ERC721("PokemonCard", "PKC") Ownable(msg.sender) {
        _setDefaultRoyalty(msg.sender, DEFAULT_ROYALTY_FEE);
    }

    /// @notice Mints a new Pokemon card
    /// @param to The address to receive the minted card
    /// @param tokenURI The metadata URI for the card
    /// @param data The specific Pokemon card data
    function mintCard(address to, string memory tokenURI, PokemonCardData memory data) external onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        cardData[tokenId] = data;

        emit CardMinted(tokenId, to, data.name, data.rarity);
    }

    /// @notice Batch mints multiple Pokemon cards
    /// @param to Array of addresses to receive the minted cards
    /// @param tokenURIs Array of metadata URIs for the cards
    /// @param data Array of specific Pokemon card data
    function batchMintCard(address[] memory to, string[] memory tokenURIs, PokemonCardData[] memory data) external onlyOwner {
        require(to.length == tokenURIs.length && to.length == data.length, "Array lengths must match");
        for (uint256 i = 0; i < to.length; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(to[i], tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);
            cardData[tokenId] = data[i];

            emit CardMinted(tokenId, to[i], data[i].name, data[i].rarity);
        }
    }

    /// @notice Returns the total number of tokens minted
    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }

    /// @notice Sets default royalty fee for all tokens
    /// @param receiver Address to receive the royalties
    /// @param feeNumerator The fee amount in basis points
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    /// @notice Sets royalty fee for a specific token
    /// @param tokenId The token ID
    /// @param receiver Address to receive the royalties
    /// @param feeNumerator The fee amount in basis points
    function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator) external onlyOwner {
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }

    /// @notice See {IERC165-supportsInterface}.
    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
