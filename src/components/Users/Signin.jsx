
import "./login.css";
import { FaUser } from "react-icons/fa";
import { RiLockPasswordLine } from "react-icons/ri";
import { SiGnuprivacyguard } from "react-icons/si";
import { MdEmail } from "react-icons/md";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios"

const Signin = ({ formmode = '' }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const [password, setpassword] = useState(false);
  const [confirm, setconfirm] = useState(false);
  const [getinputdata, setgetinputdata] = useState({ uname: "", email: "", password: "", confirm: "", })
  const [inputerror, setinputerror] = useState({ uname: false, email: false, password: false, confirm: false, })

  const usernameRegex = /^[0-9A-Za-z]{6,16}$/;
  const passwordRegex = /^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[!@#$%*_.]).{6,16}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function passwordhandler() {
    setpassword(!password);
  }

  function confirmpasswordhandler() {
    setconfirm(!confirm);
  }

  function getformdata(event) {
    let inputvalue = event.target.value
    let inputname = event.target.name
    setgetinputdata({ ...getinputdata, [inputname]: inputvalue })
    setinputerror({ ...inputerror, [inputname]: false })
  }

  const varNavigate = useNavigate()

  const checkUserExists = async () => {

    let username = getinputdata.uname

    if (username === '') {
      alert("UserName Should Be Given");
      return;
    }


    let email = getinputdata.email;

    if (email === '') {
      alert("Email Should Be Given");
      return;
    }

    if (username !== "") {
      const xusername = getinputdata.uname.toLowerCase()
      if (xusername === "admin") {
        alert("invalid user name")
        return;
      }

      const user = { username: username };
      const res = await axios.post(process.env.REACT_APP_RAINBOW_URL + '/readbyusername_sqlite', user)
      console.log(res);
      if (res.data.length > 0 && formmode !== 'FP') {
        alert("UserName already registered...");
        return;
      }
      if (res.data.length === 0 && formmode === 'FP') {
        alert("UserName Does Not Exists");
        return;
      }
      if (res.data.length > 0 && formmode === 'FP') {
        console.log(getinputdata.email);
        if (res.data[0].email !== getinputdata.email) {
          alert("Email Mismatch With Your UserName");
          return;
        }
        if(res.data[0].password === getinputdata.password){
          alert("Please Create New Password");
          return;
        }

      }
    }

    if ((getinputdata.uname === "") || !(usernameRegex.test(getinputdata.uname))) {
      setinputerror((getmydata) => ({ ...getmydata, uname: true }))
    }
    else if ((getinputdata.email === "") || !(emailRegex.test(getinputdata.email))) {
      setinputerror((getmydata) => ({ ...getmydata, email: true }))
      setinputerror((getmydata) => ({ ...getmydata, uname: false }))
    }
    else if ((getinputdata.password === "") || !(passwordRegex.test(getinputdata.password))) {
      setinputerror((getmydata) => ({ ...getmydata, password: true }))
      setinputerror((getmydata) => ({ ...getmydata, email: false }))
    }
    else if (getinputdata.confirm === "" || getinputdata.confirm !== getinputdata.password) {
      setinputerror((getmydata) => ({ ...getmydata, confirm: true }))
      setinputerror((getmydata) => ({ ...getmydata, password: false }))
    }
    else {
      runAPI()
    }
  };

  function formloginhandler() {
    varNavigate("/login")
  }

  async function runAPI() {

    try {
      const logindata = {
        username: getinputdata.uname,
        email: getinputdata.email,
        password: getinputdata.password
      }
      let url = "http://localhost:5000/create_sqlite";
      if(formmode=== 'FP'){
        url = "http://localhost:5000/update_sqlite";
      }
      await axios.post(url, logindata)
        .then((res) => {
          alert(formmode==='FP' ? "Successfully Updated" : "Successfully Registered");
          varNavigate("/login")
        })
        .catch((error) => {
          console.log(error)
        });
    }
    catch {

    }
  }


  return (
    <>
      <div className="Container">

        <div className="ContainerInner">

          <div className="innerrightsignin">

            <div className="headicon">
              <h3><span><SiGnuprivacyguard className="signupicon" /></span></h3>
            </div>

            <div className="inputfileds">

              <div className="inputs ">
                <label className="required">Username</label>
                <p>
                  <span><FaUser className="inputicon" /></span>
                  <input ref={inputRef} type="text" name="uname" onChange={getformdata} maxLength={16} />
                </p>
                {inputerror.uname && <h5>Enter Username (having Minimum 6 Chars. and Maximum of 16 Chars.)</h5>}
              </div>

              <div className="inputs">
                <label className="required">Email</label>
                <p>
                  <span><MdEmail className="inputicon" /></span>
                  <input type="text" name="email" onChange={getformdata} />
                </p>
                {inputerror.email && <h5>Enter Email Address</h5>}
              </div>

              <div className="inputs">
                <label className="required">Password</label>
                <p>
                  <span><RiLockPasswordLine className="inputicon" /></span>
                  <input type={password ? "text" : "password"} name="password" maxLength={16} onChange={getformdata} />
                  {password ? (
                    <FaRegEye onClick={passwordhandler} className="eye" />
                  ) : (
                    <FaRegEyeSlash onClick={passwordhandler} className="eye" />
                  )}
                </p>
                {inputerror.password && <h5>Enter Password (having Minimum 6 Chars. and Maximum of 16 Chars., Must have one upperCase,one lowerCase,one Number and one Special Symbol [!@#$%*_.]) </h5>}
              </div>

              <div className="inputs">
                <label className="required">Confirm Password</label>
                <p>
                  <span><RiLockPasswordLine className="inputicon" /></span>
                  <input type={confirm ? "text" : "password"} name="confirm" onChange={getformdata} />
                  {confirm ? (
                    <FaRegEye onClick={confirmpasswordhandler} className="eye" />
                  ) : (
                    <FaRegEyeSlash onClick={confirmpasswordhandler} className="eye" />
                  )}
                </p>
                {inputerror.confirm && <h5>Enter Confirm password</h5>}
              </div>

            </div>

            <div className="btn">
              <button onClick={formloginhandler}>
                <span>Login</span>
              </button>
              <button onClick={() => checkUserExists()}>
                <span>{formmode === 'FP' ? 'Update' : 'Add User'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </>
  );
};

export default Signin;