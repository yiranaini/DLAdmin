// @ts-ignore
/* eslint-disable */
import { MenuDataItem } from '@ant-design/pro-layout';
import { request } from 'umi';

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request<API.CurrentUser>('/api/admins/info', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取当前的菜单列表 */
export async function currentMenu(options?: { [key: string]: any }) {
  // return request<MenuDataItem[]>('/api/menus', {
  //   method: 'GET',
  //   ...(options || {}),
  // });
  return request<MenuDataItem[]>('/api/menus/backend', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}
