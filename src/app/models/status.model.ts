export class Status {
    private _user: string;
    private _orderId: string;
    private _cash_in: number;
    private _cash_out: number;
    private _payment: string;
    private _balance: number;
    private _created_at: Date;

    constructor(user: string, orderId: string, cash_in: number, cash_out: number, payment: string, balance: number, created_at: Date) {
        this._user = user;
        this._orderId = orderId;
        this._cash_in = cash_in;
        this._cash_out = cash_out;
        this._payment = payment;
        this._balance = balance;
        this._created_at = created_at;
    }

    get user() {
        return this._user;
    }

    get orderId() {
        return this._orderId;
    }

    get cash_in() {
        return this._cash_in;
    }

    get cash_out() {
        return this._cash_out;
    }

    get payment() {
        return this._payment;
    }

    get balance() {
        return this._balance;
    }

    get created_at() {
        return this._created_at;
    }

    set user(user: string) {
        this._user = user;
    }

    set orderId(orderId: string) {
        this._orderId = orderId;
    }

    set cash_in(cash_in: number) {
        this._cash_in = cash_in;
    }

    set cash_out(cash_out: number) {
        this._cash_out = cash_out;
    }

    set payment(payment: string) {
        this._payment = payment;
    }

    set balance(balance: number) {
        this._balance = balance;
    }

    set created_at(created_at: Date) {
        this._created_at = created_at;
    }

    toString() {
        return `User: ${this.user}, OrderId: ${this.orderId}, Cash In: ${this.cash_in}, Cash Out: ${this.cash_out}, Payment: ${this.payment}, Balance: ${this.balance}, Created At: ${this.created_at}`;
    }

    toJSON(): string {
        return JSON.stringify(this);
    }
}