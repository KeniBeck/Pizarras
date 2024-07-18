const useSession = () => {
    const isBrowser = typeof window !== 'undefined';

    const login = (userData) => {
        if (isBrowser) {
            localStorage.setItem('logged', true);
            localStorage.setItem('userData', JSON.stringify(userData));
        }
    };

    const logout = () => {
        if (isBrowser) {
            localStorage.clear();
            localStorage.clear();
        }
    };

    const getUserData = () => {
        if (isBrowser) {
            const userData = localStorage.getItem('userData');
            return userData ? JSON.parse(userData) : null;
        } else {
            return null;
        }
    };

    return { login, logout, getUserData };
};

export default useSession;