import { paginationFunc } from "./pagination.js"

export class APIFeatures{
    //mongooseQuery = model.find
    //query=req.query
    constructor(query,mongooseQuery){
        this.query=query
        this.mongooseQuery=mongooseQuery
    }
    pagination({page,size}){
        const {limit,skip}=paginationFunc({page,size})
        this.mongooseQuery=this.mongooseQuery.limit(limit).skip(skip)
        return this
    }

    sort(sortBy){
        if(!sortBy){
            this.mongooseQuery= this.mongooseQuery.sort({createdAt:-1})
            return this
        }
        const formula=sortBy.replace(/desc/g,-1).replace(/asc/g,1).replace(/ /g,':')
        const [key,value]=formula.split(':')
        this.mongooseQuery =this.mongooseQuery.find().sort({[key]:+value})
        return this
    }

    search(search){
        const queryfilters={}

        if(search.title)queryfilters.title={$regex:search.title,$options:'i'}//i mearns it is un case sensetive 
        // for more info https://www.mongodb.com/docs/manual/reference/operator/query/regex/#mongodb-query-op.-regex
        if(search.description)queryfilters.description={$regex:search.description,$options:'i'}
        if(search.discount)queryfilters.discount={$gte:search.discount}
        if(search.priceFrom && !search.priceTo)queryfilters.appliedPrice={$gte:search.priceFrom}
        if(!search.priceFrom &&search.priceTo)queryfilters.appliedPrice={$lte:search.priceTo}
        if(search.priceFrom &&search.priceTo)queryfilters.appliedPrice={$gte:search.priceFrom,$lte:search.priceTo}

        this.mongooseQuery=this.mongooseQuery.find(queryfilters)
        return this
    }
}