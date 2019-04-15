import { Component, ViewChild, HostListener } from '@angular/core';
import { ElasticService} from '../app/service/elastic.service';
import { NgxUiLoaderService } from 'ngx-ui-loader'; // Import NgxUiLoaderService
import { Search } from './model/search';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { GridOptions } from 'ag-grid-community';
import { XmlPipe } from './pipe/xml.pipe';
import * as moment from 'moment';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import {interval} from "rxjs/internal/observable/interval";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ["./app.component.css"]
})

export class AppComponent {
  
  /* MAIN GRID */
  private mainGridApi;
  public mainGridOptions: GridOptions;
  public mainRowData: any;

  /* EVENTS GRID*/
  public timemarkRowData: any;
  public backendRowData: any;

  /* ERROR GRID */
  public errorRowData: any;
  public errorGridOptions: GridOptions;
  public selectedErrorRow: any = null;

  /* CHILD GRID */
  private childGridApi;
  public childGridOptions: GridOptions;  
  public chilRowdData: any;

  /* AVG GRID */
  public avgTopFiveData: any;
  public avgCardData: any;

  /* GRAFICOS */
  public graphTopData: ChartDataSets[] = [{ data: [], label: '' }];
  public graphTopLabel: Label[] = [];
  public graphMaxData: ChartDataSets[] = [{ data: [], label: '' }];
  public graphMaxLabel: Label[] = [];
  public graphCountData: ChartDataSets[] = [{ data: [], label: '' }];
  public graphCountLabel: Label[] = [];

  /* ALERT PARA LA OPERACIÓN SELECCIONADA */
  public alertSelectedOperationEnabled = false;
  public showAlertSelectedOperation = false;

  public selectedErrorIndex: number;

  public hideAlertSelectedOperation(){

    this.alertSelectedOperationEnabled = false;
  }

  @HostListener("window:scroll", ['$event'])
    doSomethingOnInternalScroll($event:Event){
    
    const searchResults= document.getElementById("search-section");
    const searchResultsPosition = searchResults.getBoundingClientRect().top;
    
    this.showAlertSelectedOperation = (searchResultsPosition <= 0)? true : false;
  }

