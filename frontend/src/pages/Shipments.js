import React, { useState } from 'react';
import {
  Table,
  Card,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Row,
  Col,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  message,
  Typography,
  Statistic,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  TruckOutlined,
  DollarOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ShipmentTile from '../components/ShipmentTile';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const SHIPMENTS_QUERY = gql`
  query GetShipments(
    $page: Int
    $limit: Int
    $sortBy: String
    $sortOrder: String
    $status: String
    $priority: String
    $origin: String
    $destination: String
  ) {
    shipments(
      page: $page
      limit: $limit
      sortBy: $sortBy
      sortOrder: $sortOrder
      status: $status
      priority: $priority
      origin: $origin
      destination: $destination
    ) {
      shipments {
        id
        shipmentId
        origin
        destination
        status
        vehicleType
        driverName
        driverPhone
        eta
        cost
        priority
        weight
        dimensions
        notes
        createdAt
      }
      total
      page
      totalPages
      hasNextPage
      hasPrevPage
    }
  }
`;

const CREATE_SHIPMENT_MUTATION = gql`
  mutation CreateShipment($input: ShipmentInput!) {
    createShipment(input: $input) {
      id
      shipmentId
      origin
      destination
      status
      vehicleType
      driverName
      eta
      cost
      priority
    }
  }
`;

const UPDATE_SHIPMENT_MUTATION = gql`
  mutation UpdateShipment($id: ID!, $input: ShipmentInput!) {
    updateShipment(id: $id, input: $input) {
      id
      shipmentId
      origin
      destination
      status
      vehicleType
      driverName
      eta
      cost
      priority
    }
  }
`;

const DELETE_SHIPMENT_MUTATION = gql`
  mutation DeleteShipment($id: ID!) {
    deleteShipment(id: $id)
  }
`;

const Shipments = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [form] = Form.useForm();
  
  const navigate = useNavigate();
  const { isAdmin, isManager, isDispatcher } = useAuth();

  const { loading, data, refetch } = useQuery(SHIPMENTS_QUERY, {
    variables: {
      page: pagination.current,
      limit: pagination.pageSize,
      ...filters,
    },
  });

  const [createShipment] = useMutation(CREATE_SHIPMENT_MUTATION, {
    onCompleted: () => {
      message.success('Shipment created successfully');
      setIsModalVisible(false);
      form.resetFields();
      refetch();
    },
    onError: (error) => {
      message.error(error.message || 'Failed to create shipment');
      console.error('Create shipment error:', error);
    },
  });

  const [updateShipment] = useMutation(UPDATE_SHIPMENT_MUTATION, {
    onCompleted: () => {
      message.success('Shipment updated successfully');
      setIsModalVisible(false);
      setSelectedShipment(null);
      form.resetFields();
      refetch();
    },
    onError: (error) => {
      message.error(error.message || 'Failed to update shipment');
      console.error('Update shipment error:', error);
    },
  });

  const [deleteShipment] = useMutation(DELETE_SHIPMENT_MUTATION, {
    onCompleted: () => {
      message.success('Shipment deleted successfully');
      refetch();
    },
    onError: (error) => {
      message.error(error.message || 'Failed to delete shipment');
      console.error('Delete shipment error:', error);
    },
  });

  const handleTableChange = (newPagination) => {
    setPagination({
      ...newPagination,
      current: newPagination.current,
    });
  };

  const handleSearch = (value) => {
    if (value) {
      setFilters((prev) => ({
        ...prev,
        origin: value,
      }));
    } else {
      const { origin, ...rest } = filters;
      setFilters(rest);
    }
  };

  const handleStatusFilter = (value) => {
    if (value) {
      setFilters((prev) => ({
        ...prev,
        status: value,
      }));
    } else {
      const { status, ...rest } = filters;
      setFilters(rest);
    }
  };

  const handlePriorityFilter = (value) => {
    if (value) {
      setFilters((prev) => ({
        ...prev,
        priority: value,
      }));
    } else {
      const { priority, ...rest } = filters;
      setFilters(rest);
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    setPagination({ current: 1, pageSize: 10 });
    message.info('Filters cleared');
  };

  const handleViewShipment = (shipment) => {
    navigate(`/shipments/${shipment.id}`);
  };

  const handleEditShipment = (shipment) => {
    setSelectedShipment(shipment);
    form.setFieldsValue({
      ...shipment,
      eta: shipment.eta ? dayjs(shipment.eta) : null,
    });
    setIsModalVisible(true);
  };

  const handleDeleteShipment = (id) => {
    Modal.confirm({
      title: 'Delete Shipment',
      content: 'Are you sure you want to delete this shipment?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => deleteShipment({ variables: { id } }),
    });
  };

  const handleCreateShipment = () => {
    setSelectedShipment(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'PENDING',
      priority: 'MEDIUM',
      vehicleType: 'TRUCK',
    });
    setIsModalVisible(true);
  };

  const handleSubmit = (values) => {
    const input = {
      ...values,
      eta: values.eta ? values.eta.toISOString() : new Date().toISOString(),
    };

    if (selectedShipment) {
      updateShipment({
        variables: {
          id: selectedShipment.id,
          input: input,
        },
      });
    } else {
      createShipment({
        variables: {
          input: input,
        },
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'blue',
      IN_TRANSIT: 'orange',
      DELIVERED: 'green',
      CANCELLED: 'red',
      DELAYED: 'purple',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'blue',
      MEDIUM: 'orange',
      HIGH: 'red',
      URGENT: 'purple',
    };
    return colors[priority] || 'default';
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'shipmentId',
      key: 'shipmentId',
      width: 120,
      render: (text) => (
        <Text strong style={{ color: '#1890ff' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Route',
      key: 'route',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: '500' }}>{record.origin}</div>
          <div style={{ color: '#999', fontSize: '12px', margin: '2px 0' }}>→</div>
          <div style={{ fontWeight: '500' }}>{record.destination}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag
          color={getStatusColor(status)}
          style={{
            borderRadius: '12px',
            padding: '2px 10px',
            fontWeight: '500',
            minWidth: '100px',
            textAlign: 'center',
          }}
        >
          {status}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'PENDING' },
        { text: 'In Transit', value: 'IN_TRANSIT' },
        { text: 'Delivered', value: 'DELIVERED' },
        { text: 'Cancelled', value: 'CANCELLED' },
        { text: 'Delayed', value: 'DELAYED' },
      ],
    },
    {
      title: 'Vehicle',
      dataIndex: 'vehicleType',
      key: 'vehicleType',
      width: 100,
      render: (vehicleType) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TruckOutlined style={{ marginRight: '6px', color: '#fa8c16' }} />
          {vehicleType}
        </div>
      ),
    },
    {
      title: 'Driver',
      dataIndex: 'driverName',
      key: 'driverName',
      width: 120,
    },
    {
      title: 'ETA',
      dataIndex: 'eta',
      key: 'eta',
      width: 120,
      render: (eta) => (
        <div>
          <div style={{ fontSize: '14px', fontWeight: '500' }}>
            {new Date(eta).toLocaleDateString()}
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {new Date(eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ),
    },
    {
      title: 'Cost',
      dataIndex: 'cost',
      key: 'cost',
      width: 100,
      render: (cost) => (
        <div style={{ fontWeight: '600', color: '#3f8600' }}>
          <DollarOutlined style={{ marginRight: '4px' }} />
          {cost?.toFixed(2) || '0.00'}
        </div>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority) => (
        <Tag
          color={getPriorityColor(priority)}
          style={{
            borderRadius: '4px',
            fontWeight: '500',
            minWidth: '70px',
            textAlign: 'center',
          }}
        >
          {priority}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            style={{
              background: '#f0f5ff',
              borderColor: '#adc6ff',
              color: '#2f54eb',
            }}
            onClick={() => handleViewShipment(record)}
          />
          {(isManager() || isDispatcher()) && (
            <Button
              icon={<EditOutlined />}
              size="small"
              style={{
                background: '#f6ffed',
                borderColor: '#b7eb8f',
                color: '#389e0d',
              }}
              onClick={() => handleEditShipment(record)}
            />
          )}
          {isAdmin() && (
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => handleDeleteShipment(record.id)}
            />
          )}
        </Space>
      ),
    },
  ];

  const shipmentsData = data?.shipments?.shipments || [];
  const total = data?.shipments?.total || 0;

  // Calculate stats
  const stats = {
    total: total,
    active: shipmentsData.filter(s => s.status === 'IN_TRANSIT').length,
    delivered: shipmentsData.filter(s => s.status === 'DELIVERED').length,
    pending: shipmentsData.filter(s => s.status === 'PENDING').length,
    totalCost: shipmentsData.reduce((sum, s) => sum + (s.cost || 0), 0),
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        style={{
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          border: '1px solid #f0f0f0',
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <Title level={2} style={{ margin: 0, color: '#1f1f1f', fontWeight: '600' }}>
                <TruckOutlined style={{ marginRight: '10px', color: '#1890ff' }} />
                Shipments Management
              </Title>
              <Text style={{ color: '#8c8c8c' }}>
                Manage and track all your shipments in one place
              </Text>
            </div>
            <Space>
              <Button
                icon={viewMode === 'grid' ? <AppstoreOutlined /> : <UnorderedListOutlined />}
                onClick={() => setViewMode(viewMode === 'grid' ? 'tile' : 'grid')}
                size="large"
                style={{ borderRadius: '8px' }}
              >
                {viewMode === 'grid' ? 'Tile View' : 'Grid View'}
              </Button>
              {(isManager() || isDispatcher()) && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateShipment}
                  size="large"
                  style={{
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '500',
                  }}
                >
                  New Shipment
                </Button>
              )}
            </Space>
          </div>

          {/* Stats Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            {[
              { title: 'Total Shipments', value: stats.total, color: '#1890ff', icon: <TruckOutlined /> },
              { title: 'Active', value: stats.active, color: '#52c41a', icon: <ClockCircleOutlined /> },
              { title: 'Delivered', value: stats.delivered, color: '#722ed1', icon: <ClockCircleOutlined /> },
              { title: 'Pending', value: stats.pending, color: '#fa8c16', icon: <ClockCircleOutlined /> },
              { title: 'Total Cost', value: `$${stats.totalCost.toFixed(2)}`, color: '#3f8600', icon: <DollarOutlined /> },
            ].map((stat, index) => (
              <Col key={index} xs={24} sm={12} md={6} lg={4.8}>
                <Card
                  hoverable
                  style={{
                    background: '#fff',
                    borderRadius: '10px',
                    border: `1px solid ${stat.color}20`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    height: '100%',
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div
                      style={{
                        background: `${stat.color}15`,
                        padding: '10px',
                        borderRadius: '8px',
                        marginRight: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div style={{ color: stat.color, fontSize: '18px' }}>
                        {stat.icon}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#666', fontSize: '13px', marginBottom: '2px' }}>
                        {stat.title}
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: '700', color: stat.color }}>
                        {stat.value}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Filters */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Search by origin"
                onSearch={handleSearch}
                enterButton={<SearchOutlined />}
                style={{ width: '100%' }}
                size="large"
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Filter by status"
                style={{ width: '100%' }}
                size="large"
                allowClear
                onChange={handleStatusFilter}
                value={filters.status || undefined}
              >
                <Option value="PENDING">Pending</Option>
                <Option value="IN_TRANSIT">In Transit</Option>
                <Option value="DELIVERED">Delivered</Option>
                <Option value="CANCELLED">Cancelled</Option>
                <Option value="DELAYED">Delayed</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Filter by priority"
                style={{ width: '100%' }}
                size="large"
                allowClear
                onChange={handlePriorityFilter}
                value={filters.priority || undefined}
              >
                <Option value="LOW">Low</Option>
                <Option value="MEDIUM">Medium</Option>
                <Option value="HIGH">High</Option>
                <Option value="URGENT">Urgent</Option>
              </Select>
            </Col>
          </Row>

          {/* Shipments Table/Tiles */}
          {viewMode === 'grid' ? (
            <Table
              columns={columns}
              dataSource={shipmentsData}
              rowKey="id"
              loading={loading}
              pagination={{
                ...pagination,
                total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => (
                  <span style={{ color: '#666', fontSize: '14px' }}>
                    Showing {range[0]}-{range[1]} of {total} shipments
                  </span>
                ),
                pageSizeOptions: ['10', '20', '50', '100'],
                style: { marginTop: '20px' },
              }}
              onChange={handleTableChange}
              style={{
                background: '#fff',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
              scroll={{ x: 1200 }}
            />
          ) : (
            <Row gutter={[16, 16]}>
              {shipmentsData.map((shipment) => (
                <Col key={shipment.id} xs={24} sm={12} md={8} lg={6}>
                  <ShipmentTile
                    shipment={shipment}
                    onView={() => handleViewShipment(shipment)}
                    onEdit={() => handleEditShipment(shipment)}
                    onDelete={() => handleDeleteShipment(shipment.id)}
                    canEdit={isManager() || isDispatcher()}
                    canDelete={isAdmin()}
                  />
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Card>

      {/* Add/Edit Shipment Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TruckOutlined style={{ marginRight: '10px', color: '#1890ff' }} />
            {selectedShipment ? 'Edit Shipment' : 'Create New Shipment'}
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedShipment(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={selectedShipment ? 'Update' : 'Create'}
        okButtonProps={{
          style: {
            background: selectedShipment ? '#389e0d' : '#1890ff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '500',
          },
        }}
        cancelButtonProps={{
          style: { borderRadius: '6px', fontWeight: '500' },
        }}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: '20px' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="origin"
                label="Origin"
                rules={[{ required: true, message: 'Please enter origin' }]}
              >
                <Input
                  placeholder="Enter origin city"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="destination"
                label="Destination"
                rules={[{ required: true, message: 'Please enter destination' }]}
              >
                <Input
                  placeholder="Enter destination city"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select
                  placeholder="Select status"
                  size="large"
                  style={{ width: '100%' }}
                >
                  <Option value="PENDING">Pending</Option>
                  <Option value="IN_TRANSIT">In Transit</Option>
                  <Option value="DELIVERED">Delivered</Option>
                  <Option value="CANCELLED">Cancelled</Option>
                  <Option value="DELAYED">Delayed</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true, message: 'Please select priority' }]}
              >
                <Select
                  placeholder="Select priority"
                  size="large"
                  style={{ width: '100%' }}
                >
                  <Option value="LOW">Low</Option>
                  <Option value="MEDIUM">Medium</Option>
                  <Option value="HIGH">High</Option>
                  <Option value="URGENT">Urgent</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="vehicleType"
                label="Vehicle Type"
                rules={[{ required: true, message: 'Please select vehicle type' }]}
              >
                <Select
                  placeholder="Select vehicle type"
                  size="large"
                  style={{ width: '100%' }}
                >
                  <Option value="TRUCK">Truck</Option>
                  <Option value="VAN">Van</Option>
                  <Option value="TRAILER">Trailer</Option>
                  <Option value="CONTAINER">Container</Option>
                  <Option value="REFRIGERATED">Refrigerated</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="driverName"
                label="Driver Name"
                rules={[{ required: true, message: 'Please enter driver name' }]}
              >
                <Input
                  placeholder="Enter driver name"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="driverPhone"
                label="Driver Phone"
                rules={[
                  { required: true, message: 'Please enter driver phone' },
                ]}
              >
                <Input
                  placeholder="Enter driver phone number"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="eta"
                label="Estimated Arrival"
                rules={[{ required: true, message: 'Please select ETA' }]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: '100%' }}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="cost"
                label="Cost ($)"
                rules={[
                  { required: true, message: 'Please enter cost' },
                  { type: 'number', min: 0, message: 'Cost must be positive' },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  step={0.01}
                  formatter={value => `$ ${value}`}
                  parser={value => value.replace(/\$\s?/, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="weight"
                label="Weight (kg)"
                rules={[
                  { required: true, message: 'Please enter weight' },
                  { type: 'number', min: 0, message: 'Weight must be positive' },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  step={0.01}
                  addonAfter="kg"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dimensions"
                label="Dimensions"
                rules={[{ required: true, message: 'Please enter dimensions' }]}
              >
                <Input
                  placeholder="e.g., 10x8x6 ft"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea
              placeholder="Enter any additional notes..."
              rows={3}
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Shipments;