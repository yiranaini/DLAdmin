import { Form, Input } from 'antd';
import React from 'react';

const FormBuilder = (data: PageApi.Datum[] | undefined) => {
  return (data || []).map((field) => {
    return (
      <Form.Item key={field.key} label={field.title} name={field.key}>
        <Input />
      </Form.Item>
    );
  });
};

export default FormBuilder;
