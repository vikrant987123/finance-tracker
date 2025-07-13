import {  useMemo, useState } from "react";
import type { FinancialRecord } from "../../contexts/financial-record-context";
import { useFinancialRecords } from "../../contexts/financial-record-context";
import { useTable, type Column, type CellProps} from "react-table";


interface EditableCellProps extends CellProps<FinancialRecord> {
    updateRecord: (rowIndex: number, columnId: string, value: any) => void;
    editable: boolean;
}

const EditableCell: React.FC<EditableCellProps> = ({value: initialValue, row, column, updateRecord, editable}) => {
    const [isEditing, setIsEditing] = useState(false)
    const [value,setValue] = useState(initialValue)
    const onBlur = () => {
        setIsEditing(false)
        updateRecord(row.index, column.id, value);
    };

    return (
        <div onClick={() => editable && setIsEditing(true)} style={{cursor: editable ? "pointer":"default"}}> 
            {isEditing ? <input value={value} onChange={(e) => setValue(e.target.value)} autoFocus onBlur={onBlur} style={{width: "100%"}}/> : typeof value === "string" ? (value) : (value.toString())}
        </div>
    )
}


export  const FinancialRecodeList = () => {

    const { records, updateRecord, deleteRecord } = useFinancialRecords();
    const updateCellRecord = (rowIndex: number, columnId: string, value: any) => {
        const id = records[rowIndex]._id;
        updateRecord( id ?? "", {...records[rowIndex], [columnId]: value});
    };
    
    const columns : Array<Column<FinancialRecord>> = useMemo(() => [
        {
            Header : "Description",
            accessor: "description",
            Cell: (props) => (
                <EditableCell {...props} updateRecord={updateCellRecord} editable = {true} />
            )
        },
        {
            Header : "Amount",
            accessor: "amount",
            Cell: (props) => (
                <EditableCell {...props} updateRecord={updateCellRecord} editable = {true} />
            )
        },
        {
            Header : "Category",
            accessor: "category",
            Cell: (props) => (
                <EditableCell {...props} updateRecord={updateCellRecord} editable = {true} />
            )
        },
        {
            Header : "Payment Method",
            accessor: "paymentMethod",
            Cell: (props) => (
                <EditableCell {...props} updateRecord={updateCellRecord} editable = {true} />
            )
        },
        {
            Header : "Date",
            accessor: "date",
            Cell: (props) => (
                <EditableCell {...props} updateRecord={updateCellRecord} editable = {false} />
            )
        },
        {
            Header: "Receipt",
            accessorKey: "receiptUrl",
            Cell: ({ value }: { value: string }) =>
            value ? (
            <a href={value} target="_blank" rel="noopener noreferrer">
                <img
                src={value}
                alt="Receipt"
                style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
                />
            </a>
            ) : (
            "No receipt"
            ),
        },

        {
            Header: "Delete",
            id: "delete",
            Cell: ({ row }) => (
                <button
                onClick={() => {
                    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
                    if (confirmDelete) {
                    deleteRecord(row.original._id ?? "");
                    }
                }}
                className="button bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                >
                Delete
                </button>
            ),
        }

    ],
    [records]
);
    const {getTableBodyProps, getTableProps, headerGroups, rows, prepareRow} = useTable({columns,data:records});
    return <div className="table-container"> 
            <table {...getTableProps()} className="table">
                <thead>
                    {headerGroups.map((hg) => {
                        const { key, ...restHeaderGroupProps } = hg.getHeaderGroupProps();
                        return (
                        <tr key={key} {...restHeaderGroupProps}>
                            {hg.headers.map((column) => {
                            const { key: colKey, ...restHeaderProps } = column.getHeaderProps();
                            return (
                                <th key={colKey} {...restHeaderProps}>
                                {column.render("Header")}
                                </th>
                            );
                            })}
                        </tr>
                        );
                    })}
                </thead>    
                <tbody {...getTableBodyProps()}>
                    {rows.map((row) => {
                        prepareRow(row);
                        const { key: rowKey, ...rowProps } = row.getRowProps();
                        return (
                        <tr key={rowKey} {...rowProps}>
                            {row.cells.map((cell) => {
                            const { key: cellKey, ...cellProps } = cell.getCellProps();
                            return (
                                <td key={cellKey} {...cellProps}>
                                {cell.render("Cell")}
                                </td>
                            );
                            })}
                        </tr>
                        );
                    })}
                </tbody>

            </table>
         </div>
};