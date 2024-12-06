export class Selling{
    private _mostSelling: string;
    private _lessSelling: string;
    private _mostSellingAmount: number;
    private _lessSellingAmount: number;
    private _image_mostSelling: string;
    private _image_lessSelling: string;

    constructor(mostSelling: string, lessSelling: string, mostSellingAmount: number, lessSellingAmount: number, image_mostSelling: string, image_lessSelling: string){
        this._mostSelling = mostSelling;
        this._lessSelling = lessSelling;
        this._mostSellingAmount = mostSellingAmount;
        this._lessSellingAmount = lessSellingAmount;
        this._image_mostSelling = image_mostSelling;
        this._image_lessSelling = image_lessSelling;
    }

    get mostSelling(): string{
        return this._mostSelling;
    }

    set mostSelling(mostSelling: string){
        this._mostSelling = mostSelling;
    }

    get lessSelling(): string{
        return this._lessSelling;
    }

    set lessSelling(lessSelling: string){
        this._lessSelling = lessSelling;
    }

    get mostSellingAmount(): number{
        return this._mostSellingAmount;
    }

    set mostSellingAmount(mostSellingAmount: number){
        this._mostSellingAmount = mostSellingAmount;
    }

    get lessSellingAmount(): number{
        return this._lessSellingAmount;
    }

    set lessSellingAmount(lessSellingAmount: number){
        this._lessSellingAmount = lessSellingAmount;
    }

    get image_mostSelling(): string{
        return this._image_mostSelling;
    }

    set image_mostSelling(image_mostSelling: string){
        this._image_mostSelling = image_mostSelling;
    }

    get image_lessSelling(): string{
        return this._image_lessSelling;
    }

    set image_lessSelling(image_lessSelling: string){
        this._image_lessSelling = image_lessSelling;
    }

    toString(): string{
        return `Most Selling: ${this._mostSelling}, Less Selling: ${this._lessSelling}, Most Selling Amount: ${this._mostSellingAmount}, Less Selling Amount: ${this._lessSellingAmount}, Image Most Selling: ${this._image_mostSelling}, Image Less Selling: ${this._image_lessSelling}`;
    }

    toJSON(): string{
        return JSON.stringify(this);
    }
}