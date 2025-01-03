// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract PropertyToken is ERC1155, Ownable, ERC1155Supply {
    uint256 private _currentTokenId = 0;
    mapping(uint256 => string) private _tokenURIs;

    event TokenMinted(address indexed to, uint256 indexed tokenId, uint256 amount);
    event TokenBatchMinted(address indexed to, uint256[] ids, uint256[] amounts);

    constructor() ERC1155("") Ownable(msg.sender) {}

    function mint(address account, uint256 amount, bytes memory data)
        public
        onlyOwner
    {
        require(account != address(0), "Mint to the zero address");
        require(amount > 0, "Amount must be positive");
        _currentTokenId += 1;
        _mint(account, _currentTokenId, amount, data);
        emit TokenMinted(account, _currentTokenId, amount);
    }

    function mintBatch(address to, uint256[] memory amounts, bytes memory data)
        public
        onlyOwner
    {
        require(to != address(0), "Mint to the zero address");
        uint256[] memory ids = new uint256[](amounts.length);
        for (uint256 i = 0; i < amounts.length; i++) {
            require(amounts[i] > 0, "Amount must be positive");
            _currentTokenId += 1;
            ids[i] = _currentTokenId;
        }
        _mintBatch(to, ids, amounts, data);
        emit TokenBatchMinted(to, ids, amounts);
    }

    function setURI(uint256 tokenId, string memory newuri) public onlyOwner {
        require(exists(tokenId), "URI set of nonexistent token");
        _tokenURIs[tokenId] = newuri;
        emit URI(newuri, tokenId);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(exists(tokenId), "URI query for nonexistent token");
        string memory _tokenURI = _tokenURIs[tokenId];
        return bytes(_tokenURI).length > 0 ? _tokenURI : uri(tokenId);
    }

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }
}

