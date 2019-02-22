import { Component } from '@angular/core';
import { ElasticService} from '../app/service/elastic.service';
import { NgxUiLoaderService } from 'ngx-ui-loader'; // Import NgxUiLoaderService
import * as moment from 'moment';
import { Search } from './model/search';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
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
  data: any = {};
  search: Search = {
    session_id: '',
    method: '',
    date: '',
    txid: '',
    country: '',
    doc_type: '',
    doc_number: ''
  };

  constructor(private elasticService : ElasticService,
    private ngxService: NgxUiLoaderService) {

  }

  ngOnInit() {
    this.callElastikService();
  }

  onSubmit() {
    console.log('Filtros', this.search)
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
