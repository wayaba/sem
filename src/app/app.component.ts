import { Component } from '@angular/core';
import { ElasticService} from '../app/service/elastic.service';
import { NgxUiLoaderService } from 'ngx-ui-loader'; // Import NgxUiLoaderService
import * as moment from 'moment'

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

  constructor(private elasticService : ElasticService,
    private ngxService: NgxUiLoaderService) {

  }

  ngOnInit() {
    this.callElastikService('', '', '');
  }

  onSubmit() {
    console.log('Filtro por el metodo', this.data)
    
    let filter_method = '';
    let filter_date = '';
    let filter_txid = '';

    if(this.data.method != null){
      filter_method  = this.data.method;
    }

    if(this.data.txid != null){
      filter_txid  = this.data.txid;
    }

    if(this.data.date != null){
      let d = new Date(this.data.date);
      filter_date = moment(d).format('YYYY-MM-DD');
    }

    console.log('filtro metodo: ', filter_method);
    console.log('filtro fecha: ', filter_date);
    console.log('filtro txid: ', filter_txid);
    this.callElastikService(filter_method, filter_date, filter_txid);
  }

  callElastikService(filter_method : string, filter_date : string, filter_txid : string){
    this.ngxService.start();
    this.elasticService.getByParams(filter_method, filter_date, filter_txid).subscribe(
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

}
