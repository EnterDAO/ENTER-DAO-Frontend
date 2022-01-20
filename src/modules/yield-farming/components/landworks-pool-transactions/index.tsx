import React, { FC, useEffect, useMemo, useState } from 'react';
import { SelectValue } from 'antd/lib/select';
import { ColumnsType } from 'antd/lib/table/interface';
import format from 'date-fns/format';
import { formatToken, formatUSD, getEtherscanAddressUrl, getEtherscanTxUrl, shortenAddr } from 'web3/utils';

import Select, { SelectOption } from 'components/antd/select';
import Table from 'components/antd/table';
import ExternalLink from 'components/custom/externalLink';
import Icon, { IconNames } from 'components/custom/icon';
import { Tabs } from 'components/custom/tabs';
import { Text } from 'components/custom/typography';
import { convertTokenInUSD, getTokenByAddress } from 'components/providers/known-tokens-provider';
import config from 'config';
import { useReload } from 'hooks/useReload';
import { useWallet } from 'wallets/wallet';

import { APIYFPoolActionType, APIYFPoolTransaction, fetchYFPoolTransactions } from '../../api';

type TableEntity = APIYFPoolTransaction;

type State = {
  transactions: TableEntity[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  filters: {
    actionType: string;
    tokenAddress: string;
  };
};

const InitialState: State = {
  transactions: [],
  total: 0,
  page: 1,
  pageSize: 10,
  loading: false,
  filters: {
    actionType: 'all',
    tokenAddress: config.tokens.landworks,
  },
};

function getColumns(isAll: boolean): ColumnsType<TableEntity> {
  return [
    {
      title: 'Transaction',
      width: '25%',
      render: function TransactionColumn(_, entity) {
        const knownToken = getTokenByAddress(entity.tokenAddress);

        if (!knownToken) {
          return null;
        }

        return (
          <div className="flex flow-col col-gap-16 align-center">
            <Icon name={knownToken.icon as IconNames} width={40} height={40} />
            <div>
              <Text type="p1" weight="semibold" wrap={false} color="primary" className="mb-4">
                {entity.actionType === APIYFPoolActionType.DEPOSIT && 'Deposit'}
                {entity.actionType === APIYFPoolActionType.WITHDRAW && 'Withdraw'}
              </Text>
              <Text type="small" weight="semibold" wrap={false}>
                {knownToken.name}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Amount',
      width: '25%',
      render: function AmountColumn(_, entity) {
        const isStake = entity.actionType === APIYFPoolActionType.DEPOSIT;
        const knownToken = getTokenByAddress(entity.tokenAddress);

        if (!knownToken) {
          return null;
        }

        const amount = entity.amount.unscaleBy(knownToken.decimals)?.gt(0)
          ? entity.amount.unscaleBy(knownToken.decimals)
          : entity.tokenIds.length;

        return (
          <>
            <Text
              type="p1"
              weight="semibold"
              wrap={false}
              color={isStake ? 'var(--gradient-green-safe)' : 'var(--gradient-red-safe)'}
              textGradient={isStake ? 'var(--gradient-green)' : 'var(--gradient-red)'}
              className="mb-4">
              {isStake ? '+' : '-'}
              {formatToken(amount, {
                tokenName: knownToken.symbol,
                decimals: knownToken.decimals,
              }) ?? '-'}
            </Text>
            <Text type="small" weight="semibold" wrap={false}>
              {formatUSD(convertTokenInUSD(amount, knownToken.symbol))}
            </Text>
          </>
        );
      },
    },
    {
      title: 'Address',
      dataIndex: 'from',
      width: '25%',
      render: (_, entity) => (
        <ExternalLink href={getEtherscanAddressUrl(entity.userAddress)} className="link-blue">
          <Text type="p1" weight="semibold" color="var(--gradient-blue-safe)" textGradient="var(--gradient-blue)">
            {shortenAddr(entity.userAddress)}
          </Text>
        </ExternalLink>
      ),
    },
    {
      title: 'Transaction hash/timestamp',
      width: '25%',
      render: (_, entity) => (
        <>
          <ExternalLink href={getEtherscanTxUrl(entity.transactionHash)} className="link-blue mb-4">
            <Text type="p1" weight="semibold" color="var(--gradient-blue-safe)" textGradient="var(--gradient-blue)">
              {shortenAddr(entity.transactionHash)}
            </Text>
          </ExternalLink>
          <Text type="small" weight="semibold" color="secondary">
            {format(entity.blockTimestamp * 1_000, 'MM.dd.yyyy HH:mm')}
          </Text>
        </>
      ),
    },
  ];
}

const TX_OPTS: SelectOption[] = [
  {
    label: 'All transactions',
    value: 'all',
  },
  {
    label: 'Deposits',
    value: APIYFPoolActionType.DEPOSIT,
  },
  {
    label: 'Withdrawals',
    value: APIYFPoolActionType.WITHDRAW,
  },
];

const LandworksPoolTransactions: FC = () => {
  const walletCtx = useWallet();

  const hasOwnTab = walletCtx.isActive;
  const [reload, version] = useReload();
  const [state, setState] = useState<State>(InitialState);
  const [activeTab, setActiveTab] = useState(hasOwnTab ? 'own' : 'all');

  const tableColumns = useMemo(() => {
    return getColumns(activeTab === 'all');
  }, [activeTab]);

  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      page: 1,
    }));
  }, [activeTab]);

  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      page: 1,
    }));
  }, [activeTab]);

  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      loading: true,
      total: 0,
    }));

    (async () => {
      try {
        const {
          data: transactions,
          meta: { count },
        } = await fetchYFPoolTransactions(
          state.page,
          state.pageSize,
          state.filters.tokenAddress,
          activeTab === 'own' ? walletCtx.account : 'all',
          state.filters.actionType,
        );

        setState(prevState => ({
          ...prevState,
          loading: false,
          transactions,
          total: count,
        }));
      } catch {
        setState(prevState => ({
          ...prevState,
          loading: false,
          transactions: [],
        }));
      }
    })();
  }, [walletCtx.account, activeTab, state.page, state.pageSize, state.filters, version]);

  useEffect(() => {
    setActiveTab(hasOwnTab ? 'own' : 'all');
  }, [hasOwnTab]);

  function handleTypeFilterChange(value: SelectValue) {
    setState(prevState => ({
      ...prevState,
      page: 1,
      filters: {
        ...prevState.filters,
        actionType: String(value),
      },
    }));
  }

  function handlePageChange(page: number) {
    setState(prevState => ({
      ...prevState,
      page,
    }));
  }

  return (
    <div className="card mb-32">
      <div className="card-header flex flow-col align-center justify-space-between pv-0" style={{ overflowX: 'auto' }}>
        <Tabs
          activeKey={activeTab}
          style={{ flexShrink: 0 }}
          tabs={[
            ...(hasOwnTab
              ? [
                  {
                    id: 'own',
                    children: 'My transactions',
                  },
                ]
              : []),
            {
              id: 'all',
              children: 'All transactions',
            },
          ]}
          onClick={setActiveTab}
        />
        <div className="flex align-center">
          <Select
            style={{ minWidth: 200 }}
            options={TX_OPTS}
            value={state.filters.actionType}
            onChange={handleTypeFilterChange}
          />
        </div>
      </div>

      <Table<TableEntity>
        columns={tableColumns}
        dataSource={state.transactions}
        loading={state.loading}
        rowKey="transactionHash"
        pagination={{
          total: state.total,
          current: state.page,
          pageSize: state.pageSize,
          position: ['bottomRight'],
          showTotal: (total: number, [from, to]: [number, number]) => (
            <Text type="p2" weight="semibold" color="secondary">
              Showing {from} to {to} the most recent {total}
            </Text>
          ),
          onChange: handlePageChange,
        }}
        scroll={{
          x: true,
        }}
      />
    </div>
  );
};

export default LandworksPoolTransactions;
