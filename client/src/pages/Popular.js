import p1 from '../Assets/p-1.jpg';
import p2 from '../Assets/p-2.jpg';
import p3 from '../Assets/p-3.jpg';
import React, { useState } from 'react';
import axios from 'axios';



function Popular(){
        return(
            <section class="popular" id="popular">

            <h1 class="heading">Most <span>Popular</span> Foods </h1>
            <br></br><br></br>
            
            <div class="box-container">
        
                <div class="box">
                    <span class="price"> 100EGP - 170EGP</span>
                    <img src={p1} alt=""></img>
                    <h3>Cheesy Mushroom <br></br> Burger</h3>
                    <div class="stars">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                    </div>
                    <a href="/order" class="btn">Order Now</a>
                </div>
        
                <div class="box">
                    <span class="price"> 100EGP - 160EGP</span>
                    <img src={p2} alt=""></img>
                    <h3>Golden Onion <br></br>Burger</h3>
                    <div class="stars">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                    </div>
                    <a href="/order" class="btn">Order Now</a>
                </div>
        
                <div class="box">
                    <span class="price"> 100EGP - 180EGP</span>
                    <img src={p3} alt=""></img>
                    <h3>Go  <br></br>Burger</h3>
                    <div class="stars">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="far fa-star"></i>
                    </div>
                    <a href="/order" class="btn">Order Now</a>
                </div>
        
            </div>
        
        
        </section>
    );
}
export default Popular;