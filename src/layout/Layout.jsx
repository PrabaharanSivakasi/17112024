import React from "react";

import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import Routers from '../router/Routers';
import Navbar from "../components/navbar/Navbar";

import { useSelector } from "react-redux";
import MyMarquee from "../components/marquee/MyMarquee";

const Layout = () => {

    const isLogin = useSelector( (xdata) => { 
        return xdata.islogin;
    }) 

  return (
    <>
    <Header/>    
    { !isLogin && <MyMarquee /> }
    { isLogin && <Navbar/> }
    <Routers/>
    <Footer/>
    </>
  );
};

export default Layout;