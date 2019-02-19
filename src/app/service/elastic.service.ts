import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from "@angular/common/http";

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ElasticService {

  private baseUrl = "http://10.241.169.67:9200";
  /*
  private httpRequestBody : any = {
    "query": {
      "query_string": {
        "query": "(soa_method:ConsultaListadoCuentas)",
        "analyze_wildcard": true,
        "default_field": "*"
      }
    }
  }
  */

  constructor(private http : HttpClient) { }

  public getHitsByMethod(method: string): Observable<HttpResponse<any>> {

    let requestBody : any = {
      "query": {
        "query_string": {
          "query": `(soa_method: ${method})`,
          "analyze_wildcard": true,
          "default_field": "*"
        }
      }
    };

    return this.http.post<any>(`${ this.baseUrl }/_search`, requestBody,{observe : "response"});
  }


  public getHitsByFilter(method: string = '*', date: string = '*'): Observable<HttpResponse<any>> {

    let filter_method = (method == '')? '*':method;
    let filter_date = (date == '')? '*':date;

    let requestBody : any = {
      "query": {
        "query_string": {
          "query": `(soa_method: ${filter_method} AND (soa_broker_timestamp: ${filter_date}))`,
          "analyze_wildcard": true,
          "default_field": "*"
        }
      }
    };

    console.log(requestBody);
    return this.http.post<any>(`${ this.baseUrl }/_search`, requestBody,{observe : "response"});
  }

  public getAllHits(): Observable<HttpResponse<any>> {

    let requestBody : any = {
      "query" : {
          "match_all" : {}
        }
    };

    return this.http.post<any>(`${ this.baseUrl }/_search`, requestBody,{observe : "response"}); 
  }

  // QUEDA PENDIENTE DE PRUEBA, YA QUE NO HAY REGISTROS CON SESSION ID
  public getHitsBySessionId(id: string){

    let requestBody : any = {
      "query": {
        "query_string": {
          "query": `(session_id: ${id})`,
          "analyze_wildcard": true,
          "default_field": "*"
        }
      }
    };

    return this.http.post<any>(`${ this.baseUrl }/_search`, requestBody,{observe : "response"});
  }

  public getByParams(
    method: string = "*",
    timeStamp: string = "*",
    txid: string = "*",
    sessionId: string = "*",
    paisOrigen: any = "*",
    tipoDoc: any = "*",
    numDoc: any = "*",
    startPage: number = 0,
    limitPage: number = 50): Observable<HttpResponse<any>>{

    method = (method == '')? '*':method;
    timeStamp = (timeStamp == '')? '*':timeStamp;
    sessionId = (sessionId == '')? '*':sessionId;
    txid = (txid == '')? '*':txid;

      let requestBody: any = {
        "from" : startPage ,"size" : limitPage, 
        "query": {
          "query_string": {
            "query": `(soa_payload: *<paisOrigen>${ paisOrigen }<\\/paisOrigen><tipoDoc>${ tipoDoc }<\\/tipoDoc><numDoc>${ numDoc }    <\\/numDoc>*) AND (soa_broker_timestamp: ${ timeStamp }) AND (soa_method: ${ method }) AND (soa_tx_id: ${ txid }) AND (message: session_id\\:${ sessionId })`,
            "analyze_wildcard": true,
            "default_field": "*"
          }
        }
       }

       console.log(requestBody);

      return this.http.post<any>(`${ this.baseUrl }/_search`, requestBody,{observe : "response"});
  }
}
