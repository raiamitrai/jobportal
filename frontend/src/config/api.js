/**
 * Centralized API Gateway & Endpoint Configuration
 *
 * In production or Docker environments, all requests are routed through
 * the central API Gateway (port 8080 or relative path) instead of directly calling
 * microservice ports on localhost.
 */

// Base URL for API Gateway. Can be overridden in production via VITE_API_GATEWAY_URL
export const API_BASE_URL = (import.meta.env.VITE_API_GATEWAY_URL || '').replace(/\/+$/, '');

/**
 * Returns the effective URL for a given service route.
 * Example: getServiceUrl('jobs', '/by-recruiter')
 *   -> "http://localhost:8080/jobs/by-recruiter" (if API_BASE_URL='http://localhost:8080')
 *   -> "/jobs/by-recruiter" (if relative in production)
 */
export function getServiceUrl(service, path = '') {
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  const base = API_BASE_URL;

  if (base) {
    return `${base}/${service}${cleanPath}`;
  }

  // If in browser and not localhost (e.g. hosted on domain/cloud), use relative route
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `/${service}${cleanPath}`;
  }

  // Local development default: API Gateway on port 8080
  return `http://localhost:8080/${service}${cleanPath}`;
}

export const ENDPOINTS = {
  jobs: (path = '') => getServiceUrl('jobs', path),
  profiles: (path = '') => getServiceUrl('profiles', path),
  notifications: (path = '') => getServiceUrl('notifications', path),
  auth: (path = '') => getServiceUrl('auth', path),
  applications: (path = '') => getServiceUrl('applications', path),
  subscriptions: (path = '') => getServiceUrl('subscriptions', path),
  payments: (path = '') => getServiceUrl('payments', path),
  interviews: (path = '') => getServiceUrl('interviews', path),
  analytics: (path = '') => getServiceUrl('analytics', path),
  adminHealth: (path = '') => {
    const clean = path ? (path.startsWith('/') ? path : `/${path}`) : '';
    const base = API_BASE_URL;
    if (base) return `${base}/admin/health${clean}`;
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `/admin/health${clean}`;
    }
    return `http://localhost:8080/admin/health${clean}`;
  },
  actuator: (path = '') => {
    const clean = path ? (path.startsWith('/') ? path : `/${path}`) : '';
    const base = API_BASE_URL;
    if (base) return `${base}/actuator${clean}`;
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `/actuator${clean}`;
    }
    return `http://localhost:8080/actuator${clean}`;
  }
};


export default ENDPOINTS;
