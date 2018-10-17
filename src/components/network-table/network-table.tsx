import { Component, Prop, Element, Event, EventEmitter } from '@stencil/core';

//import { DataTable } from "simple-datatables";

@Component({
  tag: 'network-table',
  styleUrl: 'network-table.css',
  shadow: true
})
export class networkTable {
  @Prop() data?:any;
  @Prop() height?:string='400px';
  @Event() tableCellSelectEvent: EventEmitter;
  @Element() private element: HTMLElement;

  tableDiv;HTMLElement;

//  @Watch('data')
  //buildTable(newData: object[]/*, oldData: undefined|object*/){
  /*  this.tableDiv = this.element.shadowRoot.querySelector('.table');
    console.log(newData);
    DataTable()
  }
*/
  checkInput() {
    if(! this.data)
      return false;
    if (! (this.data.constructor === Array))
      return false;
    
      return true;
  }
  render() {
    if(!this.checkInput())
      return <div/>;

    let rows = [];
    let head = this.data.shift().map((e)=><td>{e} <i class="fas fa-arrow-up"></i></td>);
    this.data.forEach((row) => {
      let cells = row.map((e)=> <td>{e}</td>)
      rows.push(<tr>{cells}</tr>);
    });
    return <div class="frame">
            <div class="header">
              <div class="input-group mb-3">
                <div class="input-group-prepend">
                  <span class="input-group-text" id="basic-addon1"><i class="fas fa-search fa-right"></i></span>
                </div>
                <input type="text" class="form-control" placeholder="Keyword" aria-label="Keyword" aria-describedby="basic-addon1"/>
              </div>
            </div>
    <div class="head"><table class="table table-borderless table-sm"><tr>{head}</tr></table></div><div class="body"><table class="table table-striped network-table table-borderless table-sm"><tbody>{rows}</tbody>      
    </table></div></div>;
    /*return <div class="frame"><table class="table table-striped"></table></div>;*/
  }

  filter(value){
    let tBody = this.element.shadowRoot.querySelector('.body');

    let re = new RegExp(value);
    Array.from(tBody.querySelectorAll('.body tr')).forEach((tr)=>{
        let status = 'collapse';
        Array.from(tr.querySelectorAll('td')).forEach((td)=>{
          if (re.test(td.textContent)) 
            status = 'visible';
        })
        tr.setAttribute('style','visibility:' + status);
      });
  }

  sortTable(index, up){
    let rows = this.element.shadowRoot.querySelectorAll('.body table tr');
    var sortedRows = Array.from(rows).sort((a, b)=> {
      let x = a.querySelectorAll('td')[index].innerHTML.toLocaleLowerCase();
      let y = b.querySelectorAll('td')[index].innerHTML.toLocaleLowerCase();
      return up ? x.localeCompare(y) : y.localeCompare(x);
      });
    for (let nRow of sortedRows) {
      this.element.shadowRoot.querySelector('.body table tbody').appendChild(nRow);
    }
  }
  componentDidUpdate() {
    let tBody = this.element.shadowRoot.querySelector('.body');//.style.height=this.height;
    tBody.setAttribute('style', "max-height:" + this.height);

    let y = this.element.shadowRoot.querySelector('input');
    let self = this;
    y.addEventListener('input', function(){self.filter(this.value)});

    let z = Array.from(this.element.shadowRoot.querySelectorAll('.head td'));
    z.forEach((th, index)=>{
      th.addEventListener('click', function(){
        let up = false;
        let i = th.querySelector('i');
        if( i.classList.contains('fa-arrow-up')) {
          up = true;
          i.classList.replace('fa-arrow-up', 'fa-arrow-down');
        } else {
          i.classList.replace('fa-arrow-down', 'fa-arrow-up');
        }
        self.sortTable(index,up);
      });
    });

    let cells = Array.from(this.element.shadowRoot.querySelectorAll('.body tr'));
    cells.forEach((e)=>{
      e.addEventListener('click', function(){
        self.tableCellSelectEvent.emit(Array.from(e.querySelectorAll('td')).map((td)=>td.innerHTML));
      });

    });
  }
}
