import { Component } from '@angular/core';
import { ElasticService} from '../app/service/elastic.service';
import * as moment from 'moment'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'sem';

  columnDefs = [
    {headerName: 'Canal', field: '_source.soa_canal_id', sortable: true, filter: true,  width: 150},
    {headerName: 'Recurso', field: '_source.soa_resource', sortable: true, filter: true, width: 140},
    {headerName: 'TX ID', field: '_source.soa_tx_id', sortable: true, filter: true, width: 200},
    {headerName: 'Metodo', field: '_source.soa_method', sortable: true, filter: true, width: 200},
    {headerName: 'Fecha', field: '_source.@timestamp', sortable: true, filter: true, width: 220},
    {headerName: 'Fecha SOA', field: '_source.soa_broker_timestamp', sortable: true, filter: true, width: 220},
    
  ];

  rowData: any;
  data: any = {};

  constructor(private elasticService : ElasticService) {

  }

  ngOnInit() {
    this.callElastikService('', '');
  }

  onSubmit() {
    console.log('Filtro por el metodo', this.data)
    
    let filter_method = '';
    let filter_date = '';
    
    if(this.data.date != null){
      filter_method  = this.data.method;
    }

    if(this.data.date != null){
      let d = new Date(this.data.date);
      filter_date = moment(d).format('YYYY-MM-DD');
    }

    console.log('filtro metodo: ', filter_method);
    console.log('filtro fecha: ', filter_date);
    this.callElastikService(filter_method, filter_date);
  }

  callElastikService(filter_method : string, filter_date : string){
    this.elasticService.getByParams(filter_method, '' ,filter_date).subscribe(
      data => { 
          console.log('Respuesta Servicio: ', data);
          this.rowData = data.body.hits.hits;
        },
      error => console.log('ops!', error)
     );
  }

}
