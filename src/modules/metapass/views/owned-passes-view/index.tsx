import React, { useEffect, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { offset } from '@popperjs/core';
import { Col, Input, Pagination, Row } from 'antd';

import MetapassCard from 'modules/metapass/components/metapassCard';
import { MetapassSorter } from 'modules/metapass/components/metapassSorter';
import { SortDirection } from 'modules/metapass/components/metapassSorter/models/SortDirection';

import { metapassMockData } from './mockMetapasses';

import './index.scss';

const OwnedPasses: React.FC = () => {
  const pageSizeOptions = ['12', '24', '48'];

  const [passes, setPasses] = useState(metapassMockData);
  const [totalPasses, setTotalPasses] = useState(metapassMockData.length);

  const [searchText, setSearchText] = useState('');
  const [sortDir, setSortDir] = useState(SortDirection.ASC);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(+pageSizeOptions[0]);

  const searchItems = (e: any) => {
    setSearchText(e.target.value);
  };

  const onPaginationChange = (page: number, newPageSize?: number | undefined) => {
    setPage(page);
    if (newPageSize) {
      setPageSize(newPageSize);

      if (pageSize === newPageSize || newPageSize < pageSize) {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    }
  };

  const onSortDirectionChange = (sortDir: SortDirection) => {
    if (sortDir === SortDirection.ASC) {
      setSortDir(SortDirection.DESC);
    } else {
      setSortDir(SortDirection.ASC);
    }
  };

  useEffect(() => {
    let fileredPasses = metapassMockData.filter(pass => pass.id.includes(searchText));
    if (sortDir === SortDirection.ASC) {
      fileredPasses.sort((a, b) => +a.id - +b.id);
    } else {
      fileredPasses.sort((a, b) => +b.id - +a.id);
    }
    setTotalPasses(fileredPasses.length);

    const offset = (page - 1) * pageSize;
    fileredPasses = fileredPasses.slice(offset, offset + pageSize);
    setPasses(fileredPasses);
  }, [sortDir, searchText, page, pageSize]);

  return (
    <>
      <div className="content-container">
        <Row>
          <Col span={24} id="owned-container">
            <Row id="header">My NFTs</Row>
            <Row id="filters">
              <Col xl={10} md={13} sm={18} xs={19}>
                <Input
                  prefix={<SearchOutlined />}
                  id="metapass-search-input"
                  value={searchText}
                  size={'small'}
                  placeholder="Search items"
                  onChange={searchItems}
                />
              </Col>
              <Col offset={1}>
                <MetapassSorter sortDir={sortDir} onSortDirectionChange={onSortDirectionChange} />
              </Col>
            </Row>
            <Row
              id="metapasses"
              gutter={[
                { sm: 16, md: 16, lg: 32 },
                { sm: 16, md: 16, lg: 32 },
              ]}>
              {passes.map(pass => (
                <MetapassCard key={pass.id} pass={pass} />
              ))}
            </Row>
          </Col>
          <Col span={24} className="my-nfts-pagination">
            <Pagination
              locale={{ items_per_page: '' }}
              current={page}
              total={totalPasses}
              defaultPageSize={pageSize}
              showSizeChanger
              pageSizeOptions={pageSizeOptions}
              onChange={onPaginationChange}
            />
          </Col>
        </Row>
      </div>
    </>
  );
};

export default OwnedPasses;
