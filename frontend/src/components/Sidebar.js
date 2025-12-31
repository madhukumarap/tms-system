import React, { useState } from 'react';
import { Layout, Menu, Button, theme } from 'antd';
import { 
  DashboardOutlined, 
  TruckOutlined, 
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Sider } = Layout;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { token } = theme.useToken();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/shipments',
      icon: <TruckOutlined />,
      label: 'Shipments',
      children: [
        {
          key: '/shipments',
          label: 'All Shipments',
        },
        {
          key: '/shipments/active',
          label: 'Active Shipments',
        },
        {
          key: '/shipments/completed',
          label: 'Completed Shipments',
        },
      ],
    },
    {
      key: '/employees',
      icon: <TeamOutlined />,
      label: 'Employees',
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      style={{
        background: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorder}`,
      }}
      width={250}
      trigger={null}
    >
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <h2 style={{ margin: 0, color: token.colorPrimary }}>
          {collapsed ? 'TMS' : 'TMS System'}
        </h2>
        <div style={{ fontSize: '12px', color: token.colorTextSecondary }}>
          {user?.role}
        </div>
      </div>
      
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{
          width: '100%',
          height: 48,
          marginBottom: 16,
        }}
      />
      
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={['/shipments']}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  );
};

export default Sidebar;