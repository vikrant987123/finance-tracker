import { useUser } from '@clerk/clerk-react';
//import { isRouteErrorResponse } from 'react-router-dom';
import { FinancialRecodeFrom } from './financial-record-form';
import { FinancialRecodeList } from './financial-record-list';
import "./financial-record.css"
import { useFinancialRecords } from '../../contexts/financial-record-context';
//import { BillUpload } from "../../components/BillUpload";
import { useMemo } from 'react';

export const Dashboard = () => {

    const {user} = useUser();
    const {records} = useFinancialRecords(); 

    const totalMonthly = useMemo(() => {
        let totalAmount = 0;
        records.forEach((record) => {
            totalAmount += record.amount
        });

        return totalAmount;
    }, [records]);

    return (
        <div className="dashboard_container"> 
            <h1> Welcome {user?.firstName}! here are your finances:</h1>
            <FinancialRecodeFrom/>
            {/* <BillUpload /> */}
            <div>Total Monthly: ${totalMonthly}</div>
            <FinancialRecodeList/>
        </div>
    )
    

}