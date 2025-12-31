import React from 'react';
import { Form, Input, Button, Card, Layout, Typography, Alert, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;
const { Content } = Layout;

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values) => {
    try {
      await login(values.email, values.password);
      navigate('/dashboard');
    } catch (error) {
        console.log(error)
        message.error('Login failed. Please try again.');
    }
  };

  const testCredentials = [
    { email: 'admin@tms.com', password: 'password123', role: 'Admin' },
    { email: 'manager@tms.com', password: 'password123', role: 'Manager' },
    { email: 'employee@tms.com', password: 'password123', role: 'Employee' },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: 400 }}>
          <Card style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Title level={2} style={{ marginBottom: 8 }}>
                TMS Login
              </Title>
              <Typography.Text type="secondary">
                Transportation Management System
              </Typography.Text>
            </div>

            <Alert
              type="info"
              message="Test Credentials"
              description={
                <div>
                  {testCredentials.map((cred, index) => (
                    <div key={index} style={{ marginBottom: 4 }}>
                      <strong>{cred.role}:</strong> {cred.email} / {cred.password}
                    </div>
                  ))}
                </div>
              }
              style={{ marginBottom: 24 }}
            />

            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              layout="vertical"
              requiredMark="optional"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Email"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Please input your password!' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Password"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                >
                  Log in
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
                <p>Demo Application - All data is reset on refresh</p>
              </div>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default Login;