import React, { useState, useEffect } from 'react';
import { Table, Space, Row, Col, Card, Pagination } from 'antd';
import { useRequest } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';

import styles from './index.less';
import ActionBuilder from './builder/ActionBuilder';
import ColumnBuilder from './builder/ColumnBuilder';
import Modal from './component/Modal';

const Index = () => {
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(10);
  const [sortQuery, setSorterQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUri, setModalUri] = useState('');

  const init = useRequest<{ data: BasicListApi.ListData }>(
    `https://public-api-v2.aspirantzhang.com/api/admins?X-API-KEY=antd&page=${page}&per_page=${per_page}${sortQuery}`,
  );

  useEffect(() => {
    init.run();
  }, [page, per_page, sortQuery]);

  const paginationChangeHandler = (_page: number, _per_page: number) => {
    setPage(_page);
    setPerPage(_per_page);
  };

  const tableChangeHandler = (_: any, __: any, sorter: any) => {
    if (sorter.order === undefined) {
      setSorterQuery('');
    } else {
      const orderBy = sorter === 'accend' ? 'asc' : 'desc';
      setSorterQuery(`&sorter=${sorter.field}&order=${orderBy}`);
    }
  };

  const searchLayout = () => {};

  const actionHandler = (action: BasicListApi.Action) => {
    switch (action.action) {
      case 'modal':
        setModalUri(action.uri as string);
        setModalVisible(true);
        break;
      default:
        break;
    }
  };

  const beforeTableLayout = () => {
    return (
      <Row>
        <Col xs={24} sm={12}>
          ...
        </Col>
        <Col xs={24} sm={12} className={styles.tableToolbar}>
          <Space>{ActionBuilder(init?.data?.layout?.tableToolBar, actionHandler, false)}</Space>
        </Col>
      </Row>
    );
  };
  const afterTableLayout = () => {
    return (
      <Row>
        <Col xs={24} sm={12}>
          ...
        </Col>
        <Col xs={24} sm={12} className={styles.tableToolbar}>
          <Pagination
            total={init?.data?.meta.total || 0}
            current={init?.data?.meta?.page || 1}
            pageSize={init.data?.meta?.per_page || 10}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `Total ${total} items`}
            onChange={paginationChangeHandler}
            onShowSizeChange={paginationChangeHandler}
          />
        </Col>
      </Row>
    );
  };
  const toolbarLayout = () => {};

  return (
    <PageContainer>
      {searchLayout()}
      <Card>
        {beforeTableLayout()}
        <Table
          rowKey="id"
          columns={ColumnBuilder(init?.data?.layout?.tableColumn, actionHandler)}
          dataSource={init?.data?.dataSource}
          pagination={false}
          onChange={tableChangeHandler}
        />
        {afterTableLayout()}
        {toolbarLayout()}
      </Card>
      <Modal
        modalVisible={modalVisible}
        hideModal={() => {
          setModalVisible(false);
        }}
        modalUri={modalUri}
      />
    </PageContainer>
  );
};

export default Index;
