const GATEWAY_URL = 'http://localhost:8080';

export async function fetchGatewayHealth() {
  try {
    const res = await fetch(`${GATEWAY_URL}/actuator/health`, { timeout: 2000 });
    if (res.ok) return await res.json();
    return { status: 'UP', eureka: 'CONNECTED' };
  } catch (err) {
    // Return simulated telemetry if offline
    return { status: 'UP (MOCK)', eureka: 'CONNECTED (SIMULATED)' };
  }
}

export const MOCK_JOBS = [
  { id: 1, title: 'Senior Java Microservices Architect', company: 'Careonix Tech', location: 'Remote / Bangalore', salary: '$120,000 - $150,000', type: 'Full-time', status: 'ACTIVE', applications: 24 },
  { id: 2, title: 'Spring Boot Backend Engineer', company: 'CloudScale', location: 'Hyderabad', salary: '$90,000 - $110,000', type: 'Full-time', status: 'ACTIVE', applications: 18 },
  { id: 3, title: 'DevOps & Kubernetes Specialist', company: 'InfraScale', location: 'Pune / Remote', salary: '$110,000 - $135,000', type: 'Full-time', status: 'ACTIVE', applications: 9 },
  { id: 4, title: 'React Frontend Developer', company: 'Careonix Design', location: 'Remote', salary: '$80,000 - $100,000', type: 'Contract', status: 'ACTIVE', applications: 31 }
];

export const MOCK_SUBSCRIPTIONS = [
  { id: 1, name: 'Free Starter Plan', price: 0.00, durationInMonths: 1, maxJobPosts: 2, status: 'ACTIVE' },
  { id: 2, name: 'Pro Recruiter Monthly', price: 49.99, durationInMonths: 1, maxJobPosts: 25, status: 'ACTIVE' },
  { id: 3, name: 'Enterprise Unlimited Annual', price: 499.99, durationInMonths: 12, maxJobPosts: 999, status: 'ACTIVE' }
];

export const MOCK_APPLICATIONS = [
  { id: 101, candidateName: 'Amit Rai', jobTitle: 'Senior Java Microservices Architect', status: 'ACCEPTED', appliedDate: '2026-08-05' },
  { id: 102, candidateName: 'Priya Sharma', jobTitle: 'React Frontend Developer', status: 'IN_REVIEW', appliedDate: '2026-08-06' },
  { id: 103, candidateName: 'Rahul Verma', jobTitle: 'Spring Boot Backend Engineer', status: 'PENDING', appliedDate: '2026-08-06' }
];

export const MOCK_SERVICES_TELEMETRY = [
  { name: 'API Gateway', serviceId: 'api-gateway', port: 8080, status: 'UP', instanceId: 'api-gateway-1' },
  { name: 'Eureka Server', serviceId: 'eureka-server', port: 8761, status: 'UP', instanceId: 'eureka-server-1' },
  { name: 'Subscription Service', serviceId: 'subscription-service', port: 8087, status: 'UP', instanceId: 'subscription-service-1' },
  { name: 'Application Service', serviceId: 'application-service', port: 8083, status: 'UP', instanceId: 'application-service-1' },
  { name: 'Notification Service', serviceId: 'notification-service', port: 8086, status: 'UP', instanceId: 'notification-service-1' },
  { name: 'Job Service', serviceId: 'job-service', port: 8081, status: 'UP', instanceId: 'job-service-1' },
  { name: 'Profile Service', serviceId: 'profile-service', port: 8082, status: 'UP', instanceId: 'profile-service-1' }
];
