import "./License.css";
import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const LicenseForm = () => {
    const usernameRef = useRef();
    const [username, setusername] = useState("");
    const [gstr9license, setgstr9license] = useState(false);
    const [gstr1license, setgstr1license] = useState(false);
    const myNavigate = useNavigate();

    const handleUsernameChange = async (e) => {
        const value = e.target.value;
        setusername(value);
    }
    const handleGSTR9LicenseChange = (e) => {
        const  value = e.target.checked;
        setgstr9license(value);
    };
    const handleGSTR1LicenseChange = (e) => {
        const  value = e.target.checked;
        setgstr1license(value);
    };
  
    const updateLicense = async () => {
        if (username === "") {
            alert("User Name Should be Given");
            return;
        }
        const userdata = {
            username: username
        }
        const res = await axios.post(`${process.env.REACT_APP_RAINBOW_URL}/readbyusername_sqlite`, userdata);
        if (!res.data.length > 0) {
            alert('User Not found ...');
            usernameRef.current.focus();
            usernameRef.current.select();
            return;
        }
        // if (res.data[0].licensed !== "D") {
        //     alert("User Name already Activated...");
        //     usernameRef.current.focus();
        //     usernameRef.current.select();
        //     return;
        // }
        // if (gstr9license === false) {
        //     alert("Activation Not Given...");
        //     usernameRef.current.focus();
        //     usernameRef.current.select();
        //     return;
        // }

        const data = {
            username: username,
            licensed: gstr9license ? 'Y' : 'D',
            licensed2: gstr1license ? 'Y' : 'D',
        }
        console.log(data);
        await axios.post(`${process.env.REACT_APP_RAINBOW_URL}/LicenseUpdated_sqlite`, data);
        setusername('');
        setgstr9license(false);
        setgstr1license(false);
        alert("User : " + username + " activated successfully ....")
        myNavigate(-1)
    }
    const defaultEnterRef = useRef(null);
    const defaultEscapeRef = useRef(null);

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'Enter') {
                defaultEnterRef.current.click();
            }
            if (event.key === 'Escape') {
                defaultEscapeRef.current.click();
            }
        };
        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, []);
    return (
        <div className="licenseform-divmain">
            <div className="licenseform-container">
                <div className="licenseform-inputgroup1">
                    <label htmlFor="username" >Username</label>
                    <input type="text"
                        autoFocus={true}
                        id="username"
                        ref={usernameRef}
                        value={username}
                        onChange={handleUsernameChange}
                        style={{ width: "75%", padding: "5px" }} />
                </div>

                <label htmlFor="license" style={{textDecoration:"underline", color:"green"}}>License</label>
        
                 <div className="licenseform-inputgroup">
                    <label htmlFor="gstr9hsnlicense">GSTR9 HSN (Table 17)</label>
                    <input type="checkbox"
                        id="gstr9hsnlicense"
                        name="gstr9hsnlicense"
                        checked={gstr9license}
                        onChange={handleGSTR9LicenseChange}
                        style={{ marginLeft: "0" }} />

                </div>
                
                <div className="licenseform-inputgroup">
                    <label htmlFor="gstr9hsnlicense">GSTR1 HSN (Table 12)</label>
                    <input type="checkbox"
                        id="gstr1hsnlicense"
                        checked={gstr1license}
                        onChange={handleGSTR1LicenseChange}
                        style={{ marginLeft: "0" }} />

                </div>
            
                <div className="licenseform-btngroup">
                    <button onClick={() => myNavigate(-1)} ref={defaultEscapeRef}>Cancel</button>
                    <button onClick={updateLicense} ref={defaultEnterRef}>Update</button>
                </div>
            </div>
        </div>
    )
}
export default LicenseForm;