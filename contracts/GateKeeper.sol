// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";


contract GateKeeper is ERC1155 {
    mapping(uint256 => address) public roomOwners;

    mapping(uint256 => int256) public roomIds;
    mapping(int256 => uint256) public IdsOfRooms;

    mapping(address => int256) public idOfUsers;
    mapping(int256 => address) public addressOfUsers;

    uint256 public nbRooms = 1;

    constructor() ERC1155("ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/") {}

    function createRoom(int256 _roomId, uint256 _supply) public {
        require(IdsOfRooms[_roomId] == 0);
        nbRooms++;
        roomOwners[nbRooms] = msg.sender;
        roomIds[nbRooms] = _roomId;
        IdsOfRooms[_roomId] = nbRooms;
        _mint(msg.sender, nbRooms, _supply, "");
    }

    function mint(uint256 _roomId, uint256 _quantity) public {
        require(msg.sender == roomOwners[_roomId], "Not owner");
        _mint(msg.sender, nbRooms, _quantity, "");
    }

    function transferRoomOwnership(uint256 _roomId, address _newOwner) public {
        require(msg.sender == roomOwners[_roomId], "Not owner");
        roomOwners[_roomId] = _newOwner;
    }

    function register(int256 _userId) public {
        require(addressOfUsers[_userId] == address(0), "Already taken");
        addressOfUsers[_userId] = msg.sender;
        idOfUsers[msg.sender] = _userId;
    }

    function unregister() public {
        addressOfUsers[idOfUsers[msg.sender]] = address(0);
        idOfUsers[msg.sender] = 0;
    }

    function isGateOpen(int256 _userId, int256 _chatId) public view returns (bool) {
        return (this.balanceOf(addressOfUsers[_userId], IdsOfRooms[_chatId]) > 0 && addressOfUsers[_userId] != address(0));
    }

}
