const useSession = () => {
    const isBrowser = typeof window !== 'undefined';

    const login = (userData) => {
        if (isBrowser) {
            if (userData.Estatus === 'alta') {
                localStorage.setItem('logged', true);
                localStorage.setItem('userData', JSON.stringify(userData));
            } else {
                localStorage.setItem('logged', false);
            }
        }

    };
    const loginAdmin = (userData) => {
        if (isBrowser) {
            localStorage.setItem('loggedAdmin', true);
            localStorage.setItem('userDataAdmin', JSON.stringify(userData));
        }
    };

    const loginWinner = (userData) => {
        if (isBrowser) {
            localStorage.setItem('loggedWinner', true);
            localStorage.setItem('userDataWinner', JSON.stringify(userData));
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

    return { login, logout, getUserData, loginAdmin, loginWinner };
};

export default useSession;