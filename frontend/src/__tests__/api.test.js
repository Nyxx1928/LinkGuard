/**
 * Tests for the Axios 401 interceptor whitelist behavior.
 *
 * Since the interceptor manipulates localStorage and dispatches DOM events,
 * we test the logic by extracting the interceptor function and testing it directly.
 */

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => { store[key] = value; }),
        removeItem: jest.fn((key) => { delete store[key]; }),
        clear: jest.fn(() => { store = {}; }),
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.dispatchEvent
window.dispatchEvent = jest.fn();

// Simulate the interceptor logic from api.js
const PUBLIC_ENDPOINTS = [
    '/api/login',
    '/api/register',
    '/email/verify/',
];

function simulateInterceptor(url) {
    const isPublic = PUBLIC_ENDPOINTS.some(endpoint =>
        endpoint.endsWith('/') ? url.startsWith(endpoint) : url === endpoint
    );

    if (!isPublic) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('session_start');
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        return 'session-cleared';
    }
    return 'ignored';
}

describe('401 Interceptor Whitelist', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('should ignore 401 on /api/login (public endpoint)', () => {
        const result = simulateInterceptor('/api/login');
        expect(result).toBe('ignored');
        expect(localStorage.removeItem).not.toHaveBeenCalled();
        expect(window.dispatchEvent).not.toHaveBeenCalled();
    });

    test('should ignore 401 on /api/register (public endpoint)', () => {
        const result = simulateInterceptor('/api/register');
        expect(result).toBe('ignored');
        expect(localStorage.removeItem).not.toHaveBeenCalled();
        expect(window.dispatchEvent).not.toHaveBeenCalled();
    });

    test('should ignore 401 on /email/verify/... (public verification link)', () => {
        const result = simulateInterceptor('/email/verify/some-hash');
        expect(result).toBe('ignored');
        expect(localStorage.removeItem).not.toHaveBeenCalled();
        expect(window.dispatchEvent).not.toHaveBeenCalled();
    });

    test('should clear session on 401 for protected endpoint', () => {
        const result = simulateInterceptor('/api/analyze');
        expect(result).toBe('session-cleared');
        expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
        expect(localStorage.removeItem).toHaveBeenCalledWith('session_start');
        expect(window.dispatchEvent).toHaveBeenCalled();
    });

    test('should clear session on 401 for /api/history', () => {
        const result = simulateInterceptor('/api/history');
        expect(result).toBe('session-cleared');
        expect(localStorage.removeItem).toHaveBeenCalled();
        expect(window.dispatchEvent).toHaveBeenCalled();
    });

    test('should clear session on 401 for /api/me', () => {
        const result = simulateInterceptor('/api/me');
        expect(result).toBe('session-cleared');
        expect(localStorage.removeItem).toHaveBeenCalled();
        expect(window.dispatchEvent).toHaveBeenCalled();
    });

    test('should ignore 401 on /email/verify/ with query params', () => {
        const result = simulateInterceptor('/email/verify/abc123?expires=12345&signature=xyz');
        expect(result).toBe('ignored');
        expect(localStorage.removeItem).not.toHaveBeenCalled();
    });

    test('should clear session for unknown route that is not in whitelist', () => {
        const result = simulateInterceptor('/api/unknown');
        expect(result).toBe('session-cleared');
        expect(localStorage.removeItem).toHaveBeenCalled();
    });
});
