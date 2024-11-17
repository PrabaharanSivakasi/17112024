import { createSlice, configureStore } from '@reduxjs/toolkit'
import { persistReducer,persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const mySlice = createSlice( { 
    name:"myslice",
    initialState: { hidemenu:false,islogin:false,isAdmin:false,username:"",userid:0,licensed:'D',flashnews2:false, pdtgroupmode:["New",0],pdtmstrmode:["New",0],accledgermode:["New",0,0],transportmode:["New",0],factorymode:["New",0],companymode:["New",0],pricelistmode:["New",0] ,selectedproductserial:0, packingslipmode:["New",0], salestaxmode:["New",0]},
   
    reducers:{ 
        mylogin(store,action) {
            store.islogin = true;
        } ,
        hideMenu(store,action){
            console.log(action);
            store.hidemenu=action.payload;
        },
        myhome(store,action) {
            store.islogin = false;
            store.username="";
            store.userid=0;
            store.isAdmin=false;
        },
        myuser(store,action) {
            store.username=action.payload;
        },
        myuserid(store,action) {
            store.userid=action.payload;
        },
        mylicense(store,action) {
            store.licensed=action.payload;
        },
        myisAdmin(store,action){
            store.isAdmin=action.payload
            if (action.payload) {
                store.islogin=true;
            }
        },
        flashnewscloser1(store,action){
            store.flashnews2=true
        },
        setflash(store,action){
            store.flashnews2=action.payload
        },
        productGroup(store,action){
            console.log(action);
            store.productgroupmode=action.payload
        },
        setpdtgroupmode(store,action) {
            store.pdtgroupmode[0]=action.payload[0]  // Mode New or Edit
            store.pdtgroupmode[1]=action.payload[1]  // pdtgroupcode
        },
        setpdtmstrmode(store,action) {
            store.pdtmstrmode[0]=action.payload[0]  // Mode New or Edit
            store.pdtmstrmode[1]=action.payload[1]  // pdtcode
        },
        setaccledgermode(store,action) {
            store.accledgermode[0]=action.payload[0] // Mode New or Edit
            store.accledgermode[1]=action.payload[1] // actCode
            store.accledgermode[2]=action.payload[2] // accgroupcode           
        },
        settransportmode(store,action) {
            store.transportmode[0]=action.payload[0]  // Mode New or Edit
            store.transportmode[1]=action.payload[1]  // TransportCode
        },
         setfactorymode(store,action) {
            store.factorymode[0]=action.payload[0]  // Mode New or Edit
            store.factorymode[1]=action.payload[1]  // FactoryCode
        },
        setcompanymode(store,action) {
            store.companymode[0]=action.payload[0]  // Mode New or Edit
            store.companymode[1]=action.payload[1]  // 
        },
        setpricelistmode(store,action) {
            store.pricelistmode[0]=action.payload[0]  // Mode New or Edit
            store.pricelistmode[1]=action.payload[1]  // 
        },
        setselectedproduct(store,action) {
            store.selectedproductserial=action.payload[0]  // Mode New or Edit
            
        },
        setpackingslipmode(store,action) {
            store.packingslipmode[0]=action.payload[0]  // Mode New or Edit
            store.packingslipmode[1]=action.payload[1]  // Packing Slip No
        },
        setsalestaxmode(store,action) {
            store.salestaxmode[0]=action.payload[0]  // Mode New or Edit
            store.salestaxmode[1]=action.payload[1]  // Sales Tax Particulars Code
        },

    }
})

const persistConfig = {
    key:"root",
    storage,
    white : [
        "islogin",
        "isAdmin",
        "username",
        "userid",
        "licensed"
    ]
}

const mypersistReducer=persistReducer(persistConfig,mySlice.reducer);


export let myaction = mySlice.actions 

let dataStore = configureStore ( {
    reducer:mypersistReducer
});

const persistor=persistStore(dataStore)

export { dataStore,persistor }
