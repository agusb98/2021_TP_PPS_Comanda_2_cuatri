import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { ToastrService } from 'ngx-toastr';
import { eEstadoMesaCliente } from 'src/app/enums/eEstadoMesaCliente';
import { eEstadoProducto } from 'src/app/enums/eEstadoProducto';
import { eProducto } from 'src/app/enums/eProducto';
import { MesaService } from 'src/app/services/mesa.service';
import { PedidosService } from 'src/app/services/pedidos.service';
import { ProductoService } from 'src/app/services/producto.service';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
})
export class PedidosPage implements OnInit {

  
  public productos: Array<any>;
  public comanda: Array<any> = [];
  public mesasCliente: Array<any> = [];
  public currentMesaClient: any;
  public currentUser: any;
  public total: number = 0;
  public filtro: eProducto;
  public mesaActual: any;
  public demoraEstimada: number = 0;
  public showCarta:boolean = true;
  public showOK: boolean = false;
  public backbuttonHref: string;
  public saveProdIndex: any
  constructor(public prodSrv: ProductoService, public mesaSrv: MesaService, public pedidosSrv: PedidosService,
     public route: ActivatedRoute, public router: Router, public navCtrl: NavController,
      public modalController: ModalController, public toastSrv: ToastrService ) { }

  navigateBack(){
    this.navCtrl.back();
  }
  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('userData'));
    this.mesaActual = this.route.snapshot.paramMap.get('mesa')
    //Traigo productos
    this.prodSrv.TraerProductos().subscribe( data => {
      console.log(data)
      this.productos = data;
      this.productos.forEach( x => {
        x.cantidad = 0;
        x.selected = false;
        x.listoParaServir = false;
        x.estado = eEstadoProducto.PENDIENTE
      })
    });
    //Traigo mesa-cliente
    this.pedidosSrv.TraerMesaCliente().subscribe( mesas => {
      this.mesasCliente = mesas;
      this.currentMesaClient = this.mesasCliente.find( x => {
        return x.nro_mesa == this.mesaActual
      })
      console.log(this.currentMesaClient)
    })
  }

  async openModal(producto) {
     
  }

  CalcularTotal(){
    this.total = 0;
    this.productos.forEach(x =>{
      this.total +=  x.selected ? x.precio * x.cantidad : 0
    })
  }
  

  AddProducto(index:number){
    this.productos[index].selected = true;
    this.productos[index].cantidad++;
    this.total += this.productos[index].precio;
    this.CalcularDemora();
  }
  RemoveProducto(nombre:string,index:number){
     if(this.productos[index].cantidad > 0){
       this.productos[index].cantidad--;
       if(this.productos[index].cantidad == 0){
        this.productos[index].selected = false;
       }
       this.total -= this.productos[index].precio;
       this.CalcularDemora();
     }
  }

  ScanQr() {
   
  }

  CalcularDemora(){
    let prodSelected = 0;
    this.productos.forEach(x =>{
      prodSelected += (x.selected ? 1 : 0);
    })
    this.demoraEstimada = prodSelected > 0 ? Math.max.apply(Math, this.productos.map( x => { return (x.selected ? x.tiempo : null)})) : 0
  }

  AgregarConQr(textqr:string){
    console.log("entro")
    let obj = this.productos.findIndex( x => x.doc_id == textqr);
    if (obj !== -1) {
      console.log(obj)
      this.saveProdIndex = obj;
      console.log(this.saveProdIndex)
      this.openModal(this.productos[obj])
    } else {
     // this.toastSrv.presentToast("No se encontro el producto buscado..", 2000,'warning');
     alert("No se encontro el producto buscado..");
    }
  }

  EnviarPedido(){
    let prodSelected = 0;
    this.productos.forEach(x =>{
      prodSelected += (x.selected ? 1 : 0);
    })
    if(prodSelected > 0){
      this.pedidosSrv.GenerarPedido('',this.productos.filter( x=> { return x.selected == true}));
      //this.pedidosSrv.GenerarPedido(this.currentMesaClient.doc_id,this.productos.filter( x=> { return x.selected == true}))
     // this.pedidosSrv.CambiarEstadoMesaCli(this.currentMesaClient.doc_id, eEstadoMesaCliente.CONFIRMANDO_PEDIDO);
    
     
      // this.pushSrv.sendNotification("Nuevo pedido pendiente de aprobacion","La mesa nro " + this.currentMesaClient.nro_mesa + " hizo un pedido.",'mozo')
      this.ShowSpinner();
    }
    else{
    //  this.toastSrv.presentToast("Debe agregar productos antes de confirmar...", 2000,'warning');

    alert('"Debe agregar productos antes de confirmar..."');
    }
  }

  ShowSpinner(){
    /*this.spinner.show()
    setTimeout(() => {
      this.showCarta = false;
      this.spinner.hide();
      this.showOK = true;
      setTimeout(() => {
        this.navigateBack();
      }, 4000);
    }, 2000);*/
  }

}
