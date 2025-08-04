import { useUser, SignInButton, SignUpButton } from "@clerk/clerk-react";
import { FinancialRecodeFrom } from './financial-record-form';
import { FinancialRecodeList } from './financial-record-list';
import { useFinancialRecords } from '../../contexts/financial-record-context';
import { useMemo } from 'react';
import './financial-record.css';


export const Dashboard = () => {
  const { user } = useUser();
  const { records } = useFinancialRecords(); 

  const totalMonthly = useMemo(() => {
    return records.reduce((sum, record) => sum + record.amount, 0);
  }, [records]);

  return (
    <div className="dashboard_container">
      <h1>Welcome {user?.firstName || "Guest"}! {user ? "Here are your finances:" : "Please sign in to start tracking your finances."}</h1>
      
      {!user && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <SignInButton mode="modal">
            <button className="button">Sign In</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="button" style={{ marginLeft: "1rem" }}>Sign Up</button>
          </SignUpButton>
        </div>
      )}

      {user && (
        <>
          <FinancialRecodeFrom />
          <div>Total Monthly: ${totalMonthly}</div>
          <FinancialRecodeList />
        </>
      )}
    </div>

  );
};
