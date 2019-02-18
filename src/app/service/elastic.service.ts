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
  /*
  // Desarrollo en curso
  public getHitsByPerson(): Observable<HttpResponse<any>> {

    let requestBody : any = { 
      "query": {
        "query_string": {
          "query": `(soa_method: ${})`,
          "analyze_wildcard": true,
          "default_field": "*"
        }
      }
    };

    return this.http.post<any>(`${ this.baseUrl }/_search`, requestBody,{observe : "response"});
  }
  */
}
