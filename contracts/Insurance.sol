pragma solidity ^0.4.24;

/*
import "https://github.com/oraclize/ethereum-api/oraclizeAPI.sol";
import "https://github.com/OpenZeppelin/zeppelin-solidity/contracts/math/SafeMath.sol";
*/

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "oraclize-api/contracts/usingOraclize.sol";


contract Insurance is usingOraclize {
    // Various states that a policy can be in.
    // PENDING is the default.
    // If a policy expires, it will be REFUNDED
    // If a policy qualifies, it will be RELEASED
    // The creator of the policy (and no one else) also has an option to force the release
    // (this is useful in case the Oracle falters, etc.)
    enum State {PENDING, REFUNDED, RELEASED, FORCED}

    event LogTransfer(address add, uint amount, State state);

    struct Policy {
        address owner;
        uint256 balance;
        address[] receivers;
        uint256 start_time;
        uint256 end_time;
        string URL;
        State state;
    }
    Policy[] public policies;
    // Every time an Oraclize query is created, its unique ID is mapped to the associated Policy
    mapping(bytes32=>uint) private queryIndexes;

    constructor() public payable {
        // this is used to set up Oraclize for the dev environment.
        // TODO: Remove when deploying to testnet
        OAR = OraclizeAddrResolverI(0x6f485c8bf6fc43ea212e93bbf8ce046c7f1cb475);
    }

    function numPolicies() public constant returns(uint) {
        return policies.length;
    }

    function create(address[] receivers,
        uint256 start_time,
        uint256 end_time,
        string URL,
        State state) public payable {
            require(receivers.length > 0);
            require(start_time > 0);
            require(start_time < end_time);
            require(msg.value > 0);
            Policy memory p;
            p.owner = msg.sender;
            p.balance = msg.value;
            p.receivers = receivers;
            p.start_time = start_time;
            p.end_time = end_time;
            p.URL = URL;
            p.state = state;
            policies.push(p);
      }

      // Check if any of the policies have expired
      function checkExpired() public {
          for(uint i = 0; i < policies.length; i++) {
              // Only check policies which are still PENDING
              if(policies[i].state == State.PENDING) {
                  if(policies[i].start_time < block.timestamp && policies[i].end_time < block.timestamp) {
                      policies[i].state = State.REFUNDED;
                      emit LogTransfer(policies[i].owner, policies[i].balance, policies[i].state);
                      // policies[i].owner.estimateGas().send(policies[i].balance);
                      policies[i].owner.transfer(policies[i].balance);
                  }
              }
          }
      }

      // Run the oracle to check if any policy should be released
      function ping() public {
          checkExpired();
          for(uint i = 0; i < policies.length; i++) {
              // only query policies which are still PENDING
              if(policies[i].state == State.PENDING) {
                  bytes32 queryId = oraclize_query("URL", policies[i].URL, 1000000);
                  queryIndexes[queryId] = i + 1;
              }
          }
      }

    // Function called by Oraclize after it loads the URL
    function __callback(bytes32 queryId, string memory result) public {
        if (queryIndexes[queryId] == 0) revert();
        if (msg.sender != oraclize_cbAddress()) revert();

        if(parseInt(result) > 0) {
            uint index = SafeMath.sub(queryIndexes[queryId], 1);
            release(index, State.RELEASED);
        }
        delete queryIndexes[queryId];
    }

    function release(uint index, State state) {
        assert(state != State.PENDING);
        assert(state != State.REFUNDED);
        // Ensure that this function is only being called on PENDING policies
        if(policies[index].state == State.PENDING) {
            policies[index].state = state;
            uint amount = SafeMath.div(policies[index].balance, policies[index].receivers.length);
            for(uint i = 0; i < policies[index].receivers.length; i++) {
                emit LogTransfer(policies[i].owner, policies[i].balance, policies[index].state);
                policies[index].receivers[i].transfer(amount);
            }
        }
    }

    function force_release(uint index) public {
        require(msg.sender == policies[index].owner);
        release(index, State.FORCED);
    }
}
