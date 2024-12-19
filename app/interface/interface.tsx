
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
    image: string,
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
