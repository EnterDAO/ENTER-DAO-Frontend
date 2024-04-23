import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { EthereumProviderOptions } from '@walletconnect/ethereum-provider';
import type WalletConnectProvider from '@walletconnect/ethereum-provider';

const MAX_LISTENERS = 100;
export const URI_AVAILABLE = 'URI_AVAILABLE'

// WalletConnect V2 implementation compatible with the abstract connector
export class WalletConnectConnector extends AbstractConnector {
    private readonly options: EthereumProviderOptions;

    public provider?: WalletConnectProvider;

    constructor(options: EthereumProviderOptions) {
        super({ supportedChainIds: options.chains });

        options.events = ["accountsChanged", "chainChanged", "disconnect", "display_uri"];
        this.options = options;

        this.handleChainChanged = this.handleChainChanged.bind(this)
        this.handleAccountsChanged = this.handleAccountsChanged.bind(this)
        this.handleDisconnect = this.handleDisconnect.bind(this)
        this.handleURIChanged = this.handleURIChanged.bind(this)
    }

    private handleChainChanged(chainId: number | string): void {
        this.emitUpdate({ chainId })
    }

    private handleAccountsChanged(accounts: string[]): void {
        this.emitUpdate({ account: accounts[0] })
    }

    private handleDisconnect(): void {
        this.emitDeactivate()
    }

    private handleURIChanged = (uri: string): void => {
        this.emit(URI_AVAILABLE, uri)
    }

    private async initProvider(): Promise<WalletConnectProvider> {
        if (this.provider) return this.provider;

        const EthereumProvider = await import('@walletconnect/ethereum-provider')
        const provider = await EthereumProvider.default.init(this.options)

        provider.events.setMaxListeners(MAX_LISTENERS)
        provider
            .on('disconnect', this.handleDisconnect)
            .on('chainChanged', this.handleChainChanged)
            .on('accountsChanged', this.handleAccountsChanged)
            .on('display_uri', this.handleURIChanged);

        return provider;
    }

    public async activate(): Promise<ConnectorUpdate> {
        this.provider = await this.initProvider();

        const account: string | undefined = await this.provider
            .enable()
            .then((accounts: string[]): string => accounts[0]);

        return { provider: this.provider, account }
    }

    public async getProvider(): Promise<any> {
        return this.provider
    }

    public async getChainId(): Promise<number | string> {
        return this.provider?.request<number | string>({ method: 'eth_chainId' }) as any
    }

    public async getAccount(): Promise<null | string> {
        return this.provider?.request<string[]>({ method: 'eth_requestAccounts' }).then((accounts: string[]): string => accounts[0]) as any
    }

    public deactivate() {
        this.provider
            ?.removeListener('disconnect', this.handleDisconnect)
            ?.removeListener('chainChanged', this.handleChainChanged)
            ?.removeListener('accountsChanged', this.handleAccountsChanged)
            ?.removeListener('display_uri', this.handleURIChanged)
            ?.disconnect();
        this.provider = undefined;
    }
}