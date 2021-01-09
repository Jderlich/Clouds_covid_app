
export class Wdata{
    constructor(
        public NewConfirmed: number,
        public TotalConfirmed: number,
        public NewDeaths: number,
        public TotalDeaths: number,
        public NewRecovered: number,
        public TotalRecovered: number,
    ){}
}

export class Countriesdata{
    constructor(
        public Country: string,
        public CountryCode: string,
        public Slug: string,
        public NewConfirmed: number,
        public TotalConfirmed: number,
        public NewDeaths: number,
        public TotalDeaths: number,
        public NewRecovered: number,
        public TotalRecovered: number,
        public Date: Date,
        public Premium: string,
    ){}
}


export class WorldWidedata{
    constructor(
        public Message: string,
        public Global: Wdata,
        public Countries: Countriesdata[], 
        public date: Date,

    ){}
}

export class DailyData{
    constructor(
        public Confirmed: number,
        public Deaths: number,
        public Recovered: number,
    ){}
}

export class CountryDailyData{
    constructor(
        public Country: string,
        public CountryCode: string,
        public Province: string,
        public City: string,
        public cityCode: string,
        public Lat: string,
        public Long: string,
        public Confirmed: number,
        public Deaths: number,
        public Recovered: number,
        public Active: number,
        public Date: Date,
    ){}
}