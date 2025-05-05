
export interface RegistrationInterface {
    _id: string,
    firstName: string,
    middleName: string,
    lastName: string,
    email: string,
    password: string,
    phone: string,
    role: string,
    admin: string,
    position: string,
    department: string,
    image: string,
    // New education background fields
    institutionName?: string,
    program?: string,
    dateCompleted?: string,
}
export interface ContactInterface {
    _id: string,
    firstName: string,
    middleName: string,
    lastName: string,
    number: string,
    company: string,
    description: string,
}

export interface CategoryInterface {
    _id: string;
    name: string
    description: string
    seller: string
}
export interface DepartmentInterface {
    _id: string;
    name: string
    description: string
    admin: string
}
export interface BlogInterface {
    _id: string
    name: string
    description: string
    category: string
    admin: string
}
export interface TaskInterface {
    _id: string
    title: string
    description: string
    status: string
    priority: string
    department: string
    createdBy: string
    dueDate: string
}


export interface MemoInterface {
    _id: string;
    refNumber: string;
    fromDepartment: string;
    fromName: string;
    memoDate: string;
    toDepartment: string;        
    toName: string;              // Name of the recipient
    subject: string;             // Subject of the memo
    memoType: string;            // Type of the memo
    dueDate: string;            // Optional due date
    frequency: string;          // Optional frequency (e.g., daily, weekly)
    remark: string;             // Optional remarks
    ccDepartment: string;       // Optional CC department
    ccName: string;             // Optional CC recipient name
    image: File;                // Optional image attachment
    emailCheck: boolean;         // Whether to send via email
    createdAt: string;           // Timestamp for when the memo is created
    updatedAt: string;          // Optional, for tracking updates
    status: string;             // Optional, e.g., "draft" or "sent"
}

export interface ComplaintInterface {
    description: string;
    attachment: string;
    unique_id: string;
    status: string
}
