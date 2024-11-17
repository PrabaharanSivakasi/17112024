import React, {  useEffect } from 'react';

import "./emptypage.css";
import { myaction } from "../../src/redux/Mystore"
import { useDispatch } from 'react-redux'
import backgroundImage from "../images/background.png";


const Emptypage = () => {

  const mydispatch = useDispatch()

  function showmenu() {
      mydispatch(myaction.hideMenu(false))
  }

  useEffect(() => {
    showmenu()
  }, [])
  
  
  return (
    <>
    <div className="mypage"
      style={{
          backgroundImage: `url(${backgroundImage})`, // Use the imported image
          backgroundSize: "cover",
          backgroundPosition:"center",
          backgroundRepeat: "no-repeat",
          height: "81vh", // Adjust height as needed
          width: "100%", // Adjust width as needed
      }}
      >

    </div>
    </>
  );
};

export default Emptypage;