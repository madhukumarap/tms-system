import React from 'react';
import { Card, Tag, Space, Button, Dropdown, Menu } from 'antd';
import {
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FlagOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const ShipmentTile = ({ shipment, onView, onEdit, onDelete, canEdit, canDelete }) => {
  const navigate = useNavigate();

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

  const menu = (
    <Menu>
      <Menu.Item key="view" icon={<EyeOutlined />} onClick={onView}>
        View Details
      </Menu.Item>
      {canEdit && (
        <Menu.Item key="edit" icon={<EditOutlined />} onClick={onEdit}>
          Edit
        </Menu.Item>
      )}
      <Menu.Item key="flag" icon={<FlagOutlined />}>
        Flag
      </Menu.Item>
      {canDelete && (
        <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={onDelete}>
          Delete
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <Card
      hoverable
      style={{ height: '100%' }}
      onClick={() => navigate(`/shipments/${shipment.id}`)}
      actions={[
        <Button type="text" icon={<EyeOutlined />} onClick={(e) => {
          e.stopPropagation();
          onView();
        }} />,
        <Dropdown overlay={menu} trigger={['click']}>
          <Button
            type="text"
            icon={<MoreOutlined />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>,
      ]}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h4 style={{ margin: 0 }}>{shipment.shipmentId}</h4>
          <p style={{ margin: '4px 0', color: '#666' }}>
            {shipment.origin} → {shipment.destination}
          </p>
        </div>
        <Tag color={getStatusColor(shipment.status)}>
          {shipment.status}
        </Tag>
      </div>

      <div style={{ marginTop: 12 }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div>
            <small style={{ color: '#999' }}>Driver:</small>
            <div>{shipment.driverName}</div>
          </div>
          <div>
            <small style={{ color: '#999' }}>ETA:</small>
            <div>{new Date(shipment.eta).toLocaleDateString()}</div>
          </div>
          <div>
            <small style={{ color: '#999' }}>Vehicle:</small>
            <div>{shipment.vehicleType}</div>
          </div>
          <div>
            <small style={{ color: '#999' }}>Priority:</small>
            <Tag color={getPriorityColor(shipment.priority)} size="small">
              {shipment.priority}
            </Tag>
          </div>
          <div>
            <small style={{ color: '#999' }}>Cost:</small>
            <div>${shipment.cost.toFixed(2)}</div>
          </div>
        </Space>
      </div>
    </Card>
  );
};

export default ShipmentTile;