// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract MyERC1155Token is Initializable, ERC1155Upgradeable, OwnableUpgradeable {
    mapping(uint256 => string) private tokenURIs;
    string private _contractURI;

    function initialize() public initializer {
        __ERC1155_init("");
        __Ownable_init(msg.sender);
    }

    // Función para mintear tokens sin necesidad de definir el URI
    function mint(
        address account,
        uint256 id,
        uint256 amount
    ) public onlyOwner {
        _mint(account, id, amount, "");
    }

    // Función para definir o actualizar el URI de un token específico
    function setTokenURI(uint256 tokenId, string memory tokenURI) public onlyOwner {
        _setTokenURI(tokenId, tokenURI);
    }

    // Función interna para guardar el URI en el mapping
    function _setTokenURI(uint256 tokenId, string memory tokenURI) internal {
        tokenURIs[tokenId] = tokenURI;
    }

    // Sobrescribir la función uri para devolver un URI específico según el tokenId
    function uri(uint256 tokenId) public view override returns (string memory) {
        return tokenURIs[tokenId];
    }

    // Nueva función: contractURI
    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    // Nueva función: permite actualizar la contractURI
    function setContractURI(string memory newContractURI) public onlyOwner {
        _contractURI = newContractURI;
    }
}
