import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from "@angular/common/http";

import { Observable } from 'rxjs';
import { Search } from '../model/search';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ElasticService {

  private baseUrl = "http://10.241.169.67:9200";
  
  constructor(private http : HttpClient) { }

  public getAllHits(): Observable<HttpResponse<any>> {

    let requestBody : any = {
      "query" : {
          "match_all" : {}
        }
    };

    return this.http.post<any>(`${ this.baseUrl }/_search`, requestBody,{observe : "response"}); 
  }

  public getByParams(objSearch: Search): Observable<HttpResponse<any>>{
    
    this.pepareParams(objSearch);

    console.log('Asi queda el objSearch:', objSearch);

    let payloadFilter : string = '*';
    
    if(objSearch.country != '*'){
      payloadFilter = payloadFilter + "<paisOrigen>" + objSearch.country + "</paisOrigen>";
    }
    if(objSearch.doc_type != '*'){
      payloadFilter = payloadFilter + "<tipoDoc>" + objSearch.doc_type + "</tipoDoc>";
    }
    if(objSearch.doc_number != '*'){
      payloadFilter = payloadFilter + "<numDoc>" + objSearch.doc_number + "</numDoc>";
    }
    if(payloadFilter != '*'){
      payloadFilter = payloadFilter + "*";
    }

    let requestBody: any = {
      "from" : 0 ,"size" : 50, 
      "query": {
        "query_string": {
          "query": `
            (soa_payload: ${ objSearch.soa_payload }) 
            AND (soa_broker_timestamp: ${ objSearch.date }) 
            AND (soa_method:\" ${ objSearch.method }\") 
            AND (soa_tx_id:\" ${ objSearch.txid }\")`,         
          "analyze_wildcard": true,
          "default_field": "*"
        }
      }
    }

    //AND (message: session_id\\:${ objSearch.session_id })`,
    console.log(requestBody);

    return this.http.post<any>(`${ this.baseUrl }/_search`, requestBody,{observe : "response"});
  }

  private pepareParams(objSearch: Search){
    
    objSearch.session_id = (objSearch.session_id == '')? '*':objSearch.session_id;
    objSearch.method = (objSearch.method == '')? '*':objSearch.method;
    objSearch.txid = (objSearch.txid == '')? '*':objSearch.txid;
    objSearch.date = (objSearch.date == '')? '*':objSearch.date;   
    objSearch.country = (objSearch.country == '')? '*':objSearch.country;   
    objSearch.doc_type = (objSearch.doc_type == '')? '*':objSearch.doc_type;   
    objSearch.doc_number = (objSearch.doc_number == '')? '*':objSearch.doc_number;

    let payloadFilter : string = '*';
    let hasCountry: boolean = false;
    let hasType: boolean = false;

    if(objSearch.country != '*'){
      let country = Number(objSearch.country);
      payloadFilter = "(\"<paisOrigen>" + country + "\" OR \"<paisOrigen>0" + country + "\")";
      hasCountry = true;
    }

    if(objSearch.doc_type != '*'){      
      let doc_type = Number(objSearch.doc_type);
      if(hasCountry){
        payloadFilter = payloadFilter + ' AND ';
        payloadFilter = payloadFilter + "(\"<tipoDoc>" + doc_type + "\" OR \"<tipoDoc>0" + doc_type + "\")";
      }else{
        payloadFilter = "(\"<tipoDoc>" + doc_type + "\" OR \"<tipoDoc>0" + doc_type + "\")";
      }
      hasType = true;
    }

    if(objSearch.doc_number != '*'){
      if(hasCountry || hasType){
        payloadFilter = payloadFilter + ' AND ';
        payloadFilter = payloadFilter + "(\"<numDoc>" + objSearch.doc_number + "\")";
      }else{
        payloadFilter = "(\"<numDoc>" + objSearch.doc_number + "\")";  
      }
    }    

    objSearch.soa_payload = payloadFilter;

    if(objSearch.date != "*"){
      let d = new Date(objSearch.date);
      objSearch.date = moment(d).format('YYYY-MM-DD');
    }
  }
}
