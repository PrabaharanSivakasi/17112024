
import React from 'react'
import "./login.css"
import { RiLockPasswordLine } from "react-icons/ri";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser } from "react-icons/fa6";
import { useSelector, useDispatch } from 'react-redux'
import { myaction } from "../../redux/Mystore"
import frmCaptchaBackGroundImage from '../../assets/recaptcha.jpeg'; // Add your own image here
import { AiOutlineSync } from "react-icons/ai";
import axios from "axios"

const Login = (isLogin) => {
  const [captchaText, setCaptchaText] = useState(generateCaptchaText());
  const [inputCaptchaValue, setInputCaptchaValue] = useState('');
  function generateCaptchaText() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  const regenerateCaptcha = () => {
    setCaptchaText(generateCaptchaText());
    logincaptchainputRef.current.focus();
  };

  const handleInputCaptchaChange = (e) => {
    setInputCaptchaValue(e.target.value);
  };

  const mydispatch = useDispatch()

  const [password, setpassword] = useState(false)

  const usernameRef = useRef(null)
  const passwordRef = useRef(null)
  const logincaptchainputRef = useRef(null)

  const islogged = useSelector((xdata) => {
    return xdata.islogin
  })

  useEffect(() => {
    usernameRef.current.focus();
  }, []);

  function passwordhandler() {
    setpassword(!password)
  }

  const formhandler = async (e) => {

    e.preventDefault();

    const username = usernameRef.current.value;
    const password = passwordRef.current.value;

    mydispatch(myaction.hideMenu(false))
    mydispatch(myaction.myisAdmin(false))

    const xusername = username.toLowerCase()
    const xpassword = password.toLowerCase()

    if (xusername === "admin" && xpassword === "password") {
      if (captchaText !== inputCaptchaValue) {
        alert("Invalid Captcha");
        logincaptchainputRef.current.focus();
        return;
      }
      mydispatch(myaction.myisAdmin(true))
      mydispatch(myaction.myuser(username))
      mydispatch(myaction.myuserid(0))
      mydispatch(myaction.mylicense("A"))
      alert("Successfully Login!");
      varNavigate("/emptypage")
      return;
    }

    if (username === "") {
      alert("UserName Shoule be given");
      return
    }

    if (password === "") {
      alert("Password Shoule be given");
      return
    }
    if (captchaText !== inputCaptchaValue) {
      alert("Invalid Captcha");
      logincaptchainputRef.current.focus();
      return
    }

    const user = {
      username: xusername,
      password: password
    }

    try {
      const response = await axios.post(process.env.REACT_APP_RAINBOW_URL + '/readuser_sqlite', user);
      console.log(response);
      if (response.data.length > 0) {
        alert("Successfully Login!");
        mydispatch(myaction.mylogin())
        mydispatch(myaction.myuser(username))
        mydispatch(myaction.myuserid(response.data[0].userid))
        mydispatch(myaction.mylicense(response.data[0].licensed))
        varNavigate("/emptypage")
        return;
      }
      else {
        alert("UserName Not found ...");
        return;
      }

    }
    catch (error) {
      alert("UserName Not found ...");
    }
  };

  const varNavigate = useNavigate()

  useEffect(() => {
    if (islogged) {
      varNavigate("/emptypage")
    }
  }, []);

  function formsigninhandler() {
    varNavigate("/signin")
  }

  function formForgotPasswordhandler() {
    varNavigate("/forgotpassword")
  }

  const defaultEnterRef = useRef(null)
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter') {
        defaultEnterRef.current.click();
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);


  return (
    <>
      <div className='Container loginform' >
        <div className='ContainerInner'>
          <div className='innerright'>
            <div className='headicon'>
              <h3>
                <span><FaUser className='signupicon' /></span>
              </h3>
            </div>

            <div className='inputfileds'>
              <div className='inputs'>
                <label className="required">Username</label>
                <p>
                  <span><FaUser className='inputicon' /></span>
                  <input ref={usernameRef} type="text" name="username" />
                </p>
              </div>

              <div className='inputs'>
                <label className="required">Password</label>
                <p>
                  <span><RiLockPasswordLine className='inputicon' /></span>
                  <input type={password ? "text" : "password"} ref={passwordRef} name="password" />
                  {password ? <FaRegEye onClick={passwordhandler} className='eye' /> : <FaRegEyeSlash onClick={passwordhandler} className='eye' />}
                </p>
              </div>

              <div className='inputs login-captcha-userinput'>
                <h4>Enter Captcha</h4>
                <p>
                  <input
                    maxLength={6}
                    type="text"
                    value={inputCaptchaValue}
                    onChange={handleInputCaptchaChange}
                    ref={logincaptchainputRef}
                  />
                </p>
              </div>
            </div>

            <div className='login-captcha'>
              <div className='login-captcha-inner'>
                <div className='login-captcha-row'>
                  <div className="login-captcha-image">
                    <img src={frmCaptchaBackGroundImage} alt="background" className="login-captcha-background" />
                    <div className="login-captcha-text">{captchaText}</div>
                  </div>
                  <span><AiOutlineSync className='login-captcha-refresh-icon' onClick={regenerateCaptcha} /></span>
                </div>
              </div>
            </div>

            <div className='btn'>
              <button onClick={formsigninhandler}><span>New User</span></button>
              <button onClick={formhandler} ref={defaultEnterRef}><span>Login</span></button>
            </div>
            <div className='forgotpassword '>
              <div>
                <p onClick={formForgotPasswordhandler}>Forgot Password?</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;