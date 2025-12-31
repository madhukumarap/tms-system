import React, { useState } from 'react';
import { CheckCircleOutlined, } from '@ant-design/icons';
import {
  Table,
  Card,
  Input,
  Select,
  Button,
  Space,
  Progress,
  Tag,
  Avatar,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  message,
  InputNumber,
  DatePicker,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuth } from '../context/AuthContext';

const { Option } = Select;
const { Search } = Input;

const EMPLOYEES_QUERY = gql`
  query GetEmployees($page: Int, $limit: Int, $role: String) {
    employees(page: $page, limit: $limit, role: $role) {
      employees {
        id
        name
        email
        age
        role
        department
        phone
        attendance {
          date
          status
        }
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

const CREATE_EMPLOYEE_MUTATION = gql`
  mutation CreateEmployee($input: EmployeeInput!) {
    register(input: $input) {
      employee {
        id
        name
        email
        age
        role
        department
        phone
        createdAt
      }
      token
    }
  }
`;

const UPDATE_EMPLOYEE_MUTATION = gql`
  mutation UpdateEmployee($id: ID!, $input: EmployeeInput!) {
    updateEmployee(id: $id, input: $input) {
      id
      name
      email
      age
      role
      department
      phone
    }
  }
`;

const DELETE_EMPLOYEE_MUTATION = gql`
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id)
  }
