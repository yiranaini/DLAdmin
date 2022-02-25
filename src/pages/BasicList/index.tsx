import React, { useState, useEffect } from 'react';
import {
  Table,
  Space,
  Row,
  Col,
  Card,
  Pagination,
  Modal as AntdModal,
  message,
  Tooltip,
  Button,
  Form,
  InputNumber,
} from 'antd';
import { useRequest, useIntl, history, useLocation } from 'umi';
import { useSessionStorageState, useToggle, useUpdateEffect } from 'ahooks';
import { stringify } from 'query-string';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import QueueAnim from 'rc-queue-anim';
import { ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';

import ActionBuilder from './builder/ActionBuilder';
import ColumnBuilder from './builder/ColumnBuilder';
import SearchBuilder from './builder/SearchBuilder';
import Modal from './component/Modal';
import { submitFieldsAdaptor } from './helper';
import styles from './index.less';

const Index = () => {
  const [pageQuery, setPageQuery] = useState('');
  const [sortQuery, setSorterQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUri, setModalUri] = useState('');
  const [selectedRowKeys, setSelectRowKeys] = useState([]);
  const [selectedRows, setSelectRows] = useState([]);
  const [tableColumns, setTableColumns] =
    useSessionStorageState<BasicListApi.Field[]>('basicListTableColumns');
  const [searchVisible, searchAction] = useToggle(false);

  const { confirm } = AntdModal;
  const lang = useIntl();
  const [searchForm] = Form.useForm();
  const location = useLocation();

  const init = useRequest<{ data: BasicListApi.ListData }>(
    (values: any) => {
      return {
        url: `${location.pathname.replace('/basic-list', '')}?${pageQuery}${sortQuery}`,
        params: values,
        paramSerializer: (params: any) => {
          return stringify(params, { arrayFormat: 'comma', skipEmptyString: true, skipNull: true });
        },
      };
    },
    {
      onSuccess: () => {
        setSelectRowKeys([]);
        setSelectRows([]);
      },
    },
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
        url: `${uri}`,
        method,
        data: {
          ...formValues,
        },
      };
    },
    {
      manual: true,
      onSuccess: (data) => {
        message.success({
          content: data?.message,
          key: 'process',
        });
      },
      formatResult: (res: any) => {
        return res;
      },
      throttleInterval: 1000,
    },
  );

  useUpdateEffect(() => {
    init.run();
  }, [pageQuery, sortQuery, location.pathname]);

  useEffect(() => {
    if (init?.data?.layout?.tableColumn) {
      setTableColumns(ColumnBuilder(init?.data?.layout?.tableColumn, actionHandler));
    }
  }, [init?.data?.layout?.tableColumn]);

  useEffect(() => {
    if (modalUri) {
      setModalVisible(true);
    }
  }, [modalUri]);

  function actionHandler(action: BasicListApi.Action, record: any) {
    switch (action.action) {
      case 'modal':
        setModalUri(
          (action.uri || '').replace(/:\w+/g, (field) => {
            return record[field.replace(':', '')];
          }) as string,
        );
        setModalVisible(true);
        break;
      case 'page': {
        const uri = (action.uri || '').replace(/:\w+/g, (field) => {
          return record[field.replace(':', '')];
        });
        history.push(`/basic-list${uri}`);
        break;
      }
      case 'reload':
        init.run();
        break;
      case 'delete':
      case 'deletePermanently':
      case 'restore': {
        const operationName = lang.formatMessage({
          id: `basic-list.list.actionHandler.operation.${action.action}`,
        });
        confirm({
          title: lang.formatMessage(
            {
              id: 'basic-list.list.actionHandler.confirmTitle',
            },
            {
              operationName,
            },
          ),
          icon: <ExclamationCircleOutlined />,
          content: batchOverView(Object.keys(record).length ? [record] : selectedRows),
          okText: `Sure to ${action.action}!!!`,
          okType: 'danger',
          cancelText: 'Cancel',
          onOk() {
            return request.run({
              uri: action.uri,
              method: action.method,
              type: action.action,
              ids: Object.keys(record).length ? [record.id] : selectedRowKeys,
            });
          },
          onCancel() {
            console.log('Cancel');
          },
        });
        break;
      }

      default:
        break;
    }
  }

  function batchOverView(dataSource: BasicListApi.Field[]) {
    return (
      <Table
        size="small"
        rowKey="id"
        columns={tableColumns ? [tableColumns[0] || {}, tableColumns[1] || {}] : []}
        dataSource={dataSource}
        pagination={false}
      />
    );
  }

  const paginationChangeHandler = (_page: number, _per_page: number) => {
    setPageQuery(`&page=${_page}&per_page=${_per_page}`);
  };

  const tableChangeHandler = (_: any, __: any, sorter: any) => {
    if (sorter.order === undefined) {
      setSorterQuery('');
    } else {
      const orderBy = sorter === 'accend' ? 'asc' : 'desc';
      setSorterQuery(`&sorter=${sorter.field}&order=${orderBy}`);
    }
  };

  const hideModal = (reload = false) => {
    setModalVisible(false);
    setModalUri('');
    if (reload) {
      init.run();
    }
  };

  const onFinish = (value: any) => {
    init.run(submitFieldsAdaptor(value));
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (_selectedRowKeys: any, _selectRows: any) => {
      setSelectRowKeys(_selectedRowKeys);
      setSelectRows(_selectRows);
    },
  };

  const searchLayout = () => {
    return (
      <QueueAnim type="top">
        {searchVisible ? (
          <Card className={styles.searchForm} key="searchForm">
            <Form onFinish={onFinish} form={searchForm}>
              <Row gutter={24}>
                <Col sm={6}>
                  <Form.Item label="ID" name="id" key="id">
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                {SearchBuilder(init.data?.layout.tableColumn)}
              </Row>
              <Row>
                <Col sm={24} className={styles.textAlignRight}>
                  <Space>
                    <Button type="primary" htmlType="submit">
                      Submit
                    </Button>
                    <Button
                      onClick={() => {
                        init.run();
                        searchForm.resetFields();
                        setSelectRowKeys([]);
                        setSelectRows([]);
                      }}
                    >
                      Clear
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Card>
        ) : null}
      </QueueAnim>
    );
  };

  const beforeTableLayout = () => {
    return (
      <Row>
        <Col xs={24} sm={12}>
          ...
        </Col>
        <Col xs={24} sm={12} className={styles.tableToolbar}>
          <Space>
            <Tooltip title="search">
              <Button
                shape="circle"
                icon={<SearchOutlined />}
                onClick={() => {
                  searchAction.toggle();
                }}
                type={searchVisible ? 'primary' : 'default'}
              />
            </Tooltip>
            {ActionBuilder(init?.data?.layout?.tableToolBar, actionHandler)}
          </Space>
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
          loading={init?.loading}
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
