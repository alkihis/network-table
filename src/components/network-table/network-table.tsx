import { Component, Prop, Element, Event, EventEmitter, Watch, h, Method } from '@stencil/core';

interface ColMask {
  header: string;
  values: string[];
}

@Component({
  tag: 'network-table',
  styleUrl: 'network-table.css',
  shadow: true
})
export class NetworkTable {
  @Prop() data?: [string, string, string | number][];
  @Prop() hood?: any;
  @Prop() height?: string = '400px';

  @Event({
    eventName: 'network-table.select'
  }) tableCellSelectEvent: EventEmitter<string[]>;

  @Event({
    eventName: 'network-table.unselect'
  }) tableCellUnSelectEvent: EventEmitter<string[]>;

  @Event({
    eventName: 'network-table.unselect-all'
  }) tableCellUnSelectAllEvent: EventEmitter<void>;

  @Event({
    eventName: 'network-table.hover-on'
  }) hoverOnEvent: EventEmitter<string[]>;

  @Event({
    eventName: 'network-table.hover-off'
  }) hoverOffEvent: EventEmitter<void>;

  @Element() protected element: HTMLElement;

  // Hiding some Rows, that match hood Prop content
  // One column can be considered
  @Watch('hood')
  shadowRows(newShadow?: ColMask) {
    let currentHeaders = this.data[0];
    let tBody = this.element.shadowRoot.querySelector('.body');
    // Get corresponding Header position    
    let index = newShadow ? currentHeaders.indexOf(newShadow.header) : 0;
    // Set an empty selector values if prop changed to undefine
    let values = newShadow ? newShadow.values : [];
    Array.from(tBody.querySelectorAll('tr'))
      .filter((tr) => {
        tr.classList.remove("shadow");
        let cVal = tr.querySelectorAll('td')[index].textContent;
        return values.includes(cVal);
      })
      .forEach((tr) => {
        tr.classList.add('shadow')
      });

  }

  checkInput() {
    if (!this.data) {
      console.warn("data is not defined");
      console.dir(this.data);
      return false;
    }
    if (!Array.isArray(this.data)) {
      console.warn("data is not an array");
      console.dir(this.data);
      return false;
    }
    return true;
  }

  render() {
    this.tableCellUnSelectAllEvent.emit();

    if (!this.checkInput())
      return <div />;

    let rows = [];
    let head = this.data[0].map((e) => <td>{e} <i class="material-icons">arrow_drop_up</i></td>);
      this.data.forEach((row, i) => {
        if (i == 0)
          return;
        let cells = row.map((e) => <td>{e}</td>)
        rows.push(<tr>{cells}</tr>);
    });

    return (
      <div class="frame">
        <div class="header">
          <div class="input-group mb-3">
            <div class="input-group-prepend">
              <span class="input-group-text" id="basic-addon1"><i class="material-icons">search</i></span>
            </div>
            <input type="text" class="form-control" placeholder="Keyword" aria-label="Keyword" aria-describedby="basic-addon1" />
          </div>
        </div>
        <div class="head">
          <table class="table table-borderless table-sm">
            <tr>{head}</tr>
          </table>
        </div>
        <div class="body">
          <table class="table table-striped network-table table-borderless table-sm">
            <tbody>{rows}</tbody>
          </table>
        </div>
      </div>
    );
  }

  _filter(value) {
    let tBody = this.element.shadowRoot.querySelector('.body');

    let re = new RegExp(value);
    Array.from(tBody.querySelectorAll('.body tr'))
      .filter((tr) => !tr.classList.contains('shadow')) // skip currently shadowed row
      .forEach((tr) => {
        let status = 'collapse';
        Array.from(tr.querySelectorAll('td')).forEach((td) => {
          if (re.test(td.textContent))
            status = 'visible';
        })
        tr.setAttribute('style', 'visibility:' + status);
      });
  }

  @Method()
  async filter(predicate: (line: string[]) => boolean) {
    const els = [...this.element.shadowRoot.querySelector('.body').querySelectorAll('.body tr')]
    const visibles: string[][] = [];

    for (const element of els) {
      // skip currently shadowed row
      if (element.classList.contains('shadow')) {
        continue;
      }

      let status = 'collapse';
      const line = [...element.querySelectorAll('td')].map(e => e.textContent);
      
      if (predicate(line)) {
        status = 'visible';
        visibles.push(line);
      }

      element.setAttribute('style', 'visibility:' + status);
    }

    return visibles;
  }

  sortTable(index, up) {
    let re = /^([0-9]*[.])?[0-9]+$/;
    let rows = this.element.shadowRoot.querySelectorAll('.body table tr');
    var sortedRows = Array.from(rows).sort((a, b) => {
      let x = a.querySelectorAll('td')[index].innerHTML.toLocaleLowerCase();
      let y = b.querySelectorAll('td')[index].innerHTML.toLocaleLowerCase();
      //console.log(x + ',' + y) ;
      if (re.test(x) && re.test(y)) {
        //console.log("Numbers");
        return up ? parseFloat(x) - parseFloat(y) : parseFloat(y) - parseFloat(x);
      }
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
    y.addEventListener('input', function () { self._filter(this.value) });

    let z = Array.from(this.element.shadowRoot.querySelectorAll('.head td'));
    z.forEach((th, index) => {
      th.addEventListener('click', function () {
        let up = false;
        let i = th.querySelector('i');
        if (i.innerText.includes('arrow_drop_up')) {
          up = true;
          i.innerText = 'arrow_drop_down';
        } else {
          i.innerText = 'arrow_drop_up';
        }
        self.sortTable(index, up);
      });
    });

    let cells = Array.from(this.element.shadowRoot.querySelectorAll('.body tr'));
    cells.forEach((e) => {
      e.addEventListener('click', function () {
        

        if (e.hasAttribute('cell-selected')) {
          console.log("Click", "select");
          e.removeAttribute('cell-selected');
          self.tableCellUnSelectEvent.emit(Array.from(e.querySelectorAll('td')).map((td) => td.innerHTML));
        }
        else {
          console.log("Click", "unselect");
          e.setAttribute('cell-selected', '');
          self.tableCellSelectEvent.emit(Array.from(e.querySelectorAll('td')).map((td) => td.innerHTML));
        }
      });
      e.addEventListener('mouseover', () => {
        this.hoverOnEvent.emit(Array.from(e.querySelectorAll('td')).map((td) => td.innerHTML));
      })
      e.addEventListener('mouseout', () => {
        this.hoverOffEvent.emit();
      })
    });
  }
}
