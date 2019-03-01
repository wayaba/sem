import { Component } from '@angular/core';
import { ElasticService} from '../app/service/elastic.service';
import { NgxUiLoaderService } from 'ngx-ui-loader'; // Import NgxUiLoaderService
import * as moment from 'moment';
import { Search } from './model/search';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: ['.panel{ margin-bottom: 2px; }','.panel-body{ padding: 5px; }']
})

export class AppComponent {
  title = 'sem';

  columnDefs = [
    {headerName: 'Canal', field: '_source.soa_canal_id', editable:true, sortable: true, filter: true,  width: 150},
    {headerName: 'Recurso', field: '_source.soa_resource', editable:true, sortable: true, filter: true, width: 140},
    {headerName: 'TX ID', field: '_source.soa_tx_id', editable:true, sortable: true, filter: true, width: 200},
    {headerName: 'Metodo', field: '_source.soa_method', editable:true, sortable: true, filter: true, width: 200},
    {headerName: 'Fecha', field: '_source.@timestamp', editable:true, sortable: true, filter: true, width: 220},
    {headerName: 'Fecha SOA', field: '_source.soa_broker_timestamp', editable:true, sortable: true, filter: true, width: 220},
    {headerName: 'Payload', field: '_source.soa_payload', editable:true, sortable: true, filter: true, width: 220},
  ];

  rowData: any;
  search: Search = {
    session_id: '',
    method: '',
    date: '',
    txid: '',
    country: '',
    doc_type: '',
    doc_number: '',
    soa_payload: ''
  };

  searchForm: FormGroup;

  constructor(
    private elasticService : ElasticService,
    private ngxService: NgxUiLoaderService,
    private formBuilder: FormBuilder
    ) {

  }

  ngOnInit() {

    this.searchForm = this.formBuilder.group({
      "txid" : new FormControl(this.search.txid),
      "sessionId" : new FormControl(this.search.session_id),
      "date" : new FormControl(this.search.date),
      "method" : new FormControl(this.search.method),
      "country" : new FormControl(this.search.country,[Validators.pattern("[0-9]*")]),
      "doc_type" : new FormControl(this.search.doc_type,[Validators.pattern("[0-9]*")]),
      "doc_number" : new FormControl(this.search.doc_number,[Validators.pattern("[0-9]*")])
    });

    this.callElastikService();
  }

  get countryField(){ return this.searchForm.get("country")}
  get docTypeField(){ return this.searchForm.get("doc_type")}
  get docNumberField(){ return this.searchForm.get("doc_number")}

  onSubmit() {
    console.log('Filtros', this.search)
    console.log(this.searchForm.status);
    
    if(this.searchForm.status == "VALID")
      this.callElastikService();
  }

  callElastikService(){
    this.ngxService.start();
    let objSearch = Object.assign({}, this.search);
    this.elasticService.getByParams(objSearch).subscribe(
      data => {           
          console.log('Respuesta Servicio: ', data);
          this.rowData = data.body.hits.hits;
          this.ngxService.stop();
        },
      error => {
        console.log('ops!', error);
        this.ngxService.stop();
       }
     );
  }

  cleanFilter(){
    this.search.country = '';
    this.search.date = '';
    this.search.doc_number = '';
    this.search.doc_type = '';
    this.search.method = '';
    this.search.session_id = '';
    this.search.txid = '';
  }

}
