// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GateKeeper is ERC1155, Ownable {
    mapping(uint128 => address) public roomOwners;

    mapping(uint128 => int128) public roomIds;
    mapping(int128 => uint128) public IdsOfRooms;

    mapping(address => int128) public idOfUsers;
    mapping(int128 => address) public addressOfUsers;

    uint128 public nbRooms = 0;

    constructor() ERC1155("https://ipfs.io/ipfs/QmWXJXRdExse2YHRY21Wvh4pjRxNRQcWVhcKw4DLVnqGqs/") {}

    function createRoom(int128 _roomId, uint128 _supply) public {
        require(IdsOfRooms[_roomId] == 0);
        nbRooms++;
        roomOwners[nbRooms] = msg.sender;
        roomIds[nbRooms] = _roomId;
        IdsOfRooms[_roomId] = nbRooms;
        _mint(msg.sender, nbRooms, _supply, "");
    }

    function mint(uint128 _roomId, uint128 _quantity) public {
        require(msg.sender == roomOwners[_roomId], "Not owner");
        _mint(msg.sender, nbRooms, _quantity, "");
    }

    function transferRoomOwnership(uint128 _roomId, address _newOwner) public {
        require(msg.sender == roomOwners[_roomId], "Not owner");
        roomOwners[_roomId] = _newOwner;
    }

    function register(int128 _userId) public {
        require(addressOfUsers[_userId] == address(0), "Already taken");
        addressOfUsers[_userId] = msg.sender;
        idOfUsers[msg.sender] = _userId;
        _mint(msg.sender, 1, 1, "");
    }

    function unregister() public {
        addressOfUsers[idOfUsers[msg.sender]] = address(0);
        idOfUsers[msg.sender] = 0;
    }

    function isGateOpen(int128 _userId, int128 _chatId) public view returns (bool) {
        return (this.balanceOf(addressOfUsers[_userId], IdsOfRooms[_chatId]) > 0 && addressOfUsers[_userId] != address(0));
    }

}
