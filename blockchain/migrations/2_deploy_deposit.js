var BaseWallet = artifacts.require("./BaseWallet.sol");

module.exports = function (deployer) {
    deployer.deploy(BaseWallet);
};
