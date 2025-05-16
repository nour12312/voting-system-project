import axios from 'axios';
import m1 from '../Assets/menu1.jpg'
import m2 from '../Assets/menu2.jpg'

function MenuPage(){
    return(
        <div class='menu-page'>
            <h1 class='heading'>Our <span>Menu</span></h1>
            <div class='menu-container'>
            <img src={m1}></img>
            <img src={m2}></img>
            </div>
        </div>
    );
}

export default MenuPage;