  public graphMaxOptions: (ChartOptions) = {
    responsive: true,
    scales: {
      xAxes: [{
        ticks: {
          // Include a dollar sign in the ticks
          callback: function(value, index, values) {
            //if (/\s/.test(values)) {
              return value.split(" ");
          }
        }
      }],
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Tiempos (seg)'
          },
          ticks: {
            beginAtZero: true,
            min: 0
            
          }
        }
      ],
    },
  };
  
  public graphCountOptions: (ChartOptions) = {
    responsive: true,
    scales: {
      xAxes: [{
        ticks: {
          // Include a dollar sign in the ticks
          callback: function(value, index, values) {
            //if (/\s/.test(values)) {
              return value.split(" ");
          }
        }
      }],
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Accesos'
          },
          ticks: {
            beginAtZero: true,
            min: 0,
            stepSize:1
          }
        }
      ],
    },
  };

  public graphTopOptions: (ChartOptions) = {
    responsive: true,
    scales: {
      xAxes: [{
        ticks: {
          // Include a dollar sign in the ticks
          callback: function(value, index, values) {
            //if (/\s/.test(values)) {
              return value.split(" ");
          }
        }
      }],
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Tiempos (seg)'
          },
          ticks: {
            beginAtZero: true,
            min: 0,
            stepSize: 5
          }
        }
      ],
    },
  };

  public chartColors: Color[] = [
  { // red
    backgroundColor: 'rgba(182,67,69,0)',
    borderColor: 'rgba(182,67,69,1)',
    pointBackgroundColor: 'rgba(182,67,69,1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(182,67,69,0.8)'
  },
  { // yellow
    backgroundColor: 'rgba(239,213,107,0)',
    borderColor: 'rgba(239,213,107,1)',
    pointBackgroundColor: 'rgba(239,213,107,1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(239,213,107,0.8)'
  },
  { // brown
    backgroundColor: 'rgba(160,131,124,0)',
    borderColor: 'rgba(160,131,124,1)',
    pointBackgroundColor: 'rgba(160,131,124,1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(160,131,124,0.8)'
  },
  { // pink
    backgroundColor: 'rgba(229,171,177,0)',
    borderColor: 'rgba(229,171,177,1)',
    pointBackgroundColor: 'rgba(229,171,177,1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(229,171,177,0.8)'
  },
  { // green
    backgroundColor: 'rgba(84,130,105,0)',
    borderColor: 'rgba(84,130,105,1)',
    pointBackgroundColor: 'rgba(84,130,105,1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(84,130,105,0.8)'
  },
  { // light blue
    backgroundColor: 'rgba(134,200,205,0)',
    borderColor: 'rgba(134,200,205,1)',
    pointBackgroundColor: 'rgba(134,200,205,1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(134,200,205,0.8)'
  },
  { // grey
    backgroundColor: 'rgba(68,73,70,0)',
    borderColor: 'rgba(68,73,70,1)',
    pointBackgroundColor: 'rgba(68,73,70,1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(68,73,70,0.8)'
  },
  { // orange
    backgroundColor: 'rgba(239,159,53,0)',
    borderColor: 'rgba(239,159,53,1)',
    pointBackgroundColor: 'rgba(239,159,53,1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(239,159,53,0.8)'
  },
  { // light green
    backgroundColor: 'rgba(181,210,98,0)',
    borderColor: 'rgba(181,210,98,1)',
    pointBackgroundColor: 'rgba(181,210,98,1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(181,210,98,0.8)'
  },
  { // purple
    backgroundColor: 'rgba(130,90,137,0)',
    borderColor: 'rgba(130,90,137,1)',
    pointBackgroundColor: 'rgba(130,90,137,1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(130,90,137,0.8)'
  }
  ];

  public lineChartLegend = true;
  public lineChartType = 'line';
  public topChartType = 'bubble';

  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  /* PAYLOAD */
  public payloadHTMLRequest: string;
  public payloadHTMLResponse: string;
  public copiedPayloadAnimation: string = ''; // propiedad para indicar que se ha copiado el payload

  public selectedRow: any = null; // utilizado para almacenar el hit seleccionado en la grilla y usarlo en toda la pantalla

  public searchForm: FormGroup;

  /* TOP GRAPH */
  public bubbleChartOptions: ChartOptions = {
    responsive: true,
    scales:{
        xAxes: [
          {
            ticks: {
              min: 0,
              max: 5,
            }
          }
        ],
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              min: 0,
              max: 70,
            }
          }
        ],
      }
  };

  public bubbleChartType: ChartType = 'bubble';
  public bubbleChartLegend = true;

  public bubbleChartData: ChartDataSets[] = [{ data: [], label: '' }];
  
  constructor(
    private elasticService : ElasticService,
    private ngxService: NgxUiLoaderService,
    private formBuilder: FormBuilder) {

    this.mainGridOptions = <GridOptions>{
        columnDefs: this.createColumnDefs(),
        context: {
            componentParent: this
        },
        paginationPageSize : 8,
        rowSelection: 'single',
        pagination: true,
    };

    this.childGridOptions = <GridOptions>{
      columnDefs: this.createColumnDefs(),
      context: {
          componentParent: this
      },
      paginationPageSize : 5,
      rowSelection: 'single',
      pagination: false
    };
    
    this.errorGridOptions = <GridOptions>{
      columnDefs: this.createColumnErrorDefs(),
      context: {
          componentParent: this
      },
      paginationPageSize : 8,
      rowSelection: 'single',
      pagination: true
    };

  }

  ngOnInit() {
    this.searchForm = this.formBuilder.group({
      "soa_tx_id" : [''],
      "soa_session_id" : [''],
      "soa_broker_timestamp_req" : [''],
      "soa_canal_id" : [''],
      "soa_resource" : [''],
      "soa_method" : [''],
      "soa_token" : [''],
      "country" : ['', Validators.pattern("[0-9]*")],
      "doc_type" : ['', Validators.pattern("[0-9]*")],
      "doc_number" : ['', Validators.pattern("[0-9]*")],
      "soa_internal_component" : ['Interface',Validators.required]
    });

    this.fillMainGrid();
    this.fillAvgGrid();
    this.fillErrorGrid();
        
    /*
    interval(10000).subscribe(res => {
      this.fillErrorGrid();
    });
    */
    interval(10000).subscribe(res => this.fillErrorGrid());
    interval(10000).subscribe(res => this.fillAvgGrid());
  }

  onSubmit() {
    if(this.searchForm.status == "VALID")
      this.fillMainGrid();
  }

  private fillMainGrid(){
    
    this.ngxService.start();
    this.selectedRow = null;
    this.elasticService.getByParams(<Search>this.searchForm.value).subscribe(
      data => {           
          console.log("LA PAPA:", data);
          this.mainRowData = data.body.hits.hits;
          this.ngxService.stop();
        },
      error => {
        console.log('ops!', error);
        this.ngxService.stop();
       }
     );
  }

  private fillAvgGrid(minutes : number = 3){
        
    this.elasticService.getTopAvg(minutes).subscribe(
      data => {           
          let rows : any[] = [];
          data.body.aggregations.byResource.buckets.forEach( itemResource => {
            let soa_resource = itemResource.key;
            itemResource.byMethod.buckets.forEach( itemMethod => {
              let soa_method = itemMethod.key;
              itemMethod.byVersion.buckets.forEach( itemVersion => {
                  rows.push({
                    "soa_resource": soa_resource,
                    "soa_method": soa_method,
                    "soa_operation_version": itemVersion.key,
                    "soa_broker_timestamp_elapsed": itemVersion.average.value
                  });
                });
             });
          });
          rows.sort(function(obj1, obj2) {
            // Ascending: first age less than the previous
            return  obj2.soa_broker_timestamp_elapsed - obj1.soa_broker_timestamp_elapsed;
          });

          let topFiveRows : any[] = [];

          for (let index = 0; index < 5; index++) {
            if(rows[index] !=null){
              topFiveRows.push(rows[index]);
            }
          }
          this.avgTopFiveData = topFiveRows;
          this.fillGraphTopData(minutes);
          this.fillBubbleGraphTopData(minutes);

          document.getElementById('avg-last-update').innerHTML = moment().format('YYYY-MM-DD HH:mm:ss');
        },
      error => {
        console.log('ops!', error);
       }
     );     
  }

  cleanFilter(){
    this.searchForm.reset({
      "soa_tx_id" : '',
      "soa_session_id" : '',
      "soa_broker_timestamp_req" : '',
      "soa_canal_id" : '',
      "soa_resource" : '',
      "soa_method" : '',
      "soa_token" : '',
      "country" : '',
      "doc_type" : '',
      "doc_number" : '',
      "soa_internal_component" : 'Interface',
    });
    
  }

  mainGridSelectionChanged(params) {
    
    if(params.api.getSelectedRows().length > 0){

      this.alertSelectedOperationEnabled = true;

      if(this.childGridApi)
        this.childGridApi.deselectAll();

      this.setSelectedRow(params);
      this.fillEventsGrid();
      
      this.elasticService.getChilds(this.selectedRow.soa_caller_tx_id).subscribe(
        data => {           
            this.chilRowdData = [];
            this.chilRowdData = data.body.hits.hits;
          },
        error => {
          console.log('ops!', error);
        }
      );
      
    }
  }

  onModelUpdated(){
    if(this.mainGridApi != undefined){
      this.mainGridApi.forEachNode((node) => {
        if (node.rowIndex === 0) {
          node.setSelected(true);
        }
      });
    }
  }

  mainGridReady(params) {
    this.mainGridApi = params.api;    
  }
  
  childGridReady(params) {
    this.childGridApi = params.api;
  }

  avgGridReady(params) {
    var defaultSortModel = [
      {
        colId: "soa_broker_timestamp_elapsed",
        sort: "desc"
      }
    ];
    params.api.setSortModel(defaultSortModel);
  }
  

  childGridSelectionChanged(params) {

    this.alertSelectedOperationEnabled = true;

    if(params.api.getSelectedRows().length > 0){
      this.mainGridApi.deselectAll();
      this.setSelectedRow(params);
      this.fillEventsGrid();
    }

  }

  private setSelectedRow(params){
    this.selectedRow = params.api.getSelectedRows()[0]._source; //como solo viene un registro, uso el índice 0 para guardarlo

    var xmlPipe = new XmlPipe();
    
    this.payloadHTMLRequest = xmlPipe.transform(this.selectedRow.soa_payload_in);
    this.payloadHTMLResponse = xmlPipe.transform(this.selectedRow.soa_payload_out);

    if(document.getElementById('graph-max-3') != null){
      document.getElementById('graph-max-3').click();
    }else{
      this.fillGraphMaxData();
    }
      
    if(document.getElementById('graph-count-3') != null){
      document.getElementById('graph-count-3').click();
    }else{
      this.fillGraphCountData();
    }
    
  }

  private createColumnDefs() {
    return [
      {headerName: 'TxID', field: '_source.soa_tx_id', editable:true, sortable: true, filter: true, width: 200},
      {headerName: 'Canal', field: '_source.soa_canal_id', editable:true, sortable: true, filter: true,  width: 100},
      {headerName: 'Recurso', field: '_source.soa_resource', editable:true, sortable: true, filter: true, width: 125},
      {headerName: 'Método', field: '_source.soa_method', editable:true, sortable: true, filter: true, width: 160},
      {headerName: 'Versión', field: '_source.soa_operation_version', editable:true, sortable: true, filter: true, width: 100},
      {headerName: 'Estado', field: '_source.soa_status', editable:true, sortable: true, filter: true, width: 100},
      {headerName: 'Usuario', field: '_source.soa_token', editable:true, sortable: true, filter: true, width: 155},
      {headerName: 'Tiempo (seg)', field: '_source.soa_broker_timestamp_elapsed', editable:true, sortable: true, filter: true, width: 100},
      {headerName: 'Fecha SOA', field: '_source.soa_broker_timestamp_req', editable:true, sortable: true, filter: true, width: 220,  
      valueFormatter: this.dateFormatter}
    ];
  }

  private createColumnErrorDefs() {
    return [
      {headerName: 'TxID', field: '_source.soa_tx_id', editable:true, sortable: true, filter: true, width: 200},
      {headerName: 'SOA ERROR', field: '_source.soa_error', editable:true, sortable: true, filter: true, width: 150},
      {headerName: 'Canal', field: '_source.soa_canal_id', editable:true, sortable: true, filter: true,  width: 100},
      {headerName: 'Recurso', field: '_source.soa_resource', editable:true, sortable: true, filter: true, width: 125},
      {headerName: 'Método', field: '_source.soa_method', editable:true, sortable: true, filter: true, width: 160},
      {headerName: 'Versión', field: '_source.soa_operation_version', editable:true, sortable: true, filter: true, width: 100},
      {headerName: 'Fecha SOA', field: '_source.soa_broker_timestamp', editable:true, sortable: true, filter: true, width: 220,  
      valueFormatter: this.dateFormatterError}
    ];
  }
  
  private dateFormatter(params) {
    let d = new Date(params.data._source.soa_broker_timestamp_req);      
    return moment(d).format('YYYY-MM-DD HH:mm:ss');
  }

  private dateFormatterError(params) {
    let d = new Date(params.data._source.soa_broker_timestamp);      
    return moment(d).format('YYYY-MM-DD HH:mm:ss');
  }

  fillGraphMaxData(minutes : number = 3){

    
    if(this.selectedRow == null) return;
    let search = new Search();
    search.soa_method = this.selectedRow.soa_method;
    search.soa_resource = this.selectedRow.soa_resource;
    search.soa_internal_component = this.selectedRow.soa_internal_component;
    search.soa_broker_timestamp_req = this.selectedRow.soa_broker_timestamp_req;

    this.elasticService.getMaxByTime(search, minutes).subscribe(
      data => {
          this.graphMaxData = [];
          this.graphMaxLabel = [];
          let charData : any[] = [];
          let charLabels : any[] = [];
          data.body.aggregations.counts_over_time.buckets.forEach( item => {
            if(item.hourly_usage.value!=null){
              charData.push(item.hourly_usage.value);
              let d = new Date(item.key_as_string);
              //charLabels.push(moment(d).format('YYYY-MM-DD HH:mm:ss'));
              charLabels.push(moment(d).format('HH:mm:ss'));
            }
          });

          this.graphMaxData = [
            { data: charData, label: 'Maximos' },
          ];
          this.graphMaxLabel = charLabels;

          document.getElementById('max-data-minutes').innerHTML = minutes.toString();
        },
      error => {
        console.log('ops!', error);
       }
     );   
  }

  fillGraphCountData(minutes : number = 3){

    if(this.selectedRow == null) return;
    let search = new Search();
    search.soa_method = this.selectedRow.soa_method;
    search.soa_resource = this.selectedRow.soa_resource;
    search.soa_internal_component = this.selectedRow.soa_internal_component;
    search.soa_broker_timestamp_req = this.selectedRow.soa_broker_timestamp_req;

    this.elasticService.getCountByTime(search, minutes).subscribe(
      data => {
          this.graphCountData = [];
          this.graphCountLabel = [];
          let charData : any[] = [];
          let charLabels : any[] = [];
          data.body.aggregations.counts_over_time.buckets.forEach( item => {
              charData.push(item.doc_count);
              let d = new Date(item.key_as_string);
              //charLabels.push(moment(d).format('YYYY-MM-DD HH:mm:ss'));
              charLabels.push(moment(d).format('HH:mm:ss'));
          });
          this.graphCountData = [
            { data: charData, label: 'Accesos' },
          ];
          this.graphCountLabel = charLabels;
          document.getElementById('count-data-minutes').innerHTML = minutes.toString();
        },
      error => {
        console.log('ops!', error);
       }
     );   
  }

  fillGraphTopData(minutes : number = 3){
    
    this.elasticService.getTopGraph(minutes).subscribe(
      data => {
          this.graphTopData = [];
          this.graphTopLabel = [];
          let charData : any[] = [];
          let charLabels : any[] = [];
          data.body.aggregations.byResource.buckets.forEach( byResourceItem => {
              let resource = byResourceItem.key;
              byResourceItem.byMethod.buckets.forEach( byMethodItem => {
                let method = byMethodItem.key;
                byMethodItem.byVersion.buckets.forEach( byVersionItem => {
                  charData = [];
                  byVersionItem.counts_over_time.buckets.forEach( byTimeItem => {
                    let d = new Date(byTimeItem.key_as_string);
                    //let label = moment(d).format('YYYY-MM-DD HH:mm:ss');
                    let label = moment(d).format('HH:mm:ss');
                    if(!charLabels.includes(label)){
                      charLabels.push(label);
                    }
                    if(byTimeItem.hourly_usage.value == null)
                      charData.push(0);
                    else
                      charData.push(byTimeItem.hourly_usage.value);
                  });
                  if(this.avgTopFiveData.find(item => item.soa_resource === resource 
                    && item.soa_method === method
                    && item.soa_operation_version === byVersionItem.key))
                  {
                    this.graphTopData.push(
                      {
                        'data': charData,
                        'label': resource + " - " + method + " - " + byVersionItem.key
                      }
                    ); 
                  }
                });
              });
          });

          this.graphTopLabel = charLabels;

        },
      error => {
        console.log('ops!', error);
       }
     );   
  }

  fillBubbleGraphTopData(minutes : number = 3){

    this.elasticService.getTopMaxGraph(minutes).subscribe(
      data => {
          let charData : any[] = [];
          let charAxisX = [];
          this.bubbleChartData = [];
          this.avgCardData = [];
          let maxValue = this.findMaxDocCount(data);
          data.body.aggregations.byResource.buckets.forEach( byResourceItem => {
              let resource = byResourceItem.key;
              byResourceItem.byMethod.buckets.forEach( byMethodItem => {
                let method = byMethodItem.key;
                byMethodItem.byVersion.buckets.forEach( byVersionItem => {
                  if(this.avgTopFiveData.find(item => item.soa_resource === resource 
                    && item.soa_method === method
                    && item.soa_operation_version === byVersionItem.key))
                  {
                    charAxisX.push(resource + " " + method);
                    charData = [];                  
                    charData.push({
                      'x': charAxisX.length ,
                      'y': byVersionItem.average.value,
                      'r': this.calcAvgValue(maxValue,byVersionItem.doc_count)
                    }); 
                    this.avgCardData.push({
                      'soa_resource': resource,
                      'soa_method': method,
                      'soa_operation_version': byVersionItem.key,
                      'soa_access_count':byVersionItem.doc_count
                    });

                    this.bubbleChartData.push(
                      {
                        data: charData,
                        label: resource + " " + method + " " + byVersionItem.key,
                      }
                    );           
                  }
                }); 
              }); 
          });

        },
      error => {
        console.log('ops!', error);
       }
     );   
  }

  private findMaxDocCount(data : any) : number{
    let docCount : any[] = [];
    data.body.aggregations.byResource.buckets.forEach( byResourceItem => {
      let resource = byResourceItem.key;
      byResourceItem.byMethod.buckets.forEach( byMethodItem => {
        let method = byMethodItem.key;
        byMethodItem.byVersion.buckets.forEach( byVersionItem => {
          if(this.avgTopFiveData.find(item => item.soa_resource === resource 
            && item.soa_method === method
            && item.soa_operation_version === byVersionItem.key))
          {
            docCount.push(byVersionItem.doc_count);
          }
        });
      }); 
    });
    docCount.sort(function(obj1, obj2) {
      // Ascending: first age less than the previous
      return  obj2 - obj1;
    });
    return docCount[0];
  }

  private calcAvgValue(max : number, value : number) : number{

    let result = 0;

    if(value > 0 && max > 0){
      result = (value * 100)/max;
    }

    return result /2;
  }

  private fillEventsGrid(){
    
    this.elasticService.getDataByEvent(this.selectedRow.soa_tx_id).subscribe(
        data => {           
            this.timemarkRowData = data.body.hits.hits;
          },
        error => {
          console.log('ops!', error);
        }
      );
    this.elasticService.getDataByEvent(this.selectedRow.soa_tx_id, 'BACKEND').subscribe(
        data => {           
            this.backendRowData = data.body.hits.hits;
          },
        error => {
          console.log('ops!', error);
        }
      );
  }

  private fillErrorGrid(){
    
    document.getElementById('error-last-update').innerHTML = moment().format('YYYY-MM-DD HH:mm:ss');

    this.elasticService.getErrors().subscribe(
      data => {           
          this.errorRowData = [];
          let errorRows : any[] = [];
          data.body.aggregations.byResource.buckets.forEach( byResourceItem => {
            let resource = byResourceItem.key;
            let doc_count = byResourceItem.doc_count;
            byResourceItem.byMethod.buckets.forEach( byMethodItem => {
              let method = byMethodItem.key;
              byMethodItem.byVersion.buckets.forEach( byVersionItem => {
                let version = byVersionItem.key;
                byVersionItem.byError.buckets.forEach( byErrorItem => {
                  let error = byErrorItem.key;
                  errorRows.push({
                    'soa_error': error,
                    'soa_resource': resource,
                    'soa_method': method,
                    'soa_operation_version': version,
                    'error_qty': doc_count,
                    'soa_broker_timestamp': byErrorItem.byMaxDate.value_as_string,
                    'soa_broker_timestamp_value': byErrorItem.byMaxDate.value,
                  });

                });
              });
            }); 
          });
          console.log('errorRows.length', errorRows.length);
          if(errorRows.length > 0){
            errorRows.sort(function(obj1, obj2) {
              // Ascending: first age less than the previous
              return  obj2.soa_broker_timestamp_value - obj1.soa_broker_timestamp_value;
            });

            for (let index = 0; index < 5; index++) {
              if(errorRows[index] != null)
                this.errorRowData.push(errorRows[index]);
            }
          }
        },
      error => {
        console.log('ops!', error);
      }
    );
  }

  public fillErrorQty(row: any, index: number){
    
    this.selectedErrorRow = [];
    this.selectedErrorRow.soa_resource = row.soa_resource;
    this.selectedErrorRow.soa_method = row.soa_method;
    this.selectedErrorRow.soa_operation_version = row.soa_operation_version;
    this.selectedErrorRow.error_qty = row.error_qty;

    this.selectedErrorIndex = index;

    setTimeout(()=> this.selectedErrorIndex = null, 2000);
  }
   
  goToFilter() {
    this.cleanFilter();
    this.searchForm.value['soa_resource'] =  this.selectedErrorRow.soa_resource;
    this.searchForm.value['soa_method'] = this.selectedErrorRow.soa_method
    //this.searchForm.value['soa_operation_version']
    //this.searchForm.value['soa_resource']
    //this.searchForm.value['soa_tx_id'] = soa_tx_id;
    this.fillMainGrid();
  }

}
