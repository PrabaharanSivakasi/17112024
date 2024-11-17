import "./ContactUs.css";
import { useNavigate } from 'react-router-dom';
import { AiOutlineClose } from 'react-icons/ai';

const Contactform = () => {

    const myNavigate = useNavigate();

    return (
        <div className="contactform-divmain">
            <div className="contactform-container">
                <AiOutlineClose size={20} style={{ position:"absolute",top:"2%",right:"1%",backgroundColor:"red", color: "white" }} onClick={() => myNavigate("/emptypage")} />
                <div className="contact-info">
                    <h3 style={{color:"rgb(248, 0, 128)"}}>ANBU COMPUTERS</h3>
                    <h6>#12, GUZHANTHAIVEL COMPLEX</h6>
                    <h6>OPP. ANNAI HOSPITAL</h6>
                    <h4 style={{color:"rgb(248, 0, 128)"}}>SIVAKASI - 626123</h4>
                    <h6>VIRUDHUNAGAR DISTRICT</h6>
                    <h6>TAMILNADU</h6>
                    <h4 style={{color:"rgb(248, 0, 128)"}}>EMAIL: anbucomputers1998@gmail.com</h4>
                    <h4 style={{color:"rgb(248, 0, 128)"}}>MOBILE: 9442774929</h4>
                </div>
            </div>
        </div>
    )
}
export default Contactform;