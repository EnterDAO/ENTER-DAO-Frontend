import { BigNumber as _BigNumber } from 'bignumber.js';
import add from 'date-fns/add';
import differenceInCalendarWeeks from 'date-fns/differenceInCalendarWeeks';
import { AbiItem } from 'web3-utils';
import Web3Contract, { createAbiItem } from 'web3/web3Contract';

import config from 'config';

import { fetchAirdropTotal } from '../modules/airdrop/api';

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

  constructor(abi: AbiItem[], address: string) {
    super([...ABI, ...abi], address, '');
    this.isInitialized = false;

    config.web3.chainId === 80001 //TODO fetch dynamically from env
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
      this.redeemableAmount = undefined;
      this.totalToBeRedeemed = _BigNumber.from(this.redeemData.tokenTotal);
    });
  }

  async loadUserData(): Promise<void> {
    const account = this.account;

    if (!account) {
      return;
    }

    const airdropEndDate = new Date('11.2.2024');

    if (this.allocatedEth !== null && this.allocatedEth !== undefined && this.redeemIndex !== -1) {
      const [isRedeemed, redeemableAmount] = await this.batch([
        { method: 'isRedeemed', methodArgs: [this.redeemIndex], callArgs: { from: account } },
        {
          method: 'calcRedeemableAmount',
          methodArgs: [this.allocatedTokens, this.actualAllocatedTokens, this.allocatedEth],
          callArgs: { from: account },
        },
      ]);

      this.isRedeemClaimed = isRedeemed;
      this.redeemableAmount = redeemableAmount;
    }
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

  async calcRedeemableAmount(): Promise<void> {
    return this.send('calcRedeemableAmount', [this.allocatedTokens, this.redeemableAmount, this.allocatedEth], {
      from: this.account,
    }).then(() => {
      this.isRedeemClaimed = true;
      this.redeemIndex = -1;
      this.allocatedTokens = undefined;
      this.allocatedEth = undefined;
      this.emit(Web3Contract.UPDATE_DATA);
    });
  }

  async redeem(): Promise<void> {
    // console.log(
    //   `
    //     this.redeemIndex,
    //     this.account,
    //     this.allocatedTokens,
    //     this.allocatedEth,
    //     this.merkleProof,
    //     this.actualAllocatedTokens,
    //    :>> `,
    //   [
    //     this.redeemIndex,
    //     this.account,
    //     this.allocatedTokens,
    //     this.allocatedEth,
    //     this.merkleProof,
    //     this.actualAllocatedTokens,
    //   ],
    // );
    return this.send(
      'redeem',
      //TODO Hris
      // hardcoded data
      //   [
      //     4,
      //     this.account,
      //     '118712',
      //     '10000000000000000',
      //     [
      //       '0x61d3fe1d2a02ff4edef082cdbdbaa0168b507fe8f08bef9199434f8b3c0a53aa',
      //       '0x0ceed3be3f9d27797c311710c9f8186e3fc5f40f6fd7066f4a0b3568284c0394',
      //       '0x35a4b6b16d3b9675986b76b9cad1431e225e896a0edd8f4eef5c744f0c692689',
      //     ],
      //     '118712',
      //   ],
      [
        this.redeemIndex,
        this.account,
        this.allocatedTokens,
        this.allocatedEth,
        this.merkleProof,
        this.actualAllocatedTokens,
      ],
      {
        from: this.account,
      },
    ).then(() => {
      this.isRedeemClaimed = true;
      this.redeemIndex = -1;
      this.allocatedTokens = undefined;
      this.allocatedEth = undefined;
      this.emit(Web3Contract.UPDATE_DATA);
    });
  }
}
