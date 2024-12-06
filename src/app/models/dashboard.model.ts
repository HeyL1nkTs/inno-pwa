export class Dashboard{
    X: string;
    Y: number;

    constructor(x: string, y: number){
        this.X = x;
        this.Y = y;
    }

    get x(): string{
        return this.X;
    }

    set x(X: string){
        this.X = X;
    }

    get y(): number{
        return this.Y;
    }

    set y(Y: number){
        this.Y = Y;
    }

    toString(): string{
        return `X: ${this.X}, Y: ${this.Y}`;
    }

    toJSON(): string{
        return JSON.stringify(this);
    }
}