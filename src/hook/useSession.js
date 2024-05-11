const useSession = () => {
    const isBrowser = typeof window !== 'undefined';

    const login = (userData) => {
        if (isBrowser) {
            sessionStorage.setItem('logged', true);
            sessionStorage.setItem('userData', JSON.stringify(userData));
        }
    };

    const logout = () => {
        if (isBrowser) {
            sessionStorage.clear();
        }
    };

    const getUserData = () => {
        if (isBrowser) {
            const userData = sessionStorage.getItem('userData');
            return userData ? JSON.parse(userData) : null;
        } else {
            return null;
        }
    };

    return { login, logout, getUserData };
};

export default useSession;