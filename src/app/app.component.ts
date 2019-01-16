import { Component } from '@angular/core';
import { UploadEvent, UploadFile, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { OrderService } from './services/order/order.service';
import { Order } from './models/order.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'parser of sncf ticket';

  order: Order = undefined;
  
  filename: string;

  constructor(public orderService: OrderService){

  }

  public dropped(event: UploadEvent) {

    const fileEntry = event.files[0].fileEntry as FileSystemFileEntry;

    if (fileEntry.isFile && fileEntry.name.indexOf(".html") != -1){
      this.filename = fileEntry.name;

      fileEntry.file((file: File) => {

        let reader = new FileReader();
        reader.onload = (event) => {
          this.order = this.orderService.fromOrderEmail(reader.result.toString());
        }

        reader.readAsText(file);
      });
    }
    else {

    }
  }
}
