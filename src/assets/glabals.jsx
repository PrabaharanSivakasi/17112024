const fs=require("fs");

export let __ISADMINLOGIN = false;

export const setGlobalVar__ISADMINLOGIN = (newValue) => {
  __ISADMINLOGIN = newValue;
};

export const getGlobalVar__ISADMINLOGIN = () => {
  return __ISADMINLOGIN;
};


export const saveConfig = (jsonData) => {
  const filePath="public/rainbow/config.json"
  const jsonString = JSON.stringify(jsonData,null,2);
  fs.writeFile(filePath,jsonString,(err) => {
    if (err) {
      console.error("Error while writing JSON to file",err)
    } else { 
      console.log("File successfully update...")
    }
  });
};
