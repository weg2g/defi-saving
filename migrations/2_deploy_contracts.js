const SavingAccount = artifacts.require("SavingAccount");
const TokenInfoLib = artifacts.require("TokenInfoLib");
const SymbolsLib = artifacts.require("SymbolsLib");
const TestTokenContract = artifacts.require("TestTokenContract");

const tokenNames = "ETH,DAI,USDC,USDT,TUSD,PAX,GUSD,BNB,MKR,BAT,OMG,GNT,ZRX,REP,CRO,WBTC";
const tokenAddresses = [
    '0x0000000000000000000000000000000000000000',
    '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359',
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    '0x0000000000085d4780B73119b644AE5ecd22b376',
    '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
    '0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd',
    '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
    '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
    '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
    '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
    '0xa74476443119A942dE498590Fe1f2454d7D4aC0d',
    '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
    '0x1985365e9f78359a9B6AD760e32412f4a445E862',
    '0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b',
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
];

module.exports = function(deployer, network, accounts) {
    deployer.deploy(TokenInfoLib);
    deployer.link(TokenInfoLib, SavingAccount);
    deployer.deploy(SymbolsLib);
    deployer.link(SymbolsLib, SavingAccount);
    deployer.deploy(SavingAccount, {value: 2 * 10**16});
    
    if (network == "develop") {
        console.log(`Deploing test contract: TestTokenContract`);
        deployer.link(TokenInfoLib, TestTokenContract);
        deployer.deploy(TestTokenContract); 
    }
    
    let instance;
    deployer.then(function() {
        return SavingAccount.deployed();
      }).then(function(inst) {
        console.log("Initializing saving pool....");
        instance = inst;
        return instance.initialize(tokenNames, tokenAddresses, { from: accounts[0], gas: 6000000 });        
    }).then(function() {     
        return instance.getCoinLength();
    }).then(function(coinCount) {             
        console.log(`Initialization complete, number of coins: ${coinCount}`);
        return instance.updatePrice(0,  { from: accounts[0], gas: 6000000 });
    })
};
