import { BigNumber, utils } from 'ethers';

import MerkleTree from './merkle-tree';

export default class BalanceTree {
  private readonly tree: MerkleTree;
  constructor(balances: { account: string; tokens: BigNumber; eth: BigNumber }[]) {
    this.tree = new MerkleTree(
      balances.map(({ account, tokens, eth }, index) => {
        return BalanceTree.toNode(index, account, tokens, eth);
      }),
    );
  }

  public static verifyProof(
    index: number | BigNumber,
    account: string,
    tokens: BigNumber,
    eth: BigNumber,
    proof: Buffer[],
    root: Buffer,
  ): boolean {
    let pair = BalanceTree.toNode(index, account, tokens, eth);
    for (const item of proof) {
      pair = MerkleTree.combinedHash(pair, item);
    }

    return pair.equals(root);
  }

  // keccak256(abi.encode(index, account, amount))
  public static toNode(index: number | BigNumber, account: string, tokens: BigNumber, eth: BigNumber): Buffer {
    return Buffer.from(
      utils.solidityKeccak256(['uint256', 'address', 'uint256', 'uint256'], [index, account, tokens, eth]).substr(2),
      'hex',
    );
  }

  public getHexRoot(): string {
    return this.tree.getHexRoot();
  }

  // returns the hex bytes32 values of the proof
  public getProof(index: number | BigNumber, account: string, tokens: BigNumber, eth: BigNumber): string[] {
    return this.tree.getHexProof(BalanceTree.toNode(index, account, tokens, eth));
  }
}
