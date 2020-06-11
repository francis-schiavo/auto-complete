# Auto complete

This web component can automatically fetch data from an url and display in a list for selection.

## Usage

Import the package:

```js
require('@francisschiavo/auto-complete');
```

Customize the appearance by setting CSS custom properties (optional):

```css
auto-complete {
  --autocomplete-color: #000;
  --autocomplete-background-color: #fff;
  --autocomplete-border-color: #ccc;
  --autocomplete-border-width: 1px;
  --autocomplete-border-radius: .3rem;
  --autocomplete-padding: .25rem;

  --autocomplete-list-color: #000;
  --autocomplete-list-background-color: #fff;
  --autocomplete-list-border-color: #ccc;
  --autocomplete-list-border-width: 1px;
  --autocomplete-list-border-style: none solid none solid;
  --autocomplete-list-border-radius: 0;
  --autocomplete-list-padding: 0;

  --autocomplete-list-item-background-color: transparent;
  --autocomplete-list-item-border-color: #ccc;
  --autocomplete-list-item-border-width: 1px;
  --autocomplete-list-item-border-style: none none solid none;
  --autocomplete-list-item-padding: .25rem;

  --autocomplete-list-item-selected-color: #000;
  --autocomplete-list-item-selected-background-color: rgba(200, 200, 255, 0.4);
  --autocomplete-list-item-selected-border-color: #ccc;
  --autocomplete-list-item-selected-width: 1px;
  --autocomplete-list-item-selected-style: none none solid none;

  --autocomplete-list-item-hover-color: #000;
  --autocomplete-list-item-hover-background-color: rgba(200, 200, 255, 0.2);
  --autocomplete-list-item-hover-border-color: #ccc;
  --autocomplete-list-item-hover-width: 1px;
  --autocomplete-list-item-hover-style: none none solid none;
}
```

Add to your views:

**html**:
```html
<auto-complete url="/search" name="category_id"></auto-complete>
```

**haml**:
```haml
%auto-complete{ url: '/search', name: 'category_id' }
```

## Back end

The back end must implement an action that will respond with a json array with the following format:

```json
[
  { "id": 2, "value": "Item 2", "label": "Item 2 - Primary" },
  { "id": 4, "value": "Item 4", "label": "Item 4 - Danger" }
]
```

The field `id` is used as the value, this will be sent to the form on submit.
The field `value` will be used as the friendly text.
The field `label` is optional and used as the display text for the items. When absent the `value` field will be used instead.
