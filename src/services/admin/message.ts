// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** 当前可用的全部短信通知模板 短信的描述 GET /api/message */
export async function getMessage(options?: { [key: string]: any }) {
  return request<API.Message[]>('/api/message', {
    method: 'GET',
    ...(options || {}),
  });
}
