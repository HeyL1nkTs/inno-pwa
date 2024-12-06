export class Supply {
    _id: number;
    name: string;
    price: number;
    stock: number;
    image_url: string;
    required?: number;
    isOptional?: boolean;
}

export class Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    image_url: string;
    supplies?: Supply[];
}

export class Combo {
    id: number;
    name: string;
    price: number;
    stock: number;
    //discount?: number;
    image_url: string;
    products?: Product[];
}

export class Avatar {
    _id: number;
    name: string;
    price: number;
    stock: number;
    image_url: string;
    isOptional?: boolean;
    supplies?: Supply[];
    discount?: number;
    products?: Product[];
}

