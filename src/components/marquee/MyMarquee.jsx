import React from 'react';
import Marquee from 'react-fast-marquee';
import "./mymarquee.css";
import { FaRegBell } from "react-icons/fa";
import { useState,useEffect } from 'react'; 
import axios from "axios";

const MyMarquee = () => {

    const [xvalue, setCurrentValue] = useState('');
    const xkey="FlashNews";
    const xsection="Settings";
  
    const fetchConfigValue = async () => {
      try {
        const data={ xsection,xkey };
        const response = await axios.post(process.env.PUBLIC_RAINBOW_URL + '/readconfigINI', data );
        setCurrentValue(response.data.value);
      } catch (error) {
        console.error('Error fetching config value:', error);
      }
    };

    useEffect(() => {
        fetchConfigValue();
    },[]);
    

    return (
        <>
            <div className='mymarquee' >
                <FaRegBell className='bellicon'/> &nbsp; &nbsp;
                <Marquee velocity={25}>
                    <h3>{xvalue}</h3>
                </Marquee>
            </div>
        </>
    );
};

export default MyMarquee;