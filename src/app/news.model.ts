export class News{
    date: any;
    description: string;
    country: string;
    uid: string;
    userName: string;
    constructor(date: Date,
        description: string,
        country: string, uid: string,
        userName: string,){

            this.country = country;
            this.date = date;
            this.description = description;
            this.uid = uid;
            this.userName = userName;

    }
}