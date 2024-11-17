import { Routes,Route } from "react-router-dom"

import React from "react";
import MyLoginPage from "../pages/MyLoginPage";
import Signin from "../components/Users/Signin";
import Login from "../components/Users/Login";
import Emptypage from "../pages/Emptypage";
import Flashnews from "../components/flashNews/Flashnews";
import License from "../components/License/License";
import Contactus from "../components/ContactUs/ContactUs";
import AnnualReturn from "../components/AnnualReturn/AnnualReturn";
import ChangePassword from "../components/Users/ChangePassword";
const Routers = () => {
  return (
    <>
    
    <Routes>
        <Route path="/" element={<MyLoginPage/>}/>
        <Route path="/login" element={ <Login/>}/>
        <Route path="/signin" element={ <Signin/>}/>
        <Route path="/forgotpassword" element={ <Signin formmode={'FP'}/>}/>
        <Route path="/changepassword" element={ <ChangePassword/>}/>
        <Route path="/editprofile" element={ <ChangePassword formmode={'EP'}/>}/>
        <Route path="/emptypage" element={ <Emptypage/>}/>

        <Route path="/flashnews" element={  <Flashnews/>}/>
        <Route path="/license" element={ <License/>}/>
        <Route path="/annualreturn" element={ <AnnualReturn/>}/>   
        <Route path="/gstr1hsn" element={ <AnnualReturn formmode={'GSTR1HSN'}/>}/>  
        <Route path="/contactus" element={ <Contactus/>}/>     
    </Routes>
        
    </>
  );
};

export default Routers;
