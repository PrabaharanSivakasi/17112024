import React, { useState, useEffect } from 'react';
import "./Footer.css";

const Footer = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array to run the effect only once when the component mounts

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString();
  };


  return (
    <>
      <div className='footer12'>
        <div class="footer">
        <div className='footer2'>
        <div className='footer13'> 
        <p>{formatDate(currentDateTime)}</p>
          <p>Time: {formatTime(currentDateTime)}</p>
          </div>
          <p>{ window.CopyRightCode } Anbu Computers, Sivakasi</p>
          <p>Supported by Code Purple Academy</p>
        </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
