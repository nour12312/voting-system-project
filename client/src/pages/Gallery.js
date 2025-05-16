import React from 'react';
import g1 from '../Assets/gallery/g-1.jpg';
import g2 from '../Assets/gallery/g-2.jpg';
import g3 from '../Assets/gallery/g-3.jpg';
import g4 from '../Assets/gallery/g-4.jpg';
import g5 from '../Assets/gallery/g-5.jpg';
import g6 from '../Assets/gallery/g-6.jpg';
import g7 from '../Assets/gallery/g-7.jpg';
import g8 from '../Assets/gallery/g-8.jpg';
import g9 from '../Assets/gallery/g-9.jpg';
import axios from 'axios';

function Gallery(){
    return(
        <section class="gallery" id="gallery">

<h1 class="heading">Our Food <span> Gallery </span> </h1>
<br></br><br></br>
<div class="box-container">

<div class="box">
    <img src={g1} alt=""></img>
    <div class="content">
        <h3>Smash Burger Fries</h3>
        <p>crispy fries topped with cheese, caramelized onions, various sauces and smash burger patties.</p>
        <a href="/order" class="btn">Order Now</a>
    </div>
</div>

<div class="box">
    <img src={g2} alt=""></img>
    <div class="content">
        <h3>Triple Mushroom Burger Meal</h3>
        <p>Triple Cheesy Mushroom burger combo with a large fry.</p>
        <a href="/order" class="btn">Order Now</a>
    </div>
</div>

<div class="box">
    <img src={g3} alt=""></img>
    <div class="content">
        <h3>Single Mushroom Meal</h3>
        <p>Single Cheesy Mushroom burger combo with a small fry.</p>
        <a href="/order" class="btn">Order Now</a>
    </div>
</div>

<div class="box">
    <img src={g4} alt=""></img>
    <div class="content">
        <h3>Family Meal 1</h3>
        <p>A Family Meal consisting of 9 burger of your choice and 2 portions of Large fries.</p>
        <a href="/order" class="btn">Order Now</a>
    </div>
</div>

<div class="box">
    <img src={g5} alt=""></img>
    <div class="content">
        <h3>Double Classic Meal</h3>
        <p>Single Classic burger combo with a medium fry.</p>
        <a href="/order" class="btn">Order Now</a>
    </div>
</div>

<div class="box">
    <img src={g6} alt=""></img>
    <div class="content">
        <h3>Duo chicken Meal</h3>
        <p>Your choice of two chicken sandwiches and a large fry.</p>
        <a href="/order" class="btn">Order Now</a>
    </div>
</div>

<div class="box">
    <img src={g7} alt=""></img>
    <div class="content">
        <h3>Family meal 2</h3>
        <p>A Family Meal consisting of 4 burger of your choice and a large fry.</p>
        <a href="/order" class="btn">Order Now</a>
    </div>
</div>

<div class="box">
    <img src={g8} alt=""></img>
    <div class="content">
        <h3>Duo beef meal</h3>
        <p>Your choice of two burgers and a large fry.</p>
        <a href="/order" class="btn">Order Now</a>
    </div>
</div>

<div class="box">
    <img src={g9} alt=""></img>
    <div class="content">
        <h3>Trio meal</h3>
        <p>Your choice of any 3 sandwiches and a large fry.</p>
        <a href="/order" class="btn">Order Now</a>
    </div>
</div>

</div>

</section>
    );
}
export default Gallery;