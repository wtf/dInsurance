var Insurance = artifacts.require("./Insurance.sol");

module.exports = function(deployer) {
  deployer.deploy(Insurance, {value: 100000000});
};