`;

const Employees = () => {
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form] = Form.useForm();
  const { isAdmin } = useAuth();

  const { loading, data, refetch } = useQuery(EMPLOYEES_QUERY, {
    variables: {
      page: pagination.current,
      limit: pagination.pageSize,
      ...filters,
    },
  });

  const [createEmployee] = useMutation(CREATE_EMPLOYEE_MUTATION, {
    onCompleted: () => {
      message.success('Employee created successfully');
      setIsModalVisible(false);
      form.resetFields();
      refetch();
    },
    onError: (error) => {
      message.error(error.message || 'Failed to create employee');
    },
  });

  const [updateEmployee] = useMutation(UPDATE_EMPLOYEE_MUTATION, {
    onCompleted: () => {
      message.success('Employee updated successfully');
      setIsModalVisible(false);
      setEditingEmployee(null);
      form.resetFields();
      refetch();
    },
    onError: (error) => {
      message.error(error.message || 'Failed to update employee');
    },
  });

  const [deleteEmployee] = useMutation(DELETE_EMPLOYEE_MUTATION, {
    onCompleted: () => {
      message.success('Employee deleted successfully');
      refetch();
    },
    onError: (error) => {
      message.error(error.message || 'Failed to delete employee');
    },
  });

  const handleTableChange = (newPagination) => {
    setPagination({
      ...newPagination,
      current: newPagination.current,
    });
  };

  const handleSearch = (value) => {
    setFilters((prev) => ({
      ...prev,
      search: value,
    }));
  };

  const handleRoleFilter = (value) => {
    setFilters((prev) => ({
      ...prev,
      role: value,
    }));
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    form.setFieldsValue({
      name: employee.name,
      email: employee.email,
      age: employee.age,
      role: employee.role,
      department: employee.department,
      phone: employee.phone,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Employee',
      content: 'Are you sure you want to delete this employee?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => deleteEmployee({ variables: { id } }),
    });
  };

  const handleSubmit = (values) => {
    if (editingEmployee) {
      updateEmployee({
        variables: {
          id: editingEmployee.id,
          input: {
            ...values,
            password: 'password123', // Default password for updates
          },
        },
      });
    } else {
      createEmployee({
        variables: {
          input: {
            ...values,
            password: 'password123', // Default password for new employees
          },
        },
      });
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      ADMIN: 'red',
      MANAGER: 'purple',
      DISPATCHER: 'orange',
      EMPLOYEE: 'blue',
    };
    return colors[role] || 'default';
  };

  const getAttendanceStatus = (attendance) => {
    const recent = attendance?.slice(0, 5) || [];
    const present = recent.filter(a => a.status === 'PRESENT').length;
    return `${present}/${recent.length} days`;
  };

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar 
            style={{ 
              backgroundColor: getRoleColor(record.role),
              color: '#fff',
              fontWeight: 'bold'
            }}
          >
            {text.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>{text}</div>
            <div style={{ fontSize: 12, color: '#666' }}>
              <MailOutlined style={{ marginRight: 4 }} />
              {record.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag 
          color={getRoleColor(role)}
          style={{
            borderRadius: '12px',
            padding: '2px 10px',
            fontWeight: '500',
            minWidth: '90px',
            textAlign: 'center',
          }}
        >
          {role}
        </Tag>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (department) => (
        <div style={{ fontWeight: '500', color: '#1f1f1f' }}>
          {department}
        </div>
      ),
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      render: (age) => (
        <div style={{ fontWeight: '500', color: '#1890ff' }}>
          {age}
        </div>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <Space>
          <PhoneOutlined style={{ color: '#52c41a' }} />
          <span style={{ fontWeight: '500' }}>{phone}</span>
        </Space>
      ),
    },
    {
      title: 'Attendance',
      key: 'attendance',
      render: (_, record) => {
        const status = getAttendanceStatus(record.attendance);
        const [present, total] = status.split('/');
        const percentage = (parseInt(present) / parseInt(total)) * 100;
        
        return (
          <div style={{ minWidth: '120px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '12px', color: '#666' }}>Last 5 days</span>
              <span style={{ fontWeight: '600', fontSize: '13px' }}>{status}</span>
            </div>
            <Progress 
              percent={percentage} 
              size="small" 
              showInfo={false}
              strokeColor={percentage >= 80 ? '#52c41a' : percentage >= 60 ? '#fa8c16' : '#ff4d4f'}
            />
          </div>
        );
      },
    },
    {
      title: 'Join Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <div style={{ fontSize: '13px' }}>
          <div style={{ fontWeight: '500' }}>
            {new Date(date).toLocaleDateString()}
          </div>
          <div style={{ color: '#999', fontSize: '12px' }}>
            {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            style={{
              background: '#f6ffed',
              borderColor: '#b7eb8f',
              color: '#389e0d',
            }}
            onClick={() => handleEditEmployee(record)}
            disabled={!isAdmin()}
          />
          {isAdmin() && (
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => handleDelete(record.id)}
            />
          )}
        </Space>
      ),
    },
  ];

  const employeesData = data?.employees?.employees || [];
  const total = data?.employees?.total || 0;

  // Calculate stats
  const stats = {
    total: total,
    admins: employeesData.filter(e => e.role === 'ADMIN').length,
    managers: employeesData.filter(e => e.role === 'MANAGER').length,
    dispatchers: employeesData.filter(e => e.role === 'DISPATCHER').length,
    employees: employeesData.filter(e => e.role === 'EMPLOYEE').length,
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
              <h2 style={{ margin: 0, color: '#1f1f1f', fontWeight: '600' }}>
                <TeamOutlined style={{ marginRight: '10px', color: '#1890ff' }} />
                Employee Management
              </h2>
              <p style={{ margin: '4px 0 0 0', color: '#8c8c8c' }}>
                Manage your team members and their details
              </p>
            </div>
            {isAdmin() && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddEmployee}
                style={{
                  background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  height: '40px',
                  padding: '0 20px',
                  fontWeight: '500',
                }}
              >
                Add Employee
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            {[
              { title: 'Total Employees', value: stats.total, color: '#1890ff', icon: <TeamOutlined /> },
              { title: 'Admins', value: stats.admins, color: '#cf1322', icon: <UserOutlined /> },
              { title: 'Managers', value: stats.managers, color: '#722ed1', icon: <UserOutlined /> },
              { title: 'Dispatchers', value: stats.dispatchers, color: '#fa8c16', icon: <UserOutlined /> },
              { title: 'Employees', value: stats.employees, color: '#52c41a', icon: <UserOutlined /> },
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
                placeholder="Search by name or email"
                onSearch={handleSearch}
                enterButton={<SearchOutlined />}
                style={{ width: '100%' }}
                size="large"
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Filter by role"
                style={{ width: '100%' }}
                size="large"
                allowClear
                onChange={handleRoleFilter}
                dropdownStyle={{ borderRadius: '8px' }}
              >
                <Option value="ADMIN">Admin</Option>
                <Option value="MANAGER">Manager</Option>
                <Option value="DISPATCHER">Dispatcher</Option>
                <Option value="EMPLOYEE">Employee</Option>
              </Select>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'right' }}>
              <Button
                onClick={() => {
                  setFilters({});
                  message.info('Filters cleared');
                }}
                size="large"
                style={{ marginRight: '10px' }}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>

          {/* Employees Table */}
          <Table
            columns={columns}
            dataSource={employeesData}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => (
                <span style={{ color: '#666', fontSize: '14px' }}>
                  Showing {range[0]}-{range[1]} of {total} employees
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
            rowClassName={() => 'table-row'}
          />
        </div>
      </Card>

      {/* Add/Edit Employee Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UserOutlined style={{ marginRight: '10px', color: '#1890ff' }} />
            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingEmployee(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingEmployee ? 'Update' : 'Create'}
        okButtonProps={{
          icon: <SaveOutlined />,
          style: {
            background: editingEmployee ? '#389e0d' : '#1890ff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '500',
          },
        }}
        cancelButtonProps={{
          style: { borderRadius: '6px', fontWeight: '500' },
        }}
        width={600}
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
                name="name"
                label="Full Name"
                rules={[
                  { required: true, message: 'Please enter employee name' },
                  { min: 2, message: 'Name must be at least 2 characters' },
                ]}
              >
                <Input
                  placeholder="Enter full name"
                  prefix={<UserOutlined style={{ color: '#999' }} />}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              >
                <Input
                  placeholder="Enter email address"
                  prefix={<MailOutlined style={{ color: '#999' }} />}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="age"
                label="Age"
                rules={[
                  { required: true, message: 'Please enter age' },
                  { type: 'number', min: 18, max: 65, message: 'Age must be between 18-65' },
                ]}
              >
                <InputNumber
                  placeholder="Age"
                  style={{ width: '100%' }}
                  size="large"
                  min={18}
                  max={65}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: 'Please select role' }]}
              >
                <Select
                  placeholder="Select role"
                  size="large"
                  style={{ width: '100%' }}
                >
                  <Option value="ADMIN">Admin</Option>
                  <Option value="MANAGER">Manager</Option>
                  <Option value="DISPATCHER">Dispatcher</Option>
                  <Option value="EMPLOYEE">Employee</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[
                  { required: true, message: 'Please enter phone number' },
                  { pattern: /^[0-9+\-\s()]+$/, message: 'Please enter a valid phone number' },
                ]}
              >
                <Input
                  placeholder="Enter phone number"
                  prefix={<PhoneOutlined style={{ color: '#999' }} />}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: 'Please enter department' }]}
          >
            <Input
              placeholder="Enter department"
              size="large"
            />
          </Form.Item>

          {!editingEmployee && (
            <div
              style={{
                background: '#f6ffed',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #b7eb8f',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                <span style={{ fontSize: '13px', color: '#389e0d' }}>
                  Default password will be set to: <strong>password123</strong>
                </span>
              </div>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Employees;