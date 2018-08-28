import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Insurance.sol";

contract TestInsurance {
    Insurance insurance = Insurance(DeployedAddresses.Insurance());
    function testRefundOnExpire() public {
        address owner = this;
    }
    function testReleaseOnMatch() public {
        address owner = this;
    }
}
