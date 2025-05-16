import React, { useEffect } from 'react';
import logo from '../Assets/logo.png';
import {Link} from 'react-router-dom';

function Navbar() {
    useEffect(() => {
        const menu = document.querySelector('#menu-bar');
        const navbar = document.querySelector('.navbar');

        const toggleMenu = () => {
            menu.classList.toggle('fa-times');
            navbar.classList.toggle('active');
        };

        const closeMenuOnScroll = () => {
            menu.classList.remove('fa-times');
            navbar.classList.remove('active');
        };

        menu.addEventListener('click', toggleMenu);
        window.addEventListener('scroll', closeMenuOnScroll);

        return () => {
            menu.removeEventListener('click', toggleMenu);
            window.removeEventListener('scroll', closeMenuOnScroll);
        };
    }, []);

    return (
        <header>
            <a href="#" className="logo">
                <img src={logo} alt="Logo" />
            </a>

            <div id="menu-bar" className="fas fa-bars"></div>

            <nav className="navbar">
                <Link className='link' to='/home'>Home</Link>
                <Link className='link' to='/popular'>Popular</Link>
                <Link className='link' to='/gallery'>Gallery</Link>
                <Link className='link' to='/menu'>Menu</Link>
                <Link className='link' to='/reviews'>Review</Link>
                <Link className='link' to='/order'>Order</Link>
            </nav>
        </header>
    );
}

export default Navbar;
