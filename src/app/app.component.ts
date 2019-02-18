import { Component } from '@angular/core';
import { ElasticService} from '../app/service/elastic.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'sem';

  columnDefs = [
    {headerName: 'Make', field: '_id', sortable: true, filter: true,  width: 200},
    {headerName: 'Model', field: '_score', sortable: true, filter: true, width: 150},
    {headerName: 'Price', field: '_index', sortable: true, filter: true, width: 200},
    {headerName: 'Price', field: '_source', sortable: true, filter: true, width: 200},
    /*
    {headerName: 'Hola', 
    cellRenderer: function(params) { 
                  //console.log('lala', params.data["_source"]);
                  console.log('pepe', params);
                  console.log('pepe', params.data);
                  return params.data
                },
    sortable: true, filter: true, width: 160}
    */
  ];

  rowData: any;
  data: any = {};
  constructor(private elasticService : ElasticService) {

  }

  ngOnInit() {
   this.elasticService.getAllHits().subscribe(
     data => {console.log(data); this.rowData = data.body.hits.hits},
     error => console.log('ops!', error)
    );
  }

  onSubmit() {
    //alert(JSON.stringify(this.data));
    console.log('Filtro por el metodo', this.data.method)
    //'ConsultaListadoCuentas'
    this.elasticService.getHitsByMethod(this.data.method).subscribe(
      data => this.rowData = data.body.hits.hits,
      error => console.log('ops!', error)
     );
  }


}
