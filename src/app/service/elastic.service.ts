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

    let requestBody: any = {
      "from" : 0 ,"size" : 100,
      "sort" : [{"soa_broker_timestamp_req" : {"order" : "desc","unmapped_type" : "long"}}], 
      "query": {
        "query_string": {
          "query": `
            ((soa_payload_in: ${ objSearch.soa_payload }) OR (soa_payload_out: ${ objSearch.soa_payload }))
            AND (soa_broker_timestamp_req: ${ objSearch.soa_broker_timestamp_req })
            AND (soa_canal_id: ${ objSearch.soa_canal_id}) 
            AND (soa_resource: ${ objSearch.soa_resource}) 
            AND (soa_method:\" ${ objSearch.soa_method }\") 
            AND (soa_token: ${ objSearch.soa_token}) 
            AND (soa_tx_id:\" ${ objSearch.soa_tx_id }\")
            AND (indice:\"soa-auditoria\")
            AND (soa_internal_component:\"${ objSearch.soa_internal_component }\")`,         
          "analyze_wildcard": true,
          "default_field": "*"
        }
      }
    }

    return this.http.post<any>(`${ this.baseUrl }/_search`, requestBody,{observe : "response"});
  }

  private pepareParams(objSearch: Search){
    
    objSearch.soa_session_id = (objSearch.soa_session_id == '')? '*':objSearch.soa_session_id;
    objSearch.soa_canal_id = (objSearch.soa_canal_id == '')? '*':objSearch.soa_canal_id;
    objSearch.soa_resource = (objSearch.soa_resource == '')? '*':objSearch.soa_resource;
    objSearch.soa_method = (objSearch.soa_method == '')? '*':objSearch.soa_method;
    objSearch.soa_token = (objSearch.soa_token == '')? '*':objSearch.soa_token;
    objSearch.soa_tx_id = (objSearch.soa_tx_id == '')? '*':objSearch.soa_tx_id;
    objSearch.soa_broker_timestamp_req = (objSearch.soa_broker_timestamp_req == '')? '*':objSearch.soa_broker_timestamp_req;   
    objSearch.country = (objSearch.country == '')? '*':objSearch.country;   
    objSearch.doc_type = (objSearch.doc_type == '')? '*':objSearch.doc_type;   
    objSearch.doc_number = (objSearch.doc_number == '')? '*':objSearch.doc_number;

    let payloadFilter : string = '*';
    let hasCountry: boolean = false;
    let hasType: boolean = false;

    if(objSearch.country != '*'){
      let country = Number(objSearch.country);
      payloadFilter = "(\"<country>" + country + "\" OR \"<country>0" + country + "\")";
      hasCountry = true;
    }

    if(objSearch.doc_type != '*'){      
      let doc_type = Number(objSearch.doc_type);
      if(hasCountry){
        payloadFilter = payloadFilter + ' AND ';
        payloadFilter = payloadFilter + "(\"<idType>" + doc_type + "\" OR \"<idType>0" + doc_type + "\")";
      }else{
        payloadFilter = "(\"<idType>" + doc_type + "\" OR \"<idType>0" + doc_type + "\")";
      }
      hasType = true;
    }

    if(objSearch.doc_number != '*'){
      if(hasCountry || hasType){
        payloadFilter = payloadFilter + ' AND ';
        payloadFilter = payloadFilter + "(\"<id>" + objSearch.doc_number + "\")";
      }else{
        payloadFilter = "(\"<id>" + objSearch.doc_number + "\")";  
      }
    }    

    objSearch.soa_payload = payloadFilter;

    if(objSearch.soa_broker_timestamp_req != "*"){
      let d = new Date(objSearch.soa_broker_timestamp_req);
      objSearch.soa_broker_timestamp_req = moment(d).format('YYYY-MM-DD');
    }
  }
  
  public getTopAvg(minutes: number = 3): Observable<HttpResponse<any>>{
    
    let gteTime = "now-" + minutes + "m";

    const reqBody = {
        "sort": [
            {
                "average": {
                    "order": "desc",
                    "unmapped_type": "long"
                }
            }
        ],
        "query": {
            "bool": {
                "must": [
                    {
                        "match_phrase": {
                            "soa_internal_component": {
                                "query": "Interface"
                            }
                        }
                    },
                    {
                        "range": {
                            "soa_broker_timestamp_req": {
                                "gte": `${ gteTime }`,
                                "lte": "now",
                                "time_zone": "-03:00"
                            }
                        }
                    }
                ]
            }
        },
    "aggs": {
        "byResource": {
            "terms": {
                "field": "soa_resource.keyword",
                "size": 10
            },
            "aggs": {
                "byMethod": {
                    "terms": {
                        "field": "soa_method.keyword",
                        "size": 10
                    },
                    "aggs": {
                        "byVersion": {
                            "terms": {
                                "field": "soa_operation_version.keyword",
                                "size": 10
                            },
                            "aggs": {
                                "average": {
                                    "avg": {
                                        "field": "soa_broker_timestamp_elapsed"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    "size": 0
}

    return this.http.post<any>(`${this.baseUrl}/_search`,reqBody,{observe: "response"});
  }

  public getTopGraph(minutes: number = 20): Observable<HttpResponse<any>>{
    let gteTime = "now-" + minutes + "m";
      const reqBody = 
      {
        "sort": [
            {
                "soa_broker_timestamp_req": {
                    "order": "desc",
                    "unmapped_type": "long"
                }
            }
        ],
        "query": {
            "bool": {
                "must": [
                    {
                        "match_phrase": {
                            "soa_internal_component": {
                                "query": "Interface"
                            }
                        }
                    },
                    {
                        "range": {
                            "soa_broker_timestamp_req": {
                                "gte": `${ gteTime }`,
                                "lte": "now",
                                "time_zone": "-03:00"
                            }
                        }
                    }
                ]
            }
        },
        "aggs": {
            "byResource": {
                "terms": {
                    "field": "soa_resource.keyword",
                    "size": 10
                },
                "aggs": {
                    "byMethod": {
                        "terms": {
                            "field": "soa_method.keyword",
                            "size": 10
                        },
                        "aggs": {
                            "byVersion": {
                                "terms": {
                                    "field": "soa_operation_version.keyword",
                                    "size": 10
                                },
                                "aggs": {
                                    "counts_over_time": {
                                        "date_histogram": {
                                            "field": "soa_broker_timestamp_req",
                                            "interval": "1m",
                                            "time_zone": "-03:00"
                                        },
                                        "aggs": {
                                            "hourly_usage": {
                                                "max": {
                                                    "field": "soa_broker_timestamp_elapsed"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "size": 0
    }

    return this.http.post<any>(`${this.baseUrl}/_search`,reqBody,{observe: "response"});
  }

  public getMaxByTime(objSearch: Search, minutes: number = 3): Observable<HttpResponse<any>>{

    let d = new Date(objSearch.soa_broker_timestamp_req);      
    let dateTo = moment(d).format('YYYY-MM-DD HH:mm:ss');
    let dateFrom = moment(d.setMinutes(d.getMinutes() - minutes)).format('YYYY-MM-DD HH:mm:ss');

    let requestBody: any = {
      
        "sort": [
            {
                "soa_broker_timestamp_req": {
                    "order": "desc",
                    "unmapped_type": "long"
                }
            }
        ],
        "query": {
            "bool": {
                "must": [
                    {
                        "match_phrase": {
                            "soa_resource": {
                                "query": `${ objSearch.soa_resource }`
                            }
                        }
                    },
                     {
                        "match_phrase": {
                            "soa_internal_component": {
                                "query": `${ objSearch.soa_internal_component }`
                            }
                        }
                    },
                    {
                      "match_phrase": {
                          "soa_method": {
                              "query": `${ objSearch.soa_method }`
                          }
                      }
                    },
                    {
                        "range": {
                            "soa_broker_timestamp_req": {
                                "gte": `${ dateFrom }`,
                                "lte": `${ dateTo }`,
                                "format": "yyyy-MM-dd HH:mm:ss",
                                "time_zone": "-03:00"
                            }
                        }
                    }
                ]
            }
        },
        "aggs": {
            "counts_over_time": {
                "date_histogram": {
                    "field": "soa_broker_timestamp_req",
                    "interval": "1m",
                    "time_zone": "-03:00"
                },
                "aggs": {
                    "hourly_usage": {
                        "max": {
                            "field": "soa_broker_timestamp_elapsed"
                        }
                    }
                }
            }
        }
    }
    return this.http.post<any>(`${ this.baseUrl }/_search`, requestBody,{observe : "response"});
  }

  public getCountByTime(objSearch: Search, minutes: number = 3): Observable<HttpResponse<any>>{

    let d = new Date(objSearch.soa_broker_timestamp_req);      
    let dateTo = moment(d).format('YYYY-MM-DD HH:mm:ss');
    let dateFrom = moment(d.setMinutes(d.getMinutes() - minutes)).format('YYYY-MM-DD HH:mm:ss');

    let requestBody: any = {
      
        "sort": [
            {
                "soa_broker_timestamp_req": {
                    "order": "desc",
                    "unmapped_type": "long"
                }
            }
        ],
        "query": {
            "bool": {
                "must": [
                    {
                        "match_phrase": {
                            "soa_resource": {
                                "query": `${ objSearch.soa_resource }`
                            }
                        }
                    },
                     {
                        "match_phrase": {
                            "soa_internal_component": {
                                "query": `${ objSearch.soa_internal_component }`
                            }
                        }
                    },
                    {
                      "match_phrase": {
                          "soa_method": {
                              "query": `${ objSearch.soa_method }`
                          }
                      }
                    },
                    {
                        "range": {
                            "soa_broker_timestamp_req": {
                                "gte": `${ dateFrom }`,
                                "lte": `${ dateTo }`,
                                "format": "yyyy-MM-dd HH:mm:ss",
                                "time_zone": "-03:00"
                            }
                        }
                    }
                ]
            }
        },
        "aggs": {
            "counts_over_time": {
                "date_histogram": {
                    "field": "soa_broker_timestamp_req",
                    "interval": "1m",
                    "time_zone": "-03:00"
                }
            }
        }
    }

    return this.http.post<any>(`${ this.baseUrl }/_search`, requestBody,{observe : "response"});
  }

public getTopMaxGraph(minutes: number = 3): Observable<HttpResponse<any>>{
    let gteTime = "now-" + minutes + "m";
      const reqBody = 
      {
        "sort": [
            {
                "soa_broker_timestamp_req": {
                    "order": "desc",
                    "unmapped_type": "long"
                }
            }
        ],
        "query": {
            "bool": {
                "must": [
                    {
                        "match_phrase": {
                            "soa_internal_component": {
                                "query": "Interface"
                            }
                        }
                    },
                    {
                        "range": {
                            "soa_broker_timestamp_req": {
                                "gte": `${ gteTime }`,
                                "lte": "now",
                                "time_zone": "-03:00"
                            }
                        }
                    }
                ]
            }
        },
        "aggs": {
            "byResource": {
                "terms": {
                    "field": "soa_resource.keyword",
                    "size": 10
                },
                "aggs": {
                    "byMethod": {
                        "terms": {
                            "field": "soa_method.keyword",
                            "size": 10
                        },
                        "aggs": {
                            "byVersion": {
                                "terms": {
                                    "field": "soa_operation_version.keyword",
                                    "size": 10
                                },
                                "aggs": {
                                    "average": {
                                        "max": {
                                            "field": "soa_broker_timestamp_elapsed"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "size": 0
    }

    return this.http.post<any>(`${this.baseUrl}/_search`,reqBody,{observe: "response"});
  }
  

  public getDataByEvent(soa_tx_id: string, event: string = 'TIMEMARK'): Observable<HttpResponse<any>>{


    let requestBody: any = {
        "from" : 0 ,"size" : 100,
        "query": {
          "query_string": {
            "query": `
                (soa_tx_id:\"${ soa_tx_id }\") 
                AND (soa_event:\"${ event }\")`,
            "analyze_wildcard": true,
            "default_field": "*"
          }
        }
      }

    return this.http.post<any>(`${ this.baseUrl }/_search`, requestBody,{observe : "response"});
  }

  public getChilds(soa_caller_tx_id: string): Observable<HttpResponse<any>>{

    let requestBody: any = {
        "from" : 0 ,"size" : 100,
        "sort" : [{"soa_broker_timestamp_req" : {"order" : "desc","unmapped_type" : "long"}}], 
        "query": {
          "query_string": {
            "query": `
               (soa_caller_tx_id:\"${ soa_caller_tx_id }\")
                AND NOT (soa_tx_id:\"${ soa_caller_tx_id }\")
              AND (soa_internal_component:Operation)`,         
            "analyze_wildcard": true,
            "default_field": "*"
          }
        }
      }
    return this.http.post<any>(`${ this.baseUrl }/_search`, requestBody,{observe : "response"});
  }

  public getErrors(minutes: number = 3): Observable<HttpResponse<any>>{

    let gteTime = "now-" + minutes + "m";

    let requestBody: any = 
    {
        "sort" : [{"soa_broker_timestamp" : {"order" : "desc","unmapped_type" : "long"}}], 
        "query": {
            "bool": {
                "must": [
                    {
                        "match_phrase": {
                            "soa_event": {
                                "query": "ERROR"
                            }
                        }
                    },
                    {
                        "range": {
                            "soa_broker_timestamp": {
                                "gte": `${ gteTime }`,
                                "lte": "now",
                                "time_zone": "-03:00"
                            }
                        }
                    }
                ]
            }
        },      
        "aggs": {
            "byResource": {
                "terms": {
                    "field": "soa_resource.keyword",
                    "size": 10
                },
                "aggs": {
                    "byMethod": {
                        "terms": {
                            "field": "soa_method.keyword",
                            "size": 10
                        },
                        "aggs": {
                            "byVersion": {
                                "terms": {
                                    "field": "soa_operation_version.keyword",
                                    "size": 10
                                },
                                "aggs": {
                                    "byError": {
                                        "terms": {
                                            "field": "soa_error.keyword"
                                        },
                                        "aggs": {
                                            "byMaxDate": {
                                                "max": {
                                                    "field": "soa_broker_timestamp"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },  
        "size": 5
        
    }

    return this.http.post<any>(`${ this.baseUrl }/_search`, requestBody,{observe : "response"});
  }
}
