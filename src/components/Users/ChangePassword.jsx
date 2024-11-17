
import "./login.css";
import { RiLockPasswordLine } from "react-icons/ri";
import { SiGnuprivacyguard } from "react-icons/si";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { useSelector, useDispatch } from 'react-redux';
import { myaction } from "../../redux/Mystore";

const Signin = ({ formmode = '' }) => {
    let email = '';
    const mydispatch = useDispatch();
    const [oldpassword, setoldpassword] = useState(false);
    const [password, setpassword] = useState(false);
    const [confirm, setconfirm] = useState(false);
    const [getinputdata, setgetinputdata] = useState({ oldpassword: "", password: "", confirm: "", })
    const [inputerror, setinputerror] = useState({ oldpassword: false, password: false, confirm: false, })

    const passwordRegex = /^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[!@#$%*_.]).{6,16}$/;
    const username = useSelector((xdata) => {
        return xdata.username
    })

    function oldpasswordhandler() {
        setoldpassword(!oldpassword);
    }

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

        let oldpassword = getinputdata.oldpassword;

        if (oldpassword === '') {
            alert("Old Password Should Be Given");
            return;
        }

        const user = { username: username };
        const res = await axios.post(process.env.REACT_APP_RAINBOW_URL + '/readbyusername_sqlite', user)
        console.log(res);
        email = res.data[0].email;

        if (res.data[0].password !== getinputdata.oldpassword) {
            alert("Incorrect Old Password");
            return;
        }
        if (getinputdata.oldpassword === getinputdata.password) {
            alert("Same Password Given. Please Create New Password");
            return;
        }
        if ((getinputdata.password === "") || !(passwordRegex.test(getinputdata.password))) {
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
    }

    function formcancelhandler() {
        varNavigate("/emptypage");
    }

    async function runAPI() {

        try {
            const logindata = {
                username: username,
                email: email,
                password: getinputdata.password
            }
            await axios.post("http://localhost:5000/update_sqlite", logindata)
                .then((res) => {
                    alert("Successfully Updated");
                    mydispatch(myaction.myhome());
                    varNavigate("/");
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
            <div className="Changepassword-Container">

                <div className="ContainerInner">

                    <div className="innerrightsignin">

                        <div className="headicon">
                            <h3><span><SiGnuprivacyguard className="signupicon" /></span></h3>
                        </div>

                        <div className="inputfileds">

                            <div className="inputs">
                                <label className="required">Old Password</label>
                                <p>
                                    <span><RiLockPasswordLine className="inputicon" /></span>
                                    <input type={oldpassword ? "text" : "password"} name="oldpassword" maxLength={16} onChange={getformdata} />
                                    {oldpassword ? (
                                        <FaRegEye onClick={oldpasswordhandler} className="eye" />
                                    ) : (
                                        <FaRegEyeSlash onClick={oldpasswordhandler} className="eye" />
                                    )}
                                </p>
                                {inputerror.oldpassword && <h5>Enter Old Password  </h5>}
                            </div>

                            <div className="inputs">
                                <label className="required"> New Password</label>
                                <p>
                                    <span><RiLockPasswordLine className="inputicon" /></span>
                                    <input type={password ? "text" : "password"} name="password" maxLength={16} onChange={getformdata} />
                                    {password ? (
                                        <FaRegEye onClick={passwordhandler} className="eye" />
                                    ) : (
                                        <FaRegEyeSlash onClick={passwordhandler} className="eye" />
                                    )}
                                </p>
                                {inputerror.password && <h5>Enter New Password (having Minimum 6 Chars. and Maximum of 16 Chars., Must have one upperCase,one lowerCase,one Number and one Special Symbol [!@#$%*_.]) </h5>}
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
                                {inputerror.confirm && <h5>Enter Confirm password or Password and Confirm Password Not Matched</h5>}
                            </div>

                        </div>

                        <div className="btn">
                            <button onClick={formcancelhandler}>
                                <span>Cancel</span>
                            </button>
                            <button onClick={() => checkUserExists()}>
                                <span>Update</span>
                            </button>
                        </div>

                    </div>

                </div>

            </div>

        </>
    );
};

export default Signin;