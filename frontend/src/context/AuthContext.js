import React, { createContext, useState, useContext, useEffect } from 'react';
import { message } from 'antd';
import { gql, useMutation, useQuery } from '@apollo/client';

const AuthContext = createContext({});

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      employee {
        id
        name
        email
        role
        department
      }
    }
  }
`;

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      role
      department
    }
  }
`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const { data: meData, loading: meLoading } = useQuery(ME_QUERY, {
    skip: !localStorage.getItem('token'),
    onCompleted: (data) => {
      if (data?.me) {
        setUser(data.me);
      }
      setLoading(false);
    },
    onError: () => {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    },
  });

  const [loginMutation] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      localStorage.setItem('token', data.login.token);
      setUser(data.login.employee);
      message.success('Login successful!');
    },
    onError: (error) => {
      message.error(error.message || 'Login failed');
    },
  });

  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  const login = async (email, password) => {
    await loginMutation({ variables: { email, password } });
  };

  const logout = async () => {
    await logoutMutation();
    localStorage.removeItem('token');
    setUser(null);
    message.success('Logged out successfully');
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const isManager = () => {
    return ['ADMIN', 'MANAGER'].includes(user?.role);
  };

  const isDispatcher = () => {
    return ['ADMIN', 'MANAGER', 'DISPATCHER'].includes(user?.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin,
        isManager,
        isDispatcher,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);