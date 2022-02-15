import { DatePicker, Form, Input, Switch, TreeSelect } from 'antd';
import React from 'react';

const FormBuilder = (data: BasicListApi.Field[] | undefined) => {
  return (data || []).map((field) => {
    switch (field.type) {
      case 'text':
        return (
          <Form.Item label={field.title} name={field.key} key={field.key}>
            <Input disabled={field.disabled} />
          </Form.Item>
        );
      case 'datetime':
        return (
          <Form.Item label={field.title} name={field.key} key={field.key}>
            <DatePicker showTime disabled={field.disabled} />
          </Form.Item>
        );
      case 'tree':
        return (
          <Form.Item label={field.title} name={field.key} key={field.key}>
            <TreeSelect treeData={field.data} disabled={field.disabled} treeCheckable />
          </Form.Item>
        );
      case 'switch':
        return (
          <Form.Item label={field.title} name={field.key} key={field.key} valuePropName="checked">
            <Switch disabled={field.disabled} />
          </Form.Item>
        );

      default:
        return null;
    }
  });
};

export default FormBuilder;
