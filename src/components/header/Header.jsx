import React from "react";
import "./header.css";
import { BiLogIn } from "react-icons/bi";
import { myaction } from "../../redux/Mystore"
import { useSelector, useDispatch } from 'react-redux'
import profilelogout from "../../assets/logout.png";
import profilehelp from "../../assets/help.png";
import profilesetting from "../../assets/setting.png";
import profileprofile from "../../assets/profile.png";
import { FaUserCircle } from "react-icons/fa";
import { FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const mydispatch = useDispatch()

  const islogged = useSelector((xdata) => {
    return xdata.islogin
  })

  const username = useSelector((xdata) => {
    return xdata.username
  })

  function openloginpage() {
    // mydispatch(myaction.mylogin())
  }

  function openhomepage() {
    mydispatch(myaction.myhome())
  }

  function toggleMenu() {
    console.log("render");
    let subMenu = document.getElementById("subMenu");
    console.log(subMenu);
    subMenu.classList.toggle("display");
    setTimeout(() => {
      subMenu.classList.remove("display");
    }, 5000);

  }

  const xnavigate = useNavigate();
  function mylogout(e) {
    e.preventDefault()
    mydispatch(myaction.myhome())
    // mydispatch( myaction.myprofileoff())

    // localStorage.removeItem('persist:root');

    xnavigate("/")
  }

  // const [username, setusername] = useState(null)
  // let user=localStorage.getItem("username")

  // useEffect(() => {
  //   if (user) {
  //     setusername(user)
  //   }
  // if(user){
  //   if (xvar.__ISADMINLOGIN) {
  //     // alert("admin")
  //     setusername("Admin-Rainbow")
  //   }
  // }

  //}, [user])

  //console.log(username);
  //console.log(user);
  // useEffect(() => {

  //     setusername(user)

  // }, [])

  // const user=localStorage.getItem("username")
  // console.log(user);

  // useEffect(() => {
  //   /
  // }, [username])

  const hideMenu = useSelector((xdata) => {
    return xdata.hidemenu;
  })
  function showmenu(params) {
    xnavigate("/emptypage")
    mydispatch(myaction.hideMenu(false))
  }
  function changepassword(e) {
    e.preventDefault()
    xnavigate("/changepassword")
    mydispatch(myaction.hideMenu(true))
  }
  function editprofile(e) {
    e.preventDefault()
    xnavigate("/editprofile")
    mydispatch(myaction.hideMenu(true))
  }
  return (
    <>
      <div class="navbar-header">
        <div className="navbar-showhide">
          {hideMenu &&
            <FaHome onClick={showmenu} className="navbarHomeicon" />
          }
          <a href="/" class="navbar-logo">
            RAINBOW
          </a>
        </div>

        <div class="navbar-item hide">
          {!islogged && <li onClick={openloginpage}><BiLogIn class="loginicon" />&nbsp; Login</li>}
          {islogged &&
            <div class="profile">
              <div class="user-pic">
                <FaUserCircle onClick={toggleMenu} />
              </div>
              <div id="subMenu">
                <div class="user-info">
                  <h3>{username}</h3>
                </div>

                <a href="/" class="sub-menu-link">
                  <img alt="loading" src={profileprofile} />
                  <p onClick={editprofile}>Edit Profile</p>
                </a>

                <a href="/" class="sub-menu-link">
                  <img alt="loading" src={profilesetting} />
                  <p onClick={changepassword} >Change Password</p>
                </a>

                <a href="/" class="sub-menu-link" >
                  <img alt="loading" src={profilelogout} />
                  <p onClick={mylogout}>Logout</p>
                </a>
              </div>
            </div>
          }
        </div>
      </div>
    </>
  );
};

export default Header;
