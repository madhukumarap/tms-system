const shipments = [];
const employees = [];

const statuses = ['PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'DELAYED'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const vehicleTypes = ['TRUCK', 'VAN', 'TRAILER', 'CONTAINER', 'REFRIGERATED'];
const roles = ['ADMIN', 'EMPLOYEE', 'MANAGER', 'DISPATCHER'];
const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
  'Miami', 'Atlanta', 'Seattle', 'Denver', 'Boston'
];

const drivers = [
  'John Smith', 'Robert Johnson', 'Michael Williams', 'David Brown',
  'James Davis', 'William Miller', 'Richard Wilson', 'Joseph Moore',
  'Thomas Taylor', 'Charles Anderson'
];

const generateMockData = () => {
  // Clear existing data
  shipments.length = 0;
  employees.length = 0;

  // Generate shipments
  for (let i = 1; i <= 50; i++) {
    const origin = cities[Math.floor(Math.random() * cities.length)];
    let destination;
    do {
      destination = cities[Math.floor(Math.random() * cities.length)];
    } while (destination === origin);

    shipments.push({
      id: `shipment_${i}`,
      shipmentId: `SH${100000 + i}`,
      origin,
      destination,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      vehicleType: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
      driverName: drivers[Math.floor(Math.random() * drivers.length)],
      driverPhone: `+1${Math.floor(2000000000 + Math.random() * 8000000000)}`,
      eta: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      cost: parseFloat((1000 + Math.random() * 9000).toFixed(2)),
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      weight: parseFloat((500 + Math.random() * 4500).toFixed(2)),
      dimensions: `${Math.floor(2 + Math.random() * 10)}x${Math.floor(3 + Math.random() * 8)}x${Math.floor(2 + Math.random() * 6)} ft`,
      notes: `Special handling required for item ${i}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Generate employees with fixed credentials
  employees.push({
    id: 'emp_1',
    name: 'Admin User',
    email: 'admin@tms.com',
    age: 35,
    role: 'ADMIN',
    department: 'Management',
    phone: '+1-555-0101',
    attendance: generateAttendanceRecords(),
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  });

  employees.push({
    id: 'emp_2',
    name: 'Manager User',
    email: 'manager@tms.com',
    age: 32,
    role: 'MANAGER',
    department: 'Operations',
    phone: '+1-555-0102',
    attendance: generateAttendanceRecords(),
    createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
  });

  employees.push({
    id: 'emp_3',
    name: 'Employee User',
    email: 'employee@tms.com',
    age: 28,
    role: 'EMPLOYEE',
    department: 'Logistics',
    phone: '+1-555-0103',
    attendance: generateAttendanceRecords(),
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // Add some more demo employees
  const empNames = [
    'Alex Johnson', 'Sarah Wilson', 'Mark Davis', 'Emily Brown', 'Chris Miller',
    'Jessica Taylor', 'Daniel Anderson', 'Lisa Thomas', 'Kevin Martinez', 'Amy Garcia'
  ];

  empNames.forEach((name, i) => {
    const role = roles[Math.floor(Math.random() * roles.length)];
    employees.push({
      id: `emp_${i + 4}`,
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@tms.com`,
      age: 25 + Math.floor(Math.random() * 20),
      role,
      department: role === 'ADMIN' ? 'Management' : 
                  role === 'DISPATCHER' ? 'Dispatch' : 
                  role === 'MANAGER' ? 'Operations' : 'Logistics',
      phone: `+1${Math.floor(2000000000 + Math.random() * 8000000000)}`,
      attendance: generateAttendanceRecords(),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    });
  });
};

const generateAttendanceRecords = () => {
  const records = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    records.push({
      date: date.toISOString().split('T')[0],
      status: ['PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'LEAVE'][Math.floor(Math.random() * 5)],
    });
  }
  return records;
};

module.exports = {
  shipments,
  employees,
  generateMockData,
};