import BigNumber from 'bignumber.js';
import { AbiItem } from 'web3-utils';
import { formatToken } from 'web3/utils';
import Web3Contract, { createAbiItem } from 'web3/web3Contract';

const ABI: AbiItem[] = [
  createAbiItem('periodFinish', [], ['uint256']),
  createAbiItem('rewardRate', [], ['uint256']),
  createAbiItem('rewardsDuration', [], ['uint256']),
  createAbiItem('lastUpdateTime', [], ['uint256']),
  createAbiItem('rewardPerTokenStored', [], ['uint256']),
  createAbiItem('totalSupply', [], ['uint256']),
  createAbiItem('lastTimeRewardApplicable', [], ['uint256']),
  createAbiItem('rewardPerToken', [], ['uint256']),
  createAbiItem('earned', ['address'], ['uint256']),
  createAbiItem('getRewardForDuration', [], ['uint256']),
  createAbiItem('computeAmount', ['uint256'], ['uint256']),
  createAbiItem('stake', ['uint256[]'], []),
  createAbiItem('withdraw', ['uint256[]'], []),
  createAbiItem('getReward', [], []),
  createAbiItem('exit', ['uint256[]'], []),
  createAbiItem('balances', ['address'], ['uint256']),
];

export class YfNftStakingContract extends Web3Contract {
  constructor(stakingAddress: string) {
    super(ABI, stakingAddress, 'YF NFT STAKING');

    this.on(Web3Contract.UPDATE_ACCOUNT, () => {
      this.balance = undefined;
      this.earned = undefined;
      this.emit(Web3Contract.UPDATE_DATA);
    });
  }

  // common data
  rewardRate?: number;
  totalSupply?: number;
  balance?: number;
  earned?: number;
  rewardForDuration?: number;
  rewards?: number;

  async loadCommon(): Promise<void> {
    const addr = this.account;

    if (!addr) {
      return;
    }
    return this.batch([
      {
        method: 'rewardRate',
        transform: value => new BigNumber(value),
      },
      {
        method: 'totalSupply',
        transform: value => new BigNumber(value),
      },
      {
        method: 'earned',
        methodArgs: [addr],
        transform: value => new BigNumber(value),
      },
      {
        method: 'balances',
        methodArgs: [addr],
        transform: value => new BigNumber(value),
      },
      {
        method: 'getRewardForDuration',
        transform: value => new BigNumber(value),
      },
      {
        method: 'lastTimeRewardApplicable',
        transform: value => new BigNumber(value),
      },
      {
        method: 'periodFinish',
        transform: value => new BigNumber(value),
      },
      {
        method: 'rewardsDuration',
        transform: value => new BigNumber(value),
      },
    ]).then(
      ([
        rewardRate,
        totalSupply,
        earned,
        balance,
        rewardForDuration,
        lastTimeRewardApplicable,
        periodFinish,
        rewardsDuration,
      ]) => {
        this.rewardRate = rewardRate;
        this.totalSupply = totalSupply || 0;
        this.earned = earned.unscaleBy(18);
        this.balance = balance;
        this.rewardForDuration = rewardForDuration.unscaleBy(18);
        this.rewards = (lastTimeRewardApplicable - (periodFinish - rewardsDuration)) * rewardRate.unscaleBy(18);
        this.emit(Web3Contract.UPDATE_DATA);
      },
    );
  }

  async stake(tokenAddress: string, amount: BigNumber, gasPrice: number): Promise<BigNumber> {
    const result = await this.send('deposit', [tokenAddress, amount], {}, gasPrice);
    return new BigNumber(result);
  }

  async unstake(tokenAddress: string, amount: BigNumber, gasPrice: number): Promise<BigNumber> {
    const result = await this.send('withdraw', [tokenAddress, amount], {}, gasPrice);
    return new BigNumber(result);
  }
}
