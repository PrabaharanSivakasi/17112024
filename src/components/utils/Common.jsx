export const  curdate=(YearIn2Digit=true)=> {
    const today = new Date();
    const _curdate = today.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: YearIn2Digit ? '2-digit' : 'numeric' ,
    });//.replace(/\//g, '-');
    return _curdate;
  }

export const validateDate = (input) => {
    // Regular expression to check format DD/MM/YY
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{2}$/;
    if (!regex.test(input)) return false;

    const [day, month, year] = input.split('/').map(Number);
    const fullYear = 2000 + year; // Assuming year 2000-2099 for two-digit years

    const dateObj = new Date(fullYear, month - 1, day);
    return dateObj.getFullYear() === fullYear && dateObj.getMonth() + 1 === month && dateObj.getDate() === day;
  };


export const toProperCase = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const myTrim = (str,isupper=false) => {
    let newvalue = str;
    if (newvalue===undefined) {
        return '';
    }
    if (newvalue===null){
        return '';
    }
    newvalue=newvalue.trim();
    if (isupper) {
        newvalue = newvalue.toUpperCase();
    }
    return newvalue;
}
export const validatePinCode = (value) => {
    const regex = /^[1-9]{1}[0-9]{5}$/;
    return regex.test(value);
}

export const myInt = (str) => {
    let newvalue = parseInt(str);
    if (newvalue===undefined) {
        return 0;
    }
    if (newvalue===null){
        return 0;
    }
    if (isNaN(newvalue)) {
        return 0;
    }
    newvalue=parseInt(newvalue)
    return newvalue;
}

export const myFloat = (str) => {
    let newvalue = parseFloat(str);
    if (newvalue===undefined) {
        return 0;
    }
    if (newvalue===null){
        return 0;
    }
    if (isNaN(newvalue)) {
        return 0;
    }
    newvalue=parseFloat(newvalue)
    return newvalue;
}

export const validateGSTIN = (value) => {
    const regex = /^([0][1-9]|[1-2][0-9]|3[0-8])[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return regex.test(value);
}
export const calculateGST = (taxableValue, gstPercentage) => {
    const roundToFourDecimals = (value) => { 
        const strValue = parseFloat(value).toFixed(5); 
        const thirdDecimal = parseInt(strValue.split('.')[1][2], 10);  // The 3rd decimal
        
        if (thirdDecimal > 4) {
            value += 0.01;
        }
        
        return parseFloat(parseFloat(value).toFixed(2));
    };
    const totalGST = (taxableValue * gstPercentage) / 100;
    let gstround = roundToFourDecimals(totalGST);
    return  parseFloat(gstround);
};

export const roundOffValue = (value) => {
    const [integerPart, decimalPart] = value.toString().split('.');
    let roundoff = '';
    if (decimalPart && parseInt(decimalPart[0], 10) > 4) {
       roundoff = parseFloat((parseInt(integerPart, 10) + 1 - value).toFixed(2));
        return roundoff;
    }
    roundoff = parseFloat((parseInt(integerPart, 10) - value).toFixed(2));
    return roundoff;
};
