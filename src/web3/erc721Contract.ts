import BigNumber from 'bignumber.js';
import { AbiItem } from 'web3-utils';
import Web3Contract, { createAbiItem } from 'web3/web3Contract';

const ABI: AbiItem[] = [
  createAbiItem('name', [], ['string']),
  createAbiItem('symbol', [], ['string']),
  createAbiItem('totalSupply', [], ['uint256']),
  createAbiItem('balanceOf', ['address'], ['uint256']),
  createAbiItem('setApprovalForAll', ['address', 'bool'], []),
  createAbiItem('isApprovedForAll', ['address', 'address'], ['bool']),
];

type SetApprovedTx = {
  blockHash: string;
  status: boolean;
};
export default class Erc721Contract extends Web3Contract {
  symbol?: string;

  totalSupply?: BigNumber;

  private balances: Map<string, BigNumber>;

  constructor(abi: [], address: string) {
    super([...ABI, ...abi], address, '');

    this.balances = new Map<string, BigNumber>();

    this.on(Web3Contract.UPDATE_ACCOUNT, () => {
      if (!this.account) {
        this.balances.clear();
        this.emit(Web3Contract.UPDATE_DATA);
      }
    });
  }

  get balance(): BigNumber | undefined {
    if (!this.account) {
      return undefined;
    }

    return this.balances.get(this.account);
  }

  getBalanceOf(address: string): BigNumber | undefined {
    return this.balances.get(address);
  }

  loadCommon(): Promise<void> {
    return this.batch([
      {
        method: 'name',
      },
      {
        method: 'symbol',
      },
      {
        method: 'totalSupply',
        transform: value => new BigNumber(value),
      },
    ]).then(([name, symbol, decimals, totalSupply]) => {
      this.name = name;
      this.symbol = symbol;
      this.totalSupply = totalSupply;
      this.emit(Web3Contract.UPDATE_DATA);
    });
  }

  async loadBalance(address?: string): Promise<void> {
    const addr = address ?? this.account;

    if (!addr) {
      return;
    }

    return this.call('balanceOf', [addr]).then(value => {
      this.balances.set(addr, new BigNumber(value));
      this.emit(Web3Contract.UPDATE_DATA);
    });
  }

  setApprovalForAll(operator: string, approved: boolean): Promise<SetApprovedTx> {
    if (!this.account) {
      return Promise.reject();
    }

    return this.send('setApprovalForAll', [operator, approved], {
      from: this.account,
    }).then(res => {
      this.loadBalance(operator);
      return res;
    });
  }

  isApprovedForAll(owner: string, operator: string): Promise<boolean> {
    if (!this.account) {
      return Promise.reject();
    }

    return this.call('isApprovedForAll', [owner, operator], {
      from: this.account,
    });
  }
}
