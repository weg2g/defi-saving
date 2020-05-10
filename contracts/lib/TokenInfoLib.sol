pragma solidity 0.5.14;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/drafts/SignedSafeMath.sol";

library TokenInfoLib {
    using SafeMath for uint256;
    using SignedSafeMath for int256;
    struct TokenInfo {
        int256 balance;
        int256 interest;
        uint256 rate;
        uint256 StartBlockNumber;
    }
    uint256 constant BASE = 10**18; // TODO: 12 vs 18?
    int256 constant POSITIVE = 1;
    int256 constant NEGATIVE = -1;

    function totalBalance(TokenInfo storage self) public view returns(int256) {
        return self.balance;
    }

    // returns the sum of balance, interest posted to the account, and any additional intereset accrued up to the given timestamp
    function totalAmount(TokenInfo storage self, uint rate) public view returns(int256) {
        return self.balance.add(viewInterest(self, rate));
    }

    // returns the sum of balance and interest posted to the account
    function getCurrentTotalAmount(TokenInfo storage self) public view returns(int256) {
        return self.balance.add(self.interest);
    }

    function getStartBlockNumber(TokenInfo storage self) public view returns(uint256){
        return self.StartBlockNumber;
    }

    function minusAmount(TokenInfo storage self, uint256 amount, uint256 rate, uint256 blockNumber) public {
        resetInterest(self, blockNumber, rate);
        int256 _amount = int256(amount);
        if (self.balance + self.interest > 0) {
            if (self.interest >= _amount) {
                self.interest = self.interest.sub(_amount);
                _amount = 0;
            } else if (self.balance.add(self.interest) >= _amount) {
                self.balance = self.balance.sub(_amount.sub(self.interest));
                self.interest = 0;
                _amount = 0;
            } else {
                _amount = _amount.sub(self.balance.add(self.interest));
                self.balance = 0;
                self.interest = 0;
            }
        }
        if (_amount > 0) {
            require(self.balance.add(self.interest) <= 0, "To minus amount, the total balance must be smaller than 0.");
            self.balance = self.balance.sub(_amount);
        }
    }

    function addAmount(TokenInfo storage self, uint256 amount, uint rate, uint256 blockNumber) public returns(int256) {
        resetInterest(self, blockNumber, rate);
        int256 _amount = int256(amount);
        if (self.balance.add(self.interest) < 0) {
            if (self.interest.add(_amount) <= 0) {
                self.interest = self.interest.add(_amount);
                _amount = 0;
            } else if (self.balance.add(self.interest).add(_amount) <= 0) {
                self.balance = self.balance.add(_amount.add(self.interest));
                self.interest = 0;
                _amount = 0;
            } else {
                _amount = _amount.add(self.balance.add(self.interest));
                self.balance = 0;
                self.interest = 0;
            }
        }
        if (_amount > 0) {
            require(self.balance.add(self.interest) >= 0, "To add amount, the total balance must be larger than 0.");
            self.balance = self.balance.add(_amount);
        }
        return self.balance;
    }

    function resetInterest(TokenInfo storage self, uint256 blockNumber, uint rate) public {
        self.interest = viewInterest(self, rate);
        self.StartBlockNumber = blockNumber;
    }

    function viewInterest(TokenInfo storage self, uint rate) public view returns(int256) {
        int256 _sign = self.balance < 0 ? NEGATIVE : POSITIVE;
        //TODO uint256(-amount) ???
        uint256 _balance = self.balance >= 0 ? uint256(self.balance) : uint256(-self.balance);
        //uint256 _interest = self.interest >= 0 ? uint256(self.interest) : uint256(-self.interest);
        if(rate == 0 || _balance == 0) {
            return self.interest;
        } else if(BASE > rate) {
            return 0;
        } else {
            return int256(_balance.mul(rate).sub(_balance.mul(BASE)).div(BASE)).mul(_sign);
        }
    }

    function updateInterest(TokenInfo storage self, int256 money) public {
        self.interest = self.interest.sub(money);
    }
}
