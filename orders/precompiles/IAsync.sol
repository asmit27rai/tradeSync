// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.25 <0.9.0;

/// @dev The IAsync contract's address.
address constant IASYNC_PRECOMPILE_ADDRESS = 0x0000000000000000000000000000000000000903;

/// @dev The IAsync contract's instance.
IAsync constant IASYNC_CONTRACT = IAsync(IASYNC_PRECOMPILE_ADDRESS);

struct Future {
  uint64 id;
  address creator;
  string handler;
  bytes input;
}

enum FutureVoteType {
  Unspecified,
  Verified,
  Rejected
}

struct FutureVote {
  uint64 futureId;
  bytes voter;
  FutureVoteType vote;
}

struct FutureResult {
  uint64 id;
  bytes output;
  bytes submitter;
}

struct FutureResponse {
  Future future;
  FutureVote[] votes;
  FutureResult result;
}

struct PendingFuturesResponse {
  PageResponse pagination;
  Future[] futures;
}

struct FuturesResponse {
  PageResponse pagination;
  FutureResponse[] futures;
}

struct FutureByIdResponse {
  FutureResponse futureResponse;
}

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

/**
 * @author Warden Team
 * @title x/async Interface
 * @dev The interface through which users and solidity contracts will interact with x/async.
 * @custom:address 0x0000000000000000000000000000000000000903
 */
interface IAsync {
  /// @dev Defines a method to add a future.
  /// @param handler The unique name of the handler
  /// @param input The handler's input
  /// @return futureId The id of the future
  function addFuture(string calldata handler, bytes calldata input) external returns (uint64 futureId);

  /// @dev Defines a method to query future by id.
  /// @param futureId The future id
  /// @return response The future reponse
  function futureById(uint64 futureId) external view returns (FutureByIdResponse memory response);

  /// @dev Defines a method to query futures.
  /// @param pagination The pagination details
  /// @param creator Optional creator address filter
  /// @return response The paged futures
  function futures(
    PageRequest calldata pagination,
    address creator
  ) external view returns (FuturesResponse memory response);

  /// @dev Defines a method to query pending futures.
  /// @param pagination The pagination details
  /// @return response The paged futures
  function pendingFutures(
    PageRequest calldata pagination
  ) external view returns (PendingFuturesResponse memory response);

  /// @dev CreateFuture defines an Event emitted when a future is created.
  /// @param creator The address of the creator
  /// @param futureId The future Id
  /// @param handler The name of the handler
  event CreateFuture(uint64 indexed futureId, address indexed creator, string handler);
}
