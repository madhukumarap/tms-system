const { GraphQLError } = require('graphql');
const { shipments, employees, generateMockData } = require('../data/mockData');
const { signToken } = require('../auth/auth');

// Generate initial mock data
generateMockData();

const resolvers = {
  Query: {
    shipments: (_, args, context) => {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
        status,
        priority,
        origin,
        destination,
      } = args;

      let filtered = [...shipments];
      
      if (status) {
        filtered = filtered.filter(s => s.status === status);
      }
      
      if (priority) {
        filtered = filtered.filter(s => s.priority === priority);
      }
      
      if (origin) {
        filtered = filtered.filter(s => 
          s.origin.toLowerCase().includes(origin.toLowerCase())
        );
      }
      
      if (destination) {
        filtered = filtered.filter(s => 
          s.destination.toLowerCase().includes(destination.toLowerCase())
        );
      }

      filtered.sort((a, b) => {
        if (sortOrder === 'ASC') {
          return a[sortBy] > b[sortBy] ? 1 : -1;
        }
        return a[sortBy] < b[sortBy] ? 1 : -1;
      });

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginated = filtered.slice(startIndex, endIndex);

      return {
        shipments: paginated,
        total: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / limit),
        hasNextPage: endIndex < filtered.length,
        hasPrevPage: page > 1,
      };
    },

    shipment: (_, { id }) => {
      return shipments.find(s => s.id === id);
    },

    employees: (_, { page = 1, limit = 10, role }) => {
      let filtered = [...employees];
      
      if (role) {
        filtered = filtered.filter(e => e.role === role);
      }

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginated = filtered.slice(startIndex, endIndex);

      return {
        employees: paginated,
        total: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / limit),
        hasNextPage: endIndex < filtered.length,
        hasPrevPage: page > 1,
      };
    },

    employee: (_, { id }) => {
      return employees.find(e => e.id === id);
    },

    me: (_, __, context) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated');
      }
      return employees.find(e => e.id === context.user.id);
    },
  },

  Mutation: {
    createShipment: (_, { input }, context) => {
      if (!context.user || !['ADMIN', 'MANAGER', 'DISPATCHER'].includes(context.user.role)) {
        throw new GraphQLError('Not authorized');
      }

      const newShipment = {
        id: `shipment_${Date.now()}`,
        shipmentId: `SH${Math.floor(100000 + Math.random() * 900000)}`,
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      shipments.unshift(newShipment);
      return newShipment;
    },

    updateShipment: (_, { id, input }, context) => {
      if (!context.user || !['ADMIN', 'MANAGER', 'DISPATCHER'].includes(context.user.role)) {
        throw new GraphQLError('Not authorized');
      }

      const index = shipments.findIndex(s => s.id === id);
      if (index === -1) {
        throw new GraphQLError('Shipment not found');
      }

      shipments[index] = {
        ...shipments[index],
        ...input,
        updatedAt: new Date().toISOString(),
      };

      return shipments[index];
    },

    deleteShipment: (_, { id }, context) => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new GraphQLError('Not authorized');
      }

      const index = shipments.findIndex(s => s.id === id);
      if (index === -1) {
        throw new GraphQLError('Shipment not found');
      }

      shipments.splice(index, 1);
      return true;
    },

    login: async (_, { email, password }) => {
      try {
        console.log('Login attempt:', email, password);
        
        const employee = employees.find(e => e.email === email);
        
        if (!employee) {
          console.log('Employee not found:', email);
          throw new GraphQLError('Invalid credentials');
        }

        // For demo purposes, accept any password as "password123"
        const isValid = password === 'password123';
        
        if (!isValid) {
          console.log('Invalid password for:', email);
          throw new GraphQLError('Invalid credentials');
        }

        console.log('Login successful for:', employee.name);
        
        const token = signToken({
          id: employee.id,
          email: employee.email,
          role: employee.role,
        });

        return {
          token,
          employee,
        };
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },

    register: async (_, { input }) => {
      const existing = employees.find(e => e.email === input.email);
      if (existing) {
        throw new GraphQLError('Employee already exists');
      }

      const newEmployee = {
        id: `emp_${Date.now()}`,
        ...input,
        attendance: [],
        createdAt: new Date().toISOString(),
      };

      employees.push(newEmployee);
      
      const token = signToken({
        id: newEmployee.id,
        email: newEmployee.email,
        role: newEmployee.role,
      });

      return {
        token,
        employee: newEmployee,
      };
    },

    logout: () => {
      return true;
    },
  },
};

module.exports = { resolvers };