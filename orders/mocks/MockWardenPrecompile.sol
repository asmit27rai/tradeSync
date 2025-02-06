// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.25 <0.9.0;

import { AddressesResponse, AddressType, BroadcastType, Key, KeyResponse } from "../precompiles/IWarden.sol";

struct AnyType {
  string typeUrl;
  bytes value;
}

struct Timestamp {
  uint64 secs;
  uint64 nanos;
}

/// @dev Dec represents a fixed point decimal value. The value is stored as an integer, and the
/// precision is stored as a uint8. The value is multiplied by 10^precision to get the actual value.
struct Dec {
  uint256 value;
  uint8 precision;
}

/// @dev Coin is a struct that represents a token with a denomination and an amount.
struct Coin {
  string denom;
  uint256 amount;
}

/// @dev DecCoin is a struct that represents a token with a denomination, an amount and a precision.
struct DecCoin {
  string denom;
  uint256 amount;
  uint8 precision;
}

/// @dev PageResponse is a struct that represents a page response.
struct PageResponse {
  bytes nextKey;
  uint64 total;
}

/// @dev PageRequest is a struct that represents a page request.
struct PageRequest {
  bytes key;
  uint64 offset;
  uint64 limit;
  bool countTotal;
  bool reverse;
}

/// @dev Height is a monotonically increasing data type
/// that can be compared against another Height for the purposes of updating and
/// freezing clients
///
/// Normally the RevisionHeight is incremented at each height while keeping
/// RevisionNumber the same. However some consensus algorithms may choose to
/// reset the height in certain conditions e.g. hard forks, state-machine
/// breaking changes In these cases, the RevisionNumber is incremented so that
/// height continues to be monotonically increasing even as the RevisionHeight
/// gets reset
struct Height {
  // the revision that the client is currently on
  uint64 revisionNumber;
  // the height within the given revision
  uint64 revisionHeight;
}

contract MockWardenPrecompile {
  mapping(uint64 keyId => KeyResponse keyResponse) private keys;
  mapping(uint64 keyId => bool isGood) private goodKeys;

  function keyById(uint64, int32[] calldata) external pure returns (KeyResponse memory keyResponse) {
    Key memory key;
    AddressesResponse[] memory addresses = new AddressesResponse[](1);
    addresses[0] = AddressesResponse({
      addressValue: "0x0000000000000000000000000000000000000000",
      addressType: AddressType.Ethereum
    });
    keyResponse = KeyResponse({ key: key, addresses: addresses });
  }

  function newSignRequest(
    uint64 keyId,
    bytes calldata,
    bytes[] calldata,
    bytes calldata,
    Coin[] calldata,
    uint64,
    uint64,
    string calldata,
    string calldata,
    BroadcastType
  ) external view returns (bool isGood) {
    isGood = goodKeys[keyId];
  }

  function addKey(uint64 keyId, bool isGood) external {
    goodKeys[keyId] = isGood;
  }
}
