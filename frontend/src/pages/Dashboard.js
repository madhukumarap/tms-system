import React from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Progress,
  Tag,
  Typography,
  Timeline,
  Space,
} from 'antd';
import {
  TruckOutlined,
  TeamOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useQuery, gql } from '@apollo/client';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const SHIPMENTS_STATS_QUERY = gql`
  query GetShipmentsStats {
    shipments(limit: 5, sortBy: "createdAt", sortOrder: "DESC") {
      shipments {
        id
        shipmentId
        origin
        destination
        status
        priority
        eta
      }
      total
    }
  }
`;

const Dashboard = () => {
  const { user } = useAuth();
  const { loading, data } = useQuery(SHIPMENTS_STATS_QUERY);

  const shipments = data?.shipments?.shipments || [];
  const totalShipments = data?.shipments?.total || 0;

  // Mock data for dashboard
  const statsData = [
    {
      title: 'Total Shipments',
      value: totalShipments,
      icon: <TruckOutlined />,
      color: '#1890ff',
      change: '+12%',
    },
    {
      title: 'Active Shipments',
      value: shipments.filter(s => s.status === 'IN_TRANSIT').length,
      icon: <ClockCircleOutlined />,
      color: '#52c41a',
      change: '+8%',
    },
    {
      title: 'Completed',
      value: shipments.filter(s => s.status === 'DELIVERED').length,
      icon: <CheckCircleOutlined />,
      color: '#722ed1',
      change: '+15%',
    },
    {
      title: 'Delayed',
      value: shipments.filter(s => s.status === 'DELAYED').length,
      icon: <ExclamationCircleOutlined />,
      color: '#fa8c16',
      change: '-3%',
    },
  ];

  const recentActivities = [
    {
      time: '2024-01-15 10:30',
      action: 'Shipment SH100001 marked as DELIVERED',
      color: 'green',
    },
    {
      time: '2024-01-15 09:15',
      action: 'New shipment created from New York to Los Angeles',
      color: 'blue',
    },
    {
      time: '2024-01-14 16:45',
      action: 'Shipment SH100005 delayed due to weather',
      color: 'orange',
    },
    {
      time: '2024-01-14 14:20',
      action: 'Driver assigned to shipment SH100007',
      color: 'purple',
    },
  ];

  const priorityDistribution = [
    { priority: 'URGENT', count: 5, color: '#cf1322' },
    { priority: 'HIGH', count: 12, color: '#fa541c' },
    { priority: 'MEDIUM', count: 25, color: '#fa8c16' },
    { priority: 'LOW', count: 18, color: '#1890ff' },
  ];

  const columns = [
    {
      title: 'Shipment ID',
      dataIndex: 'shipmentId',
      key: 'shipmentId',
    },
    {
      title: 'Route',
      dataIndex: 'route',
      key: 'route',
      render: (_, record) => `${record.origin} → ${record.destination}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          PENDING: 'blue',
          IN_TRANSIT: 'orange',
          DELIVERED: 'green',
          CANCELLED: 'red',
          DELAYED: 'purple',
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const colors = {
          LOW: 'blue',
          MEDIUM: 'orange',
          HIGH: 'red',
          URGENT: 'purple',
        };
        return <Tag color={colors[priority]}>{priority}</Tag>;
      },
    },
    {
      title: 'ETA',
      dataIndex: 'eta',
      key: 'eta',
      render: (eta) => new Date(eta).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      <Text type="secondary">Welcome back, {user?.name}!</Text>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {statsData.map((stat, index) => (
          <Col key={index} xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: stat.color }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                <Text type="success">{stat.change}</Text> from last month
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Recent Shipments" style={{ height: '100%' }}>
            <Table
              columns={columns}
              dataSource={shipments}
              rowKey="id"
              loading={loading}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="Recent Activity" style={{ height: '100%' }}>
            <Timeline>
              {recentActivities.map((activity, index) => (
                <Timeline.Item
                  key={index}
                  color={activity.color}
                  style={{ paddingBottom: 16 }}
                >
                  <div>
                    <Text strong style={{ fontSize: 12 }}>
                      {activity.time}
                    </Text>
                    <div style={{ marginTop: 4 }}>{activity.action}</div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card title="Priority Distribution">
            {priorityDistribution.map((item) => (
              <div key={item.priority} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text strong>{item.priority}</Text>
                  <Text>{item.count} shipments</Text>
                </div>
                <Progress
                  percent={(item.count / 60) * 100}
                  strokeColor={item.color}
                  size="small"
                  showInfo={false}
                />
              </div>
            ))}
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title="Quick Stats">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Average Cost"
                    value={1520.50}
                    prefix={<DollarOutlined />}
                    precision={2}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="On-time Delivery"
                    value={92.5}
                    suffix="%"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Active Drivers"
                    value={8}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Vehicles Available"
                    value={12}
                    prefix={<TruckOutlined />}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;