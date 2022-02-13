import { BigNumber, FixedNumber } from 'ethers';
import { AbiItem } from 'web3-utils';
import Web3Contract, { createAbiItem } from 'web3/web3Contract';

import config from 'config';

import { fetchAirdropTotal } from '../modules/airdrop/api';
import add from 'date-fns/add';
import differenceInCalendarWeeks from 'date-fns/differenceInCalendarWeeks';

const ABI: AbiItem[] = [
  createAbiItem('isClaimed', ['uint256'], ['bool']),
  createAbiItem('claim', ['uint256', 'address', 'uint256', 'bytes32[]']),
  createAbiItem('calculateAdjustedAmount', ['uint256'], ['uint256', 'uint256', 'uint256']),
  createAbiItem('bonusStart', [], ['uint256']),
];

export default class MerkleDistributor extends Web3Contract {
  isAirdropClaimed?: boolean;
  claimIndex?: number;
  claimAmount?: string;
  totalAirdropped?: BigNumber;
  totalInfo?: {
    totalAirdropClaimed: string;
    totalAirdropRedistributed: string;
  };
  adjustedAmount?: {
    airdropAmount: string;
    bonus: string;
    bonusPart: string;
  };
  bonusStart?: string;
  airdropDurationInWeeks: number;
  airdropCurrentWeek?: number;
  airdropData?: any;
  merkleProof?: string[];
  isInitialized: boolean;

  constructor(abi: AbiItem[], address: string) {
    super([...ABI, ...abi], address, '');
    this.airdropDurationInWeeks = 26; // TODO CHANGE IT!
    this.isInitialized = false;

    this.on(Web3Contract.UPDATE_ACCOUNT, () => {
      if (!this.account) {
        this.isAirdropClaimed = false;
        this.claimIndex = -1;
        this.claimAmount = undefined;
        this.totalAirdropped = undefined;
        this.totalInfo = undefined;
        this.adjustedAmount = undefined;
        this.bonusStart = undefined;
        this.airdropCurrentWeek = undefined;
        this.merkleProof = undefined;
        this.emit(Web3Contract.UPDATE_DATA);
      }
      let airdropData;

      config.isDev
        ? (airdropData = require(`../merkle-distributor/airdrop-test.json`))
        : (airdropData = require(`../merkle-distributor/airdrop.json`));

      const airdropAccounts = airdropData.map((drop: { address: any; earnings: any }) => ({
        account: drop.address,
        amount: BigNumber.from(FixedNumber.from(drop.earnings)),
      }));

      this.claimIndex = airdropAccounts.findIndex((o: { account: string | undefined }) => o.account === this.account);
      this.claimAmount = this.claimIndex !== -1 ? this.getClaimAmount(this.account || '', airdropData) : undefined;
      this.adjustedAmount = undefined;
    });
  }

  getClaimAmount(address: string, airdropData: any[]): string | undefined {
    return airdropData.find(e => e.address === address)?.earnings;
  }

  async loadCommonFor(): Promise<void> {
    this.totalInfo = await fetchAirdropTotal()
    this.emit(Web3Contract.UPDATE_DATA);
  }

  async loadUserData(): Promise<void> {
    const account = this.account;

    if (!account) {
      return;
    }

    const [ bonusStart] = await this.batch([
      { method: 'bonusStart', methodArgs: [], callArgs: { from: account } },
    ]);

    this.bonusStart = bonusStart;

    const airdropStartDate = new Date(Number(this.bonusStart ?? 0) * 1000);
    const airdropEndDate = add(airdropStartDate, { weeks: this.airdropDurationInWeeks });

    this.airdropCurrentWeek =
    this.airdropDurationInWeeks -
    differenceInCalendarWeeks(new Date(airdropEndDate), new Date() > airdropEndDate ? airdropEndDate : new Date());

    if (this.claimAmount !== null && this.claimIndex !== -1) {
      const [isClaimed, adjustedAmount] = await this.batch([
        { method: 'isClaimed', methodArgs: [this.claimIndex], callArgs: { from: account } },
        { method: 'calculateAdjustedAmount', methodArgs: [this.claimAmount], callArgs: { from: account } },
      ]);

      this.isAirdropClaimed = isClaimed;
      this.adjustedAmount = {
        airdropAmount: adjustedAmount[0],
        bonus: adjustedAmount[1],
        bonusPart: adjustedAmount[2]
      };
    }
    this.isInitialized = true;
    this.emit(Web3Contract.UPDATE_DATA);
  }

  async claim(index: number | BigNumber, address: string, amount: string, merkleProof: string[]): Promise<void> {
    return this.send('claim', [index, address, amount, merkleProof], {
      from: this.account,
    }).then(() => {
      this.isAirdropClaimed = true;
      this.claimIndex = -1;
      this.claimAmount = undefined;
      this.adjustedAmount = undefined;
      this.bonusStart = undefined;
      this.emit(Web3Contract.UPDATE_DATA);
    });
  }
}
