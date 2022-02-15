import React, { useState, useEffect } from 'react';
import { Table, Space, Row, Col, Card, Pagination, Modal as AntdModal, message } from 'antd';
import { useRequest } from 'umi';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import { ExclamationCircleOutlined } from '@ant-design/icons';

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
  const [selectedRowKeys, setSelectRowKeys] = useState([]);
  const [selectedRows, setSelectRows] = useState([]);
  const [tableColumns, setTableColumns] = useState<BasicListApi.Field[]>([]);

  const { confirm } = AntdModal;

  const init = useRequest<{ data: BasicListApi.ListData }>(
    `https://public-api-v2.aspirantzhang.com/api/admins?X-API-KEY=antd&page=${page}&per_page=${per_page}${sortQuery}`,
  );

  const request = useRequest(
    (values: any) => {
      message.loading({
        content: 'Processing...',
        key: 'process',
        duration: 0,
      });
      const { uri, method, ...formValues } = values;
      return {
        url: `https://public-api-v2.aspirantzhang.com${uri}`,
        method,
        data: {
          ...formValues,
          'X-API-KEY': 'antd',
        },
      };
    },
    {
      manual: true,
      onSuccess: (data) => {
        message.success({
          content: data.message,
          key: 'process',
        });
      },
      formatResult: (res: any) => {
        return res;
      },
    },
  );

  useEffect(() => {
    init.run();
  }, [page, per_page, sortQuery]);

  useEffect(() => {
    if (init?.data?.layout?.tableColumn) {
      setTableColumns(ColumnBuilder(init?.data?.layout?.tableColumn, actionHandler));
    }
  }, [init?.data?.layout?.tableColumn]);

  const batchOverView = () => {
    return (
      <Table
        size="small"
        rowKey="id"
        columns={[tableColumns[0] || {}, tableColumns[1] || {}]}
        dataSource={selectedRows}
        pagination={false}
      />
    );
  };

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

  function actionHandler(action: BasicListApi.Action, record: any) {
    switch (action.action) {
      case 'modal':
        setModalUri(
          action.uri?.replace(/:\w+/g, (field) => {
            return record[field.replace(':', '')];
          }) as string,
        );
        setModalVisible(true);
        break;
      case 'reload':
        init.run();
        break;
      case 'delete':
        confirm({
          title: 'Are you sure delete this task?',
          icon: <ExclamationCircleOutlined />,
          content: batchOverView(),
          okText: 'Sure to Delete!!!',
          okType: 'danger',
          cancelText: 'Cancel',
          onOk() {
            return request.run({
              uri: action.uri,
              method: action.method,
              type: 'delete',
              id: selectedRowKeys,
            });
          },
          onCancel() {
            console.log('Cancel');
          },
        });
      default:
        break;
    }
  }

  const beforeTableLayout = () => {
    return (
      <Row>
        <Col xs={24} sm={12}>
          ...
        </Col>
        <Col xs={24} sm={12} className={styles.tableToolbar}>
          <Space>{ActionBuilder(init?.data?.layout?.tableToolBar, actionHandler)}</Space>
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

  const hideModal = (reload = false) => {
    setModalVisible(false);
    if (reload) {
      init.run();
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (_selectedRowKeys: any, _selectRows: any) => {
      setSelectRowKeys(_selectedRowKeys);
      setSelectRows(_selectRows);
    },
  };

  const batchToolbar = () => {
    return (
      selectedRowKeys.length > 0 && (
        <Space>{ActionBuilder(init?.data?.layout?.batchToolBar, actionHandler)}</Space>
      )
    );
  };

  return (
    <PageContainer>
      {searchLayout()}
      <Card>
        {beforeTableLayout()}
        <Table
          rowKey="id"
          columns={tableColumns}
          dataSource={init?.data?.dataSource}
          pagination={false}
          onChange={tableChangeHandler}
          rowSelection={rowSelection}
        />
        {afterTableLayout()}
        {toolbarLayout()}
      </Card>
      <Modal modalVisible={modalVisible} hideModal={hideModal} modalUri={modalUri} />
      <FooterToolbar extra={batchToolbar()} />
    </PageContainer>
  );
};

export default Index;
