import { Signer } from '@ethersproject/abstract-signer';
import { Signature, splitSignature } from '@ethersproject/bytes';

export const EIP712Domain = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
];

export const Permit = [
  { name: 'owner', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
];

interface ISignData {
  owner: Signer;
  spenderAddress: string;
  erc20: any;
}

export class Builder {
  user: User;

  constructor() {
    this.user = new User();
  }

  static create() {
    return new Builder();
  }

  withSignObject(signDataObj: ISignData): Builder {
    this.user.setSignProps(signDataObj);
    return this;
  }

  async build(): Promise<User> {
    await this.user.setChainId();
    await this.user.setOwnerAddress();
    return this.user;
  }
}

export class User {
  erc20!: any;
  chainId: number;
  deadline: number;
  spenderAddress = '';
  address: string;
  owner!: Signer;
  permitSignature!: Signature;
  permitMessage: any;

  constructor() {
    this.spenderAddress = '';
    this.chainId = -1;
    this.deadline = +new Date() + 60 * 60;
    this.address = '';
  }

  async withSigner(signer: Signer) {
    this.owner = signer;
    await this.setOwnerAddress();
  }

  async setChainId() {
    const network = await this.owner.provider?.getNetwork();
    this.chainId = network != null ? network.chainId : -1;
  }

  async setOwnerAddress() {
    this.address = await this.owner.getAddress();
  }

  setSignProps(signDataObj: ISignData) {
    this.owner = signDataObj.owner;
    this.spenderAddress = signDataObj.spenderAddress;
    this.erc20 = signDataObj.erc20;
  }

  async getPermitData(value: number | string) {
    const domain = {
      name: await this.erc20.name(),
      version: '1',
      chainId: this.chainId,
      verifyingContract: this.erc20.address,
    };

    const message = {
      owner: this.address,
      spender: this.spenderAddress,
      value: value,
      nonce: (await this.erc20.nonces(this.address)).toString(),
      deadline: this.deadline,
    };

    return {
      types: {
        EIP712Domain,
        Permit,
      },
      domain,
      primaryType: 'Permit',
      message,
    };
  }

  async signPermit(value: number | string) {
    const data = await this.getPermitData(value);

    let types = {
      Permit: data.types.Permit,
    };

    // @ts-expect-error
    const signatureLike = await this.owner._signTypedData(data.domain, types, data.message);

    this.permitSignature = splitSignature(signatureLike);
    this.permitMessage = {
      actualBalance: value,
      deadline: this.deadline,
      v: this.permitSignature!.v,
      r: this.permitSignature!.r,
      s: this.permitSignature!.s,
    };
  }
}
