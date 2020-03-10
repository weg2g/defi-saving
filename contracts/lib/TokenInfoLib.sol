pragma solidity >= 0.5.0 < 0.6.0;

import "../../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
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

	// returns the sum of balance, interest posted to the account, and any additional intereset accrued up to the given timestamp
	function totalAmount(TokenInfo storage self, uint256 blockNumber, uint rate) public view returns(int256) {
		return self.balance.add(viewInterest(self, blockNumber, rate));
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

//	function mixRate(TokenInfo storage self, int256 amount, uint256 rate) private view returns (uint256){
//		//TODO uint256(-self.balance) this will integer underflow - Critical Security risk
//		//TODO Why do we need this???
//        uint256 _balance = self.balance >= 0 ? uint256(self.balance) : uint256(-self.balance);
//		uint256 _amount = amount >= 0 ? uint256(amount) : uint256(-amount);
//		return _balance.mul(self.rate).add(_amount.mul(rate)).div(_balance + _amount);
//	}

	function resetInterest(TokenInfo storage self, uint256 blockNumber, uint rate) public {
		self.interest = viewInterest(self, blockNumber, rate);
		self.StartBlockNumber = blockNumber;
	}

	function viewInterest(TokenInfo storage self, uint256 blockNumber, uint rate) public view returns(int256) {
        int256 _sign = self.balance < 0 ? NEGATIVE : POSITIVE;
		//TODO uint256(-amount) ???
		uint256 _balance = self.balance >= 0 ? uint256(self.balance) : uint256(-self.balance);
		uint256 _interest = self.interest >= 0 ? uint256(self.interest) : uint256(-self.interest);
		uint256 _difference = blockNumber.sub(self.StartBlockNumber);

		if(_difference == 0) {
			return self.interest;
		} else {
			return int256(_balance.add(_interest).mul(rate).mul(_difference).div(BASE).sub(_balance)).mul(_sign);
		}
	}

    function updateInterest(TokenInfo storage self, int256 money) public {
        self.interest=self.interest.sub(money);
    }
}
