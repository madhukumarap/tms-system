const typeDefs = `
  type Query {
    shipments(
      page: Int = 1
      limit: Int = 10
      sortBy: String = "createdAt"
      sortOrder: String = "DESC"
      status: String
      priority: String
      origin: String
      destination: String
    ): ShipmentPaginated!

    shipment(id: ID!): Shipment
    employees(page: Int = 1, limit: Int = 10, role: String): EmployeePaginated!
    employee(id: ID!): Employee
    me: Employee
  }

  type Mutation {
    createShipment(input: ShipmentInput!): Shipment
    updateShipment(id: ID!, input: ShipmentInput!): Shipment
    deleteShipment(id: ID!): Boolean
    login(email: String!, password: String!): AuthPayload
    logout: Boolean
    register(input: EmployeeInput!): AuthPayload
  }

  type Shipment {
    id: ID!
    shipmentId: String!
    origin: String!
    destination: String!
    status: ShipmentStatus!
    vehicleType: VehicleType!
    driverName: String!
    driverPhone: String
    eta: String!
    cost: Float!
    priority: Priority!
    weight: Float
    dimensions: String
    notes: String
    createdAt: String!
    updatedAt: String!
  }

  type Employee {
    id: ID!
    name: String!
    email: String!
    age: Int
    role: Role!
    department: String
    phone: String
    attendance: [Attendance]!
    createdAt: String!
  }

  type Attendance {
    date: String!
    status: AttendanceStatus!
  }

  type ShipmentPaginated {
    shipments: [Shipment]!
    total: Int!
    page: Int!
    totalPages: Int!
    hasNextPage: Boolean!
    hasPrevPage: Boolean!
  }

  type EmployeePaginated {
    employees: [Employee]!
    total: Int!
    page: Int!
    totalPages: Int!
    hasNextPage: Boolean!
    hasPrevPage: Boolean!
  }

  type AuthPayload {
    token: String!
    employee: Employee!
  }

  input ShipmentInput {
    origin: String!
    destination: String!
    status: ShipmentStatus
    vehicleType: VehicleType!
    driverName: String!
    driverPhone: String
    eta: String!
    cost: Float!
    priority: Priority!
    weight: Float
    dimensions: String
    notes: String
  }

  input EmployeeInput {
    name: String!
    email: String!
    password: String!
    age: Int
    role: Role!
    department: String
    phone: String
  }

  enum ShipmentStatus {
    PENDING
    IN_TRANSIT
    DELIVERED
    CANCELLED
    DELAYED
  }

  enum VehicleType {
    TRUCK
    VAN
    TRAILER
    CONTAINER
    REFRIGERATED
  }

  enum Priority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  enum Role {
    ADMIN
    EMPLOYEE
    MANAGER
    DISPATCHER
  }

  enum AttendanceStatus {
    PRESENT
    ABSENT
    LATE
    LEAVE
  }
`;

module.exports = typeDefs;
