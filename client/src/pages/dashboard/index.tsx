import { useUser, SignInButton, SignUpButton } from "@clerk/clerk-react";
import { FinancialRecodeFrom } from './financial-record-form';
import { FinancialRecodeList } from './financial-record-list';
import { useFinancialRecords } from '../../contexts/financial-record-context';
import { useMemo } from 'react';

export const Dashboard = () => {
  const { user } = useUser();
  const { records } = useFinancialRecords(); 

  const totalMonthly = useMemo(() => {
    return records.reduce((sum, record) => sum + record.amount, 0);
  }, [records]);

  return (
    <div className="dashboard_container">
      <h1 style={{ textAlign: "center" }}>
        {user?.firstName 
        ? `Welcome ${user.firstName}! Here are your finances:` 
        : "Welcome! Please sign in to start tracking your finances."}
      </h1>


      {/* 🧠 Show Sign In/Up only when user is not logged in */}
      {!user && (
        <>
          {!user && (
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", margin: "1rem 0" }}>
                <SignInButton mode="modal">
                <button className="button">Sign In</button>
                </SignInButton>

                <SignUpButton mode="modal">
                <button className="button">Sign Up</button>
                </SignUpButton>
            </div>
            )}
        </>
      )}

      {user && (
        <>
          <FinancialRecodeFrom />
          <div>Total Monthly: ₹{totalMonthly}</div>
          <FinancialRecodeList />
        </>
      )}
    </div>
  );
};
