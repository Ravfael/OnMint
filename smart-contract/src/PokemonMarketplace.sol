// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC2981} from "@openzeppelin/contracts/interfaces/IERC2981.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Pokemon Card Marketplace
/// @notice A marketplace for listing and buying Pokemon Cards
contract PokemonMarketplace is ReentrancyGuard, Ownable {
    address public pokemonCardAddress;
    uint256 public platformFee = 250; // 2.5%

    struct Listing {
        uint256 tokenId;
        uint256 price;
        address seller;
        bool isActive;
    }

    mapping(uint256 => Listing) public listings;

    error NotCardOwner();
    error NotApproved();
    error InvalidPrice();
    error ListingNotActive();
    error InsufficientPayment();
    error NotListingOwner();
    error TransferFailed();
    error CannotBuyOwnListing();

    event CardListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event CardSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event ListingCancelled(uint256 indexed tokenId);

    /// @notice Constructor sets the NFT contract address
    /// @param _pokemonCardAddress Address of the PokemonCard NFT
    constructor(address _pokemonCardAddress) Ownable(msg.sender) {
        pokemonCardAddress = _pokemonCardAddress;
    }

    /// @notice Lists a card for sale
    /// @param tokenId The ID of the token to list
    /// @param price The sale price in wei
    function listCard(uint256 tokenId, uint256 price) external {
        if (price == 0) revert InvalidPrice();
        
        IERC721 nft = IERC721(pokemonCardAddress);
        if (nft.ownerOf(tokenId) != msg.sender) revert NotCardOwner();
        if (nft.getApproved(tokenId) != address(this) && !nft.isApprovedForAll(msg.sender, address(this))) {
            revert NotApproved();
        }

        listings[tokenId] = Listing({
            tokenId: tokenId,
            price: price,
            seller: msg.sender,
            isActive: true
        });

        emit CardListed(tokenId, msg.sender, price);
    }

    /// @notice Buys a listed card
    /// @param tokenId The ID of the token to buy
    function buyCard(uint256 tokenId) external payable nonReentrant {
        Listing memory listing = listings[tokenId];
        if (!listing.isActive) revert ListingNotActive();
        if (msg.value < listing.price) revert InsufficientPayment();
        if (listing.seller == msg.sender) revert CannotBuyOwnListing();

        // Checks complete, Effects
        listings[tokenId].isActive = false;

        // Interactions
        uint256 feeAmount = (listing.price * platformFee) / 10000;
        uint256 royaltyAmount = 0;
        address royaltyReceiver = address(0);

        try IERC2981(pokemonCardAddress).royaltyInfo(tokenId, listing.price) returns (address receiver, uint256 amount) {
            royaltyReceiver = receiver;
            royaltyAmount = amount;
        } catch {}

        uint256 sellerAmount = listing.price - feeAmount - royaltyAmount;

        IERC721(pokemonCardAddress).safeTransferFrom(listing.seller, msg.sender, tokenId);

        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            (bool successRoyalty, ) = payable(royaltyReceiver).call{value: royaltyAmount}("");
            if (!successRoyalty) revert TransferFailed();
        }

        (bool successSeller, ) = payable(listing.seller).call{value: sellerAmount}("");
        if (!successSeller) revert TransferFailed();

        emit CardSold(tokenId, listing.seller, msg.sender, listing.price);
    }

    /// @notice Cancels an active listing
    /// @param tokenId The ID of the token listing to cancel
    function cancelListing(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];
        if (listing.seller != msg.sender) revert NotListingOwner();
        if (!listing.isActive) revert ListingNotActive();

        listings[tokenId].isActive = false;
        
        emit ListingCancelled(tokenId);
    }

    /// @notice Updates the price of an active listing
    /// @param tokenId The ID of the token listing to update
    /// @param newPrice The new price in wei
    function updatePrice(uint256 tokenId, uint256 newPrice) external {
        if (newPrice == 0) revert InvalidPrice();
        Listing storage listing = listings[tokenId];
        if (listing.seller != msg.sender) revert NotListingOwner();
        if (!listing.isActive) revert ListingNotActive();

        listing.price = newPrice;
        
        emit CardListed(tokenId, msg.sender, newPrice);
    }

    /// @notice Withdraws accumulated platform fees to the owner
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        if (!success) revert TransferFailed();
    }

    /// @notice Updates the platform fee
    /// @param newFee The new fee in basis points
    function setPlatformFee(uint256 newFee) external onlyOwner {
        platformFee = newFee;
    }
}
