const AUTOCOMPLETE_TEMPLATE = `
<input type="text" id="input" />
<ul></ul>
`;

const AUTOCOMPLETE_STYLE = `
<style>
:host(*) {
  background: var(--autocomplete-background-color, #fff);
  border-color: var(--autocomplete-border-color, #ccc);
  border-width: var(--autocomplete-border-width, 1px);
  border-style: solid;
  border-radius: var(--autocomplete-border-radius, .3rem);
  padding: calc(var(--autocomplete-padding, .25rem) - var(--autocomplete-border-width, 1px));
}

input {
  background: transparent;
  padding: 0;
  margin: 0;
  border: none;
  width: 100%;
  color: var(--autocomplete-color, #000);
}

ul {
  position: relative;
  z-index: 1;
  color: var(--autocomplete-list-color, #000);
  background: var(--autocomplete-list-background-color, #fff);
  list-style: none;
  margin: calc(var(--autocomplete-padding, .25rem) + var(--autocomplete-border-width, 1px)) 0;
  border-color: var(--autocomplete-list-border-color, #ccc);
  border-width: var(--autocomplete-list-border-width, 1px);
  border-style: var(--autocomplete-list-border-style, none solid none solid);
  border-radius: var(--autocomplete-list-border-radius, 0);
  padding: var(--autocomplete-list-padding, 0);
}

li {
  background: var(--autocomplete-list-item-background-color, transparent);
  border-color: var(--autocomplete-list-item-border-color, #ccc);
  border-width: var(--autocomplete-list-item-border-width, 1px);
  border-style: var(--autocomplete-list-item-border-style, none none solid none);
  padding: var(--autocomplete-list-item-padding, .25rem);
  cursor: pointer;
}

li.selected {
  color: var(--autocomplete-list-item-selected-color, #000);
  background: var(--autocomplete-list-item-selected-background-color, rgba(200, 200, 255, 0.4));
  border-color: var(--autocomplete-list-item-selected-border-color, #ccc);
  border-width: var(--autocomplete-list-item-selected-width, 1px);
  border-style: var(--autocomplete-list-item-selected-style, none none solid none);
}

li:hover {
  color: var(--autocomplete-list-item-hover-color, #000);
  background: var(--autocomplete-list-item-hover-background-color, rgba(200, 200, 255, 0.2));
  border-color: var(--autocomplete-list-item-hover-border-color, #ccc);
  border-width: var(--autocomplete-list-item-hover-width, 1px);
  border-style: var(--autocomplete-list-item-hover-style, none none solid none);
}
</style>
`;

class AutoComplete extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = AUTOCOMPLETE_STYLE + AUTOCOMPLETE_TEMPLATE;
    this.items = shadowRoot.querySelector('ul');
    this.input = shadowRoot.getElementById('input');
    this._selectedItemIndex = 0;
    if (!this.hasAttribute('minlength')) {
      this.setAttribute('minlength', '2');
    }
  }

  connectedCallback() {
    if (!this.hasAttribute('url')) {
      console.error('AutoComplete: Missing url attribute for %s', this.id);
      return;
    }

    this.input.addEventListener('keyup', this.onKeyUp.bind(this));
    this.input.value = this.getAttribute('display-value');
    this.items.addEventListener('click', this.onItemClick.bind(this));

    this.hiddenInput = document.createElement('input');
    this.hiddenInput.type = 'hidden';
    this.hiddenInput.name = this.getAttribute('name');
    this.hiddenInput.value = this.getAttribute('value');
    this.parentNode.insertBefore(this.hiddenInput, this);
  }

  async fetchData() {
    let response = await fetch(`${this.url}?term=${encodeURIComponent(this.input.value)}`, {
      cache: 'reload',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
      credentials: 'same-origin'
    });
    let data = await response.json();
    this.updateList(data);
  }

  updateList(data) {
    this.items.innerHTML = '';
    for (let item of data) {
      let li = document.createElement('li');
      li.dataset.key = item.id;
      li.dataset.value = item.value;
      li.innerText = item.label || item.value;
      this.items.appendChild(li);
    }
    this.selectedItemIndex = 0;
    this.updateSelection();
    this.items.style.display = 'block';
  }

  get url() {
    return this.getAttribute('url');
  }

  get value() {
    return this.hiddenInput.value;
  }

  set value(value) {
    this.setAttribute('value', value);
    this.hiddenInput.value = value;
  }

  set selectedItemIndex(value) {
    if (value >= this.items.childNodes.length) {
      this._selectedItemIndex = 0
    } else if (value < 0) {
      this._selectedItemIndex = this.items.childNodes.length - 1;
    } else {
      this._selectedItemIndex = value;
    }
    this.updateSelection();
  }

  get selectedItemIndex() {
    return this._selectedItemIndex;
  }

  get minLength() {
    return parseInt(this.getAttribute('minlength'));
  }

  updateSelection() {
    if (this.selectedItem) {
      this.selectedItem.classList.remove('selected');
    }
    this.selectedItem = this.items.childNodes[this.selectedItemIndex];
    this.selectedItem.classList.add('selected');
  }

  previousItem() {
    this.selectedItemIndex--;
  }

  nextItem() {
    this.selectedItemIndex++;
  }

  select(item) {
    this.input.value = item.innerText;
    this.value = item.dataset.key;
    this.items.style.display = 'none';
  }

  onKeyUp(event) {
    let key = event.code.toLowerCase();
    if (['arrowdown', 'enter', 'arrowup', 'insert', 'tab'].includes(key)) {
      event.preventDefault();
      if (key === 'arrowdown') {
        this.nextItem();
      } else if (key === 'arrowup') {
        this.previousItem();
      } else if (key === 'enter') {
        if (this.input.value !== '') {
          this.select(this.selectedItem);
        } else {
          this.input.value = '';
          this.hiddenInput.value = '';
        }
      }
    } else {
      if (this.input.value.length < this.minLength) {
        return;
      }

      if (this._timeout) {
        window.clearTimeout(this._timeout);
      }

      this._timeout = window.setTimeout(this.fetchData.bind(this), 500);
    }
  }

  onItemClick(event) {
    let item = event.target;
    if (item.tagName.toLowerCase() === 'li') {
      this.select(item);
    }
  }
}
customElements.define('auto-complete', AutoComplete);
