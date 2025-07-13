import { useUser } from "@clerk/clerk-react";
import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";


export interface FinancialRecord {
  _id?: string;
  userId: string;
  date: Date;
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
}

interface FinancialRecordsContextType {
  records: FinancialRecord[];
  addRecord: (record: Omit<FinancialRecord, "userId">) => void;
  updateRecord: (id: string, updated: Partial<FinancialRecord>) => void;
  deleteRecord: (id: string) => void;
}

const FinancialRecordsContext = createContext<FinancialRecordsContextType | undefined>(undefined);

export const FinancialRecordsProvider = ({ children }: { children: React.ReactNode }) => {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const { user } = useUser();
  const userId = user?.id;

  const fetchRecords = async () => {
    if (!userId) return;

    const response = await fetch(`http://localhost:3001/financial-records/getAllbyUserID/${userId}`);

    if (response.ok) {
      const records = await response.json();
      console.log(records);
      setRecords(records);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [userId]);

  const addRecord = async (record: Omit<FinancialRecord, "userId">) => {
    if (!userId) {
      console.error("User not authenticated");
      return;
    }

    const fullRecord = { ...record, userId };

    try {
      const response = await fetch("http://localhost:3001/financial-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullRecord),
      });

      if (!response.ok) {
        const err = await response.text();
        toast.error("Failed to add record");
        console.error("Add record failed:", err);
        return;
      }

      const newRecord = await response.json();
      setRecords((prev) => [...prev, newRecord]);
      toast.success("Record added!");
    } catch (err) {
      console.error("Network error:", err);
    }
  };

  const updateRecord = async (id: string, updatedData: Partial<FinancialRecord>) => {
  try {
    const response = await fetch(`http://localhost:3001/financial-records/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      toast.error("Failed to update record");
      throw new Error(await response.text());
    }

    const newRecord = await response.json();
    setRecords((prev) =>
      prev.map((record) => (record._id === id ? newRecord : record))
    );
    toast.success("Record updated!");
  } catch (err) {
    console.error("Update record failed:", err);
  }
};


  const deleteRecord = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/financial-records/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        toast.error("Delete failed");
        throw new Error(await response.text());
      }

      setRecords((prev) => prev.filter((r) => r._id !== id));
      toast.success("Record deleted!");

    } catch (err) {
      console.error("Delete record failed:", err);
    }
  };

  return (
    <FinancialRecordsContext.Provider value={{ records, addRecord, updateRecord, deleteRecord }}>
      {children}
    </FinancialRecordsContext.Provider>
  );
};

export const useFinancialRecords = () => {
  const context = useContext(FinancialRecordsContext);
  if (!context) {
    throw new Error("useFinancialRecords must be used within a FinancialRecordsProvider");
  }
  return context;
};
