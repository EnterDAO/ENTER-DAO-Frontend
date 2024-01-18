import { BigNumber as _BigNumber } from 'bignumber.js';
import { BigNumber } from 'ethers';
import { AbiItem } from 'web3-utils';
import Web3Contract, { createAbiItem } from 'web3/web3Contract';

import config from 'config';

import { Builder } from './signer';

const ABI: AbiItem[] = [
  createAbiItem('isRedeemed', ['uint256'], ['bool']),
  createAbiItem('calcRedeemableAmount', ['uint256', 'uint256', 'uint256'], ['uint256']),
  createAbiItem(
    'permitRedeem',
    ['uint256', 'address', 'uint256', 'uint256', 'bytes32[]', 'uint256', 'uint256', 'uint8', 'bytes32', 'bytes32'],
    [],
  ),
  createAbiItem('redeem', ['uint256', 'address', 'uint256', 'uint256', 'bytes32[]', 'uint256']),
];

export default class MerkleRedeemDistributor extends Web3Contract {
  isRedeemClaimed?: boolean;
  redeemIndex?: number;
  allocatedEth?: string;
  allocatedTokens?: string;
  actualAllocatedTokens?: string;
  totalToBeRedeemed?: _BigNumber;
  tokenAddress?: string;
  merkleRoot?: string;
  totalRedemptions?: number;
  initialPoolSize?: _BigNumber;
  currentPoolSize?: _BigNumber;
  endingTimestamp?: number;
  recipientAddress?: string;
  redeemData?: any;
  merkleProof?: string[];
  isInitialized: boolean;
  redeemableAmount?: string;
  userData?: any;

  constructor(abi: AbiItem[], address: string) {
    super([...ABI, ...abi], address, '');
    this.isInitialized = false;

    config.web3.chainId === 11155111 //TODO fetch dynamically from env
      ? (this.redeemData = require(`../merkle-distributor/tree.json`))
      : (this.redeemData = require(`../merkle-distributor/airdrop.json`));

    this.on(Web3Contract.UPDATE_ACCOUNT, () => {
      if (!this.account) {
        this.redeemIndex = -1;
        this.isRedeemClaimed = false;
        this.allocatedEth = undefined;
        this.redeemableAmount = undefined;
        this.allocatedTokens = undefined;
        this.totalToBeRedeemed = undefined;
        this.merkleProof = undefined;
        this.actualAllocatedTokens = undefined;
        this.emit(Web3Contract.UPDATE_DATA);
      }

      this.redeemIndex = this.redeemData.redemptions[this.account ?? '']?.index;

      this.merkleProof = this.redeemData.redemptions[this.account ?? '']?.proof;
      this.allocatedEth = this.redeemData.redemptions[this.account ?? '']?.eth;
      this.allocatedTokens = this.redeemData.redemptions[this.account ?? '']?.tokens;
      // this.redeemableAmount = undefined;
      this.isRedeemClaimed = false;
      this.totalToBeRedeemed = _BigNumber.from(this.redeemData.ethTotal);
    });
  }

  async loadUserData(userData: any): Promise<void> {
    const account = this.account;

    if (!account) {
      return;
    }

    if (this.allocatedEth !== null && this.allocatedEth !== undefined && this.redeemIndex !== -1) {
      const [isRedeemed, redeemableAmount] = await this.batch([
        { method: 'isRedeemed', methodArgs: [this.redeemIndex], callArgs: { from: account } },
        {
          method: 'calcRedeemableAmount',
          methodArgs: [this.allocatedTokens, this.actualAllocatedTokens, this.allocatedEth],
          callArgs: { from: account },
        },
      ]);
      console.log('this.allocatedTokens :>> ', this.allocatedTokens);
      this.isRedeemClaimed = isRedeemed;
      this.redeemableAmount = redeemableAmount;
      console.log('this.redeemableAmount :>> ', this.redeemableAmount);
    }
    this.userData = userData;
    this.isInitialized = true;
    this.emit(Web3Contract.UPDATE_DATA);
  }

  async isRedeemed(): Promise<void> {
    return this.send('isRedeemed', [this.redeemIndex], {
      from: this.account,
    }).then(() => {
      this.isRedeemClaimed = true;
      this.emit(Web3Contract.UPDATE_DATA);
    });
  }

  // async calcRedeemableAmount(): Promise<void> {
  //   return this.send('calcRedeemableAmount', [this.allocatedTokens, this.redeemableAmount, this.allocatedEth], {
  //     from: this.account,
  //   }).then(() => {
  //     this.isRedeemClaimed = true;
  //     this.redeemIndex = -1;
  //     this.allocatedTokens = undefined;
  //     this.allocatedEth = undefined;
  //     this.emit(Web3Contract.UPDATE_DATA);
  //   });
  // }

  async redeem(): Promise<void> {
    const actualBalance = BigNumber.from(this.userData.actualBalance);
    const allocatedTokens = BigNumber.from(this.allocatedTokens);
    const amountToRedeem = actualBalance.lt(allocatedTokens) ? actualBalance : allocatedTokens;

    const txHashListener = (txHash: string) => {
      localStorage.setItem('transactionHash', txHash);
      this.off('tx:hash', txHashListener);
    };
    this.on('tx:hash', txHashListener);

    return this.send('redeem', [this.userData, amountToRedeem.toString()], {
      from: this.account,
    }).then(() => {
      this.isRedeemClaimed = true;
      this.redeemIndex = -1;
      this.allocatedTokens = undefined;
      this.allocatedEth = undefined;
      this.emit(Web3Contract.UPDATE_DATA);
    });
  }

  async permitRedeem(): Promise<void> {
    const buildObj = {
      owner: this.userData.library.getSigner(this.account),
      spenderAddress: this.address,
      erc20: this.userData.erc20,
    };

    //const actualBalance = BigNumber.from(this.userData.actualBalance);
    const actualBalance = BigNumber.from(743564377);
    console.log('actualBalance in distributor :>> ', actualBalance.toString());
    const allocatedTokens = BigNumber.from(this.allocatedTokens);
    console.log('allocatedTokens in distributor :>> ', allocatedTokens.toString());
    const amountToRedeem = actualBalance.lt(allocatedTokens) ? actualBalance : allocatedTokens;
    this.userData.tokens = amountToRedeem;
    // this.userData.tokens = 55;
    console.log('this.userData.tokens :>> ', this.userData?.tokens.toString());
    const user = await Builder.create().withSignObject(buildObj).build();
    console.log('user :>> ', user);
    await user.signPermit(this.userData.tokens.toString());

    const txHashListener = (txHash: string) => {
      localStorage.setItem('transactionHash', txHash);
      this.off('tx:hash', txHashListener);
    };
    this.on('tx:hash', txHashListener);

    return this.send('permitRedeem', [this.userData, user.permitMessage], {
      from: this.account,
    }).then(() => {
      this.isRedeemClaimed = true;
      this.redeemIndex = -1;
      this.allocatedTokens = undefined;
      this.allocatedEth = undefined;
      this.emit(Web3Contract.UPDATE_DATA);
    });
  }
}
