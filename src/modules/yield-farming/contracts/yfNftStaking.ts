import BigNumber from 'bignumber.js';
import { AbiItem } from 'web3-utils';
import { formatToken } from 'web3/utils';
import Web3Contract, { BatchContractMethod, createAbiItem } from 'web3/web3Contract';

const ABI: AbiItem[] = [
  createAbiItem('periodFinish', [], ['uint256']),
  createAbiItem('rewardRate', [], ['uint256']),
  createAbiItem('rewardsDuration', [], ['uint256']),
  createAbiItem('lastUpdateTime', [], ['uint256']),
  createAbiItem('rewardPerTokenStored', [], ['uint256']),
  createAbiItem('rewardPerToken', [], ['uint256']),
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
  createAbiItem('getReward', [], []),
];

type StakeTx = {
  transactionHash: string;
  status: string;
};
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
  potentialRewardPerWeek?: number;

  async loadCommon(): Promise<void> {
    const commonMethods: BatchContractMethod[] = [
      {
        method: 'rewardRate',
        transform: (value: any) => new BigNumber(value),
      },
      {
        method: 'totalSupply',
        transform: (value: any) => new BigNumber(value),
      },
      {
        method: 'getRewardForDuration',
        transform: (value: any) => new BigNumber(value),
      },
      {
        method: 'lastTimeRewardApplicable',
        transform: (value: any) => new BigNumber(value),
      },
      {
        method: 'periodFinish',
        transform: (value: any) => new BigNumber(value),
      },
      {
        method: 'rewardsDuration',
        transform: (value: any) => new BigNumber(value),
      },
    ];

    return this.batch(commonMethods).then(
      ([rewardRate, totalSupply, rewardForDuration, lastTimeRewardApplicable, periodFinish, rewardsDuration]) => {
        this.rewardRate = rewardRate;
        this.totalSupply = totalSupply || 0;
        this.rewardForDuration = rewardForDuration.unscaleBy(18);
        this.rewards = (lastTimeRewardApplicable - (periodFinish - rewardsDuration)) * rewardRate.unscaleBy(18);
        this.emit(Web3Contract.UPDATE_DATA);
      },
    );
  }

  async loadAccountMethods(): Promise<void> {
    const addr = this.account;
    if (!addr) return;

    const accountMethods: BatchContractMethod[] = [
      {
        method: 'rewardRate',
        transform: (value: any) => new BigNumber(value),
      },
      {
        method: 'totalSupply',
        transform: (value: any) => new BigNumber(value),
      },
      {
        method: 'earned',
        methodArgs: [addr],
        transform: (value: any) => new BigNumber(value),
      },
      {
        method: 'balances',
        methodArgs: [addr],
        transform: (value: any) => new BigNumber(value),
      },
    ];

    return this.batch(accountMethods).then(([rewardRate, totalSupply, earned, balance]) => {
      this.earned = earned.unscaleBy(18);
      this.balance = balance;
      this.potentialRewardPerWeek = ((rewardRate.unscaleBy(18) * 604800) / totalSupply) * balance;
      this.emit(Web3Contract.UPDATE_DATA);
    });
  }

  async getReward(gasPrice: number): Promise<any> {
    return await this.send('getReward', [], {}, gasPrice);
  }

  async stake(tokenIds: number[]): Promise<StakeTx> {
    const result = await this.send('stake', [tokenIds]);
    if (result.status) {
      this.emit(Web3Contract.UPDATE_DATA);
    }
    return result;
  }

  async unstake(tokenIds: number[]): Promise<StakeTx> {
    const result = await this.send('withdraw', [tokenIds]);
    if (result.status) {
      this.emit(Web3Contract.UPDATE_DATA);
    }
    return result;
  }
}
