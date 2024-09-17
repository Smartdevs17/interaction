// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;


contract Ludo {
    mapping(address => uint) public playerPositions;
    mapping(address => uint) public playerStatus;
    uint public numPlayers;
    uint public turnNumber;
    uint public seed;
    event DiceRolled(address player, uint roll);
    event PlayerMoved(address player, uint newPosition);
    event GameFinished(address player);

    constructor() {
        seed = block.timestamp;
    }

    function joinGame() public {
        require(numPlayers < 4, "Max 4 players allowed");
        playerPositions[msg.sender] = 0;
        playerStatus[msg.sender] = 1;
        numPlayers++;
        emit PlayerMoved(msg.sender, 0);
    }

    function rollDice() public {
        require(playerStatus[msg.sender] == 1, "Its not your turn");
        uint roll = (seed + block.timestamp) % 6 + 1;
        seed = roll;
        emit DiceRolled(msg.sender, roll);
        movePlayer(roll);
    }

    function movePlayer(uint roll) internal {
        uint newPosition = playerPositions[msg.sender] + roll;
        if (newPosition >= 52) {
            playerStatus[msg.sender] = 2;
            emit GameFinished(msg.sender);
        } else {
            playerPositions[msg.sender] = newPosition;
            emit PlayerMoved(msg.sender, newPosition);
        }
    }

    function getPlayerPosition(address player) public view returns (uint) {
        return playerPositions[player];
    }

    function getPlayerStatus(address player) public view returns (uint) {
        return playerStatus[player];
    }

    function getNumPlayers() public view returns (uint) {
        return numPlayers;
    }

    function getTurnNumber() public view returns (uint) {
        return turnNumber;
    }
}

