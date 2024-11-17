import React, { useState, useEffect, useRef, useCallback } from 'react';
import './AnnualReturn.css';
import InputMask from 'react-input-mask';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { NumericFormat } from 'react-number-format';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { AiOutlineClose } from 'react-icons/ai';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import { calculateGST } from '../utils/Common';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from 'react-redux';

const AgeGridForm = ({ formmode = '' }) => {
    const gt = 0;
    const cur_gt = 0;

    const username = useSelector(function (data) {
        return data.username;
    })
    const [licensed, setlicensed] = useState([]);
    useEffect(() => {
        window.document.getElementById("gstin").focus();
        readlicense();

    }, []);
    const readlicense = async () => {
        let array = [];
        try {
            const user = {
                username: username
            }
            const response = await axios.post(process.env.REACT_APP_RAINBOW_URL + '/readbyusername_sqlite', user);
            if (response.data.length > 0) {
                array.push(response.data[0].licensed, response.data[0].licensed_gstr1hsn, response.data[0].licensed_gstr1json_excel)
                setlicensed(array);
                return;
            }
        }
        catch (error) {
            console.log("UserName Not found ...", error);
        }
    }

    const navigate = useNavigate();
    const differenceamount = 10;
    const gstrate = [0, 1, 5, 6, 12, 18, 28];
    const gridRef = useRef();
    const [gstin, setgstin] = useState('');
    const [gstcess, setgstcess] = useState(false);
    const [checkportal, setCheckPortal] = useState(false);
    const [validation, setValidation] = useState(false);
    const [hsndigit, sethsndigit] = useState(4);

    const currentYear = new Date().getFullYear();
    const currentmonth = new Date().getMonth();
    const startYear = 2017;
    const year = currentYear - startYear - (currentmonth > 2 ? 0 : 1);
    const [yearOptions, setYearOptions] = useState([]);
    const month = ['APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR'];
    const [monthOptions, setMonthOptions] = useState(month);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(monthOptions[0]);
    const excelInputRef = useRef();
    const jsonInputRef = useRef();
    const errorInputRef = useRef();

    const gstuqc = ["BAG BAGS", "BAL BALE", "BDL BUNDLES", "BKL BUCKLES", "BOU BILLION OF UNITS", "BOX BOX",
        "BTL BOTTLES", "BUN BUNCHES", "CAN CANS", "CBM CUBIC METERS", "CCM CUBIC CENTIMETERS",
        "CMS CENTIMETERS", "CTN CARTONS", "DOZ DOZENS", "DRM DRUMS", "GGK GREAT GROSS",
        "GMS GRAMMES", "GRS GROSS", "GYD GROSS YARDS", "KGS KILOGRAMS", "KLR KILOLITRE",
        "KME KILOMETRE", "LTR LITRES", "MLT MILILITRE", "MTR METERS", "MTS METRIC TON",
        "NOS NUMBERS", "OTH OTHERS", "PAC PACKS", "PCS PIECES", "PRS PAIRS", "QTL QUINTAL",
        "ROL ROLLS", "SET SETS", "SQF SQUARE FEET", "SQM SQUARE METERS", "SQY SQUARE YARDS",
        "TBS TABLETS", "TGM TEN GROSS", "THD THOUSANDS", "TON TONNES", "TUB TUBES", "UGS US GALLONS",
        "UNT UNITS", "YDS YARDS"]

    const gstuqclist = gstuqc.map(item => item.substring(0, 3));

    const errors = [
        { code: 1, value: 'Error HSN Length' },
        { code: 2, value: 'Invalid HSN' },
        { code: 3, value: 'CGST and SGST are not same' },
        { code: 4, value: 'Invalid Taxrate' },
        { code: 5, value: 'Difference of Taxable value and Sum of IGST, CGST, SGST is greater than Rs.10' },
        { code: 6, value: 'Invalid UQC' },
        { code: 7, value: 'Calculated IGST Value is Wrong!' },
        { code: 8, value: 'Qty Should Be Given' },
        { code: 9, value: 'Taxable Value Should Be Given' },
    ];
    const monthMap = {
        APR: '04', MAY: '05', JUN: '06', JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12', JAN: '01', FEB: "02", MAR: '03'
    }
    useEffect(() => {
        let options = [];
        if ((licensed[0] !== 'D' && formmode !== 'GSTR1HSN') || (licensed[1] !== 'D' && formmode === 'GSTR1HSN')) {
            if(formmode === 'GSTR1HSN'){
                options.push(`${currentYear}-${currentYear+1}`)
            }
            for (let i = year; i > 0; i--) {
                const startingYear = startYear + i - 1;
                const endYear = (startingYear + 1).toString();
                options.push(`${startingYear}-${endYear}`);
            }
           
        }
        else {
            options.push("2021-2022");
        }
        setYearOptions(options);
        setSelectedYear(options[0]);
    }, [licensed, formmode, year])



    useEffect(() => {
        if (selectedYear) {
            let montharray = [];
            for (let i = 0; i <= 8; i++) {
                montharray.push(month[i] + '-' + selectedYear.substring(0, 4));
            }
            for (let i = 9; i <= 11; i++) {
                montharray.push(month[i] + '-' + selectedYear.substring(5, 9));
            }
            setMonthOptions(montharray);
            setSelectedMonth(montharray[0]);
        }
    }, [selectedYear])



    const [hsnJsonData, setHSNJsonData] = useState([]);
    const fetchHSNdata = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_RAINBOW_URL}/HSNJson_read`);
            setHSNJsonData(response.data);
        } catch (error) {
            console.error('There was an error fetching the data!', error);
        }
    };

    useEffect(() => {
        fetchHSNdata();
    }, [validation]);

    const [columnSettings, setColumnSettings] = useState({
        hsn_sc: 'A',
        qty: 'B',
        uqc: 'C',
        rt: 'D',
        txval: 'E',
        iamt: 'F',
        camt: 'G',
        samt: 'H',
        csamt: 'I',
        startingRow: 5,
    });
    const [existingData, setExistingData] = useState([]);
    const resetobj = {
        num: '', hsn_sc: '', qty: '', uqc: 'NOS', rt: 0, txval: 0, iamt: 0, camt: 0, samt: 0, csamt: 0, errorcode: 'To Be Checked'
    }
    const [updatingData, setUpdatingData] = useState(resetobj);
    const [selectedRow, setSelectedRow] = useState(null);
    const [curmode, setcurmode] = useState('');
    const handleAdd = () => {

        setcurmode("New");
        setTimeout(() => {
            window.document.getElementById("hsn").focus();
        }, 200);
        const nextsrl = existingData.length - 1;
        setUpdatingData({ ...resetobj, num: existingData.length > 0 ? existingData[nextsrl].num + 1 : 1 });
        setSelectedRow(null);
        setIsUpdateModalOpen(true);
    };

    const handleEdit = useCallback((row) => {
        setValidation(false);
        setTimeout(() => {
            window.document.getElementById("hsn").select();
            window.document.getElementById("hsn").focus();
        }, 100);
        setcurmode("Edit");
        const isUqcValid = gstuqc.some(item => item.substring(0, 3) === row.uqc);
        const isRtValid = gstrate.includes(row.rt);
        setUpdatingData(isUqcValid && isRtValid ? row : {
            ...row,
            uqc: isUqcValid ? row.uqc : '',
            rt: isRtValid ? row.rt : ''
        }
        );
        setSelectedRow(row.num);
        setIsUpdateModalOpen(true);
    }, []);

    const handleCancel = () => {
        setIsUpdateModalOpen(false);
        setUpdatingData(resetobj);
    }

    const updatingerrorcode = (error) => {
        setUpdatingData((prevFormdata) => ({
            ...prevFormdata,
            errorcode: error
        }));
    }
    const handleSave = () => {
        setValidation(false);
        const igst = isNaN(updatingData.iamt) ? 0 : updatingData.iamt;
        const cgst = isNaN(updatingData.camt) ? 0 : updatingData.camt;
        const sgst = isNaN(updatingData.samt) ? 0 : updatingData.samt;
        if (updatingData.hsn_sc.length < 4 || updatingData.hsn_sc.length === 5 ||
            updatingData.hsn_sc.length === 7 || updatingData.hsn_sc.length < hsndigit) {
            updatingerrorcode(errors[0].value);
            alert(errors[0].value);
            window.document.getElementById("hsn").select();
            window.document.getElementById("hsn").focus();
            return;
        }
        // const foundHSN = hsnJsonData.HSN_SAC.find(item => item["HSN Code"] === Number(updatingData.hsn_sc));
        // if (!foundHSN) {
        //     updatingerrorcode(errors[1].value);
        //     alert(errors[1].value);
        //     window.document.getElementById("hsn").select();
        //     window.document.getElementById("hsn").focus();
        //     return;
        // }
        const isValidUQC = gstuqc.includes(updatingData.uqc) || gstuqclist.some(prefix => updatingData.uqc.startsWith(prefix));
        if (!isValidUQC && updatingData.qty > 0) {
            updatingerrorcode(errors[5].value);
            alert(errors[5].value)
            window.document.getElementById("uqc").focus();
            return; // Add error code
        }
        if (!updatingData.qty > 0 && updatingData.hsn_sc.substring(0, 2) !== '99') {
            updatingerrorcode(errors[7].value);
            alert(errors[7].value)
            window.document.getElementById("qty").focus();
            return;
        }
        if (!gstrate.includes(updatingData.rt)) {
            updatingerrorcode(errors[3].value);
            alert(errors[3].value)
            window.document.getElementById("rt").focus();
            return;
        }
        if (!updatingData.txval > 0) {
            updatingerrorcode(errors[8].value);
            alert(errors[8].value)
            window.document.getElementById("txval").focus();
            return;
        }
        const taxvalue = isNaN(updatingData.txval) ? 0 : updatingData.txval;
        const value = calculateGST(taxvalue, updatingData.rt);
        const total = cgst + sgst + igst;
        const difference = Math.abs(total - value);
        if (difference >= differenceamount) {
            updatingerrorcode(errors[4].value);
            alert(errors[4].value);
            window.document.getElementById("txval").select();
            window.document.getElementById("txval").focus();
            return;
        }
        if (cgst !== sgst) {
            updatingerrorcode(errors[2].value);
            alert(errors[2].value);
            window.document.getElementById("camt").select();
            window.document.getElementById("camt").focus();
            return;
        }
        if (curmode === 'New') {
            setExistingData([...existingData, updatingData]);
            setUpdatingData({ ...resetobj, num: updatingData.num + 1, hsn_sc: updatingData.hsn_sc, uqc: updatingData.uqc, rt: updatingData.rt });
            window.document.getElementById("hsn").select();
            window.document.getElementById("hsn").focus();
        } else {
            const data = existingData.map(row => (row.num === selectedRow ? updatingData : row));
            setExistingData(data);
            setUpdatingData(resetobj);
            setIsUpdateModalOpen(false);
        }
        setSelectedRow(null);
    };


    const handleDelete = useCallback((row) => {
        setSelectedRow(row.num);
        Swal.fire({
            title: `Are you sure to Remove the Data of Srl. No ${row.num}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.isConfirmed) {
                setExistingData((prevData) => prevData.filter((rows) => rows.num !== row.num));
            }
        });
    }, []);

    const handleValueChange = ({ name, value }) => {
        setUpdatingData((prevFormdata) => ({
            ...prevFormdata,
            [name]: value,
            errorcode: 'To Be Checked'
        }));
        if (name === 'camt') {
            setUpdatingData((prevFormdata) => ({
                ...prevFormdata,
                samt: value,
                errorcode: 'To Be Checked'
            }));
        }

    };

    const handleReplaceChange = (values) => {
        const { value } = values;
        setReplaceValue(value);
    }

    const handleRTChange = (e) => {
        const { name, value } = e.target;
        setUpdatingData((prevFormdata) => ({
            ...prevFormdata,
            [name]: name === 'rt' ? parseFloat(value) : value,
            errorcode: 'To Be Checked'
        }));
    }

    const CustomTooltip = (props) => {
        return (
            <div style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '5px', borderRadius: '4px' }}>
                <strong>Details:</strong>
                <div>{props.value}</div>
                {props.data && props.data.errorcode && (
                    <div style={{ color: 'red' }}>Error: {props.data.errorcode}</div>
                )}
            </div>
        );
    };

    const [columnDefs] = useState([
        {
            headerName: 'Srl.',
            field: 'num',
            editable: false, headerClass: 'custom-header', cellStyle: { overflow: 'hidden', textAlign: 'right', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: '1px solid #ccc', paddingLeft: '5px', paddingRight: '5px' },
            flex: 0.5,
            tooltipComponent: CustomTooltip,
            tooltipComponentParams: (params) =>
            ({
                data: params.data
            })
        },
        { headerName: 'HSN/SAC', headerClass: 'custom-header', field: 'hsn_sc', editable: false, cellStyle: { overflow: 'hidden', textAlign: 'left', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: '1px solid #ccc', paddingLeft: '5px', paddingRight: '5px' }, flex: 0.9 },
        {
            headerName: 'Qty', headerClass: 'custom-header', field: 'qty', editable: false, cellStyle: { overflow: 'hidden', textAlign: 'right', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: '1px solid #ccc', paddingLeft: '5px', paddingRight: '5px' }, flex: 0.9,
            valueFormatter: (params) => {
                if (params.node.rowPinned) {
                    // Return the raw value for pinned rows without applying toFixed(2)
                    return "(" + String(params.value) + ")";
                }
                const value = parseFloat(params.value);
                if (!isNaN(value)) {
                    return value.toFixed(2);
                } else {
                    return parseFloat(0.00);
                }
            }
        },
        { headerName: 'UQC', headerClass: 'custom-header', field: 'uqc', editable: false, cellStyle: { overflow: 'hidden', textAlign: 'left', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: '1px solid #ccc', paddingLeft: '5px', paddingRight: '5px' }, flex: 0.6 },
        { headerName: 'TAX(%)', headerClass: 'custom-header', field: 'rt', editable: false, cellStyle: { overflow: 'hidden', textAlign: 'right', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: '1px solid #ccc', paddingLeft: '5px', paddingRight: '5px' }, flex: 0.5 },
        {
            headerName: 'Taxable Value', headerClass: 'custom-header', field: 'txval', editable: false, flex: 1.3, cellStyle: { overflow: 'hidden', textAlign: 'right', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: '1px solid #ccc', paddingLeft: '5px', paddingRight: '5px' },
            valueFormatter: (params) => {
                const value = parseFloat(params.value);
                if (!isNaN(value)) {
                    return value.toFixed(2);
                } else {
                    return parseFloat(0.00);
                }
            }
        },
        {
            headerName: 'IGST', headerClass: 'custom-header', field: 'iamt', editable: false, flex: 1, cellStyle: { overflow: 'hidden', textAlign: 'right', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: '1px solid #ccc', paddingLeft: '5px', paddingRight: '5px' },
            valueFormatter: (params) => {
                const value = parseFloat(params.value);
                if (!isNaN(value)) {
                    return value.toFixed(2);
                } else {
                    return parseFloat(0.00);
                }
            }
        },
        {
            headerName: 'CGST', headerClass: 'custom-header', field: 'camt', editable: false, flex: 1, cellStyle: { overflow: 'hidden', textAlign: 'right', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: '1px solid #ccc', paddingLeft: '5px', paddingRight: '5px' },
            valueFormatter: (params) => {
                const value = parseFloat(params.value);
                if (!isNaN(value)) {
                    return value.toFixed(2);
                } else {
                    return parseFloat(0.00);
                }
            }
        },
        {
            headerName: 'SGST', headerClass: 'custom-header', field: 'samt', editable: false, flex: 1, cellStyle: { overflow: 'hidden', textAlign: 'right', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: '1px solid #ccc', paddingLeft: '5px', paddingRight: '5px' },
            valueFormatter: (params) => {
                const value = parseFloat(params.value);
                if (!isNaN(value)) {
                    return value.toFixed(2);
                } else {
                    return parseFloat(0.00);
                }
            }
        },
        {
            headerName: 'CESS', headerClass: 'custom-header', field: 'csamt', editable: false, flex: 0.8, cellStyle: { overflow: 'hidden', textAlign: 'right', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRight: '1px solid #ccc', paddingLeft: '5px', paddingRight: '5px' },
            valueFormatter: (params) => {
                const value = parseFloat(params.value);
                if (!isNaN(value)) {
                    return value.toFixed(2);
                } else {
                    return parseFloat(0.00);
                }
            }
        },
        {
            headerName: 'Error', headerClass: 'custom-header', field: 'errorcode', editable: false, flex: 1, cellStyle: params => ({
                overflow: 'hidden',
                textAlign: 'left',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                borderRight: '1px solid #ccc',
                paddingLeft: '5px',
                paddingRight: '5px',
                color: params.value === 'Valid' ? 'green' :
                    params.value === 'To Be Checked' ? 'blue' : 'red'
            }),
        },
        {
            headerName: 'Actions',
            headerClass: 'custom-header',
            field: 'actions',
            cellRenderer: (params) => {
                if (params.node.rowPinned) {
                    return '';
                }
                return <div className="col-action-div action-cell">
                    <button onClick={() => handleEdit(params.data)}>Edit</button>
                    <button onClick={() => handleDelete(params.data)}>Delete</button>
                </div>
            },
            flex: 1,
        }
    ]);

    const handleYearChange = (e) => {
        const value = e.target.value;
        setSelectedYear(value);
    }

    const handleMonthChange = (e) => {
        const value = e.target.value;
        setSelectedMonth(value);
    }

    const handleImportHSN = async (event) => {
        setValidation(false);
        const files = event.target.files;
        let mergedHSNData = [...existingData];
        if (mergedHSNData.length > 0) {
            const result = await Swal.fire({
                title: 'Are you sure to Clear Existing Data?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
            });

            if (result.isConfirmed) {
                mergedHSNData = [];
            }
        }
        for (let file of files) {
            const fileName = file.name.toLowerCase();
            let parsedData = null;

            try {
                if (fileName.endsWith(".json")) {
                    parsedData = await readJsonFile(file);
                } else if (fileName.endsWith(".zip")) {
                    parsedData = await readJsonFromZip(file);
                } else {
                    console.error("Unsupported file type. Please upload a .json or .zip file.");
                    continue;
                }
                if (parsedData) {

                    if (parsedData?.fp) {
                        const fp = parsedData.fp;
                        const date = fp.substring(2, 6) + fp.substring(0, 2);
                        const yearfrom = selectedYear.substring(0, 4) + "04";
                        const yearto = selectedYear.substring(5, 9) + "03";
                        const [month, year] = selectedMonth.split('-');
                        const fperiod = monthMap[month] + year;

                        if (date < yearfrom || date > yearto) {
                            alert(`This File --- ${file.name} --- Is Not In This Period`);
                            continue;
                        }
                        if(formmode === 'GSTR1HSN'){
                             if(fperiod !== fp){
                                alert(`This File --- ${file.name} --- Is Not Belongs To This Month`);
                                continue;
                             }
                        }
                    }

                    if (parsedData?.gstin) {
                        setgstin(parsedData.gstin);
                    }

                    if (parsedData?.hsn) {
                        mergedHSNData.push(...parsedData.hsn.data);
                    }
                }
            } catch (error) {
                console.error("Error processing file:", error);
                continue;
            }
        }
        const updateddata = addNum(mergedHSNData);
        setExistingData(updateddata);
        jsonInputRef.current.value = '';
    };

    const addNum = (data) => {
        return data.map((item, index) => {
            return {
                ...item,
                num: index + 1,
                errorcode: 'To Be Checked',
            };
        });
    };

    const columnLetterToIndex = (letter) => letter.charCodeAt(0) - 65;

    const handleInputChange = (event) => {
        let { name, value } = event.target;
        setColumnSettings({ ...columnSettings, [name]: value })
    };

    const handleImport = async (event) => {
        setValidation(false);
        const file = event.target.files[0];
        let combinedHsn = [];
        combinedHsn.push(...existingData);
        if (combinedHsn.length > 0) {
            const result = await Swal.fire({
                title: 'Are you sure to Clear Existing Data?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
            });
            if (result.isConfirmed) {
                combinedHsn = [];
            }

        }
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const binaryStr = e.target.result;
                const workbook = XLSX.read(binaryStr, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                const startRow = parseInt(columnSettings.startingRow) - 1;
                const xlsdata = excelData.slice(startRow);
                const newData = xlsdata.map(row => ({
                    hsn_sc: row[columnLetterToIndex(columnSettings.hsn_sc.toUpperCase())] !== undefined ? String(row[columnLetterToIndex(columnSettings.hsn_sc.toUpperCase())]) : '',
                    qty: isNaN(row[columnLetterToIndex(columnSettings.qty.toUpperCase())]) ? 0.00 : parseFloat(row[columnLetterToIndex(columnSettings.qty.toUpperCase())]),
                    uqc: row[columnLetterToIndex((columnSettings.uqc.toUpperCase()))] !== undefined ? row[columnLetterToIndex((columnSettings.uqc.toUpperCase()))].toString().substring(0, 3) : '',
                    rt: isNaN(row[columnLetterToIndex(columnSettings.rt.toUpperCase())]) ? 0.00 : parseFloat(row[columnLetterToIndex(columnSettings.rt.toUpperCase())]),
                    txval: isNaN(row[columnLetterToIndex(columnSettings.txval.toUpperCase())]) ? 0.00 : parseFloat(row[columnLetterToIndex(columnSettings.txval.toUpperCase())]),
                    iamt: isNaN(row[columnLetterToIndex(columnSettings.iamt.toUpperCase())]) ? 0.00 : parseFloat(row[columnLetterToIndex(columnSettings.iamt.toUpperCase())]),
                    camt: isNaN(row[columnLetterToIndex(columnSettings.camt.toUpperCase())]) ? 0.00 : parseFloat(row[columnLetterToIndex(columnSettings.camt.toUpperCase())]),
                    samt: isNaN(row[columnLetterToIndex(columnSettings.samt.toUpperCase())]) ? 0.00 : parseFloat(row[columnLetterToIndex(columnSettings.samt.toUpperCase())]),
                    csamt: isNaN(row[columnLetterToIndex(columnSettings.csamt.toUpperCase())]) ? 0.00 : parseFloat(row[columnLetterToIndex(columnSettings.csamt.toUpperCase())]),
                }));
                combinedHsn.push(...newData);
                const hsndata = addNum(combinedHsn);
                setExistingData(hsndata);
                excelInputRef.current.value = '';
            };
            reader.readAsBinaryString(file);
        }
    };

    const handleInputStartRowChange = (values) => {
        let { value } = values;
        setColumnSettings({ ...columnSettings, startingRow: value })
    };

    const calculateTotals = () => {
        let totalTaxableValue = 0, totalIGST = 0, totalCGST = 0, totalSGST = 0, totalCESS = 0;

        existingData.forEach((row) => {
            totalTaxableValue += isNaN(row.txval) ? 0 : row.txval;
            totalIGST += isNaN(row.iamt) ? 0 : row.iamt;
            totalCGST += isNaN(row.camt) ? 0 : row.camt;
            totalSGST += isNaN(row.samt) ? 0 : row.samt;
            totalCESS += isNaN(row.csamt) ? 0 : row.csamt;
        });

        return [
            {
                hsn_sc: 'Total-->',
                qty: String(existingData.length),
                txval: totalTaxableValue,
                iamt: totalIGST,
                camt: totalCGST,
                samt: totalSGST,
                csamt: totalCESS,
            }
        ];
    };

    const [pinnedBottomRowData, setPinnedBottomRowData] = useState([]);

    useEffect(() => {
        const totals = calculateTotals();
        setPinnedBottomRowData(totals);
    }, [existingData]);

    useEffect(() => {
        const calculationiamt = () => {
            const taxvalue = isNaN(updatingData.txval) ? 0 : updatingData.txval;
            const camtcalc = calculateGST(taxvalue, updatingData.rt);
            setUpdatingData((prevFormdata) => ({
                ...prevFormdata,
                iamt: camtcalc,
                camt: 0,
                samt: 0
            }));
        }
        if (curmode === 'New') {
            calculationiamt();
        }
    }, [updatingData.rt, updatingData.txval, curmode]);

    useEffect(() => {
        const calculationcgst = () => {
            const taxvalue = isNaN(updatingData.txval) ? 0 : updatingData.txval;
            const igstamt = isNaN(updatingData.iamt) ? 0 : updatingData.iamt;
            const camtcalc = calculateGST(taxvalue, updatingData.rt);
            const cgstamt = parseFloat(((camtcalc - igstamt) / 2).toFixed(2));
            setUpdatingData((prevFormdata) => ({
                ...prevFormdata,
                camt: cgstamt,
                samt: cgstamt
            }));
        }
        if (curmode === 'New') {
            calculationcgst();
        }
    }, [updatingData.iamt]);

    const handleClearList = () => {
        if (existingData.length > 0) {
            Swal.fire({
                title: 'Are you sure to Clear Existing Data?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
            }).then((result) => {
                if (result.isConfirmed) {
                    setExistingData([]);
                }
            });
        }
        else {
            alert("There is no Data to Clear");
        }

    }

    const handlePortalView = () => {
        if (existingData.length === 0) {
            alert("There is no Existing Data");
            return;
        }
        Swal.fire({
            title: 'Are you sure to show the Data in Portal View?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.isConfirmed) {
                portalViewData();
            }
        });

    };
    const portalViewData = (updateAggrid = true) => {
        let portalData = [];
        const groupedData = existingData.reduce((acc, item) => {
            const key = `${item.hsn_sc}-${item.uqc}-${item.rt}`;
            if (acc[key]) {
                acc[key].qty += item.qty || 0;
                acc[key].txval += item.txval || 0;
                acc[key].iamt += isNaN(item.iamt) ? 0 : item.iamt;
                acc[key].samt += isNaN(item.samt) ? 0 : item.samt;
                acc[key].camt += isNaN(item.camt) ? 0 : item.camt;
                acc[key].csamt += isNaN(item.csamt) ? 0 : item.csamt;
            } else {
                // Initialize the item in the accumulator with default zero values for the sums
                acc[key] = {
                    ...item,
                    qty: item.qty || 0,
                    txval: item.txval || 0,
                    iamt: isNaN(item.iamt) ? 0 : item.iamt,
                    samt: isNaN(item.samt) ? 0 : item.samt,
                    camt: isNaN(item.camt) ? 0 : item.camt,
                    csamt: isNaN(item.csamt) ? 0 : item.csamt
                };
            }

            return acc;
        }, {});
        const resultData = Object.values(groupedData);
        portalData.push(...resultData);
        if (updateAggrid) {
            const hsndata = addNum(portalData);
            setExistingData(hsndata);
        }
        return portalData;
    };
    const addconcesstional = (data) => {
        return data.map((item) => {
            return {
                ...item,
                isconcesstional: "N",
            };
        });
    };
    const generate9HSNJson = () => {
        const data = portalViewData(false);
        const itemData = data.map(({ num, desc, errorcode, ...rest }) => rest);
        const itemsdata = addconcesstional(itemData);
        const formattedItemsData = itemsdata.map(item => ({
            ...item,
            uqc: (item.hsn_sc.substring(0, 2) === '99' && item.qty === 0 && item.uqc === '') ? 'NA' : item.uqc,
            qty: parseFloat(item.qty.toFixed(2)),
            iamt: parseFloat(item.iamt.toFixed(2)),
            camt: parseFloat(item.camt.toFixed(2)),
            samt: parseFloat(item.samt.toFixed(2)),
            csamt: parseFloat(item.csamt.toFixed(2)),
            txval: parseFloat(item.txval.toFixed(2))
        }));
        const jsonData = {
            "gstin": gstin.toUpperCase(),
            "fp": "03" + selectedYear.substring(5, 9),
            "table17": {
                "items": formattedItemsData
            }
        }
        return jsonData;
    }

    const generate1HSNJson = () => {
        const data = portalViewData(false);
        const itemData = data.map(({ desc, errorcode, ...rest }) => rest);
        const formattedItemsData = itemData.map((item, index) => ({
            num: index + 1,
            hsn_sc: item.hsn_sc,
            rt: item.rt,
            uqc: (item.hsn_sc.substring(0, 2) === '99' && item.qty === 0 && item.uqc === '') ? 'NA' : item.uqc,
            qty: parseFloat(item.qty.toFixed(2)),
            iamt: parseFloat(item.iamt.toFixed(2)),
            camt: parseFloat(item.camt.toFixed(2)),
            samt: parseFloat(item.samt.toFixed(2)),
            csamt: parseFloat(item.csamt.toFixed(2)),
            txval: parseFloat(item.txval.toFixed(2))
        }));
        console.log(selectedMonth);
        const [month, year] = selectedMonth.split("-")
        const jsonData = {
            "gstin": gstin.toUpperCase(),
            "fp": monthMap[month] + year,
            'gt': 0,
            "cur_gt": 0,
            "hsn": {
                "data": formattedItemsData
            }
        }
        return jsonData;
    }
    const [showModal, setShowModal] = useState(false);
    const [findValue, setFindValue] = useState("");
    const [replaceValue, setReplaceValue] = useState("");

    const handleOpenModal = () => {
        if (existingData.length > 0) {
            setShowModal(true);
        }
        else {
            alert("There is no Data to Find and Replace");
        }

    }

    const handleCloseModal = () => {
        setFindValue('');
        setReplaceValue('');
        setShowModal(false);
    }

    const handleSubmit = async () => {
        setValidation(false);
        if (findValue.length === 0) {
            alert("Please Give the Value To Find");
            window.document.getElementById("find").focus();
            return;
        }
        const isHSNExists = existingData.some(item => item.hsn_sc === findValue);
        if (!isHSNExists) {
            alert("This HSN is not in the Existing Data");
            window.document.getElementById("find").select();
            window.document.getElementById("find").focus();
            return;
        }
        if (replaceValue.length === 0) {
            alert("Please Give the Value To Replace");
            window.document.getElementById("replace").focus();
            return;
        }
        if (findValue === replaceValue) {
            alert("Find and Replace are Same");
            window.document.getElementById("find").select();
            window.document.getElementById("find").focus();
            return;
        }
        if (replaceValue.length < 4 || replaceValue.length === 5 || replaceValue.length === 7) {
            alert(errors[0].value + " in Replace value");
            window.document.getElementById("replace").select();
            window.document.getElementById("replace").focus();
            return;
        }
        if (replaceValue.length < hsndigit) {
            alert("Give HSN with Digit Greater than or Equal to - " + hsndigit);
            window.document.getElementById("replace").select();
            window.document.getElementById("replace").focus();
            return;
        }
        const updatedData = existingData.map(item => {
            if (item.hsn_sc === findValue) {
                return { ...item, hsn_sc: replaceValue, errorcode: "To Be Checked" };
            }
            return item;
        });
        const result = await Swal.fire({
            title: `Are you sure to Replace HSN/SAC from ${findValue} to ${replaceValue}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
        });
        if (result.isConfirmed) {
            setExistingData(updatedData);
        }

        handleCloseModal();

    };
    const handleGenerateJson = async () => {
        if (existingData.length === 0) {
            alert("There is no Existing Data");
            return;
        }

        const data = handleValidateHsn();
        const hasError = data.find(item => !(item.errorcode === 'Valid' || item.errorcode === errors[1].value));

        if (hasError) {
            alert("There are some Errors. Please Rectify Through Validate HSN");
            return;
        }
        if (gstin === '') {
            alert("GSTIN Should Be Given");
            window.document.getElementById("gstin").focus();
            return;
        }
        if (gstin.length < 15) {
            alert("Invalid GSTIN");
            window.document.getElementById("gstin").focus();
            window.document.getElementById("gstin").select();
            return;
        }
        let result = '';
        if (formmode === 'GSTR1HSN') {
            result = await generate1HSNJson();
        }
        else {
            result = await generate9HSNJson();
        }

        const jsonData = JSON.stringify(result, null, 2);

        const blob = new Blob([jsonData], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        if (formmode === 'GSTR1HSN') {
            link.download = `${gstin.toUpperCase()}_${selectedMonth}_outwardhsn.json`;
        }
        else {
            link.download = `${gstin.toUpperCase()}_${selectedYear}_outwardhsn.json`; // Set the download file name
        }
        // Programmatically click the link to trigger download
        document.body.appendChild(link); // Append the link to the body (required for Firefox)
        link.click();

        // Clean up and remove the link after downloading
        document.body.removeChild(link);

    }

    const checkHSNinportal = async (data) => {
        alert('portalcheck');
        const HSNdata = {
            HSNCode: data
        };
        const response = await axios.post(`${process.env.REACT_APP_RAINBOW_URL}/searchHSN`, HSNdata);
        return response;
    };

    const handleValidateHsn = () => {
        if (existingData.length === 0) {
            alert("There is no Existing Data");
            return;
        }
        setValidation(true);
        const data = existingData.map(item => {
            const qty = (isNaN(item.qty) || item.qty === undefined) ? 0 : item.qty;
            const rt = (isNaN(item.rt) || item.rt === undefined) ? 0 : item.rt;
            const txval = (isNaN(item.txval) || item.txval === undefined) ? 0 : item.txval;
            const igst = (isNaN(item.iamt) || item.iamt === undefined) ? 0 : item.iamt;
            const cgst = (isNaN(item.camt) || item.camt === undefined) ? 0 : item.camt;
            const sgst = (isNaN(item.samt) || item.samt === undefined) ? 0 : item.samt;

            if (item.hsn_sc.length < 4 || item.hsn_sc.length === 5 || item.hsn_sc.length === 7 || item.hsn_sc.length < hsndigit) {
                return { ...item, errorcode: errors[0].value };
            }
            const isValidUQC = gstuqclist.includes(item.uqc);
            if (qty > 0 && !isValidUQC) {
                return { ...item, errorcode: errors[5].value };
            }
            if (!qty > 0 && item.hsn_sc.substring(0, 2) !== '99') {
                return { ...item, errorcode: errors[7].value }
            }


            if (!gstrate.includes(rt)) {
                return { ...item, errorcode: errors[3].value };
            }
            if (!txval > 0) {
                return { ...item, errorcode: errors[8].value };
            }


            const value = calculateGST(txval, rt);
            const total = cgst + sgst + igst;
            const difference = Math.abs(total - value);
            if (difference >= differenceamount) {
                return { ...item, errorcode: errors[4].value };
            }

            if (cgst !== sgst) {
                return { ...item, errorcode: errors[2].value };
            }
            const hsnExists = hsnJsonData.HSN_SAC.find(hsnItem => hsnItem["HSN Code"] === Number(item.hsn_sc));
            if (!hsnExists) {
                // if(checkportal){
                //     const hsnInPortal = checkHSNinportal(item.hsn_sc);
                //     if (!hsnInPortal) {
                //         return { ...item, errorcode: errors[1].value + 'in the Portal'};
                //     }
                //     return { ...item, errorcode: 'Valid' };
                // }
                return { ...item, errorcode: errors[1].value };
            }
            return { ...item, errorcode: 'Valid' };
        });
        data.sort((a, b) => a.errorcode.localeCompare(b.errorcode));
        setExistingData(data);
        return data;
    }

    const getRowStyle = params => {
        if (params.node.rowPinned) {
            return { backgroundColor: "#ccc", fontWeight: "600" }
        }
        if (validation) {
            const qty = (isNaN(params.data.qty) || params.data.qty === undefined) ? 0 : params.data.qty;
            const rt = (isNaN(params.data.rt) || params.data.rt === undefined) ? 0 : params.data.rt;
            const txval = (isNaN(params.data.txval) || params.data.txval === undefined) ? 0 : params.data.txval;
            const igst = (isNaN(params.data.iamt) || params.data.iamt === undefined) ? 0 : params.data.iamt;
            const cgst = (isNaN(params.data.camt) || params.data.camt === undefined) ? 0 : params.data.camt;
            const sgst = (isNaN(params.data.samt) || params.data.samt === undefined) ? 0 : params.data.samt;

            if (params.data.hsn_sc.length < 4 || params.data.hsn_sc.length === 5 || params.data.hsn_sc.length === 7 || params.data.hsn_sc.length < hsndigit) {
                params.data.errorcode = errors[0].value;
                return { backgroundColor: '#f9c2c3' } // blush pink
            }
            const isValidUQC = gstuqclist.includes(params.data.uqc);
            if (qty > 0 && !isValidUQC) {
                params.data.errorcode = errors[5].value;
                return { backgroundColor: "#e4c1f9" }; //lilac
            }
            if (qty <= 0 && params.data.hsn_sc.substring(0, 2) !== '99') {
                params.data.errorcode = errors[7].value;
                return { backgroundColor: "#4682B4" }   // steelblue
            }
            if (!gstrate.includes(rt)) {
                params.data.errorcode = errors[3].value;
                return { backgroundColor: '#ffdab9' } //peach
            }
            if (!txval > 0) {
                params.data.errorcode = errors[8].value;
                return { backgroundColor: "#708090" }   // slategray
            }

            const value = calculateGST(txval, rt);
            const total = cgst + sgst + igst;
            const difference = Math.abs(total - value);
            if (difference >= differenceamount) {
                params.data.errorcode = errors[4].value;
                return { backgroundColor: '#cdb4db' } //powder blue
            }
            if (cgst !== sgst) {
                params.data.errorcode = errors[2].value;
                return { backgroundColor: '#cdb4db' } //lavender
            }
            const hsnExists = hsnJsonData.HSN_SAC.find(hsnItem => hsnItem["HSN Code"] === Number(params.data.hsn_sc));
            if (!hsnExists) {
                params.data.errorcode = errors[1].value;
                return { backgroundColor: '#a8e6cf' }; //mint green
            }
        }
        return null;
    };

    const handlePDFDownload = () => {
        if (existingData.length === 0) {
            alert("There is no Existing Data");
            return;
        }
        if (gstin === '') {
            alert("GSTIN Should Be Given");
            window.document.getElementById("gstin").focus();
            return;
        }
        if (gstin.length < 15) {
            alert("Invalid GSTIN");
            window.document.getElementById("gstin").focus();
            window.document.getElementById("gstin").select();
            return;
        }
        const doc = new jsPDF("p", "mm", "a4");
        const fs = 10;
        let lineno = 0;
        let str = '';
        let strwidth = 0;
        let curY = 0;
        let curX = 0;
        let tm = 8;
        let ls = (0.2 * fs) + 2;    // for fs = 14, factor = 0.35
        let rstrwidth = 0;
        let xlinefrom = 0;
        let pageno = 0;
        let tottxval = 0;
        let totiamt = 0;
        let totcamt = 0;
        let totsamt = 0;
        let totcsamt = 0;

        const gstcessYN = existingData.some(item => item.csamt > 0);
        const wc = 2;
        const wsrl = 8;
        const whsn = 20;
        const wqty = 15;
        const wuqc = 10;
        const wrt = 12;
        const wtxval = 26;
        const wa = 23;
        let lnline = (wc / 2) + wsrl + wc + whsn + wc + wqty + wc + wuqc + wc + wrt + wc + wtxval + ((wc + wa) * 3) + (wc / 2);
        if (gstcessYN) {
            lnline += wc + wa;
        }

        const lm = (doc.internal.pageSize.width - lnline) / 2;

        const addline = (xfrom, yfrom, xto, yto,) => {
            doc.setDrawColor(150, 150, 150);
            doc.line(xfrom, yfrom, xto, yto);
            doc.setDrawColor(0, 0, 0);
        }

        const addVerticalLine = () => {

            curX = lm;
            addline(curX, xlinefrom, curX, curY);
            curX += wc + wsrl;
            addline(curX, xlinefrom, curX, curY);
            curX += wc + whsn;
            addline(curX, xlinefrom, curX, curY);
            curX += wc + wqty;
            addline(curX, xlinefrom, curX, curY);
            curX += wc + wuqc;
            addline(curX, xlinefrom, curX, curY);
            curX += wc + wrt;
            addline(curX, xlinefrom, curX, curY);
            curX += wc + wtxval;
            addline(curX, xlinefrom, curX, curY);
            curX += wc + wa;
            addline(curX, xlinefrom, curX, curY);
            curX += wc + wa;
            addline(curX, xlinefrom, curX, curY);
            curX += wc + wa;
            addline(curX, xlinefrom, curX, curY);
            if (gstcessYN) {
                curX += wc + wa;
                addline(curX, xlinefrom, curX, curY);
            }
            curY += 4;
            str = 'Page No.' + String(pageno);
            strwidth = lnline + lm;
            rstrwidth = doc.getTextWidth(str);
            doc.text(str, (strwidth - rstrwidth), curY);
        }
        const addPageHeader = () => {
            if (lineno > 0) {
                sayTotal("Balance Carried Over");
                addVerticalLine();
                doc.addPage();
            }
            doc.setFontSize(fs);
            doc.setLineWidth(0.01);
            doc.setDrawColor(0, 0, 0, 5);
            curY = tm;

            str = 'GSTIN : ' + gstin.toUpperCase();
            strwidth = doc.getTextWidth(str);
            curX = (doc.internal.pageSize.width - strwidth) / 2;
            doc.text(str, curX, curY);

            curY += ls;
            str = 'Year : ' + selectedYear;
            strwidth = doc.getTextWidth(str);
            curX = (doc.internal.pageSize.width - strwidth) / 2;
            doc.text(str, curX, curY);

            curY += 2 * ls;
            xlinefrom = curY;
            doc.line(lm, curY, lm + lnline, curY);
            curY += ls;
            str = 'Srl.';
            strwidth = wsrl;
            curX = lm + (wc / 2);
            doc.text(str, curX, curY);
            curX += strwidth + wc;

            str = 'HSN/SAC.';
            strwidth = whsn;
            doc.text(str, curX, curY);
            curX += strwidth + wc;

            str = 'Qty.';
            strwidth = wqty;
            rstrwidth = doc.getTextWidth(str);
            doc.text(str, curX + (strwidth - rstrwidth), curY);
            curX += strwidth + wc;

            str = 'UQC';
            strwidth = wuqc;
            doc.text(str, curX, curY);
            curX += strwidth + wc;

            str = 'GST(%)';
            strwidth = wrt;
            rstrwidth = doc.getTextWidth(str);
            doc.text(str, curX + (strwidth - rstrwidth), curY);
            curX += strwidth + wc;

            str = 'Tax Value';
            strwidth = wtxval;
            rstrwidth = doc.getTextWidth(str);
            doc.text(str, curX + (strwidth - rstrwidth), curY);
            curX += strwidth + wc;

            str = 'IGST';
            strwidth = wa;
            rstrwidth = doc.getTextWidth(str);
            doc.text(str, curX + (strwidth - rstrwidth), curY);
            curX += strwidth + wc;

            str = 'CGST';
            strwidth = wa;
            rstrwidth = doc.getTextWidth(str);
            doc.text(str, curX + (strwidth - rstrwidth), curY);
            curX += strwidth + wc;

            str = 'SGST';
            strwidth = wa;
            rstrwidth = doc.getTextWidth(str);
            doc.text(str, curX + (strwidth - rstrwidth), curY);
            curX += strwidth + wc;
            if (gstcessYN) {
                str = 'CESS';
                strwidth = wa;
                rstrwidth = doc.getTextWidth(str);
                doc.text(str, curX + (strwidth - rstrwidth), curY);
                curX += strwidth + wc;
            }
            curY += 1;
            doc.line(lm, curY, lm + lnline, curY);

        }
        let newpage = true;
        const sayTotal = (p) => {
            curY += ls;
            str = p;
            strwidth = wsrl + wc + whsn + wc + wqty + wc + wuqc;
            curX = lm + (wc / 2);
            rstrwidth = doc.getTextWidth(str);
            doc.text(str, curX + (strwidth - rstrwidth), curY);
            curX += strwidth + wc + wrt + wc;

            doc.setFont("helvetica", "bold");
            str = tottxval.toFixed(2);
            if (str === "0.00") {
                str = "--  ";
            }
            strwidth = wtxval;
            rstrwidth = doc.getTextWidth(str);
            doc.text(str, curX + (strwidth - rstrwidth), curY);
            curX += strwidth + wc;

            str = totiamt.toFixed(2);
            if (str === "0.00") {
                str = "--  ";
            }
            strwidth = wa;
            rstrwidth = doc.getTextWidth(str);
            doc.text(str, curX + (strwidth - rstrwidth), curY);
            curX += strwidth + wc;


            str = totcamt.toFixed(2);
            if (str === "0.00") {
                str = "--  ";
            }
            strwidth = wa;
            rstrwidth = doc.getTextWidth(str);
            doc.text(str, curX + (strwidth - rstrwidth), curY);
            curX += strwidth + wc;

            str = totsamt.toFixed(2);
            if (str === "0.00") {
                str = "--  ";
            }
            strwidth = wa;
            rstrwidth = doc.getTextWidth(str);
            doc.text(str, curX + (strwidth - rstrwidth), curY);
            curX += strwidth + wc;
            if (gstcessYN) {
                str = totcsamt.toFixed(2);
                if (str === "0.00") {
                    str = "--  ";
                }
                strwidth = wa;
                rstrwidth = doc.getTextWidth(str);
                doc.text(str, curX + (strwidth - rstrwidth), curY);
                curX += strwidth + wc;
            }
            doc.setFont("helvetica", "normal");
            curY += 1;
            doc.line(lm, curY, lm + lnline, curY);
        }
        existingData.forEach((item, index) => {
            if (curY > doc.internal.pageSize.height - 25) {
                sayTotal("Balance Carried Over");
                addVerticalLine();
                doc.addPage();
                newpage = true;
            }
            if (newpage) {
                addPageHeader();
                if (pageno > 0) {
                    sayTotal("Balance Brought Forward");
                }

                pageno += 1;
                newpage = false;
            }
            curY += ls;

            str = String(index + 1);
            strwidth = wsrl;
            curX = lm + (wc / 2);
            rstrwidth = doc.getTextWidth(str);
            doc.text(str, curX + (strwidth - rstrwidth), curY);
            curX += strwidth + wc;

            str = String(item.hsn_sc);
            strwidth = whsn;
            doc.text(str, curX, curY);
            curX += strwidth + wc;

            str = String(item.qty);
            strwidth = wqty;
            rstrwidth = doc.getTextWidth(str);
            doc.text(str, curX + (strwidth - rstrwidth), curY);
            curX += strwidth + wc;

            str = String(item.uqc);
            strwidth = wuqc;
            doc.text(str, curX, curY);
            curX += strwidth + wc;

            str = String(item.rt);
            strwidth = wrt;
            rstrwidth = doc.getTextWidth(str);
            doc.text(str, curX + (strwidth - rstrwidth), curY);
            curX += strwidth + wc;

            str = item.txval.toFixed(2);
            if (str === "0.00") {
                str = "--  ";
            }
            strwidth = wtxval;
            rstrwidth = doc.getTextWidth(str);
            doc.text(str, curX + (strwidth - rstrwidth), curY);
            curX += strwidth + wc;
            tottxval += item.txval;

            str = item.iamt.toFixed(2);
            if (str === "0.00") {
                str = "--  ";
            }
            strwidth = wa;
            rstrwidth = doc.getTextWidth(str);
            doc.text(str, curX + (strwidth - rstrwidth), curY);
            curX += strwidth + wc;
            totiamt += item.iamt;

            str = item.camt.toFixed(2);
            if (str === "0.00") {
                str = "--  ";
            }
            strwidth = wa;
            rstrwidth = doc.getTextWidth(str);
            doc.text(str, curX + (strwidth - rstrwidth), curY);
            curX += strwidth + wc;
            totcamt += item.camt;

            str = item.samt.toFixed(2);
            if (str === "0.00") {
                str = "--  ";
            }
            strwidth = wa;
            rstrwidth = doc.getTextWidth(str);
            doc.text(str, curX + (strwidth - rstrwidth), curY);
            curX += strwidth + wc;
            totsamt += item.samt;
            if (gstcessYN) {
                str = item.csamt.toFixed(2);
                if (str === "0.00") {
                    str = "--  ";
                }
                strwidth = wa;
                rstrwidth = doc.getTextWidth(str);
                doc.text(str, curX + (strwidth - rstrwidth), curY);
                curX += strwidth + wc;
                totcsamt += item.csamt;
            };

            curY += 1;
            addline(lm, curY, lm + lnline, curY);
        })
        sayTotal("Total");
        addVerticalLine();
        if (formmode === 'GSTR1HSN') {
            doc.save(`${gstin.toUpperCase()}_${selectedMonth}_outwardhsn.pdf`);
        }
        else {
            doc.save(`${gstin.toUpperCase()}_${selectedYear}_outwardhsn.pdf`);
        }
    };

    const handleExportToExcel = () => {
        if (existingData.length === 0) {
            alert("There is no Existing Data");
            return;
        }
        if (gstin === '') {
            alert("GSTIN Should Be Given");
            window.document.getElementById("gstin").focus();
            return;
        }
        if (gstin.length < 15) {
            alert("Invalid GSTIN");
            window.document.getElementById("gstin").focus();
            window.document.getElementById("gstin").select();
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        worksheet.mergeCells('A1:J1');
        const gstinCell = worksheet.getCell('A1');
        gstinCell.value = `GSTIN: ${gstin.toUpperCase()}`;
        gstinCell.alignment = { vertical: 'middle', horizontal: 'center' };
        gstinCell.font = { bold: true };

        worksheet.mergeCells('A2:J2');
        const yearCell = worksheet.getCell('A2');
        yearCell.value = `Accounting Year: ${selectedYear}`;
        yearCell.alignment = { vertical: 'middle', horizontal: 'center' };
        yearCell.font = { bold: true };

        worksheet.addRow([]);

        const headers = ['SrlNo', 'HSN_SAC', 'Qty', 'UQC', 'TaxRate', 'TaxableValue', 'CGST', 'SGST', 'IGST', 'CESS'];
        worksheet.addRow(headers);
        worksheet.columns = [
            { key: 'num', width: 5 },
            { key: 'hsn_sc', width: 15 },
            { key: 'qty', width: 10 },
            { key: 'uqc', width: 10 },
            { key: 'rt', width: 10 },
            { key: 'txval', width: 15, style: { numFmt: '###,##,##,##0.00' } },
            { key: 'iamt', width: 10, style: { numFmt: '###,##,##,##0.00' } },
            { key: 'camt', width: 10, style: { numFmt: '###,##,##,##0.00' } },
            { key: 'samt', width: 10, style: { numFmt: '###,##,##,##0.00' } },
            { key: 'csamt', width: 10, style: { numFmt: '###,##,##,##0.00' } },
        ];

        headers.forEach((header, index) => {
            const cell = worksheet.getRow(4).getCell(index + 1);
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center' };
        });

        existingData.forEach((row, index) => {
            worksheet.addRow([
                index + 1,
                String(row.hsn_sc),
                row.qty,
                row.uqc.toUpperCase(),
                row.rt,
                parseFloat(row.txval),
                row.iamt,
                row.camt,
                row.samt,
                row.csamt,
            ]);
        });
        worksheet.eachRow((row, rownumber) => {
            if (rownumber > 4) {
                row.getCell(6).numFmt = '###,##,##,##0.00';
                row.getCell(7).numFmt = '###,##,##,##0.00';
                row.getCell(8).numFmt = '###,##,##,##0.00';
                row.getCell(9).numFmt = '###,##,##,##0.00';
                row.getCell(10).numFmt = '###,##,##,##0.00';
            }
        })
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/octet-stream' });
            if (formmode === 'GSTR1HSN') {
                saveAs(blob, `${gstin.toUpperCase()}_${selectedMonth}_outwardhsn.xlsx`);
            }
            else {
                saveAs(blob, `${gstin.toUpperCase()}_${selectedYear}_outwardhsn.xlsx`);
            }
        });
    };

    const [jsonError, setJsonError] = useState([]);
    const [showErrorModal, setshowErrorModal] = useState(false);

    const handleErrorFileUpload = async (event) => {
        const files = event.target.files;

        if (files.length > 0) {
            try {
                let allData = [];
                for (const file of files) {
                    const fileName = file.name.toLowerCase();

                    if (fileName.endsWith(".json")) {
                        const jsonData = await readJsonFile(file);
                        allData.push(...jsonData.error_report.table17.items);
                    } else if (fileName.endsWith(".zip")) {
                        const zipData = await readJsonFromZip(file);
                        allData = allData.concat(...zipData.error_report.table17.items);
                    } else {
                        console.error(`Unsupported file type for file: ${file.name}. Please upload a .json or .zip file.`);
                    }
                }
                if (allData.length > 0) {
                    setJsonError(allData);
                    setshowErrorModal(true);
                } else {
                    console.error("No valid JSON data found in the uploaded files.");
                }
            } catch (error) {
                console.error("Error processing files:", error);
            }
            errorInputRef.current.value = '';
        }
    };
    const readJsonFile = async (file) => {
        try {
            const content = await file.text();
            const jsonData = JSON.parse(content);
            return jsonData;
        } catch (error) {
            console.error("Error reading JSON file:", error);
            throw error;
        }
    };
    const readJsonFromZip = async (file) => {
        try {
            const zip = await JSZip.loadAsync(file);
            // Create an array of promises to handle each file in the ZIP
            const jsonPromises = Object.keys(zip.files).map(async (relativePath) => {
                const zipEntry = zip.files[relativePath];

                if (zipEntry.name.endsWith(".json")) {
                    const content = await zipEntry.async("string"); // Read the JSON file as text
                    const jsonData = JSON.parse(content); // Parse the content into JSON
                    return jsonData;
                }
            });

            // Wait for all promises to resolve and filter out undefined results
            const jsonFiles = (await Promise.all(jsonPromises)).filter(Boolean);

            if (jsonFiles.length === 0) {
                throw new Error("No JSON files found in the ZIP");
            }

            return jsonFiles.length === 1 ? jsonFiles[0] : jsonFiles;
        } catch (error) {
            console.error("Error reading ZIP file:", error);
            throw error;
        }
    };

    const [tooltip, setTooltip] = useState('');
    const [tooltipTimeout, setTooltipTimeout] = useState(null);

    const showRowTooltip = (params) => {
        const errormsg = validation && params.data.errorcode !== 'Valid' && params.data.errorcode !== undefined
            && params.data.errorcode !== 'To Be Checked'
            ? `Error: ${params.data.errorcode} in Srl.No. :  ${params.data.num}`
            : '';
        // Only update the tooltip if the message has changed
        if (tooltip !== errormsg) {
            setTooltip(errormsg);
            // Clear existing timeout if there is one
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
            }
            // Set a timeout to hide the tooltip after 3 seconds
            const timeout = setTimeout(() => {
                setTooltip('');
            }, 3000); // Tooltip will disappear after 3 seconds
            setTooltipTimeout(timeout); // Store the timeout ID
        }
    };

    const newCell = (params) => {
        setTimeout(() => {
            const focusedCell = params.api.getFocusedCell();
            if (focusedCell) {
                // Get the displayed row index rather than the original row index
                const displayedRowIndex = focusedCell.rowIndex;
                const currentRowNode = params.api.getDisplayedRowAtIndex(displayedRowIndex);
                const newParams = {
                    data: currentRowNode.data,
                    event: params.event,
                    api: params.api,
                    columnApi: params.columnApi,
                };
                showRowTooltip(newParams); // Pass the updated params to showRowTooltip
            }
        }, 0);
    }

    const onCellKeyDown = (params) => {
        if (params.event.target.closest(".ag-header")) {
            return;
        }
        const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];
        if (keys.includes(params.event.key)) {

            newCell(params);
        }
    };

    const onRowClicked = (params) => {
        if (params.event.target.closest(".ag-header")) {
            return;
        }
        newCell(params);
    }

    const onRowDoubleClicked = (params) => {
        handleEdit(params.data);
    }

    useEffect(() => {
        return () => {
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
            }
        };
    }, [tooltipTimeout]);

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    const onEnterkeydown = (e, nextid) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (nextid === "save" || nextid === "uqc" || nextid === "rt" || nextid === "hsndigit" ||
                nextid === "addnew" || nextid === 'ok' || nextid === 'month') {
                window.document.getElementById(nextid).focus();
                return;
            }
            window.document.getElementById(nextid).select();
            window.document.getElementById(nextid).focus();
        }

    }

    return (
        <div className='annualreturn-divmain'>
            <div className="annualreturn-formcontainer">
                <div className='annualreturn-header'>
                    <h6>HSN/SAC Summary</h6>
                    <h1 style={{ width: "18px", height: "100%", backgroundColor: "red", color: "white", fontSize: "16px", textAlign: "center" }} onClick={() => navigate("/emptypage")}>x</h1>
                </div>
                <div className='annualreturn-toppanel'>
                    <div className="input-group">
                        <select value={selectedYear} onChange={handleYearChange}
                            onKeyDown={(e) => onEnterkeydown(e, formmode !== 'GSTR1HSN' ? "gstin" : 'month')}>
                            <option value='' disabled selected> Select Year ...</option>
                            {yearOptions.map((yearOption, index) => (
                                <option key={index} value={yearOption}>{yearOption}</option>
                            ))}

                        </select>
                    </div>
                    {formmode === 'GSTR1HSN' &&
                        <div className="input-group">
                            <select id='month' value={selectedMonth} onChange={handleMonthChange}
                                onKeyDown={(e) => onEnterkeydown(e, "gstin")}>
                                <option value='' disabled selected> Select Month ...</option>
                                {monthOptions.map((month, index) => (
                                    <option key={index} value={month}>{month}</option>
                                ))}

                            </select>
                        </div>
                    }
                    <div className="input-group">
                        <label>GSTIN:</label>
                        <InputMask
                            autoComplete='off'
                            mask="D9AAAAA9999A*Z*"
                            maskChar={null}
                            formatChars={{
                                '*': '[A-Za-z0-9]',
                                'D': '[0-3]',
                                'A': '[A-Za-z]',
                                'Z': '[Zz]',
                                '9': '[0-9]'
                            }}
                            id='gstin'
                            alwaysShowMask={false}
                            style={{ width: "60%", textAlign: "left", paddingLeft: "2px" }}
                            value={gstin} onChange={(e) => setgstin(e.target.value)}
                            onKeyDown={(e) => onEnterkeydown(e, "hsndigit")}
                        ></InputMask>
                    </div>
                    <button onClick={handlePortalView}>Portal View</button>
                    <div className="input-group">
                        <label>GST CESS:</label>
                        <input type="checkbox" checked={gstcess} onChange={(e) => setgstcess(e.target.checked)} tabIndex={-1} />
                    </div>

                    <div className="input-group">
                        <label style={{ width: "73%" }}>HSN with digit:</label>
                        <select id='hsndigit' style={{ width: "27%", padding: "0 2px" }} value={hsndigit} onChange={(e) => sethsndigit(e.target.value)}
                            onKeyDown={(e) => onEnterkeydown(e, "addnew")}>
                            <option value={4}>4</option>
                            <option value={6}>6</option>
                        </select>
                    </div>
                    {/* <div className="input-group">
                        <label>Re-Calculate GST:</label>
                        <input type="checkbox" checked={recalcgst} onChange={(e) => setrecalcgst(e.target.checked)} />
                    </div> */}
                    <button id='addnew' onClick={handleAdd}>New</button>
                </div>
                <div className='annualreturn-container'>
                    <div className="annualreturn-leftpanel">
                        <div className='annualreturn-settings'>
                            <h5>Excel Column Settings</h5>
                            <div className="annualreturn-inputgroup">
                                <label>HSN/SAC:</label>
                                <InputMask
                                    autoComplete='off'
                                    mask="AA"
                                    maskChar={null}
                                    formatChars={{
                                        'A': '[A-Za-z]'
                                    }}
                                    name='hsn_sc'
                                    alwaysShowMask={false}
                                    value={columnSettings.hsn_sc}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => onEnterkeydown(e, "colset_qty")}
                                ></InputMask>
                            </div>
                            <div className="annualreturn-inputgroup">
                                <label>Quantity:</label>
                                <InputMask
                                    id='colset_qty'
                                    autoComplete='off'
                                    mask="AA"
                                    maskChar={null}
                                    formatChars={{
                                        'A': '[A-Za-z]'
                                    }}
                                    alwaysShowMask={false}
                                    name='qty'
                                    value={columnSettings.qty}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => onEnterkeydown(e, "colset_uqc")}
                                ></InputMask>
                            </div>
                            <div className="annualreturn-inputgroup">
                                <label>UQC:</label>
                                <InputMask
                                    id='colset_uqc'
                                    autoComplete='off'
                                    mask="AA"
                                    maskChar={null}
                                    formatChars={{
                                        'A': '[A-Za-z]'
                                    }}
                                    alwaysShowMask={false}
                                    name='uqc'
                                    value={columnSettings.uqc}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => onEnterkeydown(e, "colset_rt")}
                                ></InputMask>
                            </div>
                            <div className="annualreturn-inputgroup">
                                <label>GST Rate:</label>
                                <InputMask
                                    id='colset_rt'
                                    autoComplete='off'
                                    mask="AA"
                                    maskChar={null}
                                    formatChars={{
                                        'A': '[A-Za-z]'
                                    }}
                                    alwaysShowMask={false}
                                    name='rt'
                                    value={columnSettings.rt}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => onEnterkeydown(e, "colset_txval")}
                                ></InputMask>
                            </div>
                            <div className="annualreturn-inputgroup">
                                <label> Taxable Value:</label>
                                <InputMask
                                    id='colset_txval'
                                    autoComplete='off'
                                    mask="AA"
                                    maskChar={null}
                                    formatChars={{
                                        'A': '[A-Za-z]'
                                    }}
                                    alwaysShowMask={false}
                                    name='txval'
                                    value={columnSettings.txval}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => onEnterkeydown(e, "colset_iamt")}
                                ></InputMask>
                            </div>
                            <div className="annualreturn-inputgroup">
                                <label>IGST:</label>
                                <InputMask
                                    id='colset_iamt'
                                    autoComplete='off'
                                    mask="AA"
                                    maskChar={null}
                                    formatChars={{
                                        'A': '[A-Za-z]'
                                    }}
                                    alwaysShowMask={false}
                                    name='iamt'
                                    value={columnSettings.iamt}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => onEnterkeydown(e, "colset_camt")}
                                ></InputMask>
                            </div>
                            <div className="annualreturn-inputgroup">
                                <label>CGST:</label>
                                <InputMask
                                    id='colset_camt'
                                    autoComplete='off'
                                    mask="AA"
                                    maskChar={null}
                                    formatChars={{
                                        'A': '[A-Za-z]'
                                    }}
                                    alwaysShowMask={false}
                                    name='camt'
                                    value={columnSettings.camt}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => onEnterkeydown(e, "colset_samt")}
                                ></InputMask>
                            </div>
                            <div className="annualreturn-inputgroup">
                                <label>SGST:</label>
                                <InputMask
                                    id='colset_samt'
                                    autoComplete='off'
                                    mask="AA"
                                    maskChar={null}
                                    formatChars={{
                                        'A': '[A-Za-z]'
                                    }}
                                    alwaysShowMask={false}
                                    name='samt'
                                    value={columnSettings.samt}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => onEnterkeydown(e, "colset_csamt")}
                                ></InputMask>
                            </div>
                            <div className="annualreturn-inputgroup">
                                <label>GST CESS:</label>
                                <InputMask
                                    id='colset_csamt'
                                    autoComplete='off'
                                    mask="AA"
                                    maskChar={null}
                                    formatChars={{
                                        'A': '[A-Za-z]'
                                    }}
                                    alwaysShowMask={false}
                                    name='csamt'
                                    value={columnSettings.csamt}
                                    onChange={handleInputChange}
                                    onKeyDown={(e) => onEnterkeydown(e, "colset_startrow")}
                                ></InputMask>
                            </div>
                            <div className="annualreturn-inputgroup">
                                <label style={{ fontWeight: "600" }}>Starting Row:</label>
                                <NumericFormat
                                    id='colset_startrow'
                                    name='startingRow'
                                    value={columnSettings.startingRow}
                                    onValueChange={handleInputStartRowChange}
                                    autoComplete='off'
                                    className='numericformatinput'
                                    maxLength={2}
                                    decimalScale={0}
                                    thousandSeparator={false}
                                    allowNegative={false}
                                    allowLeadingZeros={false}
                                    isNumericString
                                />

                            </div>
                            <div className="annualreturn-buttongroup">
                                <div className='file-upload-div'>
                                    <label htmlFor="file-upload-excel" style={{ paddingTop: "3px" }} className="file-upload-button" >Imp.Excel</label>
                                    <input type="file" accept=".xlsx, .xls" multiple={true}
                                        id="file-upload-excel" onChange={handleImport}
                                        style={{ width: "0", height: "22px", display: "none" }}
                                        ref={excelInputRef}
                                        tabIndex={0}
                                    />
                                </div>
                                <div className='file-upload-div'>
                                    <label htmlFor="file-upload" style={{ paddingTop: "3px" }} className="file-upload-button" >Imp.GSTR1 JSON</label>
                                    <input type="file" accept=".json, .zip" multiple={true} id="file-upload"
                                        onChange={handleImportHSN} style={{ width: "0", height: "22px", display: "none" }}
                                        ref={jsonInputRef} />
                                </div>
                                {formmode !== 'GSTR1HSN' &&
                                    <div className='file-upload-div'>
                                        <label htmlFor="file-upload-error" style={{ paddingTop: "3px" }} className="file-upload-button" >Open GSTR9 Error</label>
                                        <input type="file" accept=".zip, .json" multiple={true} id="file-upload-error"
                                            onChange={handleErrorFileUpload} style={{ width: "0", height: "22px", display: "none" }}
                                            ref={errorInputRef} />
                                    </div>
                                }
                            </div>

                            {showErrorModal &&
                                <div className="error-modal">
                                    <div className="error-container">
                                        <div className="error-topgrp">
                                            <h3>GSTR9 ERROR</h3>
                                            <div className="error-btngrp">
                                                <AiOutlineClose size={20} style={{ backgroundColor: "red", color: "white" }} onClick={() => setshowErrorModal(false)} />
                                            </div>

                                        </div>
                                        <div className="errorlookup-table">
                                            <table className="error-table" id="error-table">
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: "8%" }}>HSN/SAC</th>
                                                        <th style={{ width: "5%" }}>Qty</th>
                                                        <th style={{ width: "5%" }}>Uqc</th>
                                                        <th style={{ width: "5%" }}>Tax Rate</th>
                                                        <th style={{ width: "10%" }}>Taxable Value</th>
                                                        <th style={{ width: "10%" }}>IGST</th>
                                                        <th style={{ width: "10%" }}>CGST</th>
                                                        <th style={{ width: "10%" }}>SGST</th>
                                                        <th style={{ width: "10%" }}>CESS</th>
                                                        <th style={{ width: "27%" }}>ERROR</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {jsonError.map((data, index) => (

                                                        <tr key={index}>
                                                            <td>{data.hsn_sc}</td>
                                                            <td style={{ textAlign: "right" }}>{data.qty}</td>
                                                            <td>{data.uqc}</td>
                                                            <td style={{ textAlign: "right" }}>{data.rt}</td>
                                                            <td style={{ textAlign: "right" }}>{data.txval}</td>
                                                            <td style={{ textAlign: "right" }}>{data.iamt}</td>
                                                            <td style={{ textAlign: "right" }}>{data.camt}</td>
                                                            <td style={{ textAlign: "right" }}>{data.samt}</td>
                                                            <td style={{ textAlign: "right" }}>{data.csamt}</td>
                                                            <td style={{ textAlign: "center" }}>{data.error_msg}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            }
                            <div className='annualreturn-validatehsn'>
                                <button style={{ width: "80%" }}
                                    onClick={handleValidateHsn}
                                >
                                    Validate HSN</button>
                                <input style={{ width: "9%" }} type="checkbox" checked={checkportal} onChange={(e) => setCheckPortal(e.target.checked)} />
                            </div>
                            <div className="annualreturn-buttongroup">
                                <button onClick={handleClearList}>Clear List</button>
                                <button onClick={handleOpenModal}>Find and Replace</button>
                                {((licensed[0] !== 'D' && formmode !== 'GSTR1HSN') || (licensed[1] !== 'D' && formmode === 'GSTR1HSN')) &&
                                    <button onClick={handleGenerateJson}>Generate JSON</button>
                                }
                                {((licensed[0] !== 'D' && formmode !== 'GSTR1HSN') || (licensed[1] !== 'D' && formmode === 'GSTR1HSN')) &&
                                    <button onClick={handlePDFDownload}>Generate PDF</button>
                                }
                                {((licensed[0] !== 'D' && formmode !== 'GSTR1HSN') || (licensed[1] !== 'D' && formmode === 'GSTR1HSN')) &&
                                    <button onClick={handleExportToExcel}>Generate Excel</button>
                                }
                            </div>

                            {showModal && (
                                <div className="modal-overlay">
                                    <div className="modal">
                                        <div className="modal-header">
                                            <h2>Find and Replace</h2>
                                            <button onClick={handleCloseModal} className="findreplace-closebtn">X</button>
                                        </div>

                                        <div className="modal-body">
                                            <div className="form-group">
                                                <label htmlFor="find">Find</label>
                                                <input
                                                    autoFocus
                                                    autoComplete='off'
                                                    type="text"
                                                    id="find"
                                                    value={findValue}
                                                    onChange={(e) => setFindValue(e.target.value)}
                                                    onKeyDown={(e) => onEnterkeydown(e, "replace")}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="replace">Replace</label>
                                                <NumericFormat
                                                    autoComplete='off'
                                                    name='replace'
                                                    id="replace"
                                                    value={replaceValue}
                                                    onValueChange={handleReplaceChange}
                                                    maxLength={8}
                                                    decimalScale={0}
                                                    thousandSeparator={false}
                                                    allowNegative={false}
                                                    allowLeadingZeros={false}
                                                    isNumericString
                                                    onKeyDown={(e) => onEnterkeydown(e, "ok")}
                                                />
                                            </div>
                                        </div>

                                        <div className="findreplace-btngrp">
                                            <button id='ok' onClick={handleSubmit} className="ok-btn">OK</button>
                                            <button onClick={handleCloseModal} className="cancel-btn" >Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className='tooltiperror'>

                        </div>

                    </div>
                    <div className='annualreturn-rightpanel'>
                        <div className="annualreturn-agegrid ">
                            <div className="aag-theme-alpine" style={{ width: "100%", height: "100%" }}>
                                <AgGridReact
                                    ref={gridRef}
                                    rowHeight={25}
                                    rowData={existingData}
                                    columnDefs={columnDefs}
                                    // gridOptions={{ suppressRowNumbers: true, domLayout: "normal" }}
                                    domLayout="normal"
                                    defaultColDef={{ resizable: true, flex: 1 }}
                                    getRowStyle={getRowStyle}
                                    pinnedBottomRowData={pinnedBottomRowData}
                                    tooltipShowDelay={0}
                                    tooltipHideDelay={10}
                                    onCellKeyDown={onCellKeyDown}
                                    onRowClicked={onRowClicked}
                                    onRowDoubleClicked={onRowDoubleClicked}
                                />

                                {tooltip && (
                                    <div className="tooltip-box" style={{ position: 'absolute', top: 10, left: '40%' }}>
                                        {tooltip}
                                    </div>
                                )}

                            </div>

                            {isUpdateModalOpen &&
                                <div className="updatemodal">
                                    <div className="updatemodal-content">
                                        <button className="updateclose-button" onClick={() => setIsUpdateModalOpen(false)}>
                                            &times;
                                        </button>
                                        <div className='annualreturn-edit' style={{ height: "100%", width: "100%" }}>
                                            <div className='annualreturn-editfields'>
                                                <div className='editfields-inputgrp' style={{ width: "4% " }}>
                                                    <label htmlFor="srl">Srl.</label>
                                                    <NumericFormat
                                                        readOnly={true}
                                                        disabled={true}
                                                        tabIndex={-1}
                                                        id='srl'
                                                        name='num'
                                                        autoComplete='off'
                                                        className='numericformatinput'
                                                        thousandSeparator={false}
                                                        allowNegative={false}
                                                        allowLeadingZeros={false}
                                                        isNumericString
                                                        value={updatingData.num}
                                                        style={{ width: "100%" }}
                                                        onKeyDown={(e) => onEnterkeydown(e, "hsn")}
                                                    />
                                                </div>
                                                <div className='editfields-inputgrp' style={{ width: "8.5% " }}>
                                                    <label htmlFor="hsn">HSN/SAC</label>
                                                    <NumericFormat
                                                        id='hsn'
                                                        name='hsn_sc'
                                                        autoComplete='off'
                                                        className='numericformatinput'
                                                        onValueChange={(values) => handleValueChange({ name: 'hsn_sc', value: values.value })}
                                                        value={updatingData.hsn_sc}
                                                        maxLength={8}
                                                        thousandSeparator={false}
                                                        allowNegative={false}
                                                        allowLeadingZeros={false}
                                                        isNumericString
                                                        style={{ width: "100%", textAlign: "left" }}
                                                        onKeyDown={(e) => onEnterkeydown(e, "qty")}
                                                    />
                                                </div>
                                                <div className='editfields-inputgrp' style={{ width: "8% " }}>
                                                    <label htmlFor="qty">Qty</label>
                                                    <NumericFormat
                                                        id='qty'
                                                        name='qty'
                                                        autoComplete='off'
                                                        className='numericformatinput'
                                                        onValueChange={(values) => handleValueChange({ name: 'qty', value: parseFloat(values.value) })}
                                                        value={updatingData.qty}
                                                        maxLength={10}
                                                        thousandSeparator={false}
                                                        decimalScale={2}
                                                        allowNegative={false}
                                                        allowLeadingZeros={false}
                                                        isNumericString
                                                        style={{ width: "100%", textAlign: "right" }}
                                                        onKeyDown={(e) => onEnterkeydown(e, "uqc")}
                                                    />
                                                </div>
                                                <div className='editfields-inputgrp' style={{ width: "5.4%" }}>
                                                    <label htmlFor="uqc">UQC</label>
                                                    <select id='uqc'
                                                        name='uqc'
                                                        // className='numericformatinput'
                                                        onChange={handleRTChange}
                                                        value={updatingData.uqc}
                                                        style={{ width: "100%" }}
                                                        onKeyDown={(e) => onEnterkeydown(e, "rt")}>
                                                        <option value="" disabled selected> Choose</option>
                                                        {gstuqc.map((item, index) => {
                                                            const shortCode = item.substring(0, 3);
                                                            return (<option key={index} value={shortCode}>{item}</option>);
                                                        })}
                                                    </select>
                                                </div>
                                                <div className='editfields-inputgrp' style={{ width: "5.7% " }}>
                                                    <label htmlFor="rt">GST(%)</label>
                                                    <select id='rt'
                                                        name='rt'
                                                        // className='numericformatinput'
                                                        onChange={handleRTChange}
                                                        value={updatingData.rt}
                                                        style={{ width: "100%", textAlign: "center" }}
                                                        onKeyDown={(e) => onEnterkeydown(e, "txval")}>
                                                        <option value='' disabled selected>Choose</option>
                                                        {gstrate.map(data => (
                                                            <option key={data}
                                                                value={data}>{data}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className='editfields-inputgrp' style={{ width: "14.2%" }}>
                                                    <label htmlFor="txval">Taxable Value</label>
                                                    <NumericFormat
                                                        id='txval'
                                                        name='txval'
                                                        autoComplete='off'
                                                        className='numericformatinput'
                                                        onValueChange={(values) => handleValueChange({ name: 'txval', value: parseFloat(values.value) })}
                                                        value={updatingData.txval}
                                                        maxLength={13}
                                                        thousandSeparator={false}
                                                        allowNegative={false}
                                                        allowLeadingZeros={false}
                                                        isNumericString
                                                        decimalScale={2}
                                                        style={{ width: "100%" }}
                                                        onKeyDown={(e) => onEnterkeydown(e, "iamt")}
                                                    />
                                                </div>
                                                <div className='editfields-inputgrp' style={{ width: "11%" }}>
                                                    <label htmlFor="iamt">IGST</label>
                                                    <NumericFormat
                                                        id='iamt'
                                                        name='iamt'
                                                        autoComplete='off'
                                                        className='numericformatinput'
                                                        onValueChange={(values) => handleValueChange({ name: 'iamt', value: parseFloat(values.value) })}
                                                        value={updatingData.iamt}
                                                        maxLength={13}
                                                        thousandSeparator={false}
                                                        allowNegative={false}
                                                        allowLeadingZeros={false}
                                                        isNumericString
                                                        decimalScale={2}
                                                        style={{ width: "100%" }}
                                                        onKeyDown={(e) => onEnterkeydown(e, "camt")}
                                                    />
                                                </div>
                                                <div className='editfields-inputgrp' style={{ width: "11%" }}>
                                                    <label htmlFor="camt">CGST</label>
                                                    <NumericFormat
                                                        id='camt'
                                                        name='camt'
                                                        autoComplete='off'
                                                        className='numericformatinput'
                                                        onValueChange={(values) => handleValueChange({ name: 'camt', value: parseFloat(values.value) })}
                                                        value={updatingData.camt}
                                                        maxLength={13}
                                                        thousandSeparator={false}
                                                        allowNegative={false}
                                                        allowLeadingZeros={false}
                                                        isNumericString
                                                        decimalScale={2}
                                                        style={{ width: "100%" }}
                                                        onKeyDown={(e) => onEnterkeydown(e, (gstcess || updatingData.csamt > 0) ? "csamt" : "save")}
                                                    />
                                                </div>
                                                <div className='editfields-inputgrp' style={{ width: "11%" }}>
                                                    <label htmlFor="samt">SGST</label>
                                                    <NumericFormat
                                                        readOnly={true}
                                                        disabled={true}
                                                        tabIndex={-1}
                                                        id='samt'
                                                        name='samt'
                                                        autoComplete='off'
                                                        className='numericformatinput'
                                                        onValueChange={(values) => handleValueChange({ name: 'samt', value: parseFloat(values.value) })}
                                                        value={updatingData.samt}
                                                        maxLength={13}
                                                        thousandSeparator={false}
                                                        allowNegative={false}
                                                        allowLeadingZeros={false}
                                                        isNumericString
                                                        decimalScale={2}
                                                        style={{ width: "100%" }}
                                                        onKeyDown={(e) => onEnterkeydown(e, (gstcess || updatingData.csamt > 0) ? "csamt" : "save")}
                                                    />
                                                </div>
                                                <div className='editfields-inputgrp' style={{ width: "11%" }}>
                                                    <label htmlFor="csamt">CESS</label>
                                                    <NumericFormat
                                                        id='csamt'
                                                        name='csamt'
                                                        autoComplete='off'
                                                        className='numericformatinput'
                                                        onValueChange={(values) => handleValueChange({ name: 'csamt', value: parseFloat(values.value) })}
                                                        value={updatingData.csamt}
                                                        maxLength={13}
                                                        thousandSeparator={false}
                                                        allowNegative={false}
                                                        allowLeadingZeros={false}
                                                        isNumericString
                                                        decimalScale={2}
                                                        style={{ width: "100%" }}
                                                        tabIndex={(gstcess || updatingData.csamt > 0) ? 0 : -1}
                                                        disabled={(gstcess || updatingData.csamt > 0) ? false : true}
                                                        onKeyDown={(e) => onEnterkeydown(e, "save")}
                                                    />
                                                </div>
                                                <div className='editfields-inputgrp' style={{ width: "13%" }}>
                                                    <label htmlFor="error">Error</label>
                                                    <input id='error'
                                                        name='errorcode'
                                                        value={updatingData.errorcode}
                                                        style={{ width: "100%", color: updatingData.errorcode === 'Valid' ? "green" : updatingData.errorcode === 'To Be Checked' ? "blue" : "red" }}
                                                        readOnly
                                                        tabIndex={-1}
                                                        // disabled
                                                        onKeyDown={(e) => onEnterkeydown(e, "save")}>

                                                    </input>
                                                </div>
                                            </div>
                                            <div className="editfields-btngrp" style={{ width: "9%", height: "100%" }}>
                                                <button id='save' onClick={handleSave} className="ok-btn">Save</button>
                                                <button onClick={handleCancel} className="cancel-btn" >Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgeGridForm;
