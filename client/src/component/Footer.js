import React, { useEffect, useState } from 'react';

function Footer() {
    const [username, setUsername] = useState('');

    useEffect(() => {
        // Retrieve the username from localStorage
        const storedUserName = localStorage.getItem('userName');
        if (storedUserName) {
            setUsername(storedUserName);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        window.location.href = '/login';
    };

    return (
        <section className="footer">
            <div className="share" style={{ display: 'flex', alignItems: 'center' }}>
                <a href="https://www.facebook.com/Smashn.Go.EG" className="btn">Facebook</a>
                <a href="https://www.instagram.com/Smashn.Go.Eg" className="btn">Instagram</a>
                <a href="https://www.tiktok.com/@smashn.go.eg" className="btn">Tik Tok</a>
                <button onClick={handleLogout} className="btn logout">Logout</button>
                {username && (
                        <span style={{ color: 'red', fontSize: '18px', marginRight: '10px' }}>
                            Logged in as {username}
                        </span>
                    )}
            </div>

            <h1 className="credit">Created by <span>Yassin, Moaz, Omar</span> | 23101504, 23101486, 23101428</h1>
        </section>
    );
}

export default Footer;
