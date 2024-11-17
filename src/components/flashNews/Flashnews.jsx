import React, { useState,useEffect,useRef } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import "./flash.css"

const Flashnews = () => {
  
  const [xvalue, setCurrentValue] = useState('');
  const xkey="FlashNews";
  const xsection="Settings";
  const myNavigate=useNavigate()

  const firstinputRef = useRef(null)
  

  useEffect(() => {
    firstinputRef.current.focus();
  }, []);

  const defaultEnterRef=useRef(null)
  const defaultEscapeRef=useRef(null)

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

  
  const updateConfigValue = async (event) => {
    event.preventDefault();
    try {
      const data={ xsection,xkey,xvalue };
      console.log(data);
      await axios.post(process.env.PUBLIC_RAINBOW_URL + '/updateconfigINI', data );
    } catch (error) {
      console.error('Error updating config value:', error);
    }
    myNavigate( "/emptypage")
    return;
  };

  const handleInputChange = (event) => {
    const value = event.target.value.trim();
      setCurrentValue(value);
  };

  return (
    <>
    <div className="mypageflashnews">
    <div className='mypagewindow'>
    <div className='popop'>
      <h1>Flash News</h1>
      <div className='pop1'>
        <textarea name="" id="" cols="30" rows="10"
          ref={ firstinputRef }
          onChange={handleInputChange}
          placeholder="Enter new value..."></textarea>
        <div className="pop11">
          <button onClick={() => myNavigate("/emptypage") }  ref= { defaultEscapeRef } >Go back</button>
          <button onClick={updateConfigValue} ref= { defaultEnterRef }>Update</button>
        </div>
      </div>
    </div>
    </div>
    </div>
    </>
  );
};

export default Flashnews;