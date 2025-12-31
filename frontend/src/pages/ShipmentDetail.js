import React, { useState } from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Timeline,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  message,
  Breadcrumb,
  Divider,
  Alert,
  Spin,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  PrinterOutlined,
  ShareAltOutlined,
  TruckOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const SHIPMENT_QUERY = gql`
  query GetShipment($id: ID!) {
    shipment(id: $id) {
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
      updatedAt
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
      driverPhone
      eta
      cost
      priority
      weight
      dimensions
      notes
      updatedAt
    }
  }
`;

const ShipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isManager, isDispatcher, user } = useAuth();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { loading, data, error, refetch } = useQuery(SHIPMENT_QUERY, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'network-only',
  });

  const [updateShipment, { loading: updating }] = useMutation(UPDATE_SHIPMENT_MUTATION, {
    onCompleted: () => {
      message.success('Shipment updated successfully');
      setIsModalVisible(false);
      refetch();
    },
    onError: (error) => {
      message.error(error.message || 'Failed to update shipment');
      console.error('Update error:', error);
    },
  });

  const shipment = data?.shipment;

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

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: <ClockCircleOutlined />,
      IN_TRANSIT: <TruckOutlined />,
      DELIVERED: <CheckCircleOutlined />,
      CANCELLED: <ExclamationCircleOutlined />,
      DELAYED: <ExclamationCircleOutlined />,
    };
    return icons[status] || <ClockCircleOutlined />;
  };

  const handleEdit = () => {
    if (shipment) {
      form.setFieldsValue({
        ...shipment,
        eta: shipment.eta ? dayjs(shipment.eta) : null,
        cost: shipment.cost || 0,
        weight: shipment.weight || 0,
      });
      setIsModalVisible(true);
    }
  };

  const handleUpdate = (values) => {
    const updateData = {
      ...values,
      eta: values.eta ? values.eta.toISOString() : shipment.eta,
      origin: shipment.origin, // Keep original values
      destination: shipment.destination,
      vehicleType: shipment.vehicleType,
    };

    updateShipment({
      variables: {
        id: shipment.id,
        input: updateData,
      },
    });
  };

  const calculateDaysInTransit = () => {
    if (!shipment) return 0;
    const created = new Date(shipment.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateCostPerKg = () => {
    if (!shipment || !shipment.weight || shipment.weight === 0) return 0;
    return (shipment.cost / shipment.weight).toFixed(2);
  };

  const timelineItems = [
    {
      color: 'green',
      children: 'Order Created',
      label: shipment?.createdAt ? new Date(shipment.createdAt).toLocaleString() : '',
      dot: <CheckCircleOutlined />,
    },
    {
      color: shipment?.status !== 'PENDING' ? 'blue' : 'gray',
      children: 'Pickup Scheduled',
      label: shipment?.createdAt ? new Date(shipment.createdAt).toLocaleString() : '',
    },
    {
      color: shipment?.status === 'IN_TRANSIT' || shipment?.status === 'DELIVERED' ? 'orange' : 'gray',
      children: 'In Transit',
      label: shipment?.eta ? `ETA: ${new Date(shipment.eta).toLocaleDateString()}` : '',
    },
    {
      color: shipment?.status === 'DELIVERED' ? 'green' : 'gray',
      children: 'Delivered',
      label: shipment?.status === 'DELIVERED' ? new Date(shipment.updatedAt).toLocaleString() : 'Pending',
    },
  ];

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        background: '#fff',
        borderRadius: '12px',
        padding: '40px'
      }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} spin />} />
        <div style={{ marginLeft: '20px' }}>
          <Title level={4} style={{ color: '#1f1f1f' }}>Loading Shipment Details</Title>
          <Text type="secondary">Please wait while we fetch the shipment information...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card style={{ margin: '24px', borderRadius: '12px' }}>
        <Alert
          message="Error Loading Shipment"
          description={error.message || 'Failed to load shipment details. Please try again.'}
          type="error"
          showIcon
          style={{ marginBottom: '20px' }}
        />
        <Button 
          type="primary" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/shipments')}
        >
          Back to Shipments
        </Button>
      </Card>
    );
  }

  if (!shipment) {
    return (
      <Card style={{ margin: '24px', borderRadius: '12px' }}>
        <Alert
          message="Shipment Not Found"
          description="The shipment you're looking for doesn't exist or has been removed."
          type="warning"
          showIcon
          style={{ marginBottom: '20px' }}
        />
        <Button 
          type="primary" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/shipments')}
        >
          Back to Shipments
        </Button>
      </Card>
    );
  }

  const daysInTransit = calculateDaysInTransit();
  const costPerKg = calculateCostPerKg();
  const isOverdue = shipment.status === 'DELAYED' || (shipment.status === 'IN_TRANSIT' && new Date(shipment.eta) < new Date());

  return (
    <div style={{ padding: '24px' }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        style={{ marginBottom: '24px' }}
        items={[
          {
            title: <Link to="/dashboard"><HomeOutlined /> Dashboard</Link>,
          },
          {
            title: <Link to="/shipments">Shipments</Link>,
          },
          {
            title: shipment.shipmentId,
          },
        ]}
      />

      {/* Header Section */}
      <Card
        style={{
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          border: '1px solid #f0f0f0',
          marginBottom: '24px',
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/shipments')}
                size="large"
                style={{ borderRadius: '8px' }}
              >
                Back
              </Button>
              <div>
                <Title level={2} style={{ margin: '8px 0', color: '#1f1f1f' }}>
                  {shipment.shipmentId}
                </Title>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Last updated: {new Date(shipment.updatedAt).toLocaleString()}
                </Text>
              </div>
            </Space>
          </div>
          
          <Space>
            {(isManager() || isDispatcher()) && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '500',
                }}
              >
                Edit Shipment
              </Button>
            )}
            <Button 
              icon={<PrinterOutlined />} 
              size="large"
              style={{ borderRadius: '8px' }}
            >
              Print
            </Button>
            <Button 
              icon={<ShareAltOutlined />} 
              size="large"
              style={{ borderRadius: '8px' }}
            >
              Share
            </Button>
          </Space>
        </div>

        {isOverdue && (
          <Alert
            message="Attention Required"
            description="This shipment is overdue or delayed. Please take necessary action."
            type="warning"
            showIcon
            style={{ marginBottom: '24px', borderRadius: '8px' }}
          />
        )}

        {/* Status and Priority Badges */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: `${getStatusColor(shipment.status)}15`, padding: '12px 20px', borderRadius: '8px' }}>
            <div style={{ marginRight: '12px', color: getStatusColor(shipment.status), fontSize: '20px' }}>
              {getStatusIcon(shipment.status)}
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Status</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: getStatusColor(shipment.status) }}>
                {shipment.status}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', background: `${getPriorityColor(shipment.priority)}15`, padding: '12px 20px', borderRadius: '8px' }}>
            <div style={{ marginRight: '12px', color: getPriorityColor(shipment.priority), fontSize: '20px' }}>
              <ExclamationCircleOutlined />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Priority</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: getPriorityColor(shipment.priority) }}>
                {shipment.priority}
              </div>
            </div>
          </div>
        </div>

        <Row gutter={[24, 24]}>
          {/* Left Column - Shipment Details */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TruckOutlined style={{ marginRight: '10px', color: '#1890ff' }} />
                  <span style={{ fontWeight: '600' }}>Shipment Information</span>
                </div>
              }
              style={{
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #f0f0f0',
                height: '100%',
              }}
              bodyStyle={{ padding: '24px' }}
            >
              <Descriptions
                column={{ xs: 1, sm: 1, md: 2 }}
                labelStyle={{
                  width: '160px',
                  whiteSpace: 'nowrap',
                }}
                contentStyle={{
                  minWidth: '240px',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                }}
              >

                <Descriptions.Item label="Shipment ID">
                  <Tag color="blue" style={{ fontSize: '14px', fontWeight: '600' }}>
                    {shipment.shipmentId}
                  </Tag>
                </Descriptions.Item>
                
                <Descriptions.Item label="Route">
                  <Space direction="vertical" size={2}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <EnvironmentOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                      <Text strong>{shipment.origin}</Text>
                    </div>
                    <div style={{ marginLeft: '24px' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>→</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <EnvironmentOutlined style={{ marginRight: '8px', color: '#ff4d4f' }} />
                      <Text strong>{shipment.destination}</Text>
                    </div>
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Vehicle Type">
                  <Space>
                    <TruckOutlined style={{ color: '#fa8c16' }} />
                    <Text>{shipment.vehicleType}</Text>
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Driver Details">
                  <Space direction="vertical" size={2}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <UserOutlined style={{ marginRight: '8px', color: '#722ed1' }} />
                      <Text>{shipment.driverName}</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: '24px' }}>
                      <PhoneOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                      <Text>{shipment.driverPhone || 'Not provided'}</Text>
                    </div>
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="ETA">
                  <Space>
                    <ClockCircleOutlined style={{ color: '#1890ff' }} />
                    <div>
                      <div style={{ fontWeight: '600' }}>
                        {new Date(shipment.eta).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {new Date(shipment.eta).toLocaleTimeString()}
                      </div>
                    </div>
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Cost">
                  <Space>
                    <DollarOutlined style={{ color: '#3f8600' }} />
                    <Text strong style={{ fontSize: '18px', color: '#3f8600' }}>
                      ${shipment.cost?.toFixed(2) || '0.00'}
                    </Text>
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Weight & Dimensions">
                  <Space direction="vertical" size={2}>
                    <div>
                      <Text strong>{shipment.weight || '0'}</Text> kg
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Dimensions: {shipment.dimensions || 'Not specified'}
                    </div>
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Created Date" span={2}>
                  <Space>
                    <ClockCircleOutlined style={{ color: '#999' }} />
                    <Text>{new Date(shipment.createdAt).toLocaleString()}</Text>
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Notes" span={2}>
                  <div style={{
                    background: '#fafafa',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #f0f0f0',
                    minHeight: '60px',
                  }}>
                    {shipment.notes || <Text type="secondary">No additional notes available</Text>}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Right Column - Timeline & Stats */}
          <Col xs={24} lg={8}>
            {/* Shipment Timeline */}
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ClockCircleOutlined style={{ marginRight: '10px', color: '#fa8c16' }} />
                  <span style={{ fontWeight: '600' }}>Shipment Timeline</span>
                </div>
              }
              style={{
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #f0f0f0',
                marginBottom: '24px',
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <Timeline style={{ marginTop: '12px' }}>
                {timelineItems.map((item, index) => (
                  <Timeline.Item
                    key={index}
                    color={item.color}
                    dot={item.dot}
                    style={{ paddingBottom: '20px' }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f1f1f', marginBottom: '4px' }}>
                        {item.children}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {item.label}
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>

            {/* Quick Stats */}
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <DollarOutlined style={{ marginRight: '10px', color: '#3f8600' }} />
                  <span style={{ fontWeight: '600' }}>Quick Stats</span>
                </div>
              }
              style={{
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #f0f0f0',
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card
                    size="small"
                    style={{
                      background: '#f6ffed',
                      border: '1px solid #b7eb8f',
                      borderRadius: '8px',
                      height: '100%',
                    }}
                    bodyStyle={{ padding: '12px' }}
                  >
                    <Statistic
                      title="Days in Transit"
                      value={daysInTransit}
                      suffix="days"
                      valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    size="small"
                    style={{
                      background: '#f0f5ff',
                      border: '1px solid #adc6ff',
                      borderRadius: '8px',
                      height: '100%',
                    }}
                    bodyStyle={{ padding: '12px' }}
                  >
                    <Statistic
                      title="Cost per kg"
                      value={costPerKg}
                      prefix="$"
                      valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    size="small"
                    style={{
                      background: '#fff7e6',
                      border: '1px solid #ffd591',
                      borderRadius: '8px',
                      height: '100%',
                    }}
                    bodyStyle={{ padding: '12px' }}
                  >
                    <Statistic
                      title="Distance"
                      value={Math.floor(Math.random() * 2000) + 500}
                      suffix="miles"
                      valueStyle={{ color: '#fa8c16', fontSize: '20px' }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    size="small"
                    style={{
                      background: '#fff1f0',
                      border: '1px solid #ffa39e',
                      borderRadius: '8px',
                      height: '100%',
                    }}
                    bodyStyle={{ padding: '12px' }}
                  >
                    <Statistic
                      title="Fuel Estimate"
                      value={(shipment.cost * 0.3).toFixed(2)}
                      prefix="$"
                      valueStyle={{ color: '#ff4d4f', fontSize: '20px' }}
                    />
                  </Card>
                </Col>
              </Row>
              
              <Divider style={{ margin: '16px 0' }} />
              
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Last updated by: {user?.name || 'System'}
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Edit Shipment Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <EditOutlined style={{ marginRight: '10px', color: '#1890ff' }} />
            <span style={{ fontWeight: '600' }}>Edit Shipment - {shipment.shipmentId}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={updating ? 'Updating...' : 'Update'}
        okButtonProps={{
          loading: updating,
          disabled: updating,
          style: {
            background: '#1890ff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '500',
          },
        }}
        cancelButtonProps={{
          disabled: updating,
          style: { borderRadius: '6px', fontWeight: '500' },
        }}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
          style={{ marginTop: '20px' }}
        >
          <Row gutter={16}>
            <Col span={12}>
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
            <Col span={12}>
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
                  placeholder="Enter driver phone"
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

          <div style={{ background: '#f6ffed', padding: '12px', borderRadius: '6px', border: '1px solid #b7eb8f' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
              <Text style={{ fontSize: '13px', color: '#389e0d' }}>
                Origin, Destination, and Vehicle Type cannot be changed. Contact admin for major changes.
              </Text>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ShipmentDetail;