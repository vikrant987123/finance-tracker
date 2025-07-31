import { useUser } from '@clerk/clerk-react';
import { FinancialRecodeFrom } from './financial-record-form';
import { FinancialRecodeList } from './financial-record-list';
import "./financial-record.css";
import { useFinancialRecords } from '../../contexts/financial-record-context';
import { useMemo } from 'react';
import { SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react"; // ✅ Added UserButton

export const Dashboard = () => {
  const { user } = useUser();
  const { records } = useFinancialRecords(); 

  const totalMonthly = useMemo(() => {
    let totalAmount = 0;
    records.forEach((record) => {
      totalAmount += record.amount;
    });

    return totalAmount;
  }, [records]);

  return (
    <div className="dashboard_container"> 
      <h1>Welcome {user?.firstName}! Here are your finances:</h1>

      {!user ? (
        <>
          {!user && (
            <div style={{ marginBottom: "1rem" }}>
                <SignInButton mode="modal">
                <button className="button">Sign In</button>
                </SignInButton>

                <SignUpButton mode="modal">
                <button className="button" style={{ marginLeft: "1rem" }}>
                    Sign Up
                </button>
                </SignUpButton>
            </div>
           )}  

        </>
      ) : (
        <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
          <UserButton afterSignOutUrl="/" />
        </div>
      )}

      <FinancialRecodeFrom />
      <div>Total Monthly: ${totalMonthly}</div>
      <FinancialRecodeList />
    </div>
  );
};
