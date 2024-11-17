import React from "react";
import "./Navbar.css";
import { FaHome, FaNewspaper } from "react-icons/fa";
import { Link, } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import { myaction } from "../../redux/Mystore";

const Navbar = () => {

  let hideMenu = useSelector((xdata) => {
    return xdata.hidemenu;
  })

  const isadmin = useSelector((xdata) => {
    return xdata.isAdmin;
  })


  const mydispatch = useDispatch()

  function sethidemenu(params) {
    mydispatch(myaction.hideMenu(true))
  }

  return (
    <>
      <div class={hideMenu ? "navbar-hide" : "navbar"}>
        <ul class="navbar-item hide">

          <li class="active"><FaHome />&nbsp; Home</li>


          <Link to="/annualreturn" className="linkcom" onClick={sethidemenu}>
            <li>GSTR9 HSN</li>
          </Link>
          
          <Link to="/gstr1hsn" className="linkcom" onClick={sethidemenu}>
            <li>GSTR1 HSN</li>
          </Link>

          {isadmin &&
            <Link to="/license" className="linkcom" onClick={sethidemenu}>
              <li> Activation</li>
            </Link>
          }
          {isadmin &&
            <Link to="/flashnews" className="linkcom" onClick={sethidemenu}>
              <li><FaNewspaper />&nbsp; Flash News</li>
            </Link>
          }
           <Link to="/contactus" className="linkcom" onClick={sethidemenu}>
            <li>Contact Us</li>
          </Link>
        </ul>
      </div>
    </>
  );
};

export default Navbar;
