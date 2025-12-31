import React from 'react';
import { Layout, Avatar, Dropdown, Button, Space, theme } from 'antd';
import {
  BellOutlined,
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header: AntHeader } = Layout;

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { token } = theme.useToken();

  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
    },
  ];

  return (
    <AntHeader
      style={{
        background: token.colorBgContainer,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${token.colorBorder}`,
      }}
    >
      <div>
        <h2 style={{ margin: 0 }}>Transport Management System</h2>
      </div>
      
      <Space size="large">
        <Button type="text" icon={<BellOutlined />} shape="circle" />
        
        <Dropdown
          menu={{
            items: menuItems,
          }}
          placement="bottomRight"
        >
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} />
            <span>{user?.name}</span>
            <DownOutlined />
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